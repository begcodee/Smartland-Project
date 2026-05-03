# SmartLand — Step-by-Step Build

This document tracks the build order. Each step is scoped so we can build incrementally and test.

---

## Step 1 — Project structure, roles & routing ✅ (done)

- [x] Align roles to **Admin**, **Seller**, **Buyer**, **Arbitrator** (was landowner/authority).
- [x] Add route structure: `/`, `/admin`, `/seller`, `/buyer`, `/arbitrator`.
- [x] Auth context for `user` and `role` across the app.
- [x] `ProtectedRoute`: redirect unauthenticated to login, wrong-role to correct dashboard.
- [x] Role dashboards with real features: Admin (Analytics), Seller (LandRegistry), Buyer (LandRegistry), Arbitrator (DisputeResolution).
- [x] Ghana Card verification (front/back + facial recognition).
- [x] Removed: GovernmentCardVerification, BiometricSecurity, PasskeyAuthentication, AfricaMapViewer, RoleBasedUI, UserAuth, VerificationAnalytics, CountrySelector.
- [x] Unified auth: RoleBasedAccess, UserProfile, NotificationCenter, Analytics use AuthContext.

**Deliverables:** `AuthContext`, `ProtectedRoute`, `GhanaCardVerification`, `LandRegistry`, `DisputeResolution`, `Analytics`, role dashboards, `UserProfile`, `NotificationCenter`.

---

## Step 2 — Auth & Ghana Card verification flow

- [ ] Persist auth (e.g. localStorage/sessionStorage or cookie) so refresh keeps user.
- [ ] Ghana Card verification step after register (NIA IVSP placeholder; real API when onboarded).
- [ ] “Skip for now” vs “Verify now” and badge “Ghana Card verified” in header.
- [ ] Shared layout component: header + role-based sidebar/nav for each dashboard.

**Deliverables:** Auth persistence, `GhanaCardVerification` in flow, shared `DashboardLayout`, nav per role.

---

## Step 3 — Backend scaffold

- [ ] Node + TypeScript API (Express or Fastify) in `backend/` (or a dedicated `api/` package).
- [ ] PostgreSQL schema: users (id, email, role, ghana_card_verified, etc.), parcels, disputes, audit_log.
- [ ] Auth API: register, login, refresh; JWT with role claim.
- [ ] Frontend: call API for login/register instead of mock only; store token.

**Deliverables:** Running API, DB migrations, auth endpoints, frontend wired to API.

---

## Step 4 — Smart contracts (Polygon testnet)

- [ ] Hardhat project in `contracts/` (this repo).
- [ ] Contracts: `AccessControl` (roles), `LandRegistry` (parcel id, owner, title hash), `Escrow` (lock/release/refund).
- [ ] Deploy to Polygon Amoy testnet; backend or frontend read from contract (owner, status).
- [ ] Optional: `DisputeResolution` contract stub.

**Deliverables:** Deployable contracts, deploy script, env for chain ID and contract addresses.

---

## Step 5 — Parcels & listings

- [ ] Seller: create/edit/delist parcel (metadata in DB; later sync hash/ID to LandRegistry contract).
- [ ] Buyer: search/filter listings, view detail, “Make offer” / “Request to buy”.
- [ ] Admin: list all parcels, approve/flag, view history.
- [ ] Shared parcel detail page; role-based actions (seller: edit; buyer: offer; admin: override).

**Deliverables:** Parcel CRUD API, parcel list/detail pages, search/filter, role-based actions.

---

## Step 6 — Wallet & payments (Binance-like)

- [ ] Unified wallet UI: balance (available, in escrow, pending), deposit/withdraw, transaction history.
- [ ] Payment methods placeholder: Credit card, MoMo, Telecel Cash, AirtelTigo Cash, Blockchain.
- [ ] Integrate one rail first (e.g. MoMo sandbox or Stripe test) for deposit.
- [ ] Escrow: “Lock funds” for a deal (backend + optional contract); release/refund on complete/dispute.

**Deliverables:** Wallet page, deposit/withdraw flows, one live payment rail, escrow state.

---

## Step 7 — Disputes & arbitrator

- [ ] File dispute (buyer/seller); link to parcel and deal/escrow.
- [ ] Arbitrator: list assigned disputes, view evidence, propose resolution, record outcome.
- [ ] Admin: assign arbitrator, override if needed; release/refund from escrow based on resolution.
- [ ] Notifications (in-app or email) for new dispute, assignment, resolution.

**Deliverables:** Dispute API, dispute list/detail, arbitrator workspace, release/refund logic.

---

## Step 8 — Security & hardening

- [ ] Rate limiting, CORS, input validation, secure headers on API.
- [ ] Frontend: no secrets in client; secure token storage; role check on every protected API call.
- [ ] Audit log for admin and sensitive actions (who, what, when).
- [ ] Optional: 2FA for Admin (and optionally Arbitrator).

**Deliverables:** Hardened API and frontend, audit log, security checklist.

---

## Step 9 — Deploy & go-live prep

- [ ] Staging env: API + DB + frontend; Polygon testnet (or mainnet if ready).
- [ ] NIA IVSP production onboarding; MoMo/payment production credentials.
- [ ] Monitoring, alerts, runbooks for Ghana Lands Commission.

**Deliverables:** Staging deploy, production checklist, handover notes.

---

*Reference: [SMARTLAND_PROJECT_PLAN.md](./SMARTLAND_PROJECT_PLAN.md) for vision, roles, blockchain, SSI, and payments.*
