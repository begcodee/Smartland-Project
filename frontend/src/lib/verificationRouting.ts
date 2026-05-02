import type { User } from '@/lib/mockData';

/**
 * Buyers/Sellers browse first; identity gates happen via banners/dialogs and transaction blocks,
 * not by trapping users on `/verification-status`.
 */
export function shouldForceBuyerSellerVerificationRoute(_user: User | null | undefined): boolean {
  return false;
}
