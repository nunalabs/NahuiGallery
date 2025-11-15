# NahuiGallery Deployment Guide

Complete guide to deploy NahuiGallery to ANDE Testnet and production.

## Prerequisites

- Node.js 20+
- ANDE Network wallet with testnet funds
- WalletConnect Project ID
- Pinata API keys (for IPFS)

## Phase 1: Smart Contract Deployment

### 1. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required variables:
```bash
# Deployer wallet (GET TESTNET FUNDS FROM FAUCET)
DEPLOYER_PRIVATE_KEY=0x...

# ANDE Network
ANDE_NETWORK_RPC_URL=https://rpc.testnet.ande.network
ANDE_NETWORK_CHAIN_ID=1234
ANDE_EXPLORER_API_KEY=your_api_key

# Platform configuration
PLATFORM_FEE=250  # 2.5%
```

### 2. Install Contract Dependencies

```bash
cd contracts
npm install
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests (Optional but Recommended)

```bash
# Run all tests
npm test

# With coverage
npm run test:coverage

# With gas reporting
REPORT_GAS=true npm test
```

### 5. Deploy to Testnet

```bash
# Deploy all contracts
npm run deploy:testnet
```

This will deploy:
- NahuiFactory
- NahuiMarketplace

Deployment info saved to `contracts/deployments/ande-testnet-1234.json`

### 6. Verify Contracts

```bash
# Verify Factory
npx hardhat verify --network ande-testnet <FACTORY_ADDRESS> <PLATFORM_FEE_RECIPIENT> 250

# Verify Marketplace
npx hardhat verify --network ande-testnet <MARKETPLACE_ADDRESS> <PLATFORM_FEE_RECIPIENT> 250
```

### 7. Save Contract Addresses

Copy addresses from `contracts/deployments/ande-testnet-1234.json`

## Phase 2: Frontend Deployment

### 1. Configure Frontend Environment

```bash
cd apps/frontend

# Copy environment template
cp .env.local.example .env.local

# Edit with your values
nano .env.local
```

Required variables:
```bash
# ANDE Network
NEXT_PUBLIC_ANDE_RPC_URL=https://rpc.testnet.ande.network
NEXT_PUBLIC_ANDE_CHAIN_ID=1234

# Contract Addresses (from deployment)
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...

# WalletConnect (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# IPFS (get from https://pinata.cloud)
NEXT_PUBLIC_PINATA_API_KEY=your_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_secret
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000

Test:
- Wallet connection
- Network switching
- Contract interaction

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy Frontend

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

#### Option B: Docker

```bash
# Build Docker image
docker build -t nahui-gallery-frontend .

# Run container
docker run -p 3000:3000 nahui-gallery-frontend
```

#### Option C: Static Export

```bash
# Add to next.config.js
output: 'export'

# Build static files
npm run build

# Deploy /out directory to any static host
```

## Phase 3: Testing on Testnet

### 1. Get Testnet Funds

Visit ANDE faucet: https://faucet.testnet.ande.network

### 2. Test Complete Flow

**A. Create NFT Collection:**
1. Connect wallet to testnet
2. Go to "Create" page (when implemented)
3. Deploy NFT collection via Factory
4. Mint test NFTs

**B. List on Marketplace:**
1. Approve marketplace
2. List NFT for sale
3. Test buying from another wallet

**C. Test Royalties:**
1. Secondary sale
2. Verify royalty distribution

### 3. Monitor Transactions

Check transactions on ANDE Explorer:
https://testnet.explorer.ande.network

## Phase 4: Mainnet Deployment

### Prerequisites

- Completed testnet testing
- Smart contract audits completed
- Security review done
- Mainnet funds for deployment

### 1. Update Environment

```bash
# Update .env
ANDE_NETWORK_RPC_URL=https://rpc.ande.network
ANDE_NETWORK_CHAIN_ID=5678  # Mainnet ID

# Update deployer with mainnet wallet
DEPLOYER_PRIVATE_KEY=0x...
```

### 2. Deploy to Mainnet

```bash
# CAREFUL - THIS IS PRODUCTION
npm run deploy:mainnet
```

### 3. Verify Contracts

```bash
npx hardhat verify --network ande-mainnet <ADDRESS> <ARGS>
```

### 4. Update Frontend

Update `.env.local` with mainnet values:
```bash
NEXT_PUBLIC_ANDE_RPC_URL=https://rpc.ande.network
NEXT_PUBLIC_ANDE_CHAIN_ID=5678
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
```

### 5. Deploy Production Frontend

```bash
vercel --prod
```

## Troubleshooting

### Contract Deployment Fails

**Issue:** "Insufficient funds"
- Get more testnet tokens from faucet
- Check wallet balance

**Issue:** "Nonce too low"
- Reset MetaMask account
- Or manually set nonce in deployment script

### Frontend Connection Issues

**Issue:** "Wrong network"
- Click "Switch Network" button
- Or manually add ANDE Network to MetaMask

**Issue:** "Contract not found"
- Verify contract addresses in .env.local
- Check network ID matches

### Transaction Fails

**Issue:** "Out of gas"
- Increase gas limit
- Check contract logic

**Issue:** "Insufficient payment"
- Check mint price
- Send correct amount

## Monitoring & Maintenance

### Contract Events

Monitor contract events:
```javascript
// Example event listener
contract.on('Listed', (listingId, seller, price) => {
  console.log('New listing:', listingId);
});
```

### Analytics

Set up:
- Google Analytics
- Mixpanel
- Custom analytics

### Updates

To update contracts:
1. Deploy new version
2. Update factory implementation
3. Migrate data if needed
4. Update frontend addresses

## Security Checklist

Before mainnet:
- [ ] Smart contracts audited (2+ firms)
- [ ] Penetration testing completed
- [ ] Bug bounty program active
- [ ] Rate limiting configured
- [ ] DDoS protection enabled
- [ ] Backup systems ready
- [ ] Incident response plan
- [ ] Insurance considered

## Support

- Documentation: https://docs.nahuigallery.art
- Discord: https://discord.gg/nahuigallery
- Email: support@nahuigallery.art

## Useful Links

- ANDE Network Docs: https://docs.ande.network
- Testnet Faucet: https://faucet.testnet.ande.network
- Explorer: https://testnet.explorer.ande.network
- WalletConnect: https://cloud.walletconnect.com
- Pinata: https://pinata.cloud
- Hardhat: https://hardhat.org
- Next.js: https://nextjs.org
- Wagmi: https://wagmi.sh

---

**Ready to deploy!** 🚀

Follow this guide step-by-step for a smooth deployment to testnet.
