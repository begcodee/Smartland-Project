/**
 * Maps API parcel responses to frontend LandParcel shape
 */
import type { LandParcel } from './mockData';

export function mapApiParcelToLandParcel(p: {
  id: string;
  title: string;
  description: string;
  area: number;
  price: number;
  status: string;
  ownerId: string;
  type: string;
  documentsVerificationStatus?: string;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; name: string; email: string };
  location?: { address: string; latitude?: number; longitude?: number; region?: string };
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    verificationStatus?: string;
    verifiedAt?: string | null;
  }>;
  images?: Array<{
    id: string;
    url: string;
    caption: string;
    type: string;
    displayOrder?: number;
    uploadedAt?: string;
  }>;
  comments?: Array<{
    id: string;
    userId: string;
    content: string;
    user?: { id: string; name: string };
  }>;
}): LandParcel {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? '',
    location: {
      address: p.location?.address ?? '',
      coordinates: {
        lat: p.location?.latitude ?? 5.6,
        lng: p.location?.longitude ?? -0.19
      },
      region: p.location?.region ?? 'Greater Accra'
    },
    area: p.area,
    price: p.price,
    status: (p.status as LandParcel['status']) ?? 'available',
    ownerId: p.ownerId,
    owner: p.owner?.name ?? 'Unknown',
    documents: (p.documents ?? []).map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      url: d.url,
      uploadedAt: '',
      verificationStatus: d.verificationStatus as 'pending' | 'verified' | 'rejected' | undefined
    })),
    documentsVerificationStatus: (p.documentsVerificationStatus as 'pending' | 'verified' | 'rejected') ?? 'pending',
    images: (p.images ?? []).map(img => ({
      id: img.id,
      url: img.url,
      caption: img.caption ?? '',
      type: (img.type as 'main' | 'aerial' | 'boundary' | 'interior' | 'exterior') ?? 'main',
      uploadedAt: img.uploadedAt ?? new Date().toISOString()
    })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    type: (p.type as LandParcel['type']) ?? 'residential',
    comments: (p.comments ?? []).map(c => ({
      id: c.id,
      userId: c.userId,
      userName: c.user?.name ?? 'Unknown',
      content: c.content,
      timestamp: '',
      likes: 0
    }))
  };
}
