# NahuiGallery Architecture Overview

## Table of Contents

1. [Introduction](#introduction)
2. [Architectural Principles](#architectural-principles)
3. [System Architecture](#system-architecture)
4. [Component Design](#component-design)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)
7. [Scalability & Performance](#scalability--performance)
8. [Technology Decisions](#technology-decisions)

## Introduction

NahuiGallery's architecture is designed following industry best practices from leading NFT platforms (OpenSea, Foundation, SuperRare, Sound.xyz) combined with modern microservices patterns and Web3 technologies.

### Design Goals

1. **Scalability**: Handle thousands of concurrent users and NFT transactions
2. **Performance**: Near-instant UI responses, fast blockchain confirmations
3. **Security**: Multi-layer security, audited smart contracts, zero-trust model
4. **Maintainability**: Modular design, clear separation of concerns
5. **User Experience**: Seamless Web3 onboarding, intuitive interfaces
6. **Cost Efficiency**: Optimized gas usage, efficient resource utilization

## Architectural Principles

### 1. Microservices Architecture

Following **Domain-Driven Design (DDD)**, we organize services around business capabilities:

```
User Service     → User management, authentication, profiles
NFT Service      → Minting, metadata, token management
Marketplace      → Listings, sales, offers, price discovery
Auction Service  → Dynamic pricing, bidding logic
Curator Service  → Collections, exhibitions, verification
Analytics        → Stats, trending, recommendations
Royalty Service  → Automatic royalty distribution
Wallet Service   → Custody, balance, transaction history
```

**Benefits:**
- Independent deployment and scaling
- Technology flexibility per service
- Fault isolation
- Team autonomy

### 2. Event-Driven Architecture (EDA)

Services communicate asynchronously via events:

```
NFT Minted Event → Analytics Service (update stats)
                 → Curator Service (check for collections)
                 → Notification Service (alert followers)

Sale Completed → Royalty Service (distribute payments)
               → Analytics Service (update volume)
               → User Service (update seller/buyer stats)
```

**Benefits:**
- Loose coupling
- Real-time responsiveness
- Scalability
- Resilience

### 3. Modular Smart Contracts

Inspired by **Sound Protocol**, our contracts are:

- **Non-upgradeable**: Immutability for security and trust
- **Factory Pattern**: Gas-efficient deployment via minimal proxies
- **Modular**: Separate concerns (minting, royalties, metadata)
- **Auditable**: Small, focused contracts easier to audit

### 4. Zero Trust Security

Every request is authenticated and authorized:

- API Gateway validates all requests
- Service-to-service authentication (mutual TLS)
- Rate limiting and DDoS protection
- Smart contract audits and monitoring
- Regular security reviews

## System Architecture

### High-Level Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Web App    │  │  Mobile App  │  │    Admin     │         │
│  │  (Next.js)   │  │(React Native)│  │   Dashboard  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      EDGE LAYER                                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Cloudflare  │  │     WAF      │  │     CDN      │         │
│  │     DDoS     │  │  Protection  │  │   (Assets)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │  Kong API Gateway / AWS API Gateway             │           │
│  │  - Authentication & Authorization               │           │
│  │  - Rate Limiting                                │           │
│  │  - Request Routing                              │           │
│  │  - Load Balancing                               │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │  GraphQL Gateway (Apollo Federation)            │           │
│  │  - Query Federation                             │           │
│  │  - Schema Stitching                             │           │
│  │  - Caching                                      │           │
│  └─────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  MICROSERVICES LAYER                            │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  User    │ │   NFT    │ │Marketplace│ │Analytics │          │
│  │ Service  │ │ Service  │ │ Service   │ │ Service  │          │
│  │ (NestJS) │ │ (NestJS) │ │ (NestJS)  │ │ (NestJS) │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Auction  │ │ Curator  │ │ Royalty  │ │  Wallet  │          │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │          │
│  │ (NestJS) │ │ (NestJS) │ │ (NestJS) │ │ (NestJS) │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │         Message Bus (RabbitMQ / Kafka)           │          │
│  │         Event-Driven Communication               │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │   MongoDB    │  │    Redis     │         │
│  │              │  │              │  │              │         │
│  │ - Users      │  │ - NFT        │  │ - Sessions   │         │
│  │ - Txns       │  │   Metadata   │  │ - Cache      │         │
│  │ - Auctions   │  │ - Collections│  │ - Rate Limit │         │
│  │ - Analytics  │  │ - Exhibits   │  │ - Queues     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │            ANDE Network (EVM RPC)                │          │
│  │  - Fast confirmations (< 2s)                     │          │
│  │  - Low gas fees (~0.0001 ANDE)                   │          │
│  │  - EVM compatible                                │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Smart      │  │   Factory    │  │   Royalty    │         │
│  │  Contracts   │  │  Contracts   │  │  Splitter    │         │
│  │ (ERC-721A)   │  │ (Minimal     │  │ (ERC-2981)   │         │
│  │              │  │  Proxies)    │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │               IPFS (Decentralized)              │           │
│  │  - NFT Metadata (JSON)                          │           │
│  │  - Images, Videos, Audio                        │           │
│  │  - Permanent, Content-Addressed                 │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ Pinata   │  │   NFT    │  │ Filebase │                     │
│  │ (Pinning)│  │ Storage  │  │(Geo-Red.)│                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

## Component Design

### Frontend Architecture (Next.js App)

```
apps/frontend/
├── app/                      # Next.js 14 App Router
│   ├── (marketing)/         # Public pages
│   │   ├── page.tsx         # Homepage
│   │   ├── about/           # About page
│   │   └── artists/         # Featured artists
│   ├── (marketplace)/       # Marketplace pages
│   │   ├── explore/         # Browse NFTs
│   │   ├── collections/     # Collections
│   │   └── auctions/        # Live auctions
│   ├── (studio)/            # Artist studio (auth required)
│   │   ├── create/          # Mint NFT
│   │   ├── dashboard/       # Artist dashboard
│   │   └── analytics/       # Stats & insights
│   └── (user)/              # User pages
│       ├── profile/         # User profile
│       └── collection/      # User collection
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── web3/                # Web3-specific components
│   │   ├── ConnectWallet/
│   │   ├── MintNFT/
│   │   └── BuyNFT/
│   ├── nft/                 # NFT display components
│   └── layout/              # Layout components
├── lib/
│   ├── wagmi.ts             # Wagmi configuration
│   ├── apollo.ts            # Apollo Client
│   ├── ipfs.ts              # IPFS utilities
│   └── contracts.ts         # Contract ABIs & addresses
├── hooks/
│   ├── useNFT.ts            # NFT data fetching
│   ├── useMarketplace.ts    # Marketplace operations
│   └── useWallet.ts         # Wallet operations
├── store/                   # Zustand state management
└── styles/                  # Global styles
```

**Key Technologies:**
- **Next.js 14**: App Router, Server Components, Server Actions
- **Wagmi v2**: Type-safe Ethereum hooks
- **viem**: Low-level Ethereum library
- **Web3Modal**: Multi-wallet connection
- **Apollo Client**: GraphQL data fetching
- **TailwindCSS**: Utility-first styling
- **Framer Motion**: Animations

### Backend Microservices (NestJS)

Each microservice follows this structure:

```
services/[service-name]/
├── src/
│   ├── modules/             # Feature modules
│   │   ├── [feature]/
│   │   │   ├── dto/         # Data Transfer Objects
│   │   │   ├── entities/    # Database entities
│   │   │   ├── [feature].controller.ts
│   │   │   ├── [feature].service.ts
│   │   │   ├── [feature].repository.ts
│   │   │   └── [feature].module.ts
│   ├── common/              # Shared code
│   │   ├── guards/          # Auth guards
│   │   ├── interceptors/    # Request/response interceptors
│   │   ├── filters/         # Exception filters
│   │   └── decorators/      # Custom decorators
│   ├── config/              # Configuration
│   └── main.ts              # Bootstrap
├── test/                    # Tests
├── Dockerfile
└── package.json
```

#### Service Responsibilities

**User Service:**
- User registration & authentication
- Profile management
- Social connections
- Artist verification
- Wallet linking

**NFT Service:**
- NFT minting coordination
- Metadata management
- IPFS uploads
- Collection management
- Token indexing

**Marketplace Service:**
- Listing management
- Buy/Sell operations
- Offer system
- Price discovery
- Transaction history

**Auction Service:**
- Auction creation & management
- Bidding logic
- Automatic settlement
- Reserve price handling
- Dutch auctions

**Curator Service:**
- Collection curation
- Exhibition management
- Featured artists
- Trending NFTs
- Quality scoring

**Analytics Service:**
- User analytics
- NFT statistics
- Market trends
- Volume tracking
- Recommendation engine

**Royalty Service:**
- Royalty calculation
- Payment distribution
- Split management
- Historical tracking

**Wallet Service:**
- Custodial wallet management
- Balance tracking
- Transaction signing
- Multi-sig support

### Smart Contract Architecture

See [smart-contracts.md](./smart-contracts.md) for detailed contract design.

```
contracts/src/
├── core/
│   ├── NahuiNFT.sol          # Main NFT contract (ERC-721A)
│   ├── NahuiFactory.sol      # NFT deployment factory
│   └── NahuiRegistry.sol     # Global NFT registry
├── marketplace/
│   ├── NahuiMarketplace.sol  # Marketplace contract
│   ├── NahuiAuction.sol      # Auction contract
│   └── NahuiOffers.sol       # Offer system
├── royalties/
│   ├── RoyaltySplitter.sol   # Revenue distribution
│   └── RoyaltyRegistry.sol   # Royalty configuration
├── modules/
│   ├── MinterModule.sol      # Custom minting logic
│   ├── MetadataModule.sol    # Metadata management
│   └── AccessModule.sol      # Access control
└── utils/
    ├── Counters.sol
    └── SafeMath.sol
```

**Contract Features:**
- **ERC-721A**: Gas-optimized batch minting
- **ERC-2981**: Royalty standard support
- **Factory Pattern**: Minimal proxy deployment
- **Modular Design**: Pluggable modules
- **Upgradeability**: Proxy patterns where needed
- **Access Control**: Role-based permissions

## Data Flow

### NFT Minting Flow

```
User Uploads      Frontend          NFT Service       IPFS          Smart Contract
    File         (Next.js)          (NestJS)        (Pinata)       (ANDE Network)
     │               │                 │               │                 │
     │─── Upload ───>│                 │               │                 │
     │               │─── Process ────>│               │                 │
     │               │                 │─── Pin ──────>│                 │
     │               │                 │<── CID ───────│                 │
     │               │                 │                                 │
     │               │                 │─── Create Metadata (JSON) ─────>│
     │               │                 │<── Metadata CID ────────────────│
     │               │                 │                                 │
     │               │<── IPFS URIs ───│                                 │
     │<── Preview ───│                 │                                 │
     │                                                                   │
     │─── Sign Tx ──>│                                                   │
     │               │──────────── mint(tokenURI) ────────────────────>│
     │               │<──────────── NFT Minted ───────────────────────│
     │               │                                                   │
     │               │─── Index NFT ──>│                                 │
     │               │                 │─── Emit Event ─>│               │
     │               │                 │                 ├─> Analytics   │
     │               │                 │                 ├─> Curator     │
     │               │                 │                 └─> Notif       │
     │<── Success ───│                 │                                 │
```

### NFT Purchase Flow

```
Buyer          Frontend      Marketplace     Royalty       Seller       Smart Contract
  │               │            Service        Service         │              │
  │─── Browse ───>│               │              │            │              │
  │<── NFTs ──────│               │              │            │              │
  │                                                                          │
  │─── Buy ──────>│               │              │            │              │
  │               │─── Get Price >│              │            │              │
  │               │<── Price ─────│              │            │              │
  │               │                                                          │
  │<── Confirm ───│                                                          │
  │─── Sign ─────>│                                                          │
  │               │──────────── buy(tokenId) {value} ────────────────────>│
  │               │                                                          │
  │               │<──────────── Transfer + Payment ──────────────────────│
  │               │                              │                          │
  │               │─── Process ─────────────────>│                          │
  │               │                              │─── Calculate ────────>   │
  │               │                              │<── Royalty %───────────   │
  │               │                              │─── Distribute ────────>   │
  │               │                              │                      (pays seller)
  │               │                                                          │
  │               │─── Update ──>│                                           │
  │               │               │─── Emit Events ──>│                      │
  │               │               │                   ├─> Analytics         │
  │               │               │                   └─> Notifications     │
  │<── Success ───│               │                                          │
```

## Security Architecture

### Multi-Layer Security

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 7: Application                     │
│  - Input validation                                         │
│  - Output encoding                                          │
│  - CSRF protection                                          │
│  - XSS prevention                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Layer 6: Authentication                   │
│  - JWT tokens                                               │
│  - Web3 signature verification                              │
│  - OAuth2 / OpenID Connect                                  │
│  - Multi-factor authentication (MFA)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Layer 5: Authorization                    │
│  - Role-based access control (RBAC)                         │
│  - Attribute-based access control (ABAC)                    │
│  - Resource-level permissions                               │
│  - Smart contract access control                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Layer 4: API Security                     │
│  - Rate limiting (per IP, per user, per endpoint)           │
│  - API key management                                       │
│  - Request signing                                          │
│  - Payload size limits                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Layer 3: Network Security                 │
│  - TLS/SSL encryption (HTTPS)                               │
│  - VPC & private subnets                                    │
│  - Security groups & firewall rules                         │
│  - DDoS protection (Cloudflare)                             │
│  - WAF (Web Application Firewall)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Layer 2: Infrastructure                    │
│  - Container security (Docker scanning)                     │
│  - Kubernetes RBAC & network policies                       │
│  - Secrets management (Vault, AWS Secrets)                  │
│  - Regular security patching                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Layer 1: Smart Contracts                   │
│  - Audited by multiple firms                                │
│  - Reentrancy protection                                    │
│  - Integer overflow/underflow checks                        │
│  - Access control modifiers                                 │
│  - Emergency pause mechanisms                               │
│  - Time-locked upgrades                                     │
└─────────────────────────────────────────────────────────────┘
```

### Security Best Practices

1. **Smart Contract Security**
   - Multiple independent audits (Consensys Diligence, Trail of Bits, OpenZeppelin)
   - Formal verification where critical
   - Bug bounty program
   - Gradual rollout (testnet → staging → mainnet)
   - Emergency pause functionality

2. **API Security**
   - Rate limiting: 100 req/min per user, 1000 req/min per IP
   - Request signing for sensitive operations
   - CORS restrictions
   - Helmet.js for HTTP headers
   - SQL injection prevention (parameterized queries)

3. **Authentication & Authorization**
   - Web3 signature-based auth (SIWE - Sign-In with Ethereum)
   - Short-lived JWT tokens (15 min access, 7 day refresh)
   - Role-based permissions
   - Audit logging for all sensitive operations

4. **Data Protection**
   - Encryption at rest (AES-256)
   - Encryption in transit (TLS 1.3)
   - PII minimization
   - GDPR compliance
   - Regular backups with encryption

5. **Infrastructure Security**
   - Least privilege principle
   - Network segmentation
   - Intrusion detection (IDS/IPS)
   - Security information and event management (SIEM)
   - Regular penetration testing

## Scalability & Performance

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer (NGINX)                  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  API Gateway  │   │  API Gateway  │   │  API Gateway  │
│   Instance 1  │   │   Instance 2  │   │   Instance 3  │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ↓
                    ┌───────────────┐
                    │ Service Mesh  │
                    │    (Istio)    │
                    └───────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ NFT Service   │   │ NFT Service   │   │ NFT Service   │
│  Instance 1   │   │  Instance 2   │   │  Instance 3   │
└───────────────┘   └───────────────┘   └───────────────┘
```

**Auto-scaling policies:**
- CPU > 70%: Scale up
- CPU < 30% for 5 min: Scale down
- Min instances: 2
- Max instances: 20

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Cache Layers                           │
└─────────────────────────────────────────────────────────────┘

1. CDN Cache (Cloudflare)
   ├─ Static assets (images, CSS, JS)
   ├─ NFT media (images, videos)
   └─ TTL: 30 days

2. Redis Cache
   ├─ API responses (hot paths)
   ├─ User sessions
   ├─ NFT metadata
   └─ TTL: 5-60 minutes

3. Database Query Cache
   ├─ PostgreSQL query result cache
   ├─ MongoDB query cache
   └─ TTL: 1-5 minutes

4. Browser Cache
   ├─ Service Worker cache
   ├─ LocalStorage (user preferences)
   └─ IndexedDB (large datasets)
```

### Database Optimization

**PostgreSQL:**
- Partitioning large tables (transactions, events)
- Indexing strategy: B-tree for lookups, GiST for geospatial
- Connection pooling (PgBouncer)
- Read replicas for analytics queries
- Materialized views for dashboards

**MongoDB:**
- Sharding for NFT metadata collections
- Compound indexes on frequently queried fields
- TTL indexes for temporary data
- Aggregation pipeline optimization

**Redis:**
- Separate instances for cache vs. queue
- Redis Cluster for high availability
- Eviction policy: allkeys-lru

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p95) | < 200ms | New Relic APM |
| Page Load Time (p95) | < 2s | Lighthouse |
| NFT Minting Time | < 5s | Custom metrics |
| Smart Contract Gas Cost | < 100k gas | Hardhat gas reporter |
| Database Query Time (p95) | < 50ms | PostgreSQL logs |
| Blockchain Confirmation | < 2s | ANDE Network stats |

## Technology Decisions

### Why Next.js?

- **Server-Side Rendering (SSR)**: Better SEO for NFT pages
- **App Router**: Modern React patterns, Server Components
- **API Routes**: Serverless functions for simple backends
- **Image Optimization**: Automatic image optimization
- **TypeScript**: Built-in TypeScript support
- **Community**: Large ecosystem, extensive plugins

### Why NestJS for Backend?

- **TypeScript-first**: Type safety across the stack
- **Modular Architecture**: Perfect for microservices
- **Dependency Injection**: Clean, testable code
- **Extensive Ecosystem**: GraphQL, WebSockets, gRPC support
- **Enterprise-ready**: Used by large-scale applications
- **Developer Experience**: CLI tools, decorators, guards

### Why Wagmi + viem?

- **Type Safety**: Full TypeScript support
- **Modern**: Hooks-based React patterns
- **Lightweight**: viem is smaller than ethers.js
- **Composable**: Build complex logic from small hooks
- **Multi-chain**: Easy to support multiple networks
- **Active Development**: Maintained by Paradigm

### Why PostgreSQL + MongoDB?

- **PostgreSQL**: ACID compliance for financial transactions
- **MongoDB**: Flexible schema for NFT metadata
- **Polyglot Persistence**: Right tool for right job
- **Mature Ecosystems**: Extensive tooling, ORMs, monitoring

### Why Kubernetes?

- **Container Orchestration**: Automatic deployment, scaling
- **Self-healing**: Automatic restart of failed containers
- **Service Discovery**: Built-in DNS and load balancing
- **Rolling Updates**: Zero-downtime deployments
- **Resource Management**: CPU/memory limits and requests
- **Industry Standard**: Widely adopted, large community

### Why IPFS for Storage?

- **Decentralization**: No single point of failure
- **Content Addressing**: Immutable CIDs, tamper-proof
- **Permanent**: Data persists as long as pinned
- **No Vendor Lock-in**: Switch pinning services easily
- **NFT Standard**: Industry standard for NFT metadata

## Conclusion

NahuiGallery's architecture combines best practices from industry leaders with modern microservices patterns and Web3 technologies to create a scalable, secure, and performant NFT platform.

Key takeaways:

1. **Microservices**: Modular, independently scalable services
2. **Event-Driven**: Asynchronous, resilient communication
3. **Modular Contracts**: Secure, gas-efficient smart contracts
4. **Multi-Layer Security**: Defense in depth
5. **Horizontal Scaling**: Auto-scaling for peak loads
6. **Optimized Performance**: Caching, CDN, database tuning

For detailed component documentation, see:
- [Smart Contract Design](./smart-contracts.md)
- [Microservices Design](./microservices.md)
- [Frontend Architecture](./frontend.md)
- [Security Best Practices](../guides/security.md)
