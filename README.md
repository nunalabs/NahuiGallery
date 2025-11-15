# NahuiGallery - Premium NFT Platform on ANDE Network

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![ANDE Network](https://img.shields.io/badge/Network-ANDE-green.svg)](https://ande.network)

NahuiGallery is a premium NFT platform built on ANDE Network, designed for artists seeking a professional, secure, and high-value experience. Inspired by Latin American cultural richness, NahuiGallery transforms digital art into verified and tradable assets in a fast, efficient, and fully decentralized ecosystem.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

NahuiGallery connects Latin American art with modern blockchain technology, enabling artists to create, exhibit, and sell digital art with fast, secure, and economical transactions.

### Why NahuiGallery?

- **Ultra-low gas fees**: ~0.0001 ANDE per transaction
- **Near-instant confirmations**: Fast ANDE Network
- **Automatic royalties**: Perpetual revenue on secondary sales
- **Curated marketplace**: Quality over quantity
- **Artist-first platform**: Professional tools and analytics
- **Energy efficient**: Sustainable blockchain technology

## Key Features

### 1. NFT Minting
- Direct NFT creation on ANDE Network using EVM contracts (Solidity)
- Multimedia support: images, video, lossless music, collectibles, digital art
- Verifiable and updatable on-chain metadata
- Authenticity certificates and automatic royalty control

### 2. Curated Marketplace
- Quality-focused curation
- Thematic exhibitions and virtual galleries
- Rankings based on art and creativity, not speculation
- Featured artists and premium collections

### 3. Premium Artist Experience
- Customizable artist pages
- Complete collection management
- Real-time statistics: visits, sales, value
- Voting system and verified collectors

### 4. Fast & Economical Transactions
- Ultra-low gas thanks to ANDE Network
- Near-instant confirmations
- Automatic royalty payments on each resale
- Ideal for emerging artists

### 5. Fiat Integration / Off-Ramps
- Bridges to stablecoins (XLM, USDC) and cash
- Simple and secure payment reception
- Future integration with banks and local wallets

### 6. Flexible Custody
- **Non-custodial**: For advanced Web3 artists
- **Custodial / Assisted Wallet**: For new artists, simplified onboarding

## Architecture

NahuiGallery follows a modern, scalable, microservices-based architecture inspired by industry leaders like OpenSea, Foundation, SuperRare, and Sound.xyz.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  Next.js 14 + React + TailwindCSS + Wagmi + Web3Modal          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
│              Kong / AWS API Gateway + GraphQL                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Microservices Layer                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  User    │ │   NFT    │ │Marketplace│ │Analytics │          │
│  │ Service  │ │ Service  │ │ Service   │ │ Service  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Auction  │ │ Curator  │ │ Royalty  │ │  Wallet  │          │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │   MongoDB    │  │    Redis     │         │
│  │  (Relational)│  │    (NoSQL)   │  │   (Cache)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Blockchain Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ANDE Network  │  │ Smart        │  │    IPFS      │         │
│  │  (EVM RPC)   │  │ Contracts    │  │  (Storage)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

Based on best practices from leading NFT platforms:

1. **Microservices Architecture** (OpenSea-inspired)
   - Domain-driven design (DDD)
   - Independent deployment and scaling
   - Event-driven communication
   - Circuit breakers and resilience patterns

2. **Modular Smart Contracts** (Sound.xyz-inspired)
   - Non-upgradeable for security
   - Factory pattern for gas optimization
   - Modular minting/royalty/metadata modules
   - ERC-721A for batch minting efficiency

3. **Decentralized Storage** (Foundation/SuperRare-inspired)
   - IPFS for metadata and assets
   - Multiple pinning services (Pinata, NFT.Storage, Filebase)
   - Content-addressed (CID-based) storage
   - No vendor lock-in

4. **Layer 2 Scaling** (Industry standard)
   - ANDE Network (fast, low-cost EVM chain)
   - Optional cross-chain bridges
   - Optimistic rollup compatibility

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+ with TypeScript
- **Styling**: TailwindCSS + Headless UI
- **Web3 Integration**:
  - Wagmi v2 + viem (Ethereum interactions)
  - Web3Modal (Multi-wallet support)
  - WalletConnect v2, MetaMask, Coinbase Wallet
- **State Management**: Zustand + React Query
- **GraphQL**: Apollo Client
- **Forms**: React Hook Form + Zod validation

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Architecture**: Microservices
- **API Gateway**: Kong / AWS API Gateway
- **GraphQL**: Apollo Server / Mercurius
- **Event Bus**: RabbitMQ / Apache Kafka
- **Databases**:
  - PostgreSQL (relational data)
  - MongoDB (metadata, collections)
  - Redis (caching, sessions)
- **ORM**: Prisma / TypeORM
- **Authentication**: JWT + OAuth2 + Web3 signatures

### Blockchain
- **Network**: ANDE Network (EVM compatible)
- **Smart Contracts**: Solidity 0.8.20+
- **Standards**:
  - ERC-721A (gas-optimized NFTs)
  - ERC-2981 (royalty standard)
  - ERC-1155 (multi-token)
- **Development**: Hardhat / Foundry
- **Testing**: Chai, Waffle, Foundry tests
- **Security**: Slither, MythX, OpenZeppelin Defender

### Storage & CDN
- **Decentralized Storage**: IPFS
- **Pinning Services**: Pinata, NFT.Storage, Filebase
- **CDN**: Cloudflare / AWS CloudFront
- **Media Processing**: Sharp, FFmpeg

### Infrastructure
- **Container Runtime**: Docker
- **Orchestration**: Kubernetes (K8s)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Service Mesh**: Istio (optional)

### DevOps & Security
- **Cloud Provider**: AWS / Google Cloud / Azure
- **Load Balancer**: NGINX / AWS ALB
- **WAF**: Cloudflare / AWS WAF
- **Secrets Management**: HashiCorp Vault / AWS Secrets Manager
- **SSL/TLS**: Let's Encrypt / AWS Certificate Manager
- **DDoS Protection**: Cloudflare

## Getting Started

### Prerequisites

- Node.js 20+ and npm/yarn/pnpm
- Docker and Docker Compose
- Git
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/nunalabs/NahuiGallery.git
cd NahuiGallery

# Install dependencies for all services
npm run install:all

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development environment
docker-compose up -d

# Run database migrations
npm run migrate

# Start development servers
npm run dev
```

### Quick Start (Frontend only)

```bash
cd apps/frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
NahuiGallery/
├── apps/
│   ├── frontend/              # Next.js frontend application
│   ├── api-gateway/           # Kong/GraphQL API Gateway
│   └── admin-dashboard/       # Admin panel (React)
├── services/
│   ├── user-service/          # User management microservice
│   ├── nft-service/           # NFT minting & metadata
│   ├── marketplace-service/   # Listings, sales, offers
│   ├── auction-service/       # Auction logic
│   ├── curator-service/       # Curation & collections
│   ├── analytics-service/     # Stats & analytics
│   ├── royalty-service/       # Royalty distribution
│   └── wallet-service/        # Wallet management
├── contracts/
│   ├── src/                   # Solidity smart contracts
│   ├── test/                  # Contract tests
│   ├── scripts/               # Deployment scripts
│   └── audits/                # Security audit reports
├── packages/
│   ├── shared-types/          # Shared TypeScript types
│   ├── ui-components/         # Shared React components
│   └── utils/                 # Shared utilities
├── infrastructure/
│   ├── kubernetes/            # K8s manifests
│   ├── terraform/             # Infrastructure as Code
│   └── docker/                # Dockerfiles
├── docs/
│   ├── architecture/          # Architecture documentation
│   ├── api/                   # API documentation
│   └── guides/                # User & developer guides
└── scripts/
    ├── deploy/                # Deployment scripts
    └── tools/                 # Development tools
```

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Architecture Overview](docs/architecture/README.md)
- [Smart Contract Design](docs/architecture/smart-contracts.md)
- [Microservices Design](docs/architecture/microservices.md)
- [Frontend Architecture](docs/architecture/frontend.md)
- [API Reference](docs/api/README.md)
- [Deployment Guide](docs/guides/deployment.md)
- [Security Best Practices](docs/guides/security.md)

## Development Roadmap

### Phase 1: MVP (Q1 2025)
- [x] Architecture design
- [ ] Smart contract development (ERC-721A, marketplace)
- [ ] Frontend: artist pages, minting interface
- [ ] Backend: core microservices (user, NFT, marketplace)
- [ ] IPFS integration
- [ ] MetaMask integration
- [ ] Basic marketplace functionality

### Phase 2: Enhanced Features (Q2 2025)
- [ ] Auction system
- [ ] Curation & collections
- [ ] Advanced analytics dashboard
- [ ] Multi-wallet support (WalletConnect, Coinbase)
- [ ] Royalty automation
- [ ] Mobile-responsive improvements

### Phase 3: Advanced Features (Q3 2025)
- [ ] 3D galleries & virtual exhibitions
- [ ] Music NFT support (Munay Sounds integration)
- [ ] Social features & artist verification
- [ ] Fiat on-ramps/off-ramps
- [ ] Cross-chain bridges
- [ ] Mobile app (React Native)

### Phase 4: Scale & Optimize (Q4 2025)
- [ ] Performance optimization
- [ ] Advanced security audits
- [ ] Multi-language support
- [ ] Enterprise features
- [ ] API marketplace
- [ ] White-label solutions

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Website: [nahuigallery.art](https://nahuigallery.art)
- Twitter: [@NahuiGallery](https://twitter.com/NahuiGallery)
- Discord: [Join our community](https://discord.gg/nahuigallery)
- Email: hello@nahuigallery.art

## Acknowledgments

Built with inspiration from:
- [OpenSea](https://opensea.io) - Marketplace architecture
- [Foundation](https://foundation.app) - Curation and artist experience
- [SuperRare](https://superrare.com) - Premium art focus
- [Sound.xyz](https://sound.xyz) - Modular smart contract design
- [ANDE Network](https://ande.network) - Fast, low-cost EVM chain

---

Made with ❤️ for artists by [Nuna Labs](https://nunalabs.com)