// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NahuiMarketplace
 * @author Nuna Labs
 * @notice Decentralized marketplace for buying/selling NFTs with royalty support
 * @dev Supports ERC-721 tokens and ERC-2981 royalty standard
 *
 * Key Features:
 * - Fixed-price listings
 * - Automatic royalty distribution (ERC-2981)
 * - Platform fee collection
 * - Offer system for price negotiation
 * - Emergency pause functionality
 * - Full event emission for indexing
 */
contract NahuiMarketplace is Ownable, ReentrancyGuard, Pausable {
    /*//////////////////////////////////////////////////////////////
                               ERRORS
    //////////////////////////////////////////////////////////////*/

    error ListingNotActive();
    error NotTokenOwner();
    error NotApprovedOrOwner();
    error InsufficientPayment();
    error InvalidPrice();
    error InvalidPlatformFee();
    error TransferFailed();
    error OfferTooLow();
    error OfferNotFound();
    error NotOfferMaker();

    /*//////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/

    event Listed(
        bytes32 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    event Sold(
        bytes32 indexed listingId,
        address indexed buyer,
        uint256 price,
        uint256 platformFee,
        uint256 royaltyFee
    );

    event ListingCancelled(bytes32 indexed listingId);

    event ListingPriceUpdated(
        bytes32 indexed listingId,
        uint256 newPrice
    );

    event OfferMade(
        bytes32 indexed offerId,
        bytes32 indexed listingId,
        address indexed offerer,
        uint256 amount
    );

    event OfferAccepted(
        bytes32 indexed offerId,
        bytes32 indexed listingId
    );

    event OfferCancelled(bytes32 indexed offerId);

    event PlatformFeeUpdated(uint256 newFee);

    /*//////////////////////////////////////////////////////////////
                            STRUCTURES
    //////////////////////////////////////////////////////////////*/

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    struct Offer {
        address offerer;
        bytes32 listingId;
        uint256 amount;
        bool active;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Platform fee in basis points (e.g., 250 = 2.5%)
    uint256 public platformFee;

    /// @notice Platform fee recipient address
    address public platformFeeRecipient;

    /// @notice Maximum platform fee (10%)
    uint256 public constant MAX_PLATFORM_FEE = 1000;

    /// @notice Listings by ID
    mapping(bytes32 => Listing) public listings;

    /// @notice Offers by ID
    mapping(bytes32 => Offer) public offers;

    /// @notice Mapping of NFT contract + tokenId to listing ID
    mapping(address => mapping(uint256 => bytes32)) public nftListingId;

    /// @notice Active listings count
    uint256 public activeListingsCount;

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initialize marketplace
     * @param platformFeeRecipient_ Address to receive platform fees
     * @param platformFee_ Initial platform fee in basis points
     */
    constructor(
        address platformFeeRecipient_,
        uint256 platformFee_
    ) Ownable(msg.sender) {
        if (platformFee_ > MAX_PLATFORM_FEE) revert InvalidPlatformFee();
        platformFeeRecipient = platformFeeRecipient_;
        platformFee = platformFee_;
    }

    /*//////////////////////////////////////////////////////////////
                          LISTING FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice List NFT for sale
     * @param nftContract NFT contract address
     * @param tokenId Token ID to list
     * @param price Listing price in wei
     * @return listingId Unique listing identifier
     */
    function list(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external whenNotPaused nonReentrant returns (bytes32) {
        if (price == 0) revert InvalidPrice();

        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();

        // Check approval
        if (
            !nft.isApprovedForAll(msg.sender, address(this)) &&
            nft.getApproved(tokenId) != address(this)
        ) {
            revert NotApprovedOrOwner();
        }

        // Generate unique listing ID
        bytes32 listingId = keccak256(
            abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp)
        );

        // Create listing
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });

        nftListingId[nftContract][tokenId] = listingId;
        activeListingsCount++;

        emit Listed(listingId, nftContract, tokenId, msg.sender, price);

        return listingId;
    }

    /**
     * @notice Buy listed NFT
     * @param listingId Listing identifier
     */
    function buy(bytes32 listingId) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        if (!listing.active) revert ListingNotActive();
        if (msg.value < listing.price) revert InsufficientPayment();

        // Mark as sold before transfers (reentrancy protection)
        listing.active = false;
        activeListingsCount--;
        delete nftListingId[listing.nftContract][listing.tokenId];

        // Calculate fees
        uint256 platformFeeAmount = (listing.price * platformFee) / 10000;
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);

        // Check for ERC-2981 royalty
        try
            IERC2981(listing.nftContract).royaltyInfo(
                listing.tokenId,
                listing.price
            )
        returns (address receiver, uint256 royalty) {
            royaltyAmount = royalty;
            royaltyReceiver = receiver;
        } catch {
            // NFT doesn't support ERC-2981, no royalty
        }

        uint256 sellerProceeds = listing.price - platformFeeAmount - royaltyAmount;

        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // Distribute funds
        _transferETH(platformFeeRecipient, platformFeeAmount);

        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            _transferETH(royaltyReceiver, royaltyAmount);
        }

        _transferETH(listing.seller, sellerProceeds);

        // Refund excess payment
        if (msg.value > listing.price) {
            _transferETH(msg.sender, msg.value - listing.price);
        }

        emit Sold(listingId, msg.sender, listing.price, platformFeeAmount, royaltyAmount);
    }

    /**
     * @notice Cancel listing
     * @param listingId Listing identifier
     */
    function cancel(bytes32 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        if (listing.seller != msg.sender) revert NotTokenOwner();
        if (!listing.active) revert ListingNotActive();

        listing.active = false;
        activeListingsCount--;
        delete nftListingId[listing.nftContract][listing.tokenId];

        emit ListingCancelled(listingId);
    }

    /**
     * @notice Update listing price
     * @param listingId Listing identifier
     * @param newPrice New price in wei
     */
    function updatePrice(bytes32 listingId, uint256 newPrice) external {
        Listing storage listing = listings[listingId];
        if (listing.seller != msg.sender) revert NotTokenOwner();
        if (!listing.active) revert ListingNotActive();
        if (newPrice == 0) revert InvalidPrice();

        listing.price = newPrice;

        emit ListingPriceUpdated(listingId, newPrice);
    }

    /*//////////////////////////////////////////////////////////////
                          OFFER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Make offer on listed NFT
     * @param listingId Listing to make offer on
     */
    function makeOffer(bytes32 listingId) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        if (!listing.active) revert ListingNotActive();
        if (msg.value == 0) revert InvalidPrice();

        bytes32 offerId = keccak256(
            abi.encodePacked(listingId, msg.sender, block.timestamp)
        );

        offers[offerId] = Offer({
            offerer: msg.sender,
            listingId: listingId,
            amount: msg.value,
            active: true
        });

        emit OfferMade(offerId, listingId, msg.sender, msg.value);
    }

    /**
     * @notice Accept offer (seller)
     * @param offerId Offer identifier
     */
    function acceptOffer(bytes32 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        if (!offer.active) revert OfferNotFound();

        Listing storage listing = listings[offer.listingId];
        if (listing.seller != msg.sender) revert NotTokenOwner();
        if (!listing.active) revert ListingNotActive();

        // Mark as sold
        offer.active = false;
        listing.active = false;
        activeListingsCount--;
        delete nftListingId[listing.nftContract][listing.tokenId];

        // Calculate fees
        uint256 platformFeeAmount = (offer.amount * platformFee) / 10000;
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);

        try
            IERC2981(listing.nftContract).royaltyInfo(
                listing.tokenId,
                offer.amount
            )
        returns (address receiver, uint256 royalty) {
            royaltyAmount = royalty;
            royaltyReceiver = receiver;
        } catch {}

        uint256 sellerProceeds = offer.amount - platformFeeAmount - royaltyAmount;

        // Transfer NFT
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            offer.offerer,
            listing.tokenId
        );

        // Distribute funds
        _transferETH(platformFeeRecipient, platformFeeAmount);

        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            _transferETH(royaltyReceiver, royaltyAmount);
        }

        _transferETH(listing.seller, sellerProceeds);

        emit OfferAccepted(offerId, offer.listingId);
        emit Sold(offer.listingId, offer.offerer, offer.amount, platformFeeAmount, royaltyAmount);
    }

    /**
     * @notice Cancel offer (offerer)
     * @param offerId Offer identifier
     */
    function cancelOffer(bytes32 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        if (offer.offerer != msg.sender) revert NotOfferMaker();
        if (!offer.active) revert OfferNotFound();

        offer.active = false;

        // Refund offer amount
        _transferETH(offer.offerer, offer.amount);

        emit OfferCancelled(offerId);
    }

    /*//////////////////////////////////////////////////////////////
                          ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Update platform fee
     * @param newPlatformFee New platform fee in basis points
     */
    function setPlatformFee(uint256 newPlatformFee) external onlyOwner {
        if (newPlatformFee > MAX_PLATFORM_FEE) revert InvalidPlatformFee();
        platformFee = newPlatformFee;
        emit PlatformFeeUpdated(newPlatformFee);
    }

    /**
     * @notice Update platform fee recipient
     * @param newRecipient New recipient address
     */
    function setPlatformFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        platformFeeRecipient = newRecipient;
    }

    /**
     * @notice Pause marketplace (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause marketplace
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get listing details
     * @param listingId Listing identifier
     */
    function getListing(bytes32 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /**
     * @notice Get offer details
     * @param offerId Offer identifier
     */
    function getOffer(bytes32 offerId) external view returns (Offer memory) {
        return offers[offerId];
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Safe ETH transfer
     */
    function _transferETH(address to, uint256 amount) private {
        if (amount == 0) return;
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @dev Required for receiving NFTs
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
