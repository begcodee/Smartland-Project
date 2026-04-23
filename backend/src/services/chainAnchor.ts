import { ethers } from 'ethers';
import { prisma } from '../db.js';

const ABI = [
  'function recordSale(bytes32 saleId, bytes32 parcelKey, bytes32 paystackRefHash) external'
] as const;

function chainConfig(): { rpc: string; key: string; contract: string } | null {
  const rpc = process.env.CHAIN_RPC_URL?.trim();
  const key = process.env.CHAIN_REGISTRAR_PRIVATE_KEY?.trim();
  const contract = process.env.LAND_SALE_ANCHOR_CONTRACT_ADDRESS?.trim();
  if (!rpc || !key || !contract) return null;
  return { rpc, key, contract };
}

/**
 * After Paystack succeeds, anchor the same sale on-chain using the registrar wallet.
 * Buyers use fiat only; they never sign this transaction.
 */
export async function anchorSaleOnChain(params: {
  transferId: string;
  landParcelId: string;
  paystackReference: string;
}): Promise<void> {
  const env = chainConfig();
  if (!env) {
    console.warn(
      '[chain] Anchor skipped: set CHAIN_RPC_URL, CHAIN_REGISTRAR_PRIVATE_KEY, LAND_SALE_ANCHOR_CONTRACT_ADDRESS'
    );
    return;
  }

  const existing = await prisma.transfer.findUnique({ where: { id: params.transferId } });
  if (existing?.chainTxHash) return;

  const saleId = ethers.keccak256(ethers.toUtf8Bytes(params.transferId));
  const parcelKey = ethers.keccak256(ethers.toUtf8Bytes(params.landParcelId));
  const paystackRefHash = ethers.keccak256(ethers.toUtf8Bytes(params.paystackReference));

  const provider = new ethers.JsonRpcProvider(env.rpc);
  const wallet = new ethers.Wallet(env.key, provider);
  const contract = new ethers.Contract(env.contract, ABI, wallet);

  const tx = await contract.recordSale(saleId, parcelKey, paystackRefHash);
  const receipt = await tx.wait();
  if (!receipt) throw new Error('Chain transaction produced no receipt');

  const network = process.env.CHAIN_NETWORK_NAME ?? 'unknown';

  await prisma.transfer.update({
    where: { id: params.transferId },
    data: {
      chainTxHash: receipt.hash,
      chainNetwork: network,
      chainSaleId: saleId,
      chainAnchoredAt: new Date()
    }
  });

  await prisma.landParcel.update({
    where: { id: params.landParcelId },
    data: { blockchainHash: saleId }
  });
}
