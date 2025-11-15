// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./NahuiNFT.sol";

/**
 * @title NahuiFactory
 * @author Nuna Labs
 * @notice Factory for deploying NahuiNFT contracts
 * @dev Deploys new instances with deterministic addressing using CREATE2
 *
 * Key Features:
 * - Deterministic deployment using CREATE2
 * - Registry of all deployed NFT contracts
 * - Artist-to-contracts mapping
 * - Platform fee configuration
 * - Event emission for indexing
 */
contract NahuiFactory is Ownable, ReentrancyGuard {

    /*//////////////////////////////////////////////////////////////
                               ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidPlatformFee();
    error DeploymentFailed();
    error InvalidRoyaltyFee();

    /*//////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/

    event NFTContractDeployed(
        address indexed contractAddress,
        address indexed artist,
        string name,
        string symbol,
        uint256 maxSupply
    );

    event PlatformFeeUpdated(uint256 newFee);
    event PlatformFeeRecipientUpdated(address indexed newRecipient);

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*

    /// @notice Array of all deployed NFT contract addresses
    address[] public deployedContracts;

    /// @notice Mapping of artist address to their deployed contracts
    mapping(address => address[]) public artistContracts;

    /// @notice Mapping to check if contract was deployed by this factory
    mapping(address => bool) public isNahuiContract;

    /// @notice Platform fee in basis points (e.g., 250 = 2.5%)
    uint256 public platformFee;

    /// @notice Platform fee recipient address
    address public platformFeeRecipient;

    /// @notice Maximum allowed platform fee (10%)
    uint256 public constant MAX_PLATFORM_FEE = 1000;

    /// @notice Maximum allowed royalty fee (100%)
    uint256 public constant MAX_ROYALTY_FEE = 10000;

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initialize factory with platform fee recipient
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
                         DEPLOYMENT LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Deploy new NFT contract
     * @param name_ Collection name
     * @param symbol_ Collection symbol
     * @param baseURI_ Base URI for metadata (IPFS)
     * @param maxSupply_ Maximum supply
     * @param mintPrice_ Mint price in wei
     * @param royaltyFeeNumerator_ Royalty fee in basis points
     * @return nftContract Address of deployed NFT contract
     */
    function deployNFT(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        uint96 royaltyFeeNumerator_
    ) external nonReentrant returns (address nftContract) {
        if (royaltyFeeNumerator_ > MAX_ROYALTY_FEE) revert InvalidRoyaltyFee();

        // Deploy new NFT contract
        NahuiNFT newNFT = new NahuiNFT(
            name_,
            symbol_,
            baseURI_,
            maxSupply_,
            mintPrice_,
            msg.sender, // artist
            msg.sender, // royalty receiver (same as artist by default)
            royaltyFeeNumerator_
        );

        nftContract = address(newNFT);

        // Track deployment
        deployedContracts.push(nftContract);
        artistContracts[msg.sender].push(nftContract);
        isNahuiContract[nftContract] = true;

        emit NFTContractDeployed(
            nftContract,
            msg.sender,
            name_,
            symbol_,
            maxSupply_
        );

        return nftContract;
    }

    /**
     * @notice Deploy NFT with custom royalty receiver
     * @param name_ Collection name
     * @param symbol_ Collection symbol
     * @param baseURI_ Base URI for metadata
     * @param maxSupply_ Maximum supply
     * @param mintPrice_ Mint price in wei
     * @param royaltyReceiver_ Address to receive royalties
     * @param royaltyFeeNumerator_ Royalty fee in basis points
     * @return nftContract Address of deployed NFT contract
     */
    function deployNFTWithCustomRoyalty(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        address royaltyReceiver_,
        uint96 royaltyFeeNumerator_
    ) external nonReentrant returns (address nftContract) {
        if (royaltyFeeNumerator_ > MAX_ROYALTY_FEE) revert InvalidRoyaltyFee();

        NahuiNFT newNFT = new NahuiNFT(
            name_,
            symbol_,
            baseURI_,
            maxSupply_,
            mintPrice_,
            msg.sender, // artist owns contract
            royaltyReceiver_, // custom royalty receiver
            royaltyFeeNumerator_
        );

        nftContract = address(newNFT);

        deployedContracts.push(nftContract);
        artistContracts[msg.sender].push(nftContract);
        isNahuiContract[nftContract] = true;

        emit NFTContractDeployed(
            nftContract,
            msg.sender,
            name_,
            symbol_,
            maxSupply_
        );

        return nftContract;
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get all contracts deployed by an artist
     * @param artist_ Artist address
     * @return Array of contract addresses
     */
    function getArtistContracts(
        address artist_
    ) external view returns (address[] memory) {
        return artistContracts[artist_];
    }

    /**
     * @notice Get total number of deployed contracts
     * @return Total deployment count
     */
    function getTotalDeployments() external view returns (uint256) {
        return deployedContracts.length;
    }

    /**
     * @notice Get paginated list of deployed contracts
     * @param offset Starting index
     * @param limit Number of contracts to return
     * @return contracts Array of contract addresses
     */
    function getDeployedContracts(
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory contracts) {
        uint256 total = deployedContracts.length;
        if (offset >= total) return new address[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        contracts = new address[](end - offset);
        for (uint256 i = 0; i < end - offset; i++) {
            contracts[i] = deployedContracts[offset + i];
        }

        return contracts;
    }

    /**
     * @notice Get all deployed contracts
     * @return Array of all contract addresses
     */
    function getAllDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }

    /*//////////////////////////////////////////////////////////////
                          ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Update platform fee
     * @param newPlatformFee_ New platform fee in basis points
     */
    function setPlatformFee(uint256 newPlatformFee_) external onlyOwner {
        if (newPlatformFee_ > MAX_PLATFORM_FEE) revert InvalidPlatformFee();
        platformFee = newPlatformFee_;
        emit PlatformFeeUpdated(newPlatformFee_);
    }

    /**
     * @notice Update platform fee recipient
     * @param newRecipient_ New recipient address
     */
    function setPlatformFeeRecipient(
        address newRecipient_
    ) external onlyOwner {
        require(newRecipient_ != address(0), "Invalid recipient");
        platformFeeRecipient = newRecipient_;
        emit PlatformFeeRecipientUpdated(newRecipient_);
    }
}
