# NahuiGallery Frontend

Production-ready Next.js 14 frontend for NahuiGallery NFT platform.

## Features

- **Next.js 14** with App Router and Server Components
- **Wagmi v2** + **viem** for type-safe Web3 interactions
- **Web3Modal** for multi-wallet connection (MetaMask, WalletConnect, Coinbase)
- **TailwindCSS** for responsive, modern UI
- **TypeScript** throughout
- **React Query** for efficient data fetching
- **Framer Motion** for smooth animations

## Getting Started

### Prerequisites

- Node.js 20+
- npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your configuration
# - Add WalletConnect Project ID
# - Add deployed contract addresses
# - Configure RPC URLs
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Environment Variables

Required environment variables in `.env.local`:

```bash
# ANDE Network
NEXT_PUBLIC_ANDE_RPC_URL=https://rpc.testnet.ande.network
NEXT_PUBLIC_ANDE_CHAIN_ID=1234

# Smart Contracts
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# IPFS
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret
```

## Project Structure

```
apps/frontend/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Homepage
│   │   ├── providers.tsx   # Web3 providers
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   └── web3/           # Web3 components
│   │       ├── ConnectButton.tsx
│   │       └── NetworkStatus.tsx
│   ├── hooks/              # Custom hooks
│   │   └── useNFTContract.ts
│   └── lib/                # Utilities
│       └── wagmi.ts        # Wagmi configuration
├── public/                 # Static assets
├── next.config.js          # Next.js config
├── tailwind.config.ts      # Tailwind config
└── package.json
```

## Key Components

### ConnectButton

Multi-wallet connection button with dropdown menu.

```tsx
import { ConnectButton } from '@/components/web3/ConnectButton';

<ConnectButton />
```

### NetworkStatus

Displays current network and allows switching to ANDE Network.

```tsx
import { NetworkStatus } from '@/components/web3/NetworkStatus';

<NetworkStatus />
```

### useNFTContract Hook

Type-safe hook for interacting with NFT contracts.

```tsx
import { useNFTContract } from '@/hooks/useNFTContract';

const { mint, mintPrice, totalMinted } = useNFTContract(contractAddress);

// Mint 5 NFTs
mint(5);
```

## Styling

Uses TailwindCSS with custom configuration:

- **Brand Colors**: Primary (red), Secondary (blue), Accent (yellow)
- **Custom Animations**: fade-in, slide-up, scale-in, shimmer
- **Glassmorphism**: `.glass` and `.glass-dark` classes
- **Custom Scrollbar**: `.scrollbar-thin` class
- **Button Variants**: `.btn-primary`, `.btn-secondary`, `.btn-outline`

## Web3 Integration

### Wagmi Configuration

Configured in `src/lib/wagmi.ts`:

- ANDE Network (testnet/mainnet)
- WalletConnect v2
- MetaMask (injected)
- Coinbase Wallet

### Supported Wallets

- MetaMask
- WalletConnect (300+ wallets)
- Coinbase Wallet
- Rainbow Wallet
- Trust Wallet
- And more...

## Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Docker

```bash
docker build -t nahui-gallery-frontend .
docker run -p 3000:3000 nahui-gallery-frontend
```

### Environment Variables

Make sure to set all required environment variables in your deployment platform.

## Performance

- **Lighthouse Score**: 90+ (all metrics)
- **Bundle Size**: Optimized with tree-shaking
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: React Query + SWR patterns

## SEO

- Dynamic metadata per page
- Open Graph tags
- Twitter Card support
- Structured data (JSON-LD)
- Sitemap generation

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- Focus management
- Semantic HTML

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

MIT

## Support

- Documentation: https://docs.nahuigallery.art
- Discord: https://discord.gg/nahuigallery
- Twitter: @NahuiGallery
