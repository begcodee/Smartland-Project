import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, FileText, Plus, Search, Eye } from 'lucide-react';
import { mockLandParcels, blockchainService } from '@/lib/mockData';
import { LandParcel } from '@/types';
import { useRoleAccess } from '@/components/RoleBasedAccess';
import { toast } from 'sonner';

export default function LandRegistry() {
  const [parcels, setParcels] = useState(mockLandParcels);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newParcel, setNewParcel] = useState({
    title: '',
    owner: '',
    address: '',
    area: '',
    value: '',
    documents: ''
  });

  const { currentUser, canRegisterLand } = useRoleAccess();

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = parcel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by user role
    if (currentUser?.role === 'landowner') {
      return matchesSearch && parcel.owner === currentUser.name;
    }
    
    return matchesSearch;
  });

  const handleRegisterLand = async () => {
    if (!newParcel.title || !newParcel.owner || !newParcel.address || !newParcel.area) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsRegistering(true);
    try {
      const parcelData = {
        title: newParcel.title,
        owner: currentUser?.role === 'landowner' ? currentUser.name : newParcel.owner,
        location: {
          address: newParcel.address,
          coordinates: { lat: 28.6139 + Math.random() * 0.1, lng: 77.2090 + Math.random() * 0.1 }
        },
        area: parseInt(newParcel.area),
        registrationDate: new Date().toISOString().split('T')[0],
        lastTransfer: new Date().toISOString().split('T')[0],
        value: parseInt(newParcel.value) || 0,
        status: 'active' as const,
        documents: newParcel.documents.split(',').map(doc => doc.trim()).filter(doc => doc)
      };

      const result = await blockchainService.registerLand(parcelData);
      
      if (result.success) {
        const registeredParcel: LandParcel = {
          ...parcelData,
          id: `LP${String(parcels.length + 1).padStart(3, '0')}`,
          blockchainHash: result.hash
        };
        
        setParcels([...parcels, registeredParcel]);
        setNewParcel({ title: '', owner: '', address: '', area: '', value: '', documents: '' });
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'transfer_pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register New Land Parcel</DialogTitle>
                <DialogDescription>
                  Add a new land parcel to the blockchain registry
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Land Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Residential Plot - Sector 15"
                    value={newParcel.title}
                    onChange={(e) => setNewParcel({ ...newParcel, title: e.target.value })}
                  />
                </div>
                {currentUser?.role === 'authority' && (
                  <div className="space-y-2">
                    <Label htmlFor="owner">Owner Name *</Label>
                    <Input
                      id="owner"
                      placeholder="Full name of the owner"
                      value={newParcel.owner}
                      onChange={(e) => setNewParcel({ ...newParcel, owner: e.target.value })}
                    />
                  </div>
                )}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Complete address with landmarks"
                    value={newParcel.address}
                    onChange={(e) => setNewParcel({ ...newParcel, address: e.target.value })}
                  />
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
                <div className="space-y-2">
                  <Label htmlFor="value">Estimated Value (USD)</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="75000"
                    value={newParcel.value}
                    onChange={(e) => setNewParcel({ ...newParcel, value: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="documents">Documents (comma-separated)</Label>
                  <Textarea
                    id="documents"
                    placeholder="title_deed.pdf, survey_report.pdf, tax_receipt.pdf"
                    value={newParcel.documents}
                    onChange={(e) => setNewParcel({ ...newParcel, documents: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                onClick={handleRegisterLand} 
                disabled={isRegistering}
                className="w-full"
              >
                {isRegistering ? 'Registering on Blockchain...' : 'Register Land Parcel'}
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by title, owner, or address..."
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
                  {parcel.status.replace('_', ' ')}
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
                  <p className="font-medium">{parcel.owner}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Area</p>
                  <p className="font-medium">{parcel.area} sq.m</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-medium">${parcel.value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registered</p>
                  <p className="font-medium">{parcel.registrationDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="w-3 h-3" />
                {parcel.documents.length} document(s)
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
                        Blockchain Hash: {selectedParcel?.blockchainHash}
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
                              {selectedParcel.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div>
                            <Label>Area</Label>
                            <p className="text-sm font-medium">{selectedParcel.area} square meters</p>
                          </div>
                          <div>
                            <Label>Estimated Value</Label>
                            <p className="text-sm font-medium">${selectedParcel.value.toLocaleString()}</p>
                          </div>
                        </div>
                        <div>
                          <Label>Address</Label>
                          <p className="text-sm">{selectedParcel.location.address}</p>
                        </div>
                        <div>
                          <Label>Documents</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedParcel.documents.map((doc, index) => (
                              <Badge key={index} variant="outline">{doc}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Registration Date</Label>
                            <p className="text-sm">{selectedParcel.registrationDate}</p>
                          </div>
                          <div>
                            <Label>Last Transfer</Label>
                            <p className="text-sm">{selectedParcel.lastTransfer}</p>
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
}