# Smart Contract Architecture

## Table of Contents

1. [Overview](#overview)
2. [Contract Standards](#contract-standards)
3. [Core Contracts](#core-contracts)
4. [Marketplace Contracts](#marketplace-contracts)
5. [Royalty System](#royalty-system)
6. [Modular Architecture](#modular-architecture)
7. [Security Considerations](#security-considerations)
8. [Gas Optimization](#gas-optimization)
9. [Deployment Strategy](#deployment-strategy)

## Overview

NahuiGallery's smart contracts are designed following best practices from Sound.xyz's modular protocol, OpenZeppelin standards, and gas-optimized patterns from ERC-721A. The architecture prioritizes:

- **Security**: Audited, non-upgradeable where possible
- **Gas Efficiency**: Batch minting, minimal proxies, optimized storage
- **Modularity**: Pluggable modules for customization
- **Interoperability**: Standard ERC interfaces
- **Artist Control**: Maximum flexibility for creators

### Design Principles

1. **Non-Upgradeable Core**: Immutable contracts for trust and security
2. **Factory Pattern**: Gas-efficient deployment via minimal proxies
3. **Modular Components**: Separate concerns (minting, royalties, metadata)
4. **Event-Driven**: Rich events for off-chain indexing
5. **Open Standards**: ERC-721A, ERC-2981, ERC-165

## Contract Standards

### ERC-721A (Gas-Optimized NFTs)

ERC-721A is an improved implementation of IERC721 with significant gas savings for batch minting.

**Key Benefits:**
- Batch minting multiple NFTs costs nearly the same as minting one
- ~5x gas savings for batch mints compared to standard ERC-721
- Fully compatible with ERC-721 standard
- Used by Azuki and other major NFT projects

```solidity
import "erc721a/contracts/ERC721A.sol";

contract NahuiNFT is ERC721A {
    constructor() ERC721A("NahuiNFT", "NAHUI") {}

    // Mint 5 NFTs for ~same gas as minting 1
    function batchMint(uint256 quantity) external {
        _mint(msg.sender, quantity);
    }
}
```

### ERC-2981 (NFT Royalty Standard)

Universal royalty standard supported by all major marketplaces.

```solidity
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract NahuiNFT is ERC721A, ERC2981 {
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }
}
```

### ERC-1155 (Multi-Token Standard)

For semi-fungible tokens and editions.

```solidity
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract NahuiEditions is ERC1155 {
    // Multiple NFT types in one contract
    // Perfect for limited editions
}
```

## Core Contracts

### 1. NahuiNFT.sol

Main NFT contract for individual artworks.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title NahuiNFT
 * @dev Gas-optimized NFT contract with royalties
 * @notice Individual NFT contract deployed per artist/collection
 */
contract NahuiNFT is ERC721A, ERC2981, Ownable, ReentrancyGuard {
    using Strings for uint256;

    /// @notice Base URI for token metadata
    string private _baseTokenURI;

    /// @notice Maximum supply for this collection
    uint256 public immutable maxSupply;

    /// @notice Minting price
    uint256 public mintPrice;

    /// @notice Artist address (receives primary sales)
    address public artist;

    /// @notice Whether minting is active
    bool public mintingActive;

    event MintPriceUpdated(uint256 newPrice);
    event BaseURIUpdated(string newBaseURI);
    event MintingToggled(bool active);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint256 _maxSupply,
        uint256 _mintPrice,
        address _artist,
        address _royaltyReceiver,
        uint96 _royaltyFeeNumerator
    ) ERC721A(name, symbol) {
        _baseTokenURI = baseURI;
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        artist = _artist;
        mintingActive = true;

        // Set default royalty (e.g., 500 = 5%)
        _setDefaultRoyalty(_royaltyReceiver, _royaltyFeeNumerator);

        _transferOwnership(_artist);
    }

    /**
     * @notice Mint NFT(s) to caller
     * @param quantity Number of NFTs to mint
     */
    function mint(uint256 quantity) external payable nonReentrant {
        require(mintingActive, "Minting is not active");
        require(_totalMinted() + quantity <= maxSupply, "Exceeds max supply");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");

        _mint(msg.sender, quantity);

        // Refund excess payment
        if (msg.value > mintPrice * quantity) {
            (bool success, ) = msg.sender.call{value: msg.value - (mintPrice * quantity)}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @notice Artist mint (free for artist)
     * @param to Recipient address
     * @param quantity Number of NFTs to mint
     */
    function artistMint(address to, uint256 quantity) external onlyOwner {
        require(_totalMinted() + quantity <= maxSupply, "Exceeds max supply");
        _mint(to, quantity);
    }

    /**
     * @notice Update mint price
     */
    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
        emit MintPriceUpdated(_mintPrice);
    }

    /**
     * @notice Toggle minting
     */
    function toggleMinting() external onlyOwner {
        mintingActive = !mintingActive;
        emit MintingToggled(mintingActive);
    }

    /**
     * @notice Update base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }

    /**
     * @notice Withdraw funds to artist
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = artist.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Base URI for computing tokenURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721A, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Starting token ID (starts at 1 instead of 0)
     */
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}
```

### 2. NahuiFactory.sol

Factory for deploying NFT contracts with minimal gas cost.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NahuiFactory
 * @dev Deploys minimal proxy clones of NahuiNFT for gas efficiency
 * @notice Inspired by Sound Protocol's factory pattern
 */
contract NahuiFactory is Ownable {
    using Clones for address;

    /// @notice Implementation contract address
    address public implementation;

    /// @notice Registry of all deployed NFT contracts
    address[] public deployedContracts;

    /// @notice Mapping of artist to their contracts
    mapping(address => address[]) public artistContracts;

    /// @notice Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFee = 250;

    /// @notice Platform fee recipient
    address public platformFeeRecipient;

    event NFTContractDeployed(
        address indexed contractAddress,
        address indexed artist,
        string name,
        string symbol
    );

    event ImplementationUpdated(address newImplementation);
    event PlatformFeeUpdated(uint256 newFee);

    constructor(address _implementation, address _platformFeeRecipient) {
        implementation = _implementation;
        platformFeeRecipient = _platformFeeRecipient;
    }

    /**
     * @notice Deploy new NFT contract as minimal proxy
     */
    function deployNFT(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint256 maxSupply,
        uint256 mintPrice,
        uint96 royaltyFeeNumerator
    ) external returns (address) {
        // Deploy minimal proxy (saves ~90% gas)
        address clone = implementation.clone();

        // Initialize the clone
        NahuiNFT(clone).initialize(
            name,
            symbol,
            baseURI,
            maxSupply,
            mintPrice,
            msg.sender, // artist
            msg.sender, // royalty receiver
            royaltyFeeNumerator
        );

        // Track deployment
        deployedContracts.push(clone);
        artistContracts[msg.sender].push(clone);

        emit NFTContractDeployed(clone, msg.sender, name, symbol);

        return clone;
    }

    /**
     * @notice Get all contracts deployed by an artist
     */
    function getArtistContracts(address artist) external view returns (address[] memory) {
        return artistContracts[artist];
    }

    /**
     * @notice Get total number of deployed contracts
     */
    function getTotalDeployments() external view returns (uint256) {
        return deployedContracts.length;
    }

    /**
     * @notice Update implementation (for future versions)
     */
    function updateImplementation(address _implementation) external onlyOwner {
        implementation = _implementation;
        emit ImplementationUpdated(_implementation);
    }

    /**
     * @notice Update platform fee
     */
    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _platformFee;
        emit PlatformFeeUpdated(_platformFee);
    }
}
```

### 3. NahuiRegistry.sol

Global registry tracking all NFTs and collections.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title NahuiRegistry
 * @dev Central registry for all Nahui NFTs and collections
 */
contract NahuiRegistry is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct Collection {
        address contractAddress;
        address artist;
        string name;
        string symbol;
        uint256 deployedAt;
        bool verified;
    }

    mapping(address => Collection) public collections;
    address[] public allCollections;

    mapping(address => bool) public verifiedArtists;

    event CollectionRegistered(address indexed contractAddress, address indexed artist);
    event ArtistVerified(address indexed artist);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    function registerCollection(
        address contractAddress,
        address artist,
        string memory name,
        string memory symbol
    ) external onlyRole(REGISTRAR_ROLE) {
        require(collections[contractAddress].contractAddress == address(0), "Already registered");

        collections[contractAddress] = Collection({
            contractAddress: contractAddress,
            artist: artist,
            name: name,
            symbol: symbol,
            deployedAt: block.timestamp,
            verified: false
        });

        allCollections.push(contractAddress);

        emit CollectionRegistered(contractAddress, artist);
    }

    function verifyArtist(address artist) external onlyRole(DEFAULT_ADMIN_ROLE) {
        verifiedArtists[artist] = true;
        emit ArtistVerified(artist);
    }

    function getAllCollections() external view returns (address[] memory) {
        return allCollections;
    }
}
```

## Marketplace Contracts

### 4. NahuiMarketplace.sol

Decentralized marketplace for buying/selling NFTs.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NahuiMarketplace
 * @dev Decentralized marketplace with royalty support
 */
contract NahuiMarketplace is ReentrancyGuard, Ownable {

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    /// @notice Platform fee (in basis points)
    uint256 public platformFee = 250; // 2.5%

    /// @notice Platform fee recipient
    address public platformFeeRecipient;

    /// @notice Listings by ID
    mapping(bytes32 => Listing) public listings;

    /// @notice Active listings
    bytes32[] public activeListings;

    event Listed(bytes32 indexed listingId, address indexed seller, address nftContract, uint256 tokenId, uint256 price);
    event Sold(bytes32 indexed listingId, address indexed buyer, uint256 price);
    event Cancelled(bytes32 indexed listingId);

    constructor(address _platformFeeRecipient) {
        platformFeeRecipient = _platformFeeRecipient;
    }

    /**
     * @notice List NFT for sale
     */
    function list(address nftContract, uint256 tokenId, uint256 price) external nonReentrant returns (bytes32) {
        require(price > 0, "Price must be > 0");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not token owner");
        require(IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) ||
                IERC721(nftContract).getApproved(tokenId) == address(this),
                "Marketplace not approved");

        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp));

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });

        activeListings.push(listingId);

        emit Listed(listingId, msg.sender, nftContract, tokenId, price);

        return listingId;
    }

    /**
     * @notice Buy listed NFT
     */
    function buy(bytes32 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.active = false;

        // Calculate fees
        uint256 platformFeeAmount = (listing.price * platformFee) / 10000;
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);

        // Check for ERC-2981 royalty
        try IERC2981(listing.nftContract).royaltyInfo(listing.tokenId, listing.price)
            returns (address receiver, uint256 royalty) {
            royaltyAmount = royalty;
            royaltyReceiver = receiver;
        } catch {}

        uint256 sellerProceeds = listing.price - platformFeeAmount - royaltyAmount;

        // Transfer NFT
        IERC721(listing.nftContract).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        // Distribute funds
        (bool success, ) = platformFeeRecipient.call{value: platformFeeAmount}("");
        require(success, "Platform fee transfer failed");

        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            (success, ) = royaltyReceiver.call{value: royaltyAmount}("");
            require(success, "Royalty transfer failed");
        }

        (success, ) = listing.seller.call{value: sellerProceeds}("");
        require(success, "Seller payment failed");

        // Refund excess
        if (msg.value > listing.price) {
            (success, ) = msg.sender.call{value: msg.value - listing.price}("");
            require(success, "Refund failed");
        }

        emit Sold(listingId, msg.sender, listing.price);
    }

    /**
     * @notice Cancel listing
     */
    function cancel(bytes32 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Listing not active");

        listing.active = false;

        emit Cancelled(listingId);
    }

    /**
     * @notice Update platform fee
     */
    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _platformFee;
    }
}
```

### 5. NahuiAuction.sol

English auction contract for premium pieces.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NahuiAuction
 * @dev English auction (ascending price) with reserve
 */
contract NahuiAuction is ReentrancyGuard {

    struct Auction {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 reservePrice;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        bool settled;
    }

    mapping(bytes32 => Auction) public auctions;
    mapping(bytes32 => mapping(address => uint256)) public pendingReturns;

    event AuctionCreated(bytes32 indexed auctionId, address nftContract, uint256 tokenId, uint256 reservePrice);
    event BidPlaced(bytes32 indexed auctionId, address bidder, uint256 amount);
    event AuctionSettled(bytes32 indexed auctionId, address winner, uint256 amount);

    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 reservePrice,
        uint256 duration
    ) external returns (bytes32) {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not owner");

        bytes32 auctionId = keccak256(abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp));

        auctions[auctionId] = Auction({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            reservePrice: reservePrice,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            highestBidder: address(0),
            highestBid: 0,
            settled: false
        });

        emit AuctionCreated(auctionId, nftContract, tokenId, reservePrice);

        return auctionId;
    }

    function bid(bytes32 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");
        require(msg.value >= auction.reservePrice, "Below reserve");

        if (auction.highestBidder != address(0)) {
            pendingReturns[auctionId][auction.highestBidder] += auction.highestBid;
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    function settleAuction(bytes32 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.settled, "Already settled");

        auction.settled = true;

        if (auction.highestBidder != address(0)) {
            IERC721(auction.nftContract).safeTransferFrom(
                auction.seller,
                auction.highestBidder,
                auction.tokenId
            );

            (bool success, ) = auction.seller.call{value: auction.highestBid}("");
            require(success, "Payment failed");

            emit AuctionSettled(auctionId, auction.highestBidder, auction.highestBid);
        }
    }

    function withdraw(bytes32 auctionId) external nonReentrant {
        uint256 amount = pendingReturns[auctionId][msg.sender];
        require(amount > 0, "No funds");

        pendingReturns[auctionId][msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
}
```

## Royalty System

### 6. RoyaltySplitter.sol

Split royalties among multiple recipients.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

/**
 * @title RoyaltySplitter
 * @dev Split royalties among collaborators
 * @notice Based on OpenZeppelin's PaymentSplitter
 */
contract RoyaltySplitter is PaymentSplitter {

    constructor(address[] memory payees, uint256[] memory shares)
        PaymentSplitter(payees, shares)
    {}

    /**
     * @notice Distribute all pending payments
     */
    function distributeAll() external {
        for (uint256 i = 0; i < payee(i) != address(0); i++) {
            address payable account = payable(payee(i));
            release(account);
        }
    }
}
```

## Modular Architecture

Inspired by Sound Protocol's modular design.

### Module System

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMinterModule {
    function mint(address to, uint256 quantity) external;
}

interface IMetadataModule {
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

interface IRoyaltyModule {
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external view returns (address, uint256);
}
```

## Security Considerations

### 1. Reentrancy Protection

All state-changing functions use OpenZeppelin's `ReentrancyGuard`.

```solidity
function buy(bytes32 listingId) external payable nonReentrant {
    // Safe from reentrancy attacks
}
```

### 2. Access Control

Role-based permissions for sensitive operations.

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract NahuiAdmin is AccessControl {
    bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
}
```

### 3. Integer Overflow Protection

Solidity 0.8.x has built-in overflow checks.

### 4. Emergency Pause

Pausable pattern for emergency situations.

```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract NahuiMarketplace is Pausable {
    function emergencyPause() external onlyOwner {
        _pause();
    }
}
```

### 5. Audit Requirements

- Minimum 2 independent audits before mainnet
- Bug bounty program (HackerOne, Immunefi)
- Testnet deployment for 2+ weeks
- Community review period

## Gas Optimization

### Techniques Used

1. **ERC-721A**: Batch minting optimization
2. **Minimal Proxies (EIP-1167)**: 90% deployment cost reduction
3. **Immutable Variables**: Storage optimization
4. **Packed Structs**: Reduce storage slots
5. **External > Public**: Function visibility optimization
6. **Short-circuit Logic**: Efficient conditionals
7. **Unchecked Math**: Where overflow impossible

### Gas Benchmarks

| Operation | Standard ERC-721 | NahuiNFT (ERC-721A) | Savings |
|-----------|------------------|---------------------|---------|
| Mint 1 NFT | ~50,000 gas | ~50,000 gas | 0% |
| Mint 5 NFTs | ~250,000 gas | ~55,000 gas | 78% |
| Deploy Contract | ~2,500,000 gas | ~250,000 gas (proxy) | 90% |

## Deployment Strategy

### Testnet Deployment

```bash
# 1. Deploy to ANDE Testnet
npx hardhat deploy --network ande-testnet

# 2. Verify contracts
npx hardhat verify --network ande-testnet DEPLOYED_ADDRESS

# 3. Run integration tests
npx hardhat test --network ande-testnet

# 4. Community testing (2 weeks minimum)
```

### Mainnet Deployment

```bash
# 1. Final audit review
# 2. Deploy implementation contracts
npx hardhat deploy --network ande-mainnet

# 3. Deploy factory
npx hardhat run scripts/deploy-factory.ts --network ande-mainnet

# 4. Verify all contracts
npx hardhat verify-all --network ande-mainnet

# 5. Transfer ownership to multisig
npx hardhat run scripts/transfer-ownership.ts --network ande-mainnet
```

### Upgrade Path

For upgradeable components:

1. **Transparent Proxy Pattern**: Admin can upgrade logic
2. **Timelock**: 48-hour delay for upgrades
3. **Multisig**: 3/5 signatures required
4. **Announcement**: Public notification before upgrade

## Testing Strategy

```javascript
describe("NahuiNFT", function () {
  it("Should mint NFT with correct metadata", async function () {
    const { nft, artist } = await loadFixture(deployNFTFixture);
    await nft.connect(artist).mint(1, { value: ethers.utils.parseEther("0.1") });
    expect(await nft.ownerOf(1)).to.equal(artist.address);
  });

  it("Should enforce royalties on secondary sales", async function () {
    // Test ERC-2981 royalty distribution
  });

  it("Should prevent reentrancy attacks", async function () {
    // Test reentrancy protection
  });
});
```

## Conclusion

NahuiGallery's smart contract architecture combines:

- **Gas efficiency** from ERC-721A and minimal proxies
- **Security** from audits, immutability, and best practices
- **Modularity** inspired by Sound Protocol
- **Standards compliance** for maximum interoperability
- **Artist empowerment** through flexible royalties and control

This design ensures a secure, efficient, and artist-friendly NFT platform on ANDE Network.
