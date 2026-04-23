# SmartLand — Database Entities (Step-by-Step Workflow)

**Rule: One step must be fully completed before proceeding to the next. No skipping.**

---

## Workflow Overview

```
STEP 1 (User Registration)  →  STEP 2 (User)  →  STEP 3 (Land Parcel)  →  STEP 4 (Document Verification)
                                                                                    ↓
STEP 9 (Dispute Resolved)   ←  STEP 8 (Voting) ←  STEP 7 (Dispute)     ←  STEP 5 (Transfer)  ←  STEP 6 (Transfer Done)
```

---

## STEP 1: User Registration (Pending)

**Gate:** None — this is the entry point.  
**Blocks:** User cannot exist until this step is approved.

### 1.1 PendingRegistration

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | e.g. REG{timestamp} |
| name | string | ✓ | |
| email | string | ✓ | Unique |
| phoneNumber | string | ✓ | |
| role | enum | ✓ | admin, seller, buyer, arbitrator |
| organization | string | | Required if admin/arbitrator |
| passwordHash | string | ✓ | |
| staffId | string | | Required if role=admin |
| arbitratorRegNo | string | | Required if role=arbitrator |
| status | enum | ✓ | pending → approved | rejected |
| submittedAt | timestamp | ✓ | |
| reviewedAt | timestamp | | Set when reviewed |
| reviewedBy | FK → User | | Admin who approved/rejected |
| rejectionReason | text | | If rejected |

### 1.2 GhanaCard (embedded or 1:1)

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| pendingRegistrationId | FK → PendingRegistration | ✓ | |
| frontCardImage | string | ✓ | URL or blob ref |
| backCardImage | string | ✓ | |
| faceImage | string | ✓ | Selfie (facial recognition) |
| cardNumber | string | ✓ | GHA-XXXXXXXXX-X |
| fullName | string | ✓ | |
| faceMatchPassed | boolean | ✓ | From facial recognition |
| createdAt | timestamp | ✓ | |

### 1.3 RegistrationLandDocument

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| pendingRegistrationId | FK → PendingRegistration | ✓ | |
| name | string | ✓ | Land Title, Survey Plan, etc. |
| type | string | ✓ | |
| scannedImage | string | ✓ | URL or blob ref |
| uploadedAt | timestamp | ✓ | |
| size | int | | Bytes |

**Step 1 complete when:** All sub-steps done (personal details ✓, Ghana Card ✓, land docs if seller ✓) AND `status = 'approved'` (Ghana Lands Commission review).

**Cannot proceed to Step 2 until:** `PendingRegistration.status = 'approved'`.

---

## STEP 2: User (Approved)

**Gate:** `PendingRegistration.status = 'approved'`.  
**Blocks:** Step 3 (Land Parcel) — only verified seller/admin can register land.

### 2.1 User

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| name | string | ✓ | |
| email | string | ✓ | Unique |
| phoneNumber | string | ✓ | |
| role | enum | ✓ | admin, seller, buyer, arbitrator |
| verificationStatus | enum | ✓ | verified (set on approval) |
| country | string | ✓ | |
| organization | string | | |
| staffId | string | | If admin |
| arbitratorRegNo | string | | If arbitrator |
| blockchainToken | string | | Generated on approval |
| idVerification | jsonb | | Ghana Card data |
| createdAt | timestamp | ✓ | |
| updatedAt | timestamp | ✓ | |

### 2.2 UserReputation

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| userId | FK → User | ✓ | |
| score | int | ✓ | 0–100 |
| totalTransactions | int | ✓ | |
| successfulTransactions | int | ✓ | |
| disputesWon | int | ✓ | |
| communityVotes | int | ✓ | |
| updatedAt | timestamp | ✓ | |

### 2.3 UserCreditScore

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| userId | FK → User | ✓ | |
| score | int | ✓ | |
| rating | enum | ✓ | Excellent, Good, Fair, Poor |
| paymentHistory | int | ✓ | |
| creditUtilization | int | ✓ | |
| lengthOfHistory | int | ✓ | |
| newCredit | int | ✓ | |
| creditMix | int | ✓ | |
| updatedAt | timestamp | ✓ | |

### 2.4 UserFinancialProfile

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| userId | FK → User | ✓ | |
| monthlyIncome | decimal | ✓ | |
| assets | decimal | ✓ | |
| liabilities | decimal | ✓ | |
| netWorth | decimal | ✓ | |
| bankingHistory | int | ✓ | Years |
| updatedAt | timestamp | ✓ | |

**Step 2 complete when:** User record created from approved PendingRegistration.

**Cannot proceed to Step 3 until:** User exists AND (role = 'seller' OR role = 'admin').

---

## STEP 3: Land Parcel Registration

**Gate:** User exists, verified, role seller or admin.  
**Blocks:** Step 4 (doc verification), Step 5 (transfer), Step 7 (dispute).

### 3.1 LandParcel

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | e.g. LP001 |
| title | string | ✓ | |
| description | text | ✓ | |
| ownerId | FK → User | ✓ | |
| area | decimal | ✓ | sq m |
| price | decimal | ✓ | Ghana Cedis |
| status | enum | ✓ | available, pending, sold, disputed |
| type | enum | ✓ | residential, commercial, agricultural, industrial |
| documentsVerificationStatus | enum | ✓ | **pending** (initial) |
| blockchainHash | string | | Set after blockchain registration |
| createdAt | timestamp | ✓ | |
| updatedAt | timestamp | ✓ | |

### 3.2 LandParcelLocation

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| landParcelId | FK → LandParcel | ✓ | |
| address | string | ✓ | |
| latitude | decimal | ✓ | |
| longitude | decimal | ✓ | |
| region | string | ✓ | e.g. Greater Accra |

### 3.3 LandParcelDocument

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| landParcelId | FK → LandParcel | ✓ | |
| name | string | ✓ | Land Title, Survey Plan, Site Plan |
| type | string | ✓ | |
| url | string | ✓ | |
| verificationStatus | enum | ✓ | **pending** (initial) |
| verifiedBy | FK → User | | Set when verified |
| verifiedAt | timestamp | | |
| uploadedAt | timestamp | ✓ | |

### 3.4 LandParcelImage

**Uploaded in Step 3** alongside LandParcel. Images are optional but recommended. Stored in object storage (S3/R2); `url` points to the file.

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | e.g. IMG_{timestamp}_{index} |
| landParcelId | FK → LandParcel | ✓ | |
| url | string | ✓ | Full URL to stored image (blob/object storage) |
| caption | string | | Description of the image |
| type | enum | ✓ | See Image Types below |
| size | int | | File size in bytes (max 5MB per image) |
| format | string | | jpeg, png, webp |
| width | int | | Pixels (optional) |
| height | int | | Pixels (optional) |
| displayOrder | int | | Sort order (0 = main/first) |
| uploadedAt | timestamp | ✓ | |
| uploadedBy | FK → User | | Owner who uploaded |

**Image types (enum):**
| Value | Description |
|-------|-------------|
| main | Primary/featured photo of the land |
| aerial | Drone or satellite view of entire property |
| boundary | Boundary markers, fences, demarcation |
| interior | Inside structures (if any) on the land |
| exterior | External view of structures |
| structure | Buildings, sheds, existing structures |
| access | Road access, entry points |
| general | General/other views |

**Constraints:**
- Max 10 images per parcel (configurable)
- Max 5MB per image
- Accepted formats: JPG, PNG, WebP
- At least one image recommended for listing visibility
- Images are **not** verified by Ghana Lands Commission (unlike documents); they are supplementary evidence

### 3.5 LandParcelComment

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| landParcelId | FK → LandParcel | ✓ | |
| userId | FK → User | ✓ | |
| content | text | ✓ | |
| likes | int | ✓ | Default 0 |
| createdAt | timestamp | ✓ | |

**Step 3 complete when:** LandParcel created with at least required documents (Land Title, Survey Plan).  
**Images:** Optional at registration. Can be added/updated anytime during Step 3 or after. Images do **not** block document verification or parcel visibility.  
**Parcel is NOT visible on public registry** until Step 4 completes.

**Cannot proceed to Step 4 until:** LandParcel exists with documents uploaded.

---

## STEP 4: Document Verification (Ghana Lands Commission)

**Gate:** LandParcel exists with LandParcelDocuments.  
**Blocks:** Parcel visibility; Transfer (buyers see only verified parcels).

### 4.1 DocumentVerificationAction (audit log)

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| landParcelDocumentId | FK → LandParcelDocument | ✓ | |
| action | enum | ✓ | verify, reject |
| verifiedBy | FK → User | ✓ | Admin |
| verifiedAt | timestamp | ✓ | |
| note | text | | |

**Logic:**
- Each LandParcelDocument.verificationStatus → 'verified' or 'rejected' by admin
- LandParcel.documentsVerificationStatus = 'verified' **only when ALL** documents verified
- If ANY rejected → documentsVerificationStatus = 'rejected'
- Parcel appears on public registry **only when** documentsVerificationStatus = 'verified'

**Step 4 complete when:** LandParcel.documentsVerificationStatus = 'verified'.

**Cannot proceed to Step 5 (Transfer) until:** Parcel documents verified (buyers can only initiate transfer on verified parcels).

---

## STEP 5: Transfer Initiation

**Gate:** LandParcel.documentsVerificationStatus = 'verified', owner verified, parcel status = 'available'.  
**Blocks:** Step 6 (completion).

### 5.1 Transfer

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | e.g. T001 |
| landParcelId | FK → LandParcel | ✓ | |
| fromUserId | FK → User | ✓ | Seller |
| toUserId | FK → User | ✓ | Buyer |
| amount | decimal | ✓ | Ghana Cedis |
| status | enum | ✓ | **pending** (initial) |
| initiatedDate | timestamp | ✓ | |
| escrowAmount | decimal | | If escrow |
| smartContractTransferId | string | | Blockchain ref |
| transactionHash | string | | |

**Step 5 complete when:** Transfer record created, status = 'pending'.

**Cannot proceed to Step 6 until:** Transfer exists, escrow/conditions met.

---

## STEP 6: Transfer Completion

**Gate:** Transfer exists, status = 'pending', conditions met (escrow released, etc.).  
**Blocks:** None (terminal for transfer flow).

### 6.1 Update Transfer

- Transfer.status → 'completed'
- Transfer.completedDate = now
- LandParcel.ownerId → toUserId
- LandParcel.status → 'sold' (or 'available' if re-listed)
- LandParcel.updatedAt = now

**Step 6 complete when:** Transfer.status = 'completed', ownership updated.

---

## STEP 7: Dispute Filing

**Gate:** LandParcel exists.  
**Blocks:** Step 8 (voting).

### 7.1 Dispute

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | e.g. D001 |
| landParcelId | FK → LandParcel | ✓ | |
| plaintiffUserId | FK → User | ✓ | |
| defendantUserId | FK → User | ✓ | |
| description | text | ✓ | |
| status | enum | ✓ | **filed** (initial) → pending → under_review → community_voting |
| filedDate | timestamp | ✓ | |
| votingDeadline | timestamp | | Set when status = community_voting |
| resolution | text | | Set when resolved |
| resolvedAt | timestamp | | |
| resolvedBy | FK → User | | |

### 7.2 DisputeEvidence

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| disputeId | FK → Dispute | ✓ | |
| fileName | string | ✓ | |
| fileUrl | string | ✓ | |
| uploadedAt | timestamp | ✓ | |

**Step 7 complete when:** Dispute created, status progresses to 'community_voting'.

**Cannot proceed to Step 8 until:** Dispute.status = 'community_voting'.

---

## STEP 8: Dispute Voting

**Gate:** Dispute.status = 'community_voting', voting period not ended.  
**Blocks:** Step 9 (resolution).

### 8.1 DisputeVote

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| disputeId | FK → Dispute | ✓ | |
| userId | FK → User | ✓ | |
| vote | enum | ✓ | support, against, abstain |
| votedAt | timestamp | ✓ | |
| **Unique** | (disputeId, userId) | ✓ | One vote per user per dispute |

### 8.2 Dispute (aggregate counts)

- supportVotes, againstVotes, abstainVotes (or computed from DisputeVote)

**Step 8 complete when:** Voting period ends (votingDeadline passed).

**Cannot proceed to Step 9 until:** block.timestamp > votingDeadline.

---

## STEP 9: Dispute Resolution

**Gate:** Voting period ended, Dispute.status = 'community_voting'.  
**Blocks:** None (terminal for dispute flow).

### 9.1 Update Dispute

- Dispute.status → 'resolved'
- Dispute.resolution = text
- Dispute.resolvedAt = now
- Dispute.resolvedBy = admin/arbitrator userId

**Step 9 complete when:** Dispute.status = 'resolved'.

---

## Land Image Storage

**LandParcelImage** records store metadata; actual image files go in object storage:

| Aspect | Recommendation |
|--------|----------------|
| Storage | S3, Cloudflare R2, Supabase Storage, or similar |
| Path pattern | `lands/{parcelId}/{imageId}.{ext}` |
| CDN | Serve via CDN for faster display |
| Thumbnails | Generate thumbnails for list views (optional) |
| Backup | Include in backup strategy |

**Flow:** User uploads in Step 3 → file stored in object storage → URL saved in LandParcelImage.url.

---

## Supporting Entities (No Strict Step Order)

### Notification

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| userId | FK → User | ✓ | |
| type | enum | ✓ | info, success, warning, error |
| title | string | ✓ | |
| message | text | ✓ | |
| category | enum | ✓ | transaction, dispute, verification, system |
| read | boolean | ✓ | Default false |
| actionUrl | string | | |
| createdAt | timestamp | ✓ | |

### SmartContract (deployed contracts)

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| address | string | ✓ | Contract address |
| type | enum | ✓ | ownership, transfer, dispute, escrow |
| network | string | ✓ | mainnet, testnet |
| status | enum | ✓ | active, deprecated |
| deployedAt | timestamp | ✓ | |

### BlockchainTransaction

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| id | PK | ✓ | |
| transactionHash | string | ✓ | Unique |
| contractAddress | FK → SmartContract | | |
| entityType | enum | ✓ | land_registration, transfer, dispute, vote |
| entityId | string | ✓ | Related record ID |
| status | enum | ✓ | pending, confirmed, failed |
| blockNumber | bigint | | |
| gasUsed | int | | |
| fromAddress | string | | User blockchain token |
| createdAt | timestamp | ✓ | |

---

## Step Dependency Summary

| Step | Prerequisite | Blocks |
|------|--------------|--------|
| 1. User Registration | None | Step 2 |
| 2. User | Step 1 approved | Step 3 |
| 3. Land Parcel | Step 2, role seller/admin | Step 4, 5, 7 |
| 4. Document Verification | Step 3 | Parcel visibility, Step 5 |
| 5. Transfer Initiation | Step 2, 4, parcel verified | Step 6 |
| 6. Transfer Completion | Step 5 | — |
| 7. Dispute Filing | Step 3 | Step 8 |
| 8. Dispute Voting | Step 7, status=community_voting | Step 9 |
| 9. Dispute Resolution | Step 8, voting ended | — |

---

## ER Diagram (Simplified)

```
PendingRegistration ──1:1── GhanaCard
PendingRegistration ──1:N── RegistrationLandDocument
PendingRegistration ──approval──▶ User

User ──1:N── UserReputation, UserCreditScore, UserFinancialProfile
User ──1:N── LandParcel (ownerId)
User ──1:N── LandParcelComment
User ──1:N── Notification

LandParcel ──1:1── LandParcelLocation
LandParcel ──1:N── LandParcelDocument, LandParcelImage, LandParcelComment
LandParcel ──1:N── Transfer, Dispute

LandParcelDocument ──verification──▶ LandParcel.documentsVerificationStatus

Transfer ──from/to──▶ User

Dispute ──1:N── DisputeEvidence, DisputeVote
Dispute ──plaintiff/defendant──▶ User

DisputeVote ──userId──▶ User
```
