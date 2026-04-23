# SmartLand — Ghana Land Registry (prototype)

Monorepo layout:

| Folder | Role |
|--------|------|
| **`frontend/`** | React + Vite + shadcn/ui — dashboards, registry, Paystack checkout UI, chat, NIA/Lands flows. Run: `cd frontend && npm install && npm run dev` (default [http://localhost:5173](http://localhost:5173)). Set `VITE_API_URL` to your API base (e.g. `http://localhost:3001/api`). |
| **`backend/`** | Node.js + Express SmartLand API — auth, parcels, Paystack, NIA, ratings, conflict engine demo. Run: `cd backend && npm install && npm run start` (port **3001** by default). |
| **`backend-legacy-prisma/`** | Earlier TypeScript + Prisma backend (reference / optional); not required for the current `frontend` + `backend` demo. |
| **`contracts/`** | Hardhat + Solidity (`LandSaleAnchor`) for optional on-chain anchoring. |
| **`docs/`** | Build notes and project plan. |

**Remote:** [begcodee/Smartland-Project](https://github.com/begcodee/Smartland-Project)

Do not commit real `.env` secrets; use `.env.example` files where provided.
