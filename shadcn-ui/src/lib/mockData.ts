export interface User {
  id: string;
  name: string;
  email: string;
  role: 'landowner' | 'buyer' | 'authority' | 'arbitrator';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  country: string;
  phoneNumber: string;
  organization?: string;
  reputation?: {
    score: number;
    totalTransactions: number;
    successfulTransactions: number;
    disputesWon: number;
    communityVotes: number;
  };
}

export interface LandParcel {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    region: string;
  };
  area: number;
  price: number;
  status: 'available' | 'pending' | 'sold' | 'disputed';
  ownerId: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  type: 'residential' | 'commercial' | 'agricultural' | 'industrial';
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: string;
    likes: number;
  }>;
  // Legacy fields for compatibility
  owner?: string;
  value?: number;
  registrationDate?: string;
  lastTransfer?: string;
  blockchainHash?: string;
}

export interface Dispute {
  id: string;
  landParcelId: string;
  plaintiff: string;
  defendant: string;
  description: string;
  evidence: string[];
  status: 'filed' | 'under_review' | 'community_voting' | 'resolved';
  filedDate: string;
  votes?: {
    for: number;
    against: number;
    abstain: number;
  };
  resolution?: string;
}

export interface Transfer {
  id: string;
  landParcelId: string;
  from: string;
  to: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  initiatedDate: string;
  completedDate?: string;
  escrowAmount?: number;
}

export const mockUsers: User[] = [
  {
    id: 'U001',
    name: 'Kwame Asante',
    email: 'kwame.asante@gmail.com',
    role: 'landowner',
    verificationStatus: 'verified',
    country: 'GH',
    phoneNumber: '+233244123456',
    reputation: {
      score: 95,
      totalTransactions: 12,
      successfulTransactions: 11,
      disputesWon: 2,
      communityVotes: 45
    }
  },
  {
    id: 'U002',
    name: 'Akosua Frimpong',
    email: 'akosua.frimpong@yahoo.com',
    role: 'buyer',
    verificationStatus: 'verified',
    country: 'GH',
    phoneNumber: '+233201987654',
    reputation: {
      score: 88,
      totalTransactions: 8,
      successfulTransactions: 7,
      disputesWon: 1,
      communityVotes: 32
    }
  },
  {
    id: 'U003',
    name: 'Ghana Land Commission',
    email: 'admin@ghanalandcommission.gov.gh',
    role: 'authority',
    verificationStatus: 'verified',
    country: 'GH',
    phoneNumber: '+233302123456',
    organization: 'Ghana Land Commission'
  },
  {
    id: 'U004',
    name: 'Dr. Ama Osei',
    email: 'ama.osei@arbitrator.gh',
    role: 'arbitrator',
    verificationStatus: 'verified',
    country: 'GH',
    phoneNumber: '+233244567890',
    organization: 'Ghana Arbitration Centre'
  },
  {
    id: 'U005',
    name: 'Kofi Mensah',
    email: 'kofi.mensah@ama.gov.gh',
    role: 'authority',
    verificationStatus: 'verified',
    country: 'GH',
    phoneNumber: '+233302789012',
    organization: 'Accra Metropolitan Assembly'
  }
];

export const mockLandParcels: LandParcel[] = [
  {
    id: 'LP001',
    title: 'Prime Residential Plot in East Legon',
    description: 'Beautiful residential plot in the prestigious East Legon area, perfect for building your dream home.',
    location: {
      address: 'East Legon, Accra',
      coordinates: { lat: 5.6037, lng: -0.1870 },
      region: 'Greater Accra'
    },
    area: 2000,
    price: 150000,
    status: 'available',
    ownerId: 'U001',
    type: 'residential',
    documents: [
      {
        id: 'DOC001',
        name: 'Land Title Certificate',
        type: 'PDF',
        url: '/documents/land-title-001.pdf',
        uploadedAt: '2024-01-15T10:00:00Z'
      }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    comments: [
      {
        id: 'C001',
        userId: 'U002',
        userName: 'Akosua Frimpong',
        content: 'This looks like a great location! Is the title clean?',
        timestamp: '2024-01-16T14:30:00Z',
        likes: 3
      },
      {
        id: 'C002',
        userId: 'U001',
        userName: 'Kwame Asante',
        content: 'Yes, the title is completely clean with no encumbrances.',
        timestamp: '2024-01-16T15:45:00Z',
        likes: 2
      }
    ],
    // Legacy compatibility
    owner: 'Kwame Asante',
    value: 150000,
    registrationDate: '2024-01-15',
    lastTransfer: '2024-01-15'
  },
  {
    id: 'LP002',
    title: 'Commercial Space in Kumasi CBD',
    description: 'Strategic commercial plot in the heart of Kumasi Central Business District.',
    location: {
      address: 'Kejetia, Kumasi',
      coordinates: { lat: 6.6885, lng: -1.6244 },
      region: 'Ashanti'
    },
    area: 1500,
    price: 200000,
    status: 'pending',
    ownerId: 'U001',
    type: 'commercial',
    documents: [
      {
        id: 'DOC002',
        name: 'Site Plan',
        type: 'PDF',
        url: '/documents/site-plan-002.pdf',
        uploadedAt: '2024-01-10T09:00:00Z'
      }
    ],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
    comments: [
      {
        id: 'C003',
        userId: 'U003',
        userName: 'Ghana Land Commission',
        content: 'Documentation under review. Expected completion in 5 business days.',
        timestamp: '2024-01-20T16:00:00Z',
        likes: 1
      }
    ],
    // Legacy compatibility
    owner: 'Akosua Frimpong',
    value: 200000,
    registrationDate: '2024-01-10',
    lastTransfer: '2024-01-20'
  },
  {
    id: 'LP003',
    title: 'Agricultural Land in Sunyani',
    description: 'Fertile agricultural land suitable for cocoa and food crop cultivation.',
    location: {
      address: 'Sunyani, Bono Region',
      coordinates: { lat: 7.3392, lng: -2.3265 },
      region: 'Bono'
    },
    area: 5000,
    price: 75000,
    status: 'available',
    ownerId: 'U001',
    type: 'agricultural',
    documents: [
      {
        id: 'DOC003',
        name: 'Survey Report',
        type: 'PDF',
        url: '/documents/survey-003.pdf',
        uploadedAt: '2024-01-05T11:00:00Z'
      }
    ],
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-05T11:00:00Z',
    comments: [
      {
        id: 'C004',
        userId: 'U002',
        userName: 'Akosua Frimpong',
        content: 'What is the soil quality like for cocoa farming?',
        timestamp: '2024-01-18T10:15:00Z',
        likes: 2
      }
    ],
    // Legacy compatibility
    owner: 'Yaw Oppong',
    value: 75000,
    registrationDate: '2024-01-05',
    lastTransfer: '2024-01-05'
  },
  {
    id: 'LP004',
    title: 'Beachfront Property in Cape Coast',
    description: 'Stunning beachfront property with tourism development potential.',
    location: {
      address: 'Cape Coast, Central Region',
      coordinates: { lat: 5.1053, lng: -1.2466 },
      region: 'Central'
    },
    area: 3000,
    price: 300000,
    status: 'disputed',
    ownerId: 'U001',
    type: 'commercial',
    documents: [
      {
        id: 'DOC004',
        name: 'Environmental Impact Assessment',
        type: 'PDF',
        url: '/documents/eia-004.pdf',
        uploadedAt: '2024-01-12T14:00:00Z'
      }
    ],
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
    comments: [
      {
        id: 'C005',
        userId: 'U004',
        userName: 'Dr. Ama Osei',
        content: 'Excellent location for hospitality development. Ensure all coastal regulations are met.',
        timestamp: '2024-01-19T09:30:00Z',
        likes: 4
      }
    ],
    // Legacy compatibility
    owner: 'Efua Asamoah',
    value: 300000,
    registrationDate: '2024-01-12',
    lastTransfer: '2024-01-12'
  },
  {
    id: 'LP005',
    title: 'Industrial Plot in Tema',
    description: 'Large industrial plot near Tema Port, ideal for manufacturing and logistics.',
    location: {
      address: 'Tema Industrial Area',
      coordinates: { lat: 5.6698, lng: -0.0166 },
      region: 'Greater Accra'
    },
    area: 8000,
    price: 500000,
    status: 'available',
    ownerId: 'U001',
    type: 'industrial',
    documents: [
      {
        id: 'DOC005',
        name: 'Zoning Certificate',
        type: 'PDF',
        url: '/documents/zoning-005.pdf',
        uploadedAt: '2024-01-08T13:00:00Z'
      }
    ],
    createdAt: '2024-01-08T13:00:00Z',
    updatedAt: '2024-01-08T13:00:00Z',
    comments: [
      {
        id: 'C006',
        userId: 'U005',
        userName: 'Kofi Mensah',
        content: 'This area has excellent infrastructure for industrial development.',
        timestamp: '2024-01-17T11:45:00Z',
        likes: 3
      }
    ],
    // Legacy compatibility
    owner: 'Ghana Land Commission',
    value: 500000,
    registrationDate: '2024-01-08',
    lastTransfer: '2024-01-08'
  }
];

export const mockDisputes: Dispute[] = [
  {
    id: 'D001',
    landParcelId: 'LP004',
    plaintiff: 'Traditional Authority - Cape Coast',
    defendant: 'Efua Asamoah',
    description: 'Dispute over traditional land rights and proper acquisition procedures for coastal land development.',
    evidence: ['traditional_claim.pdf', 'witness_statements.pdf', 'historical_documents.pdf'],
    status: 'community_voting',
    filedDate: '2024-09-15T14:20:00Z',
    votes: {
      for: 23,
      against: 18,
      abstain: 5
    }
  },
  {
    id: 'D002',
    landParcelId: 'LP002',
    plaintiff: 'Neighboring Property Owner',
    defendant: 'Akosua Frimpong',
    description: 'Boundary dispute regarding the exact demarcation of commercial property in Kumasi CBD.',
    evidence: ['survey_discrepancy.pdf', 'boundary_photos.pdf'],
    status: 'under_review',
    filedDate: '2024-09-28T10:15:00Z'
  },
  {
    id: 'D003',
    landParcelId: 'LP001',
    plaintiff: 'John Mensah',
    defendant: 'Kwame Asante',
    description: 'Claim of prior ownership and incomplete transfer documentation for East Legon residential plot.',
    evidence: ['prior_agreement.pdf', 'payment_receipts.pdf'],
    status: 'resolved',
    filedDate: '2024-08-10T16:30:00Z',
    resolution: 'Resolved in favor of defendant. Original documentation confirmed valid ownership transfer.'
  }
];

export const mockTransfers: Transfer[] = [
  {
    id: 'T001',
    landParcelId: 'LP002',
    from: 'Akosua Frimpong',
    to: 'Ghana Investment Holdings',
    amount: 200000,
    status: 'pending',
    initiatedDate: '2024-10-01T09:00:00Z',
    escrowAmount: 20000
  },
  {
    id: 'T002',
    landParcelId: 'LP003',
    from: 'Yaw Oppong',
    to: 'Cocoa Farmers Cooperative',
    amount: 75000,
    status: 'completed',
    initiatedDate: '2024-09-20T14:15:00Z',
    completedDate: '2024-09-25T11:30:00Z'
  },
  {
    id: 'T003',
    landParcelId: 'LP001',
    from: 'Previous Owner',
    to: 'Kwame Asante',
    amount: 150000,
    status: 'completed',
    initiatedDate: '2024-03-10T10:20:00Z',
    completedDate: '2024-03-15T15:45:00Z'
  },
  {
    id: 'T004',
    landParcelId: 'LP005',
    from: 'Ghana Land Commission',
    to: 'Industrial Development Corp',
    amount: 500000,
    status: 'pending',
    initiatedDate: '2024-10-05T13:10:00Z',
    escrowAmount: 50000
  }
];

// Mock blockchain service for land registration
export const blockchainService = {
  registerLand: async (landData: Omit<LandParcel, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Simulate blockchain registration
    const id = `LP${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    const newParcel: LandParcel = {
      ...landData,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      comments: []
    };
    
    // Add to mock data
    mockLandParcels.push(newParcel);
    
    return {
      success: true,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      landParcel: newParcel,
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      gasUsed: Math.floor(Math.random() * 50000) + 21000
    };
  },
  
  transferOwnership: async (landId: string, newOwnerId: string) => {
    const parcel = mockLandParcels.find(p => p.id === landId);
    if (parcel) {
      parcel.ownerId = newOwnerId;
      parcel.updatedAt = new Date().toISOString();
      
      return {
        success: true,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        landParcel: parcel
      };
    }
    
    return { success: false, error: 'Land parcel not found' };
  },
  
  verifyOwnership: async (landId: string, userId: string) => {
    const parcel = mockLandParcels.find(p => p.id === landId);
    return {
      isOwner: parcel?.ownerId === userId,
      verificationHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };
  }
};

// Export countries data for CountrySelector
export const countries = [
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', dialCode: '+212' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', dialCode: '+251' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', dialCode: '+255' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', dialCode: '+256' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', dialCode: '+250' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', dialCode: '+221' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', dialCode: '+225' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', dialCode: '+223' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', dialCode: '+229' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '+228' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', dialCode: '+231' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', dialCode: '+232' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳', dialCode: '+224' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', dialCode: '+220' }
];