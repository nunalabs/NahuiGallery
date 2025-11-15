# NahuiGallery User Workflows & Data Flows

## Table of Contents

1. [User Onboarding Flow](#user-onboarding-flow)
2. [NFT Minting Flow](#nft-minting-flow)
3. [NFT Purchase Flow](#nft-purchase-flow)
4. [Auction Flow](#auction-flow)
5. [Royalty Distribution Flow](#royalty-distribution-flow)
6. [Collection Curation Flow](#collection-curation-flow)
7. [Artist Verification Flow](#artist-verification-flow)

## User Onboarding Flow

### Non-Custodial Wallet Flow (Web3 Native Users)

```
┌────────────────────────────────────────────────────────────────┐
│                      User Journey                              │
└────────────────────────────────────────────────────────────────┘

1. User visits NahuiGallery.art
   │
   ↓
2. Click "Connect Wallet" button
   │
   ↓
3. Web3Modal displays wallet options
   ├─ MetaMask
   ├─ WalletConnect (mobile wallets)
   ├─ Coinbase Wallet
   └─ Other injected wallets
   │
   ↓
4. User selects wallet
   │
   ↓
5. Wallet prompts connection approval
   │
   ↓
6. User approves connection
   │
   ↓
7. Frontend detects wallet address
   │
   ↓
8. Backend checks if user exists
   │
   ├─ EXISTS: Load user profile
   │   │
   │   ↓
   │   Display personalized dashboard
   │
   └─ NEW USER: Create profile
       │
       ↓
       Request signature for authentication
       (Sign message: "Welcome to NahuiGallery - ${timestamp}")
       │
       ↓
       Verify signature on backend
       │
       ↓
       Create user record in database
       │
       ↓
       Issue JWT token (15 min expiry)
       │
       ↓
       Redirect to profile setup
       ├─ Username
       ├─ Bio
       ├─ Profile picture (upload to IPFS)
       ├─ Cover image
       └─ Social links
       │
       ↓
       Welcome to NahuiGallery!
```

### Custodial Wallet Flow (Web2 Users)

```
1. User visits NahuiGallery.art
   │
   ↓
2. Click "Sign up with Email"
   │
   ↓
3. Enter email + password
   │
   ↓
4. Email verification
   │
   ↓
5. Backend creates custodial wallet
   │
   ├─ Generate private key
   ├─ Encrypt with user password (AES-256)
   ├─ Store encrypted key in database
   └─ Derive public address
   │
   ↓
6. User completes profile setup
   │
   ↓
7. Display wallet address
   │
   ↓
8. Optional: Export private key (12-word seed phrase)
```

## NFT Minting Flow

### Complete Minting Journey

```
┌────────────────────────────────────────────────────────────────┐
│                    NFT Minting Flow                            │
└────────────────────────────────────────────────────────────────┘

Step 1: Upload Artwork
─────────────────────
User (Frontend)                 NFT Service              IPFS (Pinata)
     │                               │                        │
     │──── Upload file ─────────────>│                        │
     │     (image/video/audio)       │                        │
     │                               │                        │
     │                               │─── Validate file ─────>│
     │                               │    (format, size)      │
     │                               │                        │
     │                               │─── Upload to IPFS ────>│
     │                               │                        │
     │                               │<── Return CID ─────────│
     │                               │    (Qm...)             │
     │                               │                        │
     │                               │─── Pin file ──────────>│
     │                               │    (permanent)         │
     │                               │                        │
     │<── File CID ──────────────────│                        │
     │                               │                        │

Step 2: Create Metadata
─────────────────────
User (Frontend)                 NFT Service              IPFS
     │                               │                        │
     │─── Submit metadata ──────────>│                        │
     │    {                          │                        │
     │      name: "Artwork Title",   │                        │
     │      description: "...",      │                        │
     │      image: "ipfs://Qm...",   │                        │
     │      attributes: [...]        │                        │
     │    }                          │                        │
     │                               │                        │
     │                               │─── Create JSON ───────>│
     │                               │    (ERC-721 metadata)  │
     │                               │                        │
     │                               │<── Metadata CID ───────│
     │                               │                        │
     │<── Metadata URI ──────────────│                        │
     │    ipfs://Qm.../metadata.json │                        │

Step 3: Deploy Contract (First Mint) or Mint Token
──────────────────────────────────────────────────
User                    Frontend              Smart Contract (ANDE)
 │                           │                        │
 │─── Configure ────────────>│                        │
 │    - Collection name      │                        │
 │    - Symbol               │                        │
 │    - Max supply           │                        │
 │    - Mint price           │                        │
 │    - Royalty %            │                        │
 │                           │                        │
 │                           │─── deployNFT() ───────>│
 │                           │    via NahuiFactory    │
 │                           │                        │
 │<── Approve Tx ────────────│                        │
 │    (MetaMask popup)       │                        │
 │                           │                        │
 │─── Sign Tx ──────────────>│                        │
 │                           │                        │
 │                           │<── Tx Hash ────────────│
 │                           │                        │
 │                           │─── Wait confirmation ─>│
 │                           │                        │
 │                           │<── Contract deployed ──│
 │                           │    (0xABC123...)       │
 │                           │                        │
 │<── Success! ──────────────│                        │
 │    NFT minted: Token #1   │                        │

Step 4: Index NFT
──────────────────
Smart Contract          Event Listener         NFT Service          Database
      │                       │                      │                  │
      │─── Emit Transfer ────>│                      │                  │
      │     Event             │                      │                  │
      │                       │                      │                  │
      │                       │─── Process event ───>│                  │
      │                       │                      │                  │
      │                       │                      │─── Fetch ───────>│
      │                       │                      │    metadata      │
      │                       │                      │    from IPFS     │
      │                       │                      │                  │
      │                       │                      │─── Store NFT ───>│
      │                       │                      │    {              │
      │                       │                      │      tokenId,     │
      │                       │                      │      owner,       │
      │                       │                      │      metadata     │
      │                       │                      │    }              │
      │                       │                      │                  │
      │                       │                      │<── Indexed ──────│
      │                       │                      │                  │
      │                       │<── Emit event ───────│                  │
      │                       │    (NFT.Minted)      │                  │

Step 5: Notify & Display
─────────────────────────
NFT Service         Analytics Service      User Dashboard
     │                     │                      │
     │─── NFT.Minted ─────>│                      │
     │     Event           │                      │
     │                     │                      │
     │                     │─── Update stats ────>│
     │                     │    (total mints,     │
     │                     │     artist volume)   │
     │                     │                      │
     │─── Send notification ───────────────────>  │
     │    "Your NFT is live!"                     │
     │                                            │
     │────────────── Display NFT ────────────────>│
     │               in profile/gallery           │
```

### Gas Estimation

| Action | Gas Cost (ANDE) | USD Cost (@ $0.01/ANDE) |
|--------|-----------------|-------------------------|
| Deploy Contract (Factory) | ~250,000 | ~$2.50 |
| Mint Single NFT | ~50,000 | ~$0.50 |
| Mint 5 NFTs (Batch) | ~55,000 | ~$0.55 |
| Set Royalty | ~30,000 | ~$0.30 |

## NFT Purchase Flow

### Fixed-Price Purchase

```
┌────────────────────────────────────────────────────────────────┐
│                   NFT Purchase Flow                            │
└────────────────────────────────────────────────────────────────┘

Step 1: Browse & Discover
──────────────────────────
Buyer                   Frontend              Marketplace Service
  │                          │                        │
  │─── Browse NFTs ─────────>│                        │
  │                          │                        │
  │                          │─── Get listings ──────>│
  │                          │                        │
  │                          │<── Return NFTs ────────│
  │                          │    [{                  │
  │                          │      tokenId,          │
  │                          │      price,            │
  │                          │      seller,           │
  │                          │      metadata          │
  │                          │    }]                  │
  │<── Display gallery ──────│                        │

Step 2: View NFT Details
─────────────────────────
Buyer                   Frontend              IPFS
  │                          │                  │
  │─── Click NFT ───────────>│                  │
  │                          │                  │
  │                          │─── Fetch ───────>│
  │                          │    metadata      │
  │                          │                  │
  │                          │<── JSON ─────────│
  │                          │    {             │
  │                          │      name,       │
  │                          │      image,      │
  │                          │      attributes  │
  │                          │    }             │
  │<── Display details ──────│                  │
  │    - High-res image                         │
  │    - Description                            │
  │    - Properties                             │
  │    - Price                                  │
  │    - Seller info                            │

Step 3: Purchase Transaction
─────────────────────────────
Buyer          Frontend       Smart Contract      Royalty       Seller
  │                │                │                │             │
  │─── Buy NFT ───>│                │                │             │
  │                │                │                │             │
  │                │─── buy() ─────>│                │             │
  │                │    {value: X}  │                │             │
  │                │                │                │             │
  │<── Approve ────│                │                │             │
  │    (MetaMask)  │                │                │             │
  │                │                │                │             │
  │─── Sign Tx ───>│                │                │             │
  │                │                │                │             │
  │                │                │─── Calculate ─>│             │
  │                │                │    royalty     │             │
  │                │                │    (10%)       │             │
  │                │                │                │             │
  │                │                │<── Amount ─────│             │
  │                │                │                │             │
  │                │                │─── Transfer NFT ────────────>│
  │                │                │                │      (buyer)│
  │                │                │                │             │
  │                │                │─── Pay royalty >│             │
  │                │                │    (10%)       │             │
  │                │                │                │             │
  │                │                │─── Pay platform fee ────>    │
  │                │                │    (2.5%)                    │
  │                │                │                              │
  │                │                │─── Pay seller ──────────────>│
  │                │                │    (87.5%)                   │
  │                │                │                              │
  │                │<── Tx hash ────│                              │
  │                │                │                              │
  │<── Success! ───│                                               │
  │    You now own NFT #123                                        │

Step 4: Update Ownership
─────────────────────────
Smart Contract      Event Listener      NFT Service       Database
      │                   │                   │               │
      │─── Emit ─────────>│                   │               │
      │    Transfer       │                   │               │
      │    Event          │                   │               │
      │                   │                   │               │
      │                   │─── Process ──────>│               │
      │                   │    event          │               │
      │                   │                   │               │
      │                   │                   │─── Update ───>│
      │                   │                   │    owner      │
      │                   │                   │               │
      │                   │                   │─── Record ───>│
      │                   │                   │    sale       │
      │                   │                   │    history    │
      │                   │                   │               │
      │                   │                   │<── Updated ───│

Step 5: Analytics & Notifications
──────────────────────────────────
NFT Service       Analytics       Buyer          Seller
     │                │              │              │
     │─── Sale ──────>│              │              │
     │    Event       │              │              │
     │                │              │              │
     │                │─── Update ──>│              │
     │                │    stats     │              │
     │                │    - Volume  │              │
     │                │    - Floor   │              │
     │                │                             │
     │─── Notify ────────────────────>│             │
     │    "You bought NFT #123!"      │             │
     │                                               │
     │─── Notify ───────────────────────────────────>│
     │    "Your NFT sold for 10 ANDE!"               │
```

## Auction Flow

### English Auction (Ascending Price)

```
┌────────────────────────────────────────────────────────────────┐
│                    Auction Flow                                │
└────────────────────────────────────────────────────────────────┘

Phase 1: Create Auction
────────────────────────
Seller          Frontend         Auction Contract       Database
  │                 │                   │                   │
  │─── Create ─────>│                   │                   │
  │    auction      │                   │                   │
  │    params:      │                   │                   │
  │    - Reserve    │                   │                   │
  │    - Duration   │                   │                   │
  │                 │                   │                   │
  │                 │─── approve() ────>│                   │
  │                 │    NFT transfer   │                   │
  │                 │                   │                   │
  │<── Approve ─────│                   │                   │
  │    (MetaMask)   │                   │                   │
  │                 │                   │                   │
  │─── Sign ───────>│                   │                   │
  │                 │                   │                   │
  │                 │─── createAuction >│                   │
  │                 │    (tokenId,      │                   │
  │                 │     reserve,      │                   │
  │                 │     duration)     │                   │
  │                 │                   │                   │
  │                 │<── Auction ID ────│                   │
  │                 │    (0xABC...)     │                   │
  │                 │                   │                   │
  │                 │────────────────────────── Save ──────>│
  │                 │                   │       auction     │
  │<── Success! ────│                   │                   │

Phase 2: Bidding
─────────────────
Bidder A        Bidder B         Frontend        Auction Contract
  │                 │                │                   │
  │─── View ───────>│                │                   │
  │    auction      │                │                   │
  │                 │                │                   │
  │─── Bid 5 ANDE ─>│                │                   │
  │                 │                │                   │
  │                 │                │─── bid() ────────>│
  │                 │                │    {value: 5}     │
  │                 │                │                   │
  │                 │                │<── Success ───────│
  │                 │                │    (highest bid)  │
  │                 │                │                   │
  │<── Notification ──────────────────│                  │
  │    "You're the highest bidder!"   │                  │
  │                                   │                  │
  │                 │─── Bid 7 ANDE ─>│                  │
  │                 │                 │                  │
  │                 │                 │─── bid() ───────>│
  │                 │                 │    {value: 7}    │
  │                 │                 │                  │
  │                 │                 │<── Success ──────│
  │                 │                 │    (new highest) │
  │                 │                 │                  │
  │                 │                 │─── Refund ──────>│
  │<────────────────────────────────────── 5 ANDE ───────│
  │    (previous bid returned)        │                  │
  │                                   │                  │
  │<── Notification ─────────────────────────────────────│
  │    "You've been outbid!"                             │
  │                                                      │
  │                 │<── Notification ────────────────────│
  │                 │    "You're the highest bidder!"    │

Phase 3: Auction End & Settlement
──────────────────────────────────
Time Passes...
  │
  ↓
Auction Duration Ends
  │
  ↓
Anyone          Frontend         Auction Contract      Winner    Seller
  │                 │                   │                 │         │
  │─── Settle ─────>│                   │                 │         │
  │    auction      │                   │                 │         │
  │                 │                   │                 │         │
  │                 │─── settleAuction >│                 │         │
  │                 │    (auctionId)    │                 │         │
  │                 │                   │                 │         │
  │                 │                   │─── Transfer NFT ────────> │
  │                 │                   │                 (winner)  │
  │                 │                   │                           │
  │                 │                   │─── Pay seller ───────────>│
  │                 │                   │    (minus fees)           │
  │                 │                   │                           │
  │                 │<── Settled ───────│                           │
  │                 │                                               │
  │                 │─── Notify ────────────────────────>│          │
  │                 │    "You won! NFT transferred"      │          │
  │                 │                                               │
  │                 │─── Notify ────────────────────────────────────>│
  │                 │    "Auction settled! Payment sent"            │
```

## Royalty Distribution Flow

```
┌────────────────────────────────────────────────────────────────┐
│                 Royalty Distribution Flow                      │
└────────────────────────────────────────────────────────────────┘

Secondary Sale Occurs
        │
        ↓
┌───────────────────────────┐
│  Sale Price: 100 ANDE     │
│  Royalty: 10% = 10 ANDE   │
│  Platform Fee: 2.5%       │
└───────────────────────────┘
        │
        ↓
Smart Contract (Marketplace)
        │
        ├─── Query royaltyInfo() ────> ERC-2981 Contract
        │                                      │
        │<──── Returns: (receiver, 10 ANDE) ───┘
        │
        ↓
Check if receiver is RoyaltySplitter
        │
        ├─── YES: Multiple recipients
        │    │
        │    ├─── Transfer to Splitter ──> RoyaltySplitter Contract
        │    │                                     │
        │    │                                     ├─ Artist: 60%
        │    │                                     ├─ Collaborator 1: 30%
        │    │                                     └─ Collaborator 2: 10%
        │    │
        │    └─── Each calls release() to claim their share
        │
        └─── NO: Single recipient
             │
             └─── Transfer 10 ANDE directly to artist
```

## Collection Curation Flow

```
┌────────────────────────────────────────────────────────────────┐
│                  Collection Curation Flow                      │
└────────────────────────────────────────────────────────────────┘

Step 1: Curator Proposes Collection
────────────────────────────────────
Curator         Frontend        Curator Service      Database
  │                 │                   │                │
  │─── Create ─────>│                   │                │
  │    collection   │                   │                │
  │    - Theme      │                   │                │
  │    - NFTs       │                   │                │
  │                 │                   │                │
  │                 │─── Submit ───────>│                │
  │                 │                   │                │
  │                 │                   │─── Save ──────>│
  │                 │                   │    (pending)   │
  │                 │                   │                │
  │<── Submitted ───│                   │                │

Step 2: Admin Review
─────────────────────
Admin           Admin Dashboard    Curator Service
  │                    │                   │
  │─── Review ────────>│                   │
  │    collection      │                   │
  │                    │                   │
  │                    │─── Get details ──>│
  │                    │                   │
  │                    │<── Collection ────│
  │<── Display ────────│                   │
  │                    │                   │
  │─── Approve ───────>│                   │
  │                    │                   │
  │                    │─── Update ───────>│
  │                    │    status         │
  │                    │    (approved)     │

Step 3: Publish Collection
───────────────────────────
Curator Service      Frontend      Users
      │                  │            │
      │─── Emit event ──>│            │
      │    (Featured)    │            │
      │                  │            │
      │                  │─── Update ────> Homepage
      │                  │    banner       │
      │                  │                 │
      │                  │─── Notify ─────>│
      │                  │    followers    │
```

## Artist Verification Flow

```
┌────────────────────────────────────────────────────────────────┐
│                 Artist Verification Flow                       │
└────────────────────────────────────────────────────────────────┘

Application
─────────────
Artist          Frontend         User Service       Database
  │                 │                   │               │
  │─── Apply ──────>│                   │               │
  │    - Portfolio  │                   │               │
  │    - Social     │                   │               │
  │    - Bio        │                   │               │
  │                 │                   │               │
  │                 │─── Submit ───────>│               │
  │                 │                   │               │
  │                 │                   │─── Save ─────>│
  │                 │                   │    (pending)  │

Review Process
───────────────
Admin Panel      User Service      Verification Team
     │                │                     │
     │─── Get ───────>│                     │
     │    pending     │                     │
     │                │                     │
     │<── List ───────│                     │
     │                │                     │
     │─── Review ─────────────────────────>│
     │    application                       │
     │    - Check portfolio quality         │
     │    - Verify social media             │
     │    - Confirm identity                │
     │                                      │
     │<── Decision ─────────────────────────│
     │    (approve/reject)                  │

Approval
─────────
User Service      Smart Contract      Artist
     │                   │                │
     │─── Update ───────>│                │
     │    status         │                │
     │    (verified)     │                │
     │                   │                │
     │─── Mark ─────────>│                │
     │    on-chain       │                │
     │    (optional)     │                │
     │                                    │
     │─── Notify ────────────────────────>│
     │    "You're verified!"              │
     │                                    │
     │─── Issue badge ───────────────────>│
     │    (Nahui Verified)                │
```

## Data Flow Summary

### Write Operations

```
User Action → Frontend → API Gateway → Microservice → Database
                  │                                       ↓
                  └────────────────────────→ Blockchain (if on-chain)
                                                         ↓
                                                  Event Emitted
                                                         ↓
                                               Event Listener
                                                         ↓
                                            Update Database & Cache
```

### Read Operations

```
User Request → Frontend → API Gateway → Cache (Redis)
                                           ├─ HIT: Return data
                                           └─ MISS: Query Database
                                                      ↓
                                                 Return data
                                                      ↓
                                              Update cache (5-60 min TTL)
```

### Real-Time Updates

```
Smart Contract Event → Event Listener → Message Queue (RabbitMQ)
                                               ↓
                                      Process Event
                                               ↓
                                     Update Database
                                               ↓
                                     Emit WebSocket Event
                                               ↓
                                     Frontend Updates (real-time)
```

## Performance Targets

| Flow | Target Duration |
|------|-----------------|
| Wallet Connection | < 3 seconds |
| NFT Minting | < 10 seconds (incl. blockchain confirmation) |
| Purchase Transaction | < 5 seconds |
| Metadata Load | < 1 second (cached) |
| Search/Browse | < 500ms |
| Artist Verification | 24-48 hours (manual review) |

## Conclusion

These workflows ensure:

- **Smooth onboarding** for both Web2 and Web3 users
- **Fast minting** with IPFS and ANDE Network
- **Secure transactions** with royalty distribution
- **Curated experience** with verified artists
- **Real-time updates** via event-driven architecture

Each flow is optimized for performance, security, and user experience.
