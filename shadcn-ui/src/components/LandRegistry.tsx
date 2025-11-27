import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, FileText, Plus, Search, Eye, Upload, Camera } from 'lucide-react';
import { mockLandParcels, blockchainService } from '@/lib/mockData';
import { LandParcel, User } from '@/lib/mockData';
import { LandImageUpload } from '@/components/LandImageUpload';
import { DocumentScanner } from '@/components/DocumentScanner';
import { EthereumIntegration } from '@/components/EthereumIntegration';
import { toast } from 'sonner';

interface LandImage {
  id: string;
  url: string;
  caption: string;
  type: 'aerial' | 'boundary' | 'structure' | 'access' | 'general';
  uploadedAt: string;
  size: number;
}

interface ScannedDocument {
  id: string;
  name: string;
  type: string;
  scannedImage: string;
  uploadedAt: string;
  size: number;
}

interface LandRegistryProps {
  currentUser?: User;
}

export const LandRegistry = ({ currentUser }: LandRegistryProps) => {
  const [parcels, setParcels] = useState(mockLandParcels);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showDocumentScan, setShowDocumentScan] = useState(false);
  const [newParcel, setNewParcel] = useState({
    title: '',
    description: '',
    location: {
      address: '',
      region: 'Greater Accra'
    },
    area: '',
    price: '',
    type: 'residential' as const,
    images: [] as LandImage[],
    documents: [] as ScannedDocument[]
  });

  const canRegisterLand = currentUser?.role === 'landowner' || currentUser?.role === 'authority';

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = parcel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.location.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by user role
    if (currentUser?.role === 'landowner') {
      return matchesSearch && parcel.ownerId === currentUser.id;
    }
    
    return matchesSearch;
  });

  const handleRegisterLand = async () => {
    if (!newParcel.title || !newParcel.location.address || !newParcel.area) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsRegistering(true);
    try {
      const parcelData = {
        title: newParcel.title,
        description: newParcel.description,
        location: {
          address: newParcel.location.address,
          coordinates: { 
            lat: 5.6037 + Math.random() * 0.1, 
            lng: -0.1870 + Math.random() * 0.1 
          },
          region: newParcel.location.region
        },
        area: parseInt(newParcel.area),
        price: parseInt(newParcel.price) || 0,
        status: 'available' as const,
        ownerId: currentUser?.id || '',
        type: newParcel.type,
        documents: newParcel.documents.map((doc, index) => ({
          id: `DOC_${Date.now()}_${index}`,
          name: doc.name,
          type: doc.type || 'PDF',
          url: doc.scannedImage || doc.name,
          uploadedAt: new Date().toISOString()
        })),
        comments: []
      };

      const result = await blockchainService.registerLand(parcelData);
      
      if (result.success) {
        const registeredParcel: LandParcel = {
          ...parcelData,
          id: `LP${String(parcels.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Legacy compatibility
          owner: currentUser?.name,
          value: parcelData.price,
          registrationDate: new Date().toISOString().split('T')[0],
          lastTransfer: new Date().toISOString().split('T')[0],
          blockchainHash: result.hash
        };
        
        setParcels([...parcels, registeredParcel]);
        setNewParcel({
          title: '',
          description: '',
          location: { address: '', region: 'Greater Accra' },
          area: '',
          price: '',
          type: 'residential',
          images: [],
          documents: []
        });
        toast.success(`Land registered successfully! Gas used: ${result.gasUsed}`);
      }
    } catch (error) {
      toast.error('Failed to register land on blockchain');
    } finally {
      setIsRegistering(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const regions = [
    'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
    'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong Ahafo',
    'Bono', 'Bono East', 'Ahafo', 'Western North', 'Savannah', 'North East'
  ];

  return (
    <div className="space-y-6">
      {/* Header with Search and Register */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Land Registry</h2>
          <p className="text-muted-foreground">
            {currentUser?.role === 'landowner' ? 'Manage your land parcels' : 'Manage and view all registered land parcels'}
          </p>
        </div>
        
        {canRegisterLand && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Register New Land
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Land Parcel</DialogTitle>
                <DialogDescription>
                  Add a new land parcel to the blockchain registry with images and documents
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Land Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Residential Plot - East Legon"
                      value={newParcel.title}
                      onChange={(e) => setNewParcel({ ...newParcel, title: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Property Type *</Label>
                    <Select value={newParcel.type} onValueChange={(value: 'residential' | 'commercial' | 'agricultural' | 'industrial') => setNewParcel({ ...newParcel, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="agricultural">Agricultural</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of the land property..."
                      value={newParcel.description}
                      onChange={(e) => setNewParcel({ ...newParcel, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="Complete address with landmarks"
                      value={newParcel.location.address}
                      onChange={(e) => setNewParcel({ 
                        ...newParcel, 
                        location: { ...newParcel.location, address: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <Select 
                      value={newParcel.location.region} 
                      onValueChange={(value) => setNewParcel({ 
                        ...newParcel, 
                        location: { ...newParcel.location, region: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq. meters) *</Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="500"
                      value={newParcel.area}
                      onChange={(e) => setNewParcel({ ...newParcel, area: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="price">Estimated Value (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="75000"
                      value={newParcel.price}
                      onChange={(e) => setNewParcel({ ...newParcel, price: e.target.value })}
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Land Images
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowImageUpload(!showImageUpload)}
                    >
                      {showImageUpload ? 'Hide' : 'Add Images'}
                    </Button>
                  </div>
                  
                  {showImageUpload && (
                    <LandImageUpload
                      onImagesUploaded={(images) => setNewParcel({ ...newParcel, images })}
                      maxImages={8}
                    />
                  )}
                </div>

                {/* Document Scanner Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Land Documents
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDocumentScan(!showDocumentScan)}
                    >
                      {showDocumentScan ? 'Hide' : 'Scan Documents'}
                    </Button>
                  </div>
                  
                  {showDocumentScan && (
                    <DocumentScanner
                      onDocumentsScanned={(documents) => setNewParcel({ ...newParcel, documents })}
                      requiredDocuments={[
                        'Land Title Certificate',
                        'Survey Plan',
                        'Site Plan',
                        'Tax Receipt',
                        'Building Permit'
                      ]}
                      title="Land Document Scanner"
                    />
                  )}
                </div>

                {/* Ethereum Integration */}
                <div className="border-t pt-4">
                  <EthereumIntegration onWalletConnected={() => {}} />
                </div>

                <Button 
                  onClick={handleRegisterLand} 
                  disabled={isRegistering}
                  className="w-full"
                  size="lg"
                >
                  {isRegistering ? 'Registering on Blockchain...' : 'Register Land Parcel'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by title, address, or region..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Land Parcels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParcels.map((parcel) => (
          <Card key={parcel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{parcel.title}</CardTitle>
                <Badge className={getStatusColor(parcel.status)}>
                  {parcel.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {parcel.location.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Owner</p>
                  <p className="font-medium">{parcel.owner || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Area</p>
                  <p className="font-medium">{parcel.area} sq.m</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-medium">${parcel.price?.toLocaleString() || parcel.value?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{parcel.type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="w-3 h-3" />
                {parcel.documents?.length || 0} document(s)
              </div>
              
              <div className="pt-2 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedParcel(parcel)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{selectedParcel?.title}</DialogTitle>
                      <DialogDescription>
                        Blockchain Hash: {selectedParcel?.blockchainHash || 'N/A'}
                      </DialogDescription>
                    </DialogHeader>
                    {selectedParcel && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Owner</Label>
                            <p className="text-sm font-medium">{selectedParcel.owner}</p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Badge className={getStatusColor(selectedParcel.status)}>
                              {selectedParcel.status}
                            </Badge>
                          </div>
                          <div>
                            <Label>Area</Label>
                            <p className="text-sm font-medium">{selectedParcel.area} square meters</p>
                          </div>
                          <div>
                            <Label>Estimated Value</Label>
                            <p className="text-sm font-medium">
                              ${(selectedParcel.price || selectedParcel.value)?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label>Address</Label>
                          <p className="text-sm">{selectedParcel.location.address}</p>
                        </div>
                        <div>
                          <Label>Region</Label>
                          <p className="text-sm">{selectedParcel.location.region}</p>
                        </div>
                        {selectedParcel.description && (
                          <div>
                            <Label>Description</Label>
                            <p className="text-sm">{selectedParcel.description}</p>
                          </div>
                        )}
                        <div>
                          <Label>Documents</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedParcel.documents?.map((doc, index) => (
                              <Badge key={index} variant="outline">{doc.name}</Badge>
                            )) || <span className="text-sm text-muted-foreground">No documents</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredParcels.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No land parcels found</h3>
          <p className="text-muted-foreground">
            {currentUser?.role === 'landowner' 
              ? 'Register your first land parcel to get started.' 
              : 'Try adjusting your search criteria or register a new land parcel.'}
          </p>
        </div>
      )}
    </div>
  );
};