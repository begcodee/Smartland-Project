export interface User {
  id: string;
  name: string;
  email: string;
  role: 'landowner' | 'buyer' | 'authority' | 'arbitrator';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  country: string;
  phoneNumber?: string;
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
  location: string;
  area: number; // in square meters
  value: number; // in USD
  owner: string;
  status: 'active' | 'disputed' | 'transfer_pending';
  registrationDate: string;
  coordinates?: { lat: number; lng: number };
  documents?: string[];
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

// Ghana-specific mock users including government bodies
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
      successfulTransactions: 8,
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
    organization: 'Ghana Land Commission',
    phoneNumber: '+233302123456'
  },
  {
    id: 'U004',
    name: 'Accra Metropolitan Assembly',
    email: 'lands@ama.gov.gh',
    role: 'authority',
    verificationStatus: 'verified',
    country: 'GH',
    organization: 'Accra Metropolitan Assembly (AMA)',
    phoneNumber: '+233302654321'
  },
  {
    id: 'U005',
    name: 'Yaw Oppong',
    email: 'yaw.oppong@hotmail.com',
    role: 'landowner',
    verificationStatus: 'pending',
    country: 'GH',
    phoneNumber: '+233244567890',
    reputation: {
      score: 72,
      totalTransactions: 5,
      successfulTransactions: 4,
      disputesWon: 0,
      communityVotes: 18
    }
  },
  {
    id: 'U006',
    name: 'Dr. Ama Osei',
    email: 'ama.osei@arbitrator.gh',
    role: 'arbitrator',
    verificationStatus: 'verified',
    country: 'GH',
    organization: 'Ghana Bar Association',
    phoneNumber: '+233244111222',
    reputation: {
      score: 98,
      totalTransactions: 0,
      successfulTransactions: 0,
      disputesWon: 15,
      communityVotes: 120
    }
  },
  {
    id: 'U007',
    name: 'Efua Asamoah',
    email: 'efua.asamoah@gmail.com',
    role: 'landowner',
    verificationStatus: 'verified',
    country: 'GH',
    phoneNumber: '+233244333444',
    reputation: {
      score: 91,
      totalTransactions: 7,
      successfulTransactions: 6,
      disputesWon: 1,
      communityVotes: 28
    }
  },
  {
    id: 'U008',
    name: 'Ministry of Lands and Natural Resources',
    email: 'info@mlnr.gov.gh',
    role: 'authority',
    verificationStatus: 'verified',
    country: 'GH',
    organization: 'Ministry of Lands and Natural Resources',
    phoneNumber: '+233302777888'
  }
];

// Ghana-specific land parcels
export const mockLandParcels: LandParcel[] = [
  {
    id: 'LP001',
    title: 'Residential Plot - East Legon',
    description: 'Prime residential land in East Legon with easy access to main roads and utilities. Perfect for luxury home development.',
    location: 'East Legon, Accra, Greater Accra Region',
    area: 1200,
    value: 85000,
    owner: 'Kwame Asante',
    status: 'active',
    registrationDate: '2024-03-15T10:00:00Z',
    coordinates: { lat: 5.6037, lng: -0.1870 },
    documents: ['title_deed.pdf', 'survey_plan.pdf', 'building_permit.pdf']
  },
  {
    id: 'LP002',
    title: 'Commercial Land - Kumasi CBD',
    description: 'Strategic commercial land in the heart of Kumasi business district. High potential for retail or office development.',
    location: 'Adum, Kumasi, Ashanti Region',
    area: 2500,
    value: 120000,
    owner: 'Akosua Frimpong',
    status: 'transfer_pending',
    registrationDate: '2024-02-20T14:30:00Z',
    coordinates: { lat: 6.6885, lng: -1.6244 },
    documents: ['commercial_title.pdf', 'zoning_certificate.pdf']
  },
  {
    id: 'LP003',
    title: 'Agricultural Land - Brong Ahafo',
    description: 'Fertile agricultural land suitable for cocoa and food crop cultivation. Well-drained soil with access to water sources.',
    location: 'Sunyani, Bono Region',
    area: 5000,
    value: 45000,
    owner: 'Yaw Oppong',
    status: 'active',
    registrationDate: '2024-01-10T09:15:00Z',
    coordinates: { lat: 7.3392, lng: -2.3265 },
    documents: ['farm_title.pdf', 'soil_analysis.pdf']
  },
  {
    id: 'LP004',
    title: 'Coastal Tourism Land - Cape Coast',
    description: 'Beautiful coastal land with tourism potential near Cape Coast Castle. Ideal for resort or hospitality development.',
    location: 'Cape Coast, Central Region',
    area: 800,
    value: 95000,
    owner: 'Efua Asamoah',
    status: 'disputed',
    registrationDate: '2024-04-05T11:45:00Z',
    coordinates: { lat: 5.1053, lng: -1.2466 },
    documents: ['coastal_title.pdf', 'environmental_clearance.pdf']
  },
  {
    id: 'LP005',
    title: 'Industrial Plot - Tema',
    description: 'Industrial land near Tema Port with excellent logistics access. Suitable for manufacturing or warehousing.',
    location: 'Tema, Greater Accra Region',
    area: 3200,
    value: 110000,
    owner: 'Ghana Land Commission',
    status: 'active',
    registrationDate: '2024-05-12T08:20:00Z',
    coordinates: { lat: 5.6698, lng: -0.0166 },
    documents: ['industrial_lease.pdf', 'port_access_permit.pdf']
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
    amount: 120000,
    status: 'pending',
    initiatedDate: '2024-10-01T09:00:00Z',
    escrowAmount: 12000
  },
  {
    id: 'T002',
    landParcelId: 'LP003',
    from: 'Yaw Oppong',
    to: 'Cocoa Farmers Cooperative',
    amount: 45000,
    status: 'completed',
    initiatedDate: '2024-09-20T14:15:00Z',
    completedDate: '2024-09-25T11:30:00Z'
  },
  {
    id: 'T003',
    landParcelId: 'LP001',
    from: 'Previous Owner',
    to: 'Kwame Asante',
    amount: 85000,
    status: 'completed',
    initiatedDate: '2024-03-10T10:20:00Z',
    completedDate: '2024-03-15T15:45:00Z'
  },
  {
    id: 'T004',
    landParcelId: 'LP005',
    from: 'Ghana Land Commission',
    to: 'Industrial Development Corp',
    amount: 110000,
    status: 'pending',
    initiatedDate: '2024-10-05T13:10:00Z',
    escrowAmount: 22000
  }
];