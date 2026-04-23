# SmartLand smart contracts

## Model: fiat first, chain as proof

- **Buyers pay in GHS** via **Paystack** (Mobile Money / bank). No wallet or cryptocurrency is required.
- After Paystack confirms payment, the **backend** (registrar wallet) submits **one transaction** to `LandSaleAnchor` to anchor the sale on-chain. This is optional: if `CHAIN_RPC_URL` is unset, the app still works with Paystack only.

## Contract: `LandSaleAnchor.sol`

- `recordSale(saleId, parcelKey, paystackRefHash)` — only `registrar` (deployer or updated key).
- Hashes match the Node app (`ethers.keccak256(ethers.toUtf8Bytes(...))`).

## Deploy (Polygon Amoy)

1. Copy `.env.example` to `.env` and set `DEPLOYER_PRIVATE_KEY`, `POLYGON_AMOY_RPC_URL`.
2. `npm install`
3. `npm run compile`
4. `npm run deploy:amoy`

Put the deployed address in the **backend** as `LAND_SALE_ANCHOR_CONTRACT_ADDRESS`. Use the **same** private key as `CHAIN_REGISTRAR_PRIVATE_KEY`, or deploy then `setRegistrar` to your backend key.

## Backend env (see `workspace/backend/.env.example`)

- `CHAIN_RPC_URL` — e.g. Polygon Amoy HTTPS RPC  
- `CHAIN_REGISTRAR_PRIVATE_KEY` — registrar wallet (must match contract `registrar`)  
- `LAND_SALE_ANCHOR_CONTRACT_ADDRESS` — deployed contract  
- `CHAIN_NETWORK_NAME` — e.g. `polygon-amoy` (stored in DB)  
- `CHAIN_EXPLORER_TX_BASE` — e.g. `https://amoy.polygonscan.com/tx/` (optional; frontend can show links)
