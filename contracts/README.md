# NahuiGallery Smart Contracts

Gas-optimized, secure smart contracts for the NahuiGallery NFT platform on ANDE Network.

## Features

- **ERC-721A NFTs**: 78% gas savings on batch minting
- **ERC-2981 Royalties**: Automatic royalty distribution
- **Factory Pattern**: Streamlined NFT collection deployment
- **Decentralized Marketplace**: Buy/sell with royalty support
- **Offer System**: Price negotiation for NFT sales
- **Emergency Pause**: Safety mechanisms for critical situations

## Contracts

### NahuiNFT.sol
Gas-optimized NFT contract using ERC-721A standard.

**Features:**
- Batch minting with massive gas savings
- Configurable royalties (ERC-2981)
- Customizable metadata (IPFS)
- Artist mint and airdrop functions
- Owner-controlled configuration

### NahuiFactory.sol
Factory for deploying NFT collections.

**Features:**
- Streamlined deployment process
- Registry of all deployed contracts
- Artist-to-contracts mapping
- Platform fee configuration

### NahuiMarketplace.sol
Decentralized marketplace for NFT trading.

**Features:**
- Fixed-price listings
- Automatic royalty distribution
- Offer/counteroffer system
- Platform fee collection
- Emergency pause functionality

## Installation

```bash
cd contracts
npm install
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with gas reporting
npm run test:gas
```

## Deployment

### Local (Hardhat Network)

```bash
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

### ANDE Testnet

```bash
# Set environment variables in ../.env
npm run deploy:testnet
```

### ANDE Mainnet

```bash
# ⚠️ PRODUCTION - Use with caution
npm run deploy:mainnet
```

## Verification

After deployment, verify contracts on block explorer:

```bash
npx hardhat verify --network ande-testnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Gas Benchmarks

| Operation | Standard ERC-721 | NahuiNFT (ERC-721A) | Savings |
|-----------|------------------|---------------------|---------|
| Mint 1 NFT | ~50,000 gas | ~50,000 gas | 0% |
| Mint 5 NFTs | ~250,000 gas | ~55,000 gas | **78%** |
| Mint 10 NFTs | ~500,000 gas | ~60,000 gas | **88%** |

## Security

- ✅ Reentrancy protection on all state-changing functions
- ✅ Custom errors for gas efficiency
- ✅ SafeMath (built-in Solidity 0.8+)
- ✅ Access control with Ownable
- ✅ Emergency pause mechanism
- ✅ Comprehensive test coverage (>90%)
- ⏳ Pending external audits

### Recommended Audits

Before mainnet deployment:
1. Consensys Diligence
2. Trail of Bits
3. OpenZeppelin Security

## Architecture

```
NahuiGallery Contracts
│
├── NahuiFactory
│   └── Deploys → NahuiNFT instances
│
├── NahuiNFT (ERC-721A + ERC-2981)
│   ├── Minting (public + artist)
│   ├── Metadata management
│   └── Royalty configuration
│
└── NahuiMarketplace
    ├── Listing management
    ├── Buy/sell with royalties
    └── Offer system
```

## Configuration

All contracts use these configuration values:

```solidity
uint256 public constant MAX_PLATFORM_FEE = 1000; // 10%
uint256 public constant MAX_ROYALTY_FEE = 10000; // 100%
```

Default values:
- Platform Fee: 250 basis points (2.5%)
- Royalty Fee: 500 basis points (5%)

## Usage Examples

### Deploy NFT Collection

```typescript
const factory = await ethers.getContractAt("NahuiFactory", FACTORY_ADDRESS);

const tx = await factory.deployNFT(
  "My Art Collection",      // name
  "MYART",                  // symbol
  "ipfs://Qm.../",         // baseURI
  1000,                     // maxSupply
  ethers.parseEther("0.1"), // mintPrice
  500                       // 5% royalty
);

const receipt = await tx.wait();
const nftAddress = receipt.events[0].args.contractAddress;
```

### Mint NFT

```typescript
const nft = await ethers.getContractAt("NahuiNFT", NFT_ADDRESS);

await nft.mint(5, { value: ethers.parseEther("0.5") }); // Mint 5 NFTs
```

### List on Marketplace

```typescript
const marketplace = await ethers.getContractAt("NahuiMarketplace", MARKETPLACE_ADDRESS);

// Approve marketplace
await nft.setApprovalForAll(MARKETPLACE_ADDRESS, true);

// List NFT
await marketplace.list(
  NFT_ADDRESS,
  TOKEN_ID,
  ethers.parseEther("1.0") // price
);
```

## Development

```bash
# Compile contracts
npm run compile

# Clean artifacts
npm run clean

# Format code
npm run format

# Lint Solidity
npm run lint

# Contract size
npm run size
```

## License

MIT

## Support

For questions or issues:
- GitHub: https://github.com/nunalabs/NahuiGallery
- Docs: https://docs.nahuigallery.art
- Discord: https://discord.gg/nahuigallery
