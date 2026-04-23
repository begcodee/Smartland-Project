# SmartLand API — Backend

Full backend for the Ghana Land Registry (SmartLand) platform.

## Setup

```bash
cd workspace/backend
npm install
```

Create `.env` from the example:

```bash
cp .env.example .env
```

Ensure `.env` contains:

```
DATABASE_URL="file:./dev.db"
PORT=3001
JWT_SECRET="your-secret-key-change-in-production"
```

## Database

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Create SQLite database
npm run db:seed       # Seed demo users (admin, seller, buyer, arbitrator)
```

## Run

```bash
npm run dev           # Development (tsx watch)
npm run build && npm start   # Production
```

## API Endpoints

### Auth
- `POST /api/auth/login` — Login (email, password, role?, staffId?, arbitratorRegNo?)
- `POST /api/auth/me` — Get current user (Bearer token)

### Registrations
- `POST /api/registrations/submit` — Submit new user registration
- `POST /api/registrations/:id/simulate-review` — Auto-approve (demo)
- `GET /api/registrations/pending` — List pending (admin, auth)
- `POST /api/registrations/:id/review` — Approve/reject (admin, auth)

### Verify
- `POST /api/verify/ghana-card` — Ghana Card (NIA) verification

### Parcels
- `GET /api/parcels` — List parcels (auth)
- `GET /api/parcels/:id` — Get parcel (auth)
- `POST /api/parcels` — Create parcel (seller/admin, auth)
- `PATCH /api/parcels/:id/documents/verify` — Verify documents (admin, auth)
- `POST /api/parcels/:id/comments` — Add comment (auth)

### Transfers
- `GET /api/transfers` — List my transfers (auth)
- `POST /api/transfers` — Initiate transfer (auth)
- `POST /api/transfers/:id/complete` — Complete transfer (seller, auth)

### Disputes
- `GET /api/disputes` — List disputes (auth)
- `POST /api/disputes` — File dispute (auth)
- `POST /api/disputes/:id/vote` — Vote (support/against/abstain) (auth)
- `POST /api/disputes/:id/resolve` — Resolve (admin/arbitrator, auth)
- `PATCH /api/disputes/:id/status` — Update status (admin/arbitrator, auth)

### Notifications
- `GET /api/notifications` — List my notifications (auth)
- `PATCH /api/notifications/:id/read` — Mark read (auth)

## Demo Accounts (after seed)

| Role       | Email                        | Password   | Extra              |
|-----------|------------------------------|------------|--------------------|
| Admin     | admin@ghanalandcommission.gov.gh | password123 | Staff ID: GLC-EMP-2024-001 |
| Seller    | john.doe@gmail.com           | password123 | —                  |
| Buyer     | akosua.frimpong@yahoo.com    | password123 | —                  |
| Arbitrator| ama.osei@arbitrator.gh       | password123 | Reg: ARB-GH-2023-045 |

## Frontend Connection

Set `VITE_API_URL=http://localhost:3001/api` in the frontend `.env` (or leave unset to use default). The frontend will try the API first and fall back to mock data if the server is unreachable.
