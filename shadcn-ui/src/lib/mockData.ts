import { LandParcel, Dispute, Transfer, User } from '@/types';

export const mockLandParcels: LandParcel[] = [
  {
    id: 'LP001',
    title: 'Residential Plot - Sector 15',
    owner: 'John Doe',
    location: {
      address: 'Plot 123, Sector 15, New Delhi, India',
      coordinates: { lat: 28.5355, lng: 77.3910 }
    },
    area: 500,
    registrationDate: '2020-03-15',
    lastTransfer: '2022-08-20',
    value: 75000,
    status: 'active',
    documents: ['title_deed.pdf', 'survey_report.pdf'],
    blockchainHash: '0x1a2b3c4d5e6f7890abcdef1234567890'
  },
  {
    id: 'LP002',
    title: 'Agricultural Land - Village Rampur',
    owner: 'Maria Garcia',
    location: {
      address: 'Village Rampur, District Meerut, UP, India',
      coordinates: { lat: 28.9845, lng: 77.7064 }
    },
    area: 2000,
    registrationDate: '2019-11-08',
    lastTransfer: '2019-11-08',
    value: 120000,
    status: 'disputed',
    documents: ['land_record.pdf', 'inheritance_doc.pdf'],
    blockchainHash: '0x2b3c4d5e6f7890abcdef1234567890ab'
  },
  {
    id: 'LP003',
    title: 'Commercial Plot - Market Area',
    owner: 'Ahmed Hassan',
    location: {
      address: 'Shop 45, Market Complex, Gurgaon, Haryana',
      coordinates: { lat: 28.4595, lng: 77.0266 }
    },
    area: 150,
    registrationDate: '2021-06-12',
    lastTransfer: '2023-02-14',
    value: 200000,
    status: 'transfer_pending',
    documents: ['commercial_license.pdf', 'property_tax.pdf'],
    blockchainHash: '0x3c4d5e6f7890abcdef1234567890abcd'
  }
];

export const mockDisputes: Dispute[] = [
  {
    id: 'D001',
    landParcelId: 'LP002',
    plaintiff: 'Raj Kumar',
    defendant: 'Maria Garcia',
    description: 'Claiming rightful inheritance of agricultural land based on family records',
    evidence: ['family_tree.pdf', 'old_land_records.pdf', 'witness_statements.pdf'],
    status: 'community_voting',
    filedDate: '2024-08-15',
    votes: {
      support: 12,
      against: 8,
      abstain: 3
    }
  },
  {
    id: 'D002',
    landParcelId: 'LP001',
    plaintiff: 'City Development Authority',
    defendant: 'John Doe',
    description: 'Land acquisition for public infrastructure development',
    evidence: ['acquisition_notice.pdf', 'compensation_offer.pdf'],
    status: 'under_review',
    filedDate: '2024-09-01',
    arbitrator: 'District Magistrate Office'
  }
];

export const mockTransfers: Transfer[] = [
  {
    id: 'T001',
    landParcelId: 'LP003',
    from: 'Ahmed Hassan',
    to: 'Priya Sharma',
    amount: 200000,
    status: 'escrowed',
    initiatedDate: '2024-09-10',
    escrowHash: '0x4d5e6f7890abcdef1234567890abcdef'
  }
];

export const mockUsers: User[] = [
  {
    id: 'U001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'landowner',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C4Aa4e24B3b2f4',
    verificationStatus: 'verified'
  },
  {
    id: 'U002',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    role: 'landowner',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c5aa3c4F5',
    verificationStatus: 'verified'
  },
  {
    id: 'U003',
    name: 'District Authority',
    email: 'authority@district.gov.in',
    role: 'authority',
    walletAddress: '0x9cb2g210662cE543904123756Ibd247d6bb4d5G6',
    verificationStatus: 'verified'
  }
];

// Simulate blockchain operations
export const blockchainService = {
  registerLand: async (parcel: Omit<LandParcel, 'id' | 'blockchainHash'>) => {
    const hash = `0x${Math.random().toString(16).substr(2, 32)}`;
    return { success: true, hash, gasUsed: 150000 };
  },
  
  transferOwnership: async (parcelId: string, from: string, to: string) => {
    const hash = `0x${Math.random().toString(16).substr(2, 32)}`;
    return { success: true, hash, gasUsed: 120000 };
  },
  
  createDispute: async (dispute: Omit<Dispute, 'id'>) => {
    const hash = `0x${Math.random().toString(16).substr(2, 32)}`;
    return { success: true, hash, gasUsed: 180000 };
  },
  
  voteOnDispute: async (disputeId: string, vote: 'support' | 'against' | 'abstain') => {
    const hash = `0x${Math.random().toString(16).substr(2, 32)}`;
    return { success: true, hash, gasUsed: 80000 };
  }
};