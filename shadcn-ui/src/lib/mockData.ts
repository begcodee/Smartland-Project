import { LandParcel, Dispute, Transfer, User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'U001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'landowner',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C4Aa4e24B3b2f4',
    verificationStatus: 'verified',
    profile: {
      phone: '+91 9876543210',
      address: '123 Green Valley Road',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postalCode: '110001',
      dateOfBirth: '1985-03-15',
      nationalId: 'AADHAAR-1234-5678-9012',
      bio: 'Experienced landowner with multiple properties in Delhi NCR. Active in community development projects.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    },
    reputation: {
      score: 92,
      totalTransactions: 15,
      successfulTransactions: 14,
      disputesWon: 3,
      disputesLost: 0,
      communityVotes: 45,
      lastUpdated: '2024-10-01'
    },
    joinedDate: '2020-01-15',
    lastActive: '2024-10-08'
  },
  {
    id: 'U002',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    role: 'landowner',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c5aa3c4F5',
    verificationStatus: 'verified',
    profile: {
      phone: '+91 8765432109',
      address: 'Village Rampur, Near Temple',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      country: 'India',
      postalCode: '250001',
      dateOfBirth: '1978-11-22',
      nationalId: 'AADHAAR-2345-6789-0123',
      bio: 'Agricultural landowner managing family farmlands for over 20 years. Advocate for sustainable farming practices.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
    },
    reputation: {
      score: 88,
      totalTransactions: 8,
      successfulTransactions: 8,
      disputesWon: 1,
      disputesLost: 1,
      communityVotes: 32,
      lastUpdated: '2024-09-28'
    },
    joinedDate: '2019-06-10',
    lastActive: '2024-10-07'
  },
  {
    id: 'U003',
    name: 'District Authority',
    email: 'authority@district.gov.in',
    role: 'authority',
    walletAddress: '0x9cb2g210662cE543904123756Ibd247d6bb4d5G6',
    verificationStatus: 'verified',
    profile: {
      phone: '+91 1800-180-1551',
      address: 'District Collectorate, Sector 17',
      city: 'Gurgaon',
      state: 'Haryana',
      country: 'India',
      postalCode: '122001',
      dateOfBirth: '1975-08-10',
      nationalId: 'GOVT-ID-789012',
      bio: 'Official government authority responsible for land registration, verification, and dispute resolution in the district.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Authority'
    },
    reputation: {
      score: 98,
      totalTransactions: 156,
      successfulTransactions: 154,
      disputesWon: 45,
      disputesLost: 2,
      communityVotes: 234,
      lastUpdated: '2024-10-08'
    },
    joinedDate: '2018-01-01',
    lastActive: '2024-10-09'
  },
  {
    id: 'U004',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    role: 'buyer',
    walletAddress: '0x4d5e6f7890abcdef1234567890abcdef12345678',
    verificationStatus: 'verified',
    profile: {
      phone: '+91 9988776655',
      address: '45 Business District, Tower A',
      city: 'Gurgaon',
      state: 'Haryana',
      country: 'India',
      postalCode: '122002',
      dateOfBirth: '1990-12-05',
      nationalId: 'AADHAAR-3456-7890-1234',
      bio: 'Real estate investor and entrepreneur looking for commercial and residential properties in NCR region.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed'
    },
    reputation: {
      score: 85,
      totalTransactions: 12,
      successfulTransactions: 11,
      disputesWon: 2,
      disputesLost: 0,
      communityVotes: 28,
      lastUpdated: '2024-09-30'
    },
    joinedDate: '2021-03-20',
    lastActive: '2024-10-08'
  },
  {
    id: 'U005',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@arbitrator.org',
    role: 'arbitrator',
    walletAddress: '0x5e6f7890abcdef1234567890abcdef1234567890',
    verificationStatus: 'verified',
    profile: {
      phone: '+91 9876543211',
      address: '78 Legal Complex, High Court Road',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postalCode: '110003',
      dateOfBirth: '1982-04-18',
      nationalId: 'BAR-ID-567890',
      bio: 'Certified arbitrator with 15+ years experience in land and property disputes. PhD in Property Law from Delhi University.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
    },
    reputation: {
      score: 96,
      totalTransactions: 89,
      successfulTransactions: 87,
      disputesWon: 67,
      disputesLost: 3,
      communityVotes: 156,
      lastUpdated: '2024-10-05'
    },
    joinedDate: '2019-09-12',
    lastActive: '2024-10-09'
  }
];

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