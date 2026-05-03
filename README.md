# SmartLand — Ghana Land Registry (prototype)

This repository root is the monorepo (no nested `workspace/` folder). Layout:

| Folder | Role |
|--------|------|
| **`frontend/`** | React + Vite + shadcn/ui — dashboards, registry, Paystack checkout UI, chat, NIA/Lands flows. Run: `cd frontend && npm install && npm run dev` (default [http://localhost:5173](http://localhost:5173)). Set `VITE_API_URL` to your API base (e.g. `http://localhost:3001/api`). |
| **`backend/`** | Node.js + Express SmartLand API — auth, parcels, Paystack, NIA, ratings, conflict engine demo. Run: `cd backend && npm install && npm run start` (port **3001** by default). |
| **`contracts/`** | Hardhat + Solidity (`LandSaleAnchor`) for optional on-chain anchoring. |
| **`docs/`** | Project plan, architecture spec, and build steps. |
| **`uploads/`** | Runtime-only user uploads (empty in git except `.gitkeep`). |

**Remote:** [begcodee/Smartland-Project](https://github.com/begcodee/Smartland-Project)

If you still see a `workspace/` directory after pulling, it is a leftover copy from an older layout: stop dev servers, close the IDE folder if it points inside `workspace/`, then delete `workspace/` manually.

Do not commit real `.env` secrets; use `.env.example` files where provided.
