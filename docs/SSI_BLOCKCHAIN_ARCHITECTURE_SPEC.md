# SmartLand — SSI / Blockchain Land Registry Architecture Spec

**Status:** Target architecture (incremental from current `frontend/` + `backend/`).  
**Scope:** Postgres-first persistence, REST API contracts, frontend modules, and **minimum** on-chain anchoring on Polygon Amoy (extends existing `contracts/contracts/LandSaleAnchor.sol`).

---

## 0) Relationship to current codebase

| Area | Today (prototype) | This spec |
|------|---------------------|-----------|
| Persistence | In-memory store + optional `app_snapshots` JSONB (`backend/src/config/schema_snapshot.sql`) | Normalized Postgres tables + optional snapshot cache |
| Identity | `idVerification`, `niaStatus`, `/api/verify/ghana-card`, `/api/nia/*` | First-class enrollments, artifact hashes, review audit |
| Assets | Parcels + embedded docs / flags | `land_documents` + verification lifecycle + digests |
| Chat | `/api/conversations/*` | Voice/STT, transcript hashes, evidence linking |
| Chain | `LandSaleAnchor.recordSale(saleId, parcelKey, paystackRefHash)` | Same anchor + optional **evidence bundle** anchor (v2) |
| Auth | JWT + bcrypt (`backend/src/routes/auth.js`) | Unchanged algorithmically; tighten session + audit |

---

## 1) Design goals (non-functional)

1. **Legal-grade traceability** — Every decision is attributable (actor id, role, timestamp, reason code, prior state).
2. **Evidence integrity** — Store **content hashes** (SHA-256) of blobs; store blobs in object storage (S3/GCS/Supabase Storage); never rely on mutable JSON alone.
3. **Separation of duties** — NIA identity decisions ≠ Lands Commission asset decisions ≠ arbitrator governance decisions.
4. **Progressive disclosure** — Public listings vs verified parties vs arbitrator “full file” via controlled joins/views.
5. **On-chain minimalism** — Anchor **hashes + ids**; keep PII and large media off-chain.

---

## 2) Canonical identifiers

- `user_id` — UUID (internal account).
- `parcel_id` — UUID (land parcel / listing).
- `transfer_id` — UUID (economic settlement intent; ties Paystack ref, parties, parcel).
- `enrollment_id` — UUID (Ghana Card / biometric capture session).
- `conversation_id` — UUID (buyer–seller negotiation thread).
- `case_id` — UUID (arbitration / dispute case projection).

**On-chain keys (bytes32)** — align with existing contract style:

- `saleId = keccak256(bytes(transferId))`
- `parcelKey = keccak256(bytes(parcelId))`
- `paystackRefHash = keccak256(bytes(paystackReference))`

Optional v2:

- `evidenceRoot = keccak256(abi.encodePacked(/* ordered leaves */))` Merkle root of normalized evidence leaves.

---

## 3) Postgres schema (DDL outline)

> **Note:** Use `uuid` PKs, `timestamptz`, and `text` for enums in v1 (CHECK constraints) or Postgres enums in v2.

### 3.1 Append-only event journal (cross-cutting)

```sql
CREATE TABLE audit_events (
  id              BIGSERIAL PRIMARY KEY,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_user_id   UUID REFERENCES users(id),
  actor_role      TEXT NOT NULL,
  action          TEXT NOT NULL,              -- e.g. 'identity.review_decided'
  entity_type     TEXT NOT NULL,              -- 'enrollment' | 'document' | 'message' | 'transfer' | ...
  entity_id       UUID NOT NULL,
  payload_json    JSONB NOT NULL,             -- non-PII metadata + references
  payload_hash    BYTEA NOT NULL,            -- sha256(canonical_json) for tamper-evidence
  prev_hash       BYTEA,                     -- optional hash chain: sha256(prev_row_hash || payload_hash)
  ip              INET,
  user_agent      TEXT
);

CREATE INDEX idx_audit_entity ON audit_events (entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_audit_actor ON audit_events (actor_user_id, occurred_at DESC);
```

### 3.2 Layer 1 — Identity enrollments

```sql
CREATE TABLE identity_enrollments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id),
  status                TEXT NOT NULL CHECK (status IN (
                          'draft','submitted','pending_automation','pending_nia',
                          'nia_approved','nia_rejected','withdrawn'
                        )),
  ghana_card_number_hash BYTEA,              -- sha256(normalized PAN); never store raw PAN in v1
  submitted_at          TIMESTAMPTZ,
  decided_at            TIMESTAMPTZ,
  nia_reference_id      TEXT,
  smartland_protocols_json JSONB,           -- snapshot of prescreen output (non-PII subset)
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity_artifacts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id     UUID NOT NULL REFERENCES identity_enrollments(id) ON DELETE CASCADE,
  kind              TEXT NOT NULL CHECK (kind IN ('card_front','card_back','selfie','liveness_meta')),
  storage_url       TEXT NOT NULL,          -- private object URL
  content_sha256    BYTEA NOT NULL,         -- hash of decrypted bytes
  mime_type         TEXT NOT NULL,
  bytes_size        INT NOT NULL,
  captured_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_attest_json JSONB                  -- optional: orientation, camera label (no PII)
);

CREATE TABLE identity_reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id     UUID NOT NULL REFERENCES identity_enrollments(id),
  reviewer_user_id  UUID NOT NULL REFERENCES users(id), -- must be role NIA
  decision            TEXT NOT NULL CHECK (decision IN ('approved','rejected')),
  reason_code         TEXT NOT NULL,        -- controlled vocabulary
  notes               TEXT,                 -- internal
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**State machine (Layer 1)**

`draft → submitted → pending_automation → pending_nia → (nia_approved | nia_rejected)`

Automation step may short-circuit to `pending_nia` on low confidence; never auto-`approved` without policy.

### 3.3 Layer 2 — Legal asset / documents

```sql
CREATE TABLE land_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id         UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  doc_type          TEXT NOT NULL,          -- 'title' | 'survey' | 'lease' | ...
  storage_url       TEXT NOT NULL,
  content_sha256    BYTEA NOT NULL,
  uploaded_by       UUID NOT NULL REFERENCES users(id),
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  status            TEXT NOT NULL CHECK (status IN ('submitted','under_review','approved','rejected')),
  reviewer_user_id  UUID REFERENCES users(id),
  reviewed_at       TIMESTAMPTZ,
  reason_code       TEXT
);

CREATE TABLE registry_checks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id         UUID NOT NULL REFERENCES parcels(id),
  check_type        TEXT NOT NULL,          -- 'cadastral_overlap' | 'seller_entitlement' | ...
  result            TEXT NOT NULL CHECK (result IN ('pass','fail','inconclusive')),
  evidence_json     JSONB NOT NULL,         -- structured findings (no blob)
  performed_by      UUID REFERENCES users(id),
  performed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Market visibility rule (computed)**

A parcel is **publicly listable** iff:

- `parcel.documents_verification_status = 'verified'` (aggregate of `land_documents`), **and**
- Seller’s latest `identity_enrollments.status = 'nia_approved'` **and**
- Commission account approval flag (existing `verified` / `verificationStatus` concept) is satisfied.

Store aggregates on `parcels` for query speed; derive via triggers or nightly job.

### 3.4 Layer 3 — Communication & audit

```sql
CREATE TABLE conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id         UUID NOT NULL REFERENCES parcels(id),
  buyer_id          UUID NOT NULL REFERENCES users(id),
  seller_id         UUID NOT NULL REFERENCES users(id),
  opened_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at         TIMESTAMPTZ
);

CREATE TABLE messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES users(id),
  body              TEXT,                   -- redacted/plain per policy
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  kind              TEXT NOT NULL CHECK (kind IN ('text','system'))
);

CREATE TABLE voice_artifacts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  storage_url       TEXT NOT NULL,
  audio_sha256      BYTEA NOT NULL,
  duration_ms       INT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transcripts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_artifact_id UUID REFERENCES voice_artifacts(id) ON DELETE SET NULL,
  conversation_id   UUID NOT NULL REFERENCES conversations(id),
  text_sha256       BYTEA NOT NULL,         -- hash of canonical transcript bytes
  stt_model         TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transcript_corrections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id     UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  delta_sha256      BYTEA NOT NULL,
  created_by        UUID NOT NULL REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Immutability policy**

- `messages`, `voice_artifacts`, `transcripts`: **INSERT-only** for normal actors; `transcript_corrections` append-only.
- Moderation / legal hold = new rows + `audit_events`, not `UPDATE body`.

### 3.5 Layer 4 — Settlement

```sql
CREATE TABLE transfers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id             UUID NOT NULL REFERENCES parcels(id),
  buyer_id              UUID NOT NULL REFERENCES users(id),
  seller_id             UUID NOT NULL REFERENCES users(id),
  status                TEXT NOT NULL CHECK (status IN (
                          'initiated','paid','anchoring','anchored','failed','disputed'
                        )),
  paystack_reference    TEXT,
  chain_tx_hash         TEXT,
  anchored_at           TIMESTAMPTZ,
  evidence_root         BYTEA,              -- optional v2
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**On-chain call (v1 — already implemented)**

`LandSaleAnchor.recordSale(saleId, parcelKey, paystackRefHash)` after Paystack verification succeeds and business gates pass.

### 3.6 Layer 5 — Governance / arbitration

```sql
CREATE TABLE arbitration_cases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id         UUID NOT NULL REFERENCES parcels(id),
  transfer_id       UUID REFERENCES transfers(id),
  status            TEXT NOT NULL CHECK (status IN ('open','review','resolved','dismissed')),
  risk_flags_json   JSONB NOT NULL DEFAULT '[]',
  opened_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at       TIMESTAMPTZ
);

CREATE TABLE arbitration_actions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id           UUID NOT NULL REFERENCES arbitration_cases(id) ON DELETE CASCADE,
  actor_id          UUID NOT NULL REFERENCES users(id),
  action_type       TEXT NOT NULL,          -- 'clear_red_flag' | 'order_evidence' | ...
  payload_json      JSONB NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**“God view” (read model)**

Materialized view or API-composed JSON:

`case` + latest identity enrollment + document list hashes + conversation ids + message counts + transfer + chain tx + audit tail (ids only in listing; hydrate under strict RBAC).

---

## 4) REST API (resource layout)

Base path: `/api` (existing). Version optional: `/api/v2`.

### 4.1 Identity

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| `POST` | `/identity/enrollments` | buyer, seller, … | Create draft enrollment |
| `POST` | `/identity/enrollments/:id/artifacts` | owner | Presigned upload handshake → register `content_sha256` |
| `POST` | `/identity/enrollments/:id/submit` | owner | Locks artifacts; runs automation job |
| `GET` | `/identity/enrollments/me` | authenticated | Latest enrollment + artifacts metadata |
| `GET` | `/nia/enrollments` | nia | Queue |
| `POST` | `/nia/enrollments/:id/decision` | nia | Approve/reject + `reason_code` |

*Migration from today:* map current `POST /api/verify/ghana-card` → writes `identity_enrollments` + `identity_artifacts` metadata; map `POST /api/nia/users/:id/decision` → `identity_reviews` + enrollment status.

### 4.2 Assets (Lands Commission)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| `POST` | `/parcels/:id/documents` | seller, lands_commission | Register doc + hash |
| `PATCH` | `/parcels/:id/documents/:docId` | lands_commission | Review decision |
| `POST` | `/parcels/:id/registry-checks` | lands_commission | Record structured check |

### 4.3 Conversations

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| `POST` | `/conversations/start` | buyer | Existing shape; add enrollment preconditions |
| `POST` | `/conversations/:id/messages` | buyer, seller | Text insert + audit |
| `POST` | `/conversations/:id/voice` | buyer, seller | Upload voice artifact + `audio_sha256` |
| `POST` | `/conversations/:id/transcripts` | system | STT worker posts transcript hash |

### 4.4 Settlement

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| `POST` | `/transfers` | buyer | Create transfer intent |
| `POST` | `/payments/initialize` | buyer | Existing |
| `GET` | `/payments/verify` | buyer | Existing; on success enqueue `anchorSale` job |
| `POST` | `/internal/anchor` | worker | Calls chain `recordSale` |

### 4.5 Arbitration

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| `GET` | `/arbitration/cases` | arbitrator | List anonymized parcel keys until review started |
| `POST` | `/arbitration/cases/:parcelId/start-review` | arbitrator | Existing; expands read model |
| `GET` | `/arbitration/cases/:parcelId/evidence` | arbitrator | Bundle of hashes + redacted metadata |
| `POST` | `/arbitration/cases/:parcelId/action` | arbitrator | Maps to `arbitration_actions` + `audit_events` |

### 4.6 SSI (future-facing, optional v1)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| `POST` | `/ssi/credentials/issue` | nia, lands_commission | Issues VC JWT/SD-JWT (format TBD) |
| `POST` | `/ssi/presentations/verify` | backend services | Verifies VP for gated actions |

Until implemented, **do not** expose “SSI verified” in UI; keep “NIA + Commission verified” wording.

---

## 5) Frontend module map (align folders to layers)

Under `frontend/src/`:

| Module | Responsibility |
|--------|----------------|
| `identity/` | Enrollment wizard, artifact upload UX, status timeline |
| `assets/` | Parcel doc upload, verification badges, officer review screens |
| `chat-audit/` | Thread UI, voice recorder, transcript viewer (hash display for trust) |
| `settlement/` | Transfer preview, Paystack flow, “anchored on-chain” confirmation |
| `governance/` | Arbitrator case manager, evidence tabs, action confirmations |

**Routes (suggested)**

- `/verify` — buyer/seller identity enrollment (wraps current `VerificationStatus` / `GhanaCardVerification`)
- `/admin/documents` — Commission document queue
- `/nia` — NIA queue (existing `NiaDashboard`)
- `/messages` — conversation list
- `/messages/:id` — thread
- `/arbitrator` — existing dashboard; add evidence tabs per spec

**Guards**

Extend `ProtectedRoute` + `verificationRouting` to key off **server-driven** `enrollment.status` rather than only `user.idVerification` JSON.

---

## 6) Smart contract — v1 (current) vs v2 (evidence anchor)

### 6.1 v1 — `LandSaleAnchor` (keep)

Excerpt from `contracts/contracts/LandSaleAnchor.sol` (registrar-only `recordSale`):

```solidity
    function recordSale(bytes32 saleId, bytes32 parcelKey, bytes32 paystackRefHash) external {
        if (msg.sender != registrar) revert NotRegistrar();
        if (saleRecorded[saleId]) revert AlreadyAnchored();
        saleRecorded[saleId] = true;
        emit SaleAnchored(saleId, parcelKey, paystackRefHash, block.timestamp);
    }
```

### 6.2 v2 — `EvidenceAnchor` (minimal addition)

**Purpose:** anchor a Merkle root tying transfer + document hashes + (optional) transcript root.

```solidity
// New contract (sketch) — deploy separately; registrar-only
contract EvidenceAnchor {
    address public registrar;
    mapping(bytes32 => bool) public evidenceAnchored;

    event EvidenceAnchored(bytes32 indexed transferIdKey, bytes32 evidenceRoot, uint256 timestamp);

    function anchorEvidence(bytes32 transferIdKey, bytes32 evidenceRoot) external {
        require(msg.sender == registrar, "not registrar");
        require(!evidenceAnchored[transferIdKey], "already anchored");
        evidenceAnchored[transferIdKey] = true;
        emit EvidenceAnchored(transferIdKey, evidenceRoot, block.timestamp);
    }
}
```

**Leaf ordering (off-chain, normative)**

1. `sha256("TRANSFER:" || transferId)`
2. `sha256("PARCEL:" || parcelId)`
3. `sha256("PAYSTACK:" || reference)`
4. For each doc: `sha256("DOC:" || docId || content_sha256)`
5. Optional: `sha256("TRANSCRIPT:" || transcriptId || text_sha256)`

Build Merkle tree → `evidenceRoot` → `anchorEvidence(keccak256(transferId), evidenceRoot)`.

---

## 7) Workers & jobs

1. **Automation worker** — consumes `identity_enrollments` `pending_automation`; writes results + audit; may auto-flag arbitrator cases.
2. **STT worker** — consumes `voice_artifacts`; writes `transcripts` + hashes.
3. **Anchor worker** — idempotent chain txs; stores `chain_tx_hash` on success; retries with nonce management.

Tech choices are intentionally loose (BullMQ, Supabase Edge Functions, etc.).

---

## 8) Phased rollout (recommended order)

| Phase | Deliverable | Exit criteria |
|-------|-------------|---------------|
| P0 | Postgres tables + migrate from `app_snapshots` / in-memory | All CRUD paths read/write DB |
| P1 | Identity enrollments + artifacts + NIA reviews + audit_events | NIA queue backed by tables |
| P2 | `land_documents` + Commission review + marketplace gate | Public browse respects doc + identity states |
| P3 | Voice + transcripts + hashes | Arbitrator evidence includes transcript hash |
| P4 | `EvidenceAnchor` on Amoy + worker | `transfers.chain_tx_hash` populated + explorer link |
| P5 | SSI VC/VP issuance | Gated actions accept VP |

---

## 9) Open decisions (capture before build)

1. **Object storage** provider + encryption at rest (KMS per tenant vs per env).
2. **Ghana Card PAN** — store hash-only vs tokenized vault; legal retention period.
3. **Arbitrator pseudonymity** — separate `arbitrator_profile` table with display handle vs user table.
4. **VC format** — JWT-VC vs SD-JWT vs OID4VCI profile for Ghana ecosystem interoperability.

---

## 10) Traceability matrix (requirements → artifacts)

| Requirement | DB | API | UI | Chain |
|-------------|----|-----|----|-------|
| NIA manual sign-off | `identity_reviews` | `/nia/enrollments/:id/decision` | NIA dashboard | — |
| Commission doc attestation | `land_documents` | `/parcels/:id/documents/*` | Admin docs | optional doc leaf in v2 root |
| Non-repudiation of chat | `messages`, `voice_artifacts`, `transcripts` | `/conversations/*` | chat-audit | transcript leaf |
| Settlement proof | `transfers` | `/payments/verify` | settlement | `LandSaleAnchor` |
| Full evidentiary bundle | joins + `audit_events` | `/arbitration/.../evidence` | governance | `EvidenceAnchor` |

---

*Document owner: SmartLand engineering. Last updated: 2026-05-02.*
