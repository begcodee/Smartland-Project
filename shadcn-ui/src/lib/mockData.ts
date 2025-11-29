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
  creditScore?: {
    score: number;
    rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    paymentHistory: number;
    creditUtilization: number;
    lengthOfHistory: number;
    newCredit: number;
    creditMix: number;
  };
  financialProfile?: {
    monthlyIncome: number;
    assets: number;
    liabilities: number;
    netWorth: number;
    bankingHistory: number; // years
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
  price: number; // Now in Ghana Cedis
  status: 'available' | 'pending' | 'sold' | 'disputed';
  ownerId: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  images?: Array<{
    id: string;
    url: string;
    caption: string;
    type: 'main' | 'aerial' | 'boundary' | 'interior' | 'exterior';
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
  amount: number; // Now in Ghana Cedis
  status: 'pending' | 'completed' | 'cancelled';
  initiatedDate: string;
  completedDate?: string;
  escrowAmount?: number;
}

export const mockUsers: User[] = [
  {
    id: 'U001',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    role: 'landowner',
    verificationStatus: 'verified',
    country: 'GH',
    phoneNumber: '+233244123456',
    reputation: {
      score: 92,
      totalTransactions: 15,
      successfulTransactions: 14,
      disputesWon: 3,
      communityVotes: 45
    },
    creditScore: {
      score: 785,
      rating: 'Excellent',
      paymentHistory: 95,
      creditUtilization: 25,
      lengthOfHistory: 88,
      newCredit: 82,
      creditMix: 90
    },
    financialProfile: {
      monthlyIncome: 8500,
      assets: 450000,
      liabilities: 125000,
      netWorth: 325000,
      bankingHistory: 12
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
    },
    creditScore: {
      score: 720,
      rating: 'Good',
      paymentHistory: 88,
      creditUtilization: 35,
      lengthOfHistory: 75,
      newCredit: 70,
      creditMix: 85
    },
    financialProfile: {
      monthlyIncome: 6200,
      assets: 180000,
      liabilities: 45000,
      netWorth: 135000,
      bankingHistory: 8
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
    organization: 'Ghana Land Commission',
    reputation: {
      score: 98,
      totalTransactions: 250,
      successfulTransactions: 248,
      disputesWon: 45,
      communityVotes: 890
    }
  },
  {
    id: 'U004',
    name: 'Dr. Ama Osei',
    email: 'ama.osei@arbitrator.gh',
    role: 'arbitrator',
    verificationStatus: 'verified',
    country: 'GH',
    phoneNumber: '+233244567890',
    organization: 'Ghana Arbitration Centre',
    reputation: {
      score: 94,
      totalTransactions: 67,
      successfulTransactions: 65,
      disputesWon: 42,
      communityVotes: 156
    }
  },
  {
    id: 'U005',
    name: 'Kofi Mensah',
    email: 'kofi.mensah@ama.gov.gh',
    role: 'authority',
    verificationStatus: 'verified',
    country: 'GH',
    phoneNumber: '+233302789012',
    organization: 'Accra Metropolitan Assembly',
    reputation: {
      score: 91,
      totalTransactions: 134,
      successfulTransactions: 131,
      disputesWon: 28,
      communityVotes: 445
    }
  }
];

export const mockLandParcels: LandParcel[] = [
  {
    id: 'LP001',
    title: 'Prime Residential Plot in East Legon',
    description: 'Beautiful residential plot in the prestigious East Legon area, perfect for building your dream home. Located in a quiet neighborhood with excellent infrastructure.',
    location: {
      address: 'East Legon, Accra',
      coordinates: { lat: 5.6037, lng: -0.1870 },
      region: 'Greater Accra'
    },
    area: 2000,
    price: 450000, // GHS 450,000
    status: 'available',
    ownerId: 'U001',
    type: 'residential',
    images: [
      {
        id: 'img1',
        url: '/assets/property-1.jpg',
        caption: 'Modern residential development with palm trees and contemporary architecture',
        type: 'main',
        uploadedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'img2',
        url: '/assets/property-2.jpg',
        caption: 'Aerial view of the residential complex showing layout and surroundings',
        type: 'aerial',
        uploadedAt: '2024-01-15T10:05:00Z'
      }
    ],
    documents: [
      {
        id: 'DOC001',
        name: 'Land Title Certificate',
        type: 'PDF',
        url: '/documents/land-title-001.pdf',
        uploadedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'DOC002',
        name: 'Survey Plan',
        type: 'PDF',
        url: '/documents/survey-plan-001.pdf',
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
        userName: 'John Doe',
        content: 'Yes, the title is completely clean with no encumbrances.',
        timestamp: '2024-01-16T15:45:00Z',
        likes: 2
      }
    ],
    // Legacy compatibility
    owner: 'John Doe',
    value: 450000,
    registrationDate: '2024-01-15',
    lastTransfer: '2024-01-15',
    blockchainHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12'
  },
  {
    id: 'LP002',
    title: 'Commercial Space in Kumasi CBD',
    description: 'Strategic commercial plot in the heart of Kumasi Central Business District. High foot traffic area with excellent business potential.',
    location: {
      address: 'Kejetia, Kumasi',
      coordinates: { lat: 6.6885, lng: -1.6244 },
      region: 'Ashanti'
    },
    area: 1500,
    price: 680000, // GHS 680,000
    status: 'pending',
    ownerId: 'U001',
    type: 'commercial',
    images: [
      {
        id: 'img3',
        url: '/assets/property-3.jpg',
        caption: 'Commercial development area with modern infrastructure',
        type: 'main',
        uploadedAt: '2024-01-10T09:00:00Z'
      }
    ],
    documents: [
      {
        id: 'DOC003',
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
    owner: 'John Doe',
    value: 680000,
    registrationDate: '2024-01-10',
    lastTransfer: '2024-01-20'
  },
  {
    id: 'LP003',
    title: 'Agricultural Land in Sunyani',
    description: 'Fertile agricultural land suitable for cocoa and food crop cultivation. Rich soil with good drainage and access to water sources.',
    location: {
      address: 'Sunyani, Bono Region',
      coordinates: { lat: 7.3392, lng: -2.3265 },
      region: 'Bono'
    },
    area: 5000,
    price: 225000, // GHS 225,000
    status: 'available',
    ownerId: 'U001',
    type: 'agricultural',
    images: [
      {
        id: 'img4',
        url: '/assets/property-4.jpg',
        caption: 'Expansive agricultural land with fertile soil for farming',
        type: 'main',
        uploadedAt: '2024-01-05T11:00:00Z'
      }
    ],
    documents: [
      {
        id: 'DOC004',
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
    owner: 'John Doe',
    value: 225000,
    registrationDate: '2024-01-05',
    lastTransfer: '2024-01-05'
  },
  {
    id: 'LP004',
    title: 'Beachfront Property in Cape Coast',
    description: 'Stunning beachfront property with tourism development potential. Direct beach access with panoramic ocean views.',
    location: {
      address: 'Cape Coast, Central Region',
      coordinates: { lat: 5.1053, lng: -1.2466 },
      region: 'Central'
    },
    area: 3000,
    price: 950000, // GHS 950,000
    status: 'disputed',
    ownerId: 'U001',
    type: 'commercial',
    images: [
      {
        id: 'img5',
        url: '/assets/property-5.jpg',
        caption: 'Beachfront property with direct ocean access and development potential',
        type: 'main',
        uploadedAt: '2024-01-12T14:00:00Z'
      }
    ],
    documents: [
      {
        id: 'DOC005',
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
    owner: 'John Doe',
    value: 950000,
    registrationDate: '2024-01-12',
    lastTransfer: '2024-01-12'
  },
  {
    id: 'LP005',
    title: 'Industrial Plot in Tema',
    description: 'Large industrial plot near Tema Port, ideal for manufacturing and logistics. Excellent transportation links and utilities.',
    location: {
      address: 'Tema Industrial Area',
      coordinates: { lat: 5.6698, lng: -0.0166 },
      region: 'Greater Accra'
    },
    area: 8000,
    price: 1200000, // GHS 1,200,000
    status: 'available',
    ownerId: 'U001',
    type: 'industrial',
    documents: [
      {
        id: 'DOC006',
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
    owner: 'John Doe',
    value: 1200000,
    registrationDate: '2024-01-08',
    lastTransfer: '2024-01-08'
  },
  {
    id: 'LP006',
    title: 'Luxury Residential Estate in Trasacco',
    description: 'Premium residential plot in the exclusive Trasacco Valley Estate. Gated community with 24/7 security and modern amenities.',
    location: {
      address: 'Trasacco Valley, East Legon',
      coordinates: { lat: 5.6125, lng: -0.1785 },
      region: 'Greater Accra'
    },
    area: 1800,
    price: 850000, // GHS 850,000
    status: 'available',
    ownerId: 'U002',
    type: 'residential',
    documents: [
      {
        id: 'DOC007',
        name: 'Land Title Certificate',
        type: 'PDF',
        url: '/documents/land-title-006.pdf',
        uploadedAt: '2024-02-01T10:00:00Z'
      }
    ],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    comments: [],
    // Legacy compatibility
    owner: 'Akosua Frimpong',
    value: 850000,
    registrationDate: '2024-02-01',
    lastTransfer: '2024-02-01'
  },
  {
    id: 'LP007',
    title: 'Mixed-Use Development Plot in Spintex',
    description: 'Versatile plot suitable for mixed-use development. Located on main Spintex road with high visibility and accessibility.',
    location: {
      address: 'Spintex Road, Accra',
      coordinates: { lat: 5.6180, lng: -0.1050 },
      region: 'Greater Accra'
    },
    area: 2500,
    price: 720000, // GHS 720,000
    status: 'available',
    ownerId: 'U001',
    type: 'commercial',
    documents: [
      {
        id: 'DOC008',
        name: 'Development Permit',
        type: 'PDF',
        url: '/documents/dev-permit-007.pdf',
        uploadedAt: '2024-02-05T14:00:00Z'
      }
    ],
    createdAt: '2024-02-05T14:00:00Z',
    updatedAt: '2024-02-05T14:00:00Z',
    comments: [],
    // Legacy compatibility
    owner: 'John Doe',
    value: 720000,
    registrationDate: '2024-02-05',
    lastTransfer: '2024-02-05'
  },
  {
    id: 'LP008',
    title: 'Cocoa Farm in Ashanti Region',
    description: 'Established cocoa farm with mature trees. Includes processing facilities and worker accommodation. Excellent investment opportunity.',
    location: {
      address: 'Konongo, Ashanti Region',
      coordinates: { lat: 6.6167, lng: -1.2167 },
      region: 'Ashanti'
    },
    area: 12000,
    price: 580000, // GHS 580,000
    status: 'available',
    ownerId: 'U001',
    type: 'agricultural',
    documents: [
      {
        id: 'DOC009',
        name: 'Farm Registration Certificate',
        type: 'PDF',
        url: '/documents/farm-cert-008.pdf',
        uploadedAt: '2024-01-20T11:00:00Z'
      }
    ],
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
    comments: [],
    // Legacy compatibility
    owner: 'John Doe',
    value: 580000,
    registrationDate: '2024-01-20',
    lastTransfer: '2024-01-20'
  }
];

export const mockDisputes: Dispute[] = [
  {
    id: 'D001',
    landParcelId: 'LP004',
    plaintiff: 'Traditional Authority - Cape Coast',
    defendant: 'John Doe',
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
    defendant: 'John Doe',
    description: 'Boundary dispute regarding the exact demarcation of commercial property in Kumasi CBD.',
    evidence: ['survey_discrepancy.pdf', 'boundary_photos.pdf'],
    status: 'under_review',
    filedDate: '2024-09-28T10:15:00Z'
  },
  {
    id: 'D003',
    landParcelId: 'LP001',
    plaintiff: 'John Mensah',
    defendant: 'John Doe',
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
    from: 'John Doe',
    to: 'Ghana Investment Holdings',
    amount: 680000, // GHS 680,000
    status: 'pending',
    initiatedDate: '2024-10-01T09:00:00Z',
    escrowAmount: 68000
  },
  {
    id: 'T002',
    landParcelId: 'LP003',
    from: 'Yaw Oppong',
    to: 'Cocoa Farmers Cooperative',
    amount: 225000, // GHS 225,000
    status: 'completed',
    initiatedDate: '2024-09-20T14:15:00Z',
    completedDate: '2024-09-25T11:30:00Z'
  },
  {
    id: 'T003',
    landParcelId: 'LP001',
    from: 'Previous Owner',
    to: 'John Doe',
    amount: 450000, // GHS 450,000
    status: 'completed',
    initiatedDate: '2024-03-10T10:20:00Z',
    completedDate: '2024-03-15T15:45:00Z'
  },
  {
    id: 'T004',
    landParcelId: 'LP005',
    from: 'Ghana Land Commission',
    to: 'Industrial Development Corp',
    amount: 1200000, // GHS 1,200,000
    status: 'pending',
    initiatedDate: '2024-10-05T13:10:00Z',
    escrowAmount: 120000
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

// Comprehensive countries list with African countries prioritized
export const countries = [
  // African countries (prioritized)
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
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', dialCode: '+220' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', dialCode: '+213' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', dialCode: '+216' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾', dialCode: '+218' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', dialCode: '+249' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', dialCode: '+267' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', dialCode: '+260' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', dialCode: '+265' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', dialCode: '+258' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', dialCode: '+244' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', dialCode: '+237' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', dialCode: '+241' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', dialCode: '+242' },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩', dialCode: '+243' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', dialCode: '+236' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩', dialCode: '+235' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', dialCode: '+227' },
  
  // Other major countries
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', dialCode: '+358' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', dialCode: '+48' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', dialCode: '+420' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', dialCode: '+36' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', dialCode: '+30' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '+90' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dialCode: '+57' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', dialCode: '+58' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', dialCode: '+598' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', dialCode: '+595' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', dialCode: '+591' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', dialCode: '+593' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾', dialCode: '+592' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷', dialCode: '+597' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '+972' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', dialCode: '+971' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '+974' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', dialCode: '+965' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', dialCode: '+973' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', dialCode: '+968' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', dialCode: '+962' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', dialCode: '+961' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾', dialCode: '+963' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', dialCode: '+964' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', dialCode: '+98' },
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', dialCode: '+93' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '+92' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '+880' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', dialCode: '+977' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹', dialCode: '+975' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', dialCode: '+960' }
];

// Currency formatter for Ghana Cedis
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};