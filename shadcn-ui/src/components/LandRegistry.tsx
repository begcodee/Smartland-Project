import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, FileText, Plus, Search, Eye, Upload, Camera, Zap, Hexagon, Shield, Image as ImageIcon } from 'lucide-react';
import { mockLandParcels, blockchainService, formatCurrency } from '@/lib/mockData';
import { LandParcel, User } from '@/lib/mockData';
import { ImageUpload } from '@/components/ImageUpload';
import { toast } from 'sonner';

interface LandImage {
  id: string;
  url: string;
  caption: string;
  type: 'main' | 'aerial' | 'boundary' | 'interior' | 'exterior';
  uploadedAt: string;
  size?: number;
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
    
    // Filter by user role - show all parcels for now to display data
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
        images: newParcel.images.map((img, index) => ({
          id: `IMG_${Date.now()}_${index}`,
          url: img.url,
          caption: img.caption,
          type: img.type,
          uploadedAt: new Date().toISOString()
        })),
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

  const handleImagesChange = (uploadedImages: any[]) => {
    const images = uploadedImages.map(img => ({
      id: img.id,
      url: img.url,
      caption: img.caption,
      type: img.type,
      uploadedAt: new Date().toISOString()
    }));
    setNewParcel({ ...newParcel, images });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white border-0';
      case 'disputed': return 'bg-gradient-to-r from-red-400 to-pink-400 text-white border-0';
      case 'pending': return 'bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0';
      case 'sold': return 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white border-0';
      default: return 'bg-gradient-to-r from-slate-400 to-gray-400 text-white border-0';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'residential': return <MapPin className="w-4 h-4 text-cyan-400" />;
      case 'commercial': return <Shield className="w-4 h-4 text-purple-400" />;
      case 'agricultural': return <Hexagon className="w-4 h-4 text-green-400" />;
      case 'industrial': return <Zap className="w-4 h-4 text-orange-400" />;
      default: return <MapPin className="w-4 h-4 text-cyan-400" />;
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Blockchain Land Registry
          </h2>
          <p className="text-slate-600 mt-1">
            {currentUser?.role === 'landowner' ? 'Manage your digital land assets' : 'Explore verified blockchain properties'}
          </p>
        </div>
        
        {canRegisterLand && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <Zap className="w-4 h-4" />
                Register New Land
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 border-0">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  Register New Land Parcel
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Add a new land parcel to the blockchain registry with immutable records
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-700 font-medium">Land Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Residential Plot - East Legon"
                      value={newParcel.title}
                      onChange={(e) => setNewParcel({ ...newParcel, title: e.target.value })}
                      className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-slate-700 font-medium">Property Type *</Label>
                    <Select value={newParcel.type} onValueChange={(value: 'residential' | 'commercial' | 'agricultural' | 'industrial') => setNewParcel({ ...newParcel, type: value })}>
                      <SelectTrigger className="border-slate-300 focus:border-cyan-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">🏠 Residential</SelectItem>
                        <SelectItem value="commercial">🏢 Commercial</SelectItem>
                        <SelectItem value="agricultural">🌾 Agricultural</SelectItem>
                        <SelectItem value="industrial">🏭 Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of the land property..."
                      value={newParcel.description}
                      onChange={(e) => setNewParcel({ ...newParcel, description: e.target.value })}
                      className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-slate-700 font-medium">Address *</Label>
                    <Input
                      id="address"
                      placeholder="Complete address with landmarks"
                      value={newParcel.location.address}
                      onChange={(e) => setNewParcel({ 
                        ...newParcel, 
                        location: { ...newParcel.location, address: e.target.value }
                      })}
                      className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-slate-700 font-medium">Region *</Label>
                    <Select 
                      value={newParcel.location.region} 
                      onValueChange={(value) => setNewParcel({ 
                        ...newParcel, 
                        location: { ...newParcel.location, region: value }
                      })}
                    >
                      <SelectTrigger className="border-slate-300 focus:border-cyan-500">
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
                    <Label htmlFor="area" className="text-slate-700 font-medium">Area (sq. meters) *</Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="500"
                      value={newParcel.area}
                      onChange={(e) => setNewParcel({ ...newParcel, area: e.target.value })}
                      className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="price" className="text-slate-700 font-medium">Estimated Value (Ghana Cedis)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="450000"
                      value={newParcel.price}
                      onChange={(e) => setNewParcel({ ...newParcel, price: e.target.value })}
                      className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                      <Camera className="w-5 h-5 text-cyan-600" />
                      Property Images
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowImageUpload(!showImageUpload)}
                      className="border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                    >
                      {showImageUpload ? 'Hide Upload' : 'Add Images'}
                    </Button>
                  </div>
                  
                  {showImageUpload && (
                    <ImageUpload
                      onImagesChange={handleImagesChange}
                      maxImages={8}
                      existingImages={newParcel.images}
                    />
                  )}
                </div>

                <Button 
                  onClick={handleRegisterLand} 
                  disabled={isRegistering}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg"
                  size="lg"
                >
                  {isRegistering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Registering on Blockchain...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Register Land Parcel
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search by title, address, or region..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-slate-300 focus:border-cyan-500 focus:ring-cyan-500 bg-white/50 backdrop-blur-sm"
        />
      </div>

      {/* Land Parcels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParcels.map((parcel) => (
          <Card key={parcel.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50 shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 overflow-hidden">
            {/* Property Image */}
            {parcel.images && parcel.images.length > 0 && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={parcel.images[0].url}
                  alt={parcel.images[0].caption || parcel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <Badge className={`absolute top-3 right-3 ${getStatusColor(parcel.status)}`}>
                  {parcel.status}
                </Badge>
                {parcel.images.length > 1 && (
                  <Badge className="absolute bottom-3 right-3 bg-black/50 text-white border-0">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    {parcel.images.length}
                  </Badge>
                )}
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(parcel.type)}
                  <CardTitle className="text-lg bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300">
                    {parcel.title}
                  </CardTitle>
                </div>
                {!parcel.images?.length && (
                  <Badge className={getStatusColor(parcel.status)}>
                    {parcel.status}
                  </Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-4 h-4 text-cyan-500" />
                {parcel.location.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 font-medium">Owner</p>
                  <p className="font-semibold text-slate-800">{parcel.owner || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Area</p>
                  <p className="font-semibold text-slate-800">{parcel.area?.toLocaleString()} sq.m</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Value</p>
                  <p className="font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    {formatCurrency(parcel.price || parcel.value || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Type</p>
                  <p className="font-semibold text-slate-800 capitalize">{parcel.type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 rounded-lg p-2">
                <FileText className="w-3 h-3 text-cyan-500" />
                <span>{parcel.documents?.length || 0} document(s)</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto"></div>
                <span className="text-green-600 font-medium">Verified</span>
              </div>
              
              <div className="pt-2 border-t border-slate-200">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-cyan-200 text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:border-cyan-300 transition-all duration-300"
                      onClick={() => setSelectedParcel(parcel)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl bg-gradient-to-br from-white to-slate-50 border-0 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                        {selectedParcel?.title}
                      </DialogTitle>
                      <DialogDescription className="text-slate-600">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-cyan-500" />
                          Blockchain Hash: {selectedParcel?.blockchainHash || 'N/A'}
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                    {selectedParcel && (
                      <div className="space-y-6">
                        {/* Image Gallery */}
                        {selectedParcel.images && selectedParcel.images.length > 0 && (
                          <div className="space-y-4">
                            <Label className="text-slate-700 font-medium">Property Images</Label>
                            <div className="space-y-3">
                              {/* Main Image */}
                              <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
                                <img
                                  src={selectedParcel.images[selectedImageIndex]?.url}
                                  alt={selectedParcel.images[selectedImageIndex]?.caption || 'Property image'}
                                  className="w-full h-full object-cover"
                                />
                                <Badge className="absolute bottom-3 left-3 bg-black/70 text-white border-0">
                                  {selectedParcel.images[selectedImageIndex]?.type}
                                </Badge>
                              </div>
                              
                              {/* Image Caption */}
                              {selectedParcel.images[selectedImageIndex]?.caption && (
                                <p className="text-sm text-slate-600 italic">
                                  {selectedParcel.images[selectedImageIndex].caption}
                                </p>
                              )}
                              
                              {/* Image Thumbnails */}
                              {selectedParcel.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {selectedParcel.images.map((image, index) => (
                                    <button
                                      key={image.id}
                                      onClick={() => setSelectedImageIndex(index)}
                                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                        index === selectedImageIndex 
                                          ? 'border-cyan-500 ring-2 ring-cyan-200' 
                                          : 'border-slate-200 hover:border-cyan-300'
                                      }`}
                                    >
                                      <img
                                        src={image.url}
                                        alt={image.caption || `Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-slate-700 font-medium">Owner</Label>
                            <p className="text-sm font-semibold text-slate-800">{selectedParcel.owner}</p>
                          </div>
                          <div>
                            <Label className="text-slate-700 font-medium">Status</Label>
                            <Badge className={getStatusColor(selectedParcel.status)}>
                              {selectedParcel.status}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-slate-700 font-medium">Area</Label>
                            <p className="text-sm font-semibold text-slate-800">{selectedParcel.area?.toLocaleString()} square meters</p>
                          </div>
                          <div>
                            <Label className="text-slate-700 font-medium">Estimated Value</Label>
                            <p className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                              {formatCurrency(selectedParcel.price || selectedParcel.value || 0)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-slate-700 font-medium">Address</Label>
                          <p className="text-sm text-slate-600">{selectedParcel.location.address}</p>
                        </div>
                        <div>
                          <Label className="text-slate-700 font-medium">Region</Label>
                          <p className="text-sm text-slate-600">{selectedParcel.location.region}</p>
                        </div>
                        {selectedParcel.description && (
                          <div>
                            <Label className="text-slate-700 font-medium">Description</Label>
                            <p className="text-sm text-slate-600">{selectedParcel.description}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-slate-700 font-medium">Documents</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedParcel.documents?.map((doc, index) => (
                              <Badge key={index} variant="outline" className="border-cyan-200 text-cyan-700">
                                {doc.name}
                              </Badge>
                            )) || <span className="text-sm text-slate-500">No documents</span>}
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
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-12 h-12 text-cyan-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
            No land parcels found
          </h3>
          <p className="text-slate-600">
            {currentUser?.role === 'landowner' 
              ? 'Register your first land parcel to get started.' 
              : 'Try adjusting your search criteria or register a new land parcel.'}
          </p>
        </div>
      )}
    </div>
  );
};