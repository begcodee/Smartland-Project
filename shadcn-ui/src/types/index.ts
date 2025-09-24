export interface LandParcel {
  id: string;
  title: string;
  owner: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  area: number; // in square meters
  registrationDate: string;
  lastTransfer: string;
  value: number; // in USD
  status: 'active' | 'disputed' | 'transfer_pending';
  documents: string[];
  blockchainHash: string;
}

export interface Dispute {
  id: string;
  landParcelId: string;
  plaintiff: string;
  defendant: string;
  description: string;
  evidence: string[];
  status: 'pending' | 'under_review' | 'community_voting' | 'resolved' | 'rejected';
  filedDate: string;
  resolution?: string;
  votes?: {
    support: number;
    against: number;
    abstain: number;
  };
  arbitrator?: string;
}

export interface Transfer {
  id: string;
  landParcelId: string;
  from: string;
  to: string;
  amount: number;
  status: 'pending' | 'escrowed' | 'completed' | 'cancelled';
  initiatedDate: string;
  completedDate?: string;
  escrowHash?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'landowner' | 'buyer' | 'authority' | 'arbitrator';
  walletAddress: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface SmartContract {
  address: string;
  type: 'ownership' | 'transfer' | 'dispute' | 'escrow';
  status: 'active' | 'executed' | 'cancelled';
  createdAt: string;
  parameters: Record<string, string | number | boolean>;
}