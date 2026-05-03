# SmartLand — Project Plan

**Ghana Land Registry & Real Estate Platform**  
Blockchain · Smart Contracts · SSI · Ghana Card · Multi-Payment

---

## 1. Vision & Problem Statement

### 1.1 Purpose
SmartLand supports the **Ghana Lands Commission** in planning and development of land in Ghana. It uses **real estate as a pivot** to enable:

- **Conflict prevention** — Tamper-proof records to reduce disputes
- **Secure land purchasing** — Transparent, auditable transactions
- **Recovery from lost records** — Flood, fire, and conflict have destroyed paper records; digital + blockchain provides durable proof
- **Fight fraud** — Forged documents, court appeals on fakes, reselling of the same land, and impersonation are mitigated by blockchain + SSI + Ghana Card

### 1.2 Core Problems Addressed
| Problem | How SmartLand Addresses It |
|--------|-----------------------------|
| Lost documents (flood, conflict) | Immutable blockchain records + SSI verifiable credentials; no single paper copy |
| Forged documents & court appeals | On-chain proof of title + Ghana Card–backed identity |
| Same land sold multiple times | Single source of truth on-chain; transfer only from current owner |
| Impersonation | Ghana Card (NIA IVSP) verification + SSI binding identity to wallet/account |
| Opacity & corruption risk | Transparent, auditable history; role-based access; **Ghana Lands Commission** (Admin) oversight |

### 1.3 Design Principles
- **Safe & secure** — Suitable for a government-backed land commission
- **Role-based** — Distinct roles: **Admin** (*is* the Ghana Lands Commission registry authority), **NIA**, **seller**, **buyer**, **arbitrator** — separate UIs and access control
- **Ghana-first** — Ghana Card verification, GHS, local mobile money
- **Cost-conscious** — Low gas fees, efficient use of blockchain

---

## 2. Entities & Role-Based Access

SmartLand treats **end users** (sellers, buyers, arbitrators) and **institutional operators** (**Admin** = Ghana Lands Commission; **NIA** verification officers) as separate roles. Everyone authenticates as a **user** with exactly one primary role for routing and authorization. There is **no separate “generic admin”** outside the Commission — **the Lands Commission is the Admin.**

| Entity | Description | Access & UI |
|--------|-------------|-------------|
| **Admin** (**Ghana Lands Commission**) | Official registry authority: Commission staff accounts for system oversight, approvals after NIA identity verification, audit | Full system view; user/parcel/dispute management; reports; config (`/admin`) |
| **NIA** | National Identification Authority staff; Ghana Card / biometric verification queue | Verification inbox; approve/reject identity submissions; reference IDs; verification audit — **no** parcel listing, escrow, or dispute fund control |
| **Seller** | Landowners / agents listing and selling property | List parcels, manage listings, receive payments, view own sales & documents |
| **Buyer** | Individuals or entities buying land | Browse/search, make offers, pay (escrow), view purchases & title history |
| **Arbitrator** | Certified mediators/arbitrators for disputes | View assigned disputes, evidence, votes; propose/resolve outcomes; no fund control |

### 2.1 Access Matrix (High Level)
| Capability | Admin (Ghana Lands Commission) | NIA | Seller | Buyer | Arbitrator |
|------------|--------|-----|--------|-------|------------|
| Submit Ghana Card / identity for verification | ✓ (self if applicable) | ✓ (self if applicable) | ✓ (self) | ✓ (self) | ✓ (self) |
| **Decide** NIA identity verification (approve/reject applicants) | ✗ | ✓ | ✗ | ✗ | ✗ |
| Registry / account approval — seller & buyer access to full features (after NIA verified) | ✓ | ✗ | ✗ | ✗ | ✗ |
| Register/list land | ✓ | ✗ | ✓ | ✗ | ✗ |
| Search & view listings | ✓ | Limited (verification context) | ✓ (all + own) | ✓ | Limited (dispute context) |
| Initiate purchase / escrow | ✓ | ✗ | ✗ | ✓ | ✗ |
| Release escrow / complete transfer | ✓ (override) | ✗ | ✓ (as seller) | ✗ | ✗ |
| File dispute | ✓ | ✗ | ✓ | ✓ | ✗ |
| Vote / mediate / resolve dispute | ✓ | ✗ | ✓ (as party/voter) | ✓ (as party/voter) | ✓ (full) |
| Manage users & roles | ✓ | ✗ | ✗ | ✗ | ✗ |
| View audit logs & analytics | ✓ | Verification scope | Own only | Own only | Assigned cases |
| Payment methods (deposit/withdraw) | ✓ | ✗ | ✓ | ✓ | ✓ (fees only) |

### 2.2 Frontend Structure (Role-Specific Pages)
- **Single app** with one codebase; routes and components rendered by role (each **user** account has one primary role).
- **After login**: redirect to role-specific dashboard (**`/admin`** = Ghana Lands Commission, **`/nia`**, `/seller`, `/buyer`, `/arbitrator`).
- **Shared**: Auth, Ghana Card verification flow (submit), wallet/payment UI (Binance-like) where applicable, help/legal.
- **Separate**: **Admin (Ghana Lands Commission)** dashboards, **NIA** verification queue, listing management (seller), search & purchase (buyer), dispute workspace (arbitrator).

---

## 3. Blockchain Choice (Low Cost & Fit for Land Registry)

### 3.1 Recommended: **Polygon (PoS)**

| Criterion | Polygon PoS |
|-----------|-------------|
| **Gas fees** | Typically **&lt; $0.01** per transaction (vs Ethereum mainnet $1.50–$50+) |
| **Speed** | ~2s block time |
| **EVM** | Full Solidity/EVM compatibility; reuse tooling (Hardhat, Foundry, Ethers) |
| **Security** | State anchored to Ethereum mainnet periodically |
| **Adoption** | Widely used for real estate tokenization and high-frequency registries |

**Why not Ethereum mainnet?** Gas costs are too high for frequent title updates, escrow, and dispute actions.

### 3.2 Alternative: **Celo**
- Very low fees; **fee abstraction** (pay gas in USDC/cUSD).
- Good if you want users to pay in stablecoins instead of native token.
- Can be considered for a second chain (e.g. payments) or pilot.

### 3.3 What Goes On-Chain (Summary)
- **Land registry (core)** — Parcel IDs, current owner, title hash, status (e.g. listed, under contract, disputed).
- **Escrow** — Lock funds against a deal; release to seller on completion or refund to buyer on dispute/cancel.
- **Dispute resolution** — Dispute ID, parties, arbitrator, status, resolution hash (evidence/outcome digest).
- **Access / consent** — Optional: consent records or role bindings (e.g. Admin, Arbitrator) if you want them on-chain.

**What stays off-chain:** Full documents, images, KYC details; only hashes or references stored on-chain. SSI credentials stored in wallets/holders, not full content on-chain.

---

## 4. Self-Sovereign Identity (SSI)

### 4.1 Goals
- **One identity per person** — Bound to Ghana Card to reduce impersonation and duplicate accounts.
- **Verifiable credentials (VCs)** — e.g. “Ghana Card verified”, “Landowner”, “Arbitrator”.
- **Selective disclosure** — Share only what’s needed (e.g. “over 18”, “verified by NIA”) without exposing full card number.

### 4.2 Ghana Card as Root of Trust
- **NIA IVSP** (National Identification Authority – Identity Verification System Platform) is the **official** way to verify Ghana Cards.
- **Integration:** Contact NIA for onboarding: **idverification@nia.gov.gh** (and see [NIA verification services](https://nia.gov.gh/service/verification-services/)).
- **Flow:** User submits consent + minimal data → backend calls NIA IVSP → on success, issue or link a **Verifiable Credential** (“Ghana Card verified”) and optionally bind to wallet/account.

### 4.3 SSI Components
- **DIDs** — Decentralized identifiers for each user (and optionally for parcels, orgs).
- **Verifiable Credentials** — Issued after Ghana Card check (and optionally after admin/arbitrator approval).
- **Verifiable Presentations** — Used when user proves “I am Ghana Card verified” or “I am the owner” without revealing raw PII.
- **Storage** — User’s wallet or app (custodial or non-custodial); only hashes or commitments on-chain if needed.

### 4.4 Suggested Stack (SSI)
- **Standards:** W3C DIDs, W3C Verifiable Credentials.
- **Libraries:** e.g. Veramo, Trinsic, or Matttr — choose one that supports your backend (Node/TS) and fits NIA integration (REST webhooks/API from NIA).

---

## 5. Smart Contracts (High-Level)

### 5.1 Contract Suite (Polygon)

| Contract | Responsibility |
|----------|----------------|
| **LandRegistry** | Parcel registry: register parcel (admin/seller), update owner on transfer, store title hash; emit events for indexer. |
| **Escrow** | Lock payment (GHS equivalent or stablecoin); release to seller on completion or refund to buyer on dispute/cancel; optional multi-sig for large deals. |
| **DisputeResolution** | Create dispute, link to parcel & escrow; assign arbitrator; record votes/outcome; trigger escrow release/refund based on resolution. |
| **AccessControl** | On-chain roles: **Admin** (Ghana Lands Commission authority), Seller, Buyer, Arbitrator. **NIA** verification is enforced in the **application layer** (and optionally recorded as hashes/events on-chain); contract calls still rely on AccessControl for economic actions (escrow, title transfer). |
| **Optional: PaymentRouter** | If you tokenize fiat (e.g. GHS-backed or stablecoin), route funds from mobile money / card gateway into escrow (via backend + one on-chain “mint/deposit” step). |

### 5.2 Security Practices
- Use **OpenZeppelin** (AccessControl, ReentrancyGuard, Pausable).
- **Upgradeability** — Consider proxies (e.g. UUPS) for LandRegistry and Escrow so Ghana Lands Commission can fix bugs or adjust logic under strict governance.
- **Multi-sig** for **Admin** (Ghana Lands Commission) keys (e.g. 2-of-3 or 3-of-5) for critical operations.
- **Events** for every state change to support off-chain indexing and audit.

---

## 6. Payments (Binance-Like + Ghana Rails)

### 6.1 Payment Methods

| Method | Use Case | Integration Notes |
|--------|----------|-------------------|
| **Credit / Debit Card** | Buyer deposits, seller payouts | Stripe, Paystack, or similar; PCI-compliant; GHS if supported. |
| **MTN MoMo** | Deposits & payouts in Ghana | MTN MoMo API (Request to Pay, refunds); sandbox: momodeveloper.mtn.com; live: momoapi.mtn.com after KYC. |
| **Telecel Cash** | Same as above | Telecel (Vodafone) mobile money API; integrate when API access is available. |
| **AirtelTigo Cash** | Same as above | AirtelTigo Money API; integrate when API access is available. |
| **Blockchain (crypto)** | Deposits/withdrawals; escrow in stablecoin (e.g. USDC on Polygon) | Wallet connect (e.g. MetaMask); receive USDC/Polygon MATIC; optional: in-app swap (Binance-like) later. |

### 6.2 Binance-Like Features (Relevant Subset)
- **Unified wallet** — One balance view: “Available”, “In escrow”, “Pending withdrawal”.
- **Deposit** — By card, MoMo, Telecel, AirtelTigo, or crypto; credit internal balance or direct to escrow contract.
- **Withdraw** — To bank/mobile money or crypto; KYC and limits as per policy.
- **Transaction history** — All deposits, withdrawals, escrow lock/release, dispute refunds; export for tax/audit.
- **Optional:** Simple “order” or “listing” state (e.g. listed price, accepted offer) that ties to escrow and disputes.

### 6.3 Escrow Flow (Cross-Payment)
1. Buyer chooses payment method (e.g. MoMo).
2. Backend creates “order” and requests payment (e.g. MoMo Request to Pay).
3. On payment confirmation, backend either:  
   - Credits internal “escrow balance” and records “locked for deal X”, or  
   - Converts to stablecoin and locks in **Escrow** contract (if you use on-chain escrow for that deal).
4. On “complete deal” or “dispute resolved”: release to seller or refund to buyer via same or different rail (e.g. MoMo refund API).

---

## 7. Security Architecture (End-to-End)

### 7.1 Identity & KYC
- **Ghana Card** via NIA IVSP only; no reliance on photocopies or manual checks.
- **SSI** for verifiable “Ghana Card verified” and role credentials; reduce replay and impersonation.
- **Session & auth** — JWT or session tokens; short-lived; refresh flow; optional 2FA for **Admin** (Ghana Lands Commission), **NIA**, and arbitrator.

### 7.2 Backend
- **API** — HTTPS only; rate limiting; CORS; input validation and sanitization.
- **AuthZ** — Every request checked against role (**Admin** = Ghana Lands Commission, **NIA**, Seller, Buyer, Arbitrator) and resource (e.g. parcel, dispute, verification record).
- **Secrets** — API keys (NIA, MoMo, Stripe, etc.) in env vault; no keys in frontend.
- **Audit logs** — Who did what, when (e.g. role change, parcel created, escrow released); store hashes on-chain if desired.

### 7.3 Frontend
- **Role-based UI** — Only render routes and components the user is allowed to use.
- **No sensitive keys** — Wallet (e.g. MetaMask) stays in user device; backend never holds private keys.
- **Secure storage** — Tokens in httpOnly cookies or secure storage; no credentials in localStorage for sensitive actions.

### 7.4 Blockchain
- **Immutable history** — Title and transfer history on-chain; dispute resolution outcomes recorded.
- **Smart contract** — Access control, reentrancy protection, and (if used) upgrade path under multi-sig.

---

## 8. Technology Stack (Recommendation)

### 8.1 Frontend
- **Framework:** React 18+ with TypeScript (or Next.js for SSR/SEO if you need public listing pages).
- **State:** React Query + Zustand (or Redux) for server state and auth.
- **UI:** Tailwind + shadcn/ui (or similar) for consistent, accessible components.
- **Wallet:** Wagmi + Viem (or ethers.js) for Polygon; WalletConnect for mobile.
- **Routing:** React Router (or Next.js router); guards per role; single entry, role-based layout.

### 8.2 Backend
- **Runtime:** Node.js with TypeScript.
- **API:** REST (or REST + GraphQL for complex dashboards); OpenAPI spec.
- **Auth:** JWT or session store (Redis); role in token or DB.
- **DB:** PostgreSQL (users, parcels metadata, orders, disputes, audit logs); optional full-text search (e.g. Elasticsearch) for listings.
- **Queue:** Redis/Bull or SQS for payment webhooks and async jobs (e.g. NIA call, MoMo callback).
- **SSI:** Veramo/Trinsic or similar; NIA IVSP integration via server-to-server.

### 8.3 Blockchain
- **Network:** Polygon Mainnet (and testnet for dev).
- **Contracts:** Solidity 0.8.x; Hardhat (or Foundry); OpenZeppelin.
- **Indexer:** The Graph or custom indexer (subgraph) for parcel list, transfers, disputes.
- **Backend ↔ chain:** Viem/Ethers in Node; wallet for server-signed txs (e.g. admin actions) in a secure HSM or KMS.

### 8.4 DevOps & Infra
- **Hosting:** Backend and frontend on cloud (e.g. AWS, GCP, or Azure); Ghana or nearby region if available.
- **CI/CD:** Build, test, deploy on push; separate staging and production.
- **Secrets:** AWS Secrets Manager / HashiCorp Vault (or equivalent).
- **Monitoring:** Logs, errors, and (optionally) on-chain event monitoring.

---

## 9. Implementation Phases

### Phase 1 — Foundation (Weeks 1–4)
- Repo structure: monorepo or separate frontend / backend / contracts.
- Auth: login, register, role selection; JWT/session; role-based redirect.
- Ghana Card: NIA IVSP onboarding + integration; “Ghana Card verified” flag and optional VC.
- DB schema: users, roles, parcels (metadata), disputes (metadata).
- Basic frontend: role-specific dashboards (**including NIA verification workspace**); shared layout and nav.

### Phase 2 — Blockchain & Contracts (Weeks 5–8)
- LandRegistry + AccessControl on Polygon testnet; deploy scripts and tests.
- Escrow contract; integrate with backend (create deal, lock, release, refund).
- DisputeResolution contract; link to parcel and escrow.
- Backend service to submit txs (e.g. register parcel, create escrow, resolve dispute); indexer or RPC polling for state.

### Phase 3 — Parcels & Listings (Weeks 9–12)
- Seller: create/list parcel (metadata in DB + hash/ID on-chain); edit/delist.
- Buyer: search/filter listings; view detail; “request to buy” or “make offer”.
- **Admin (Ghana Lands Commission):** approve/flag listings; view all parcels and history.
- Optional: map (e.g. Ghana regions) and document upload (hash stored on-chain).

### Phase 4 — Payments (Weeks 13–16)
- Unified wallet (balance, escrow, history) in UI.
- Integrate one fiat rail first (e.g. MoMo) and one crypto (e.g. USDC on Polygon).
- Escrow flow: lock on “deal accepted”; release/refund on completion or dispute.
- Credit card (Stripe/Paystack) and other mobile money (Telecel, AirtelTigo) when APIs are available.

### Phase 5 — Disputes & Arbitration (Weeks 17–20)
- File dispute (buyer/seller); assign arbitrator (**Admin** / Ghana Lands Commission or automatic).
- Arbitrator UI: view case, evidence, timeline; propose resolution; record outcome on-chain.
- Auto-refund or release from Escrow based on resolution.
- Notifications and basic email/dashboard alerts.

### Phase 6 — Hardening & Launch (Weeks 21–24)
- Security review (backend, frontend, contracts); penetration testing.
- NIA IVSP and payment providers go-live (production credentials).
- **Admin** (Ghana Lands Commission) training; runbooks; monitoring and alerts.
- Soft launch with Ghana Lands Commission; iterate from feedback.

---

## 10. Success Metrics

- **Integrity:** No duplicate titles for same parcel; every transfer and dispute outcome on-chain.
- **Identity:** 100% of active sellers/buyers/arbitrators verified via Ghana Card (NIA IVSP), with **NIA role** processing verifications per policy.
- **Availability:** Uptime target (e.g. 99.5%); payment and escrow completion within SLA.
- **Cost:** Gas per transaction (target &lt; $0.05 on Polygon); affordable for commission and users.
- **Trust:** Audit trail for every **Admin** (Ghana Lands Commission) action and dispute resolution; transparent to authorized roles.

---

## 11. References & Contacts

- **SSI + Postgres + REST + frontend modules + chain (deliverable spec):** [`docs/SSI_BLOCKCHAIN_ARCHITECTURE_SPEC.md`](./SSI_BLOCKCHAIN_ARCHITECTURE_SPEC.md) — DDL, state machines, API tables, UI module map, `LandSaleAnchor` + optional evidence anchor.
- **NIA (Ghana Card):** idverification@nia.gov.gh; [NIA verification services](https://nia.gov.gh/service/verification-services/).
- **MTN MoMo:** [MoMo Developer Community](https://momodevelopercommunity.mtn.com); sandbox: momodeveloper.mtn.com.
- **Polygon:** [docs.polygon.technology](https://docs.polygon.technology).

---

*This plan is the single source of truth for the SmartLand rebuild. Frontend and backend will be implemented with strict role-based access, Ghana Card verification, blockchain + SSI + smart contracts for security, and a Binance-like wallet with cards, MoMo, Telecel Cash, AirtelTigo Cash, and blockchain.*
