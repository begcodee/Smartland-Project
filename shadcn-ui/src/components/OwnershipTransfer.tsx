import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRightLeft, Shield, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { mockLandParcels, mockTransfers, blockchainService } from '@/lib/mockData';
import { Transfer } from '@/types';
import { toast } from 'sonner';

export default function OwnershipTransfer() {
  const [transfers, setTransfers] = useState(mockTransfers);
  const [newTransfer, setNewTransfer] = useState({
    landParcelId: '',
    from: '',
    to: '',
    amount: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTransfer = async () => {
    if (!newTransfer.landParcelId || !newTransfer.from || !newTransfer.to || !newTransfer.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const result = await blockchainService.transferOwnership(
        newTransfer.landParcelId,
        newTransfer.from,
        newTransfer.to
      );

      if (result.success) {
        const transfer: Transfer = {
          id: `T${String(transfers.length + 1).padStart(3, '0')}`,
          landParcelId: newTransfer.landParcelId,
          from: newTransfer.from,
          to: newTransfer.to,
          amount: parseInt(newTransfer.amount),
          status: 'escrowed',
          initiatedDate: new Date().toISOString().split('T')[0],
          escrowHash: result.hash
        };

        setTransfers([...transfers, transfer]);
        setNewTransfer({ landParcelId: '', from: '', to: '', amount: '' });
        toast.success(`Transfer initiated successfully! Gas used: ${result.gasUsed}`);
      }
    } catch (error) {
      toast.error('Failed to initiate transfer on blockchain');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompleteTransfer = async (transferId: string) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;

    try {
      const result = await blockchainService.transferOwnership(
        transfer.landParcelId,
        transfer.from,
        transfer.to
      );

      if (result.success) {
        setTransfers(transfers.map(t => 
          t.id === transferId 
            ? { ...t, status: 'completed', completedDate: new Date().toISOString().split('T')[0] }
            : t
        ));
        toast.success('Transfer completed successfully!');
      }
    } catch (error) {
      toast.error('Failed to complete transfer');
    }
  };

  const handleCancelTransfer = (transferId: string) => {
    setTransfers(transfers.map(t => 
      t.id === transferId ? { ...t, status: 'cancelled' } : t
    ));
    toast.success('Transfer cancelled');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'escrowed': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'escrowed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Ownership Transfer</h2>
          <p className="text-muted-foreground">Manage land ownership transfers with smart contract escrow</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Initiate Transfer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Initiate Ownership Transfer</DialogTitle>
              <DialogDescription>
                Create a new land ownership transfer with smart contract escrow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parcel">Land Parcel</Label>
                <Select value={newTransfer.landParcelId} onValueChange={(value) => 
                  setNewTransfer({ ...newTransfer, landParcelId: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a land parcel" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLandParcels.filter(p => p.status === 'active').map((parcel) => (
                      <SelectItem key={parcel.id} value={parcel.id}>
                        {parcel.title} - {parcel.owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="from">Current Owner</Label>
                <Input
                  id="from"
                  placeholder="Current owner name"
                  value={newTransfer.from}
                  onChange={(e) => setNewTransfer({ ...newTransfer, from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">New Owner</Label>
                <Input
                  id="to"
                  placeholder="New owner name"
                  value={newTransfer.to}
                  onChange={(e) => setNewTransfer({ ...newTransfer, to: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Transfer Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="150000"
                  value={newTransfer.amount}
                  onChange={(e) => setNewTransfer({ ...newTransfer, amount: e.target.value })}
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateTransfer} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating Smart Contract...' : 'Initiate Transfer'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transfer Process Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Process</CardTitle>
          <CardDescription>How smart contract-based land transfers work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <h4 className="font-medium">Initiate</h4>
              <p className="text-xs text-muted-foreground">Buyer initiates transfer request</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <h4 className="font-medium">Escrow</h4>
              <p className="text-xs text-muted-foreground">Funds locked in smart contract</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <h4 className="font-medium">Verify</h4>
              <p className="text-xs text-muted-foreground">Documents and ownership verified</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">4</div>
              <h4 className="font-medium">Complete</h4>
              <p className="text-xs text-muted-foreground">Ownership transferred automatically</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {transfers.map((transfer) => {
          const parcel = mockLandParcels.find(p => p.id === transfer.landParcelId);
          return (
            <Card key={transfer.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{parcel?.title}</CardTitle>
                  <Badge className={getStatusColor(transfer.status)}>
                    {getStatusIcon(transfer.status)}
                    <span className="ml-1">{transfer.status}</span>
                  </Badge>
                </div>
                <CardDescription>Transfer ID: {transfer.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-medium">{transfer.from}</p>
                  </div>
                  <ArrowRightLeft className="mx-4 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-medium">{transfer.to}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">${transfer.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Initiated</p>
                    <p className="font-medium">{transfer.initiatedDate}</p>
                  </div>
                </div>

                {transfer.escrowHash && (
                  <div className="text-xs">
                    <p className="text-muted-foreground">Escrow Hash:</p>
                    <p className="font-mono break-all">{transfer.escrowHash}</p>
                  </div>
                )}

                {transfer.status === 'escrowed' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleCompleteTransfer(transfer.id)}
                      className="flex-1"
                    >
                      Complete Transfer
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleCancelTransfer(transfer.id)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {transfer.status === 'completed' && transfer.completedDate && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    ✓ Transfer completed on {transfer.completedDate}
                  </div>
                )}

                {transfer.status === 'cancelled' && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    ✗ Transfer was cancelled
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {transfers.length === 0 && (
        <div className="text-center py-12">
          <ArrowRightLeft className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No transfers found</h3>
          <p className="text-muted-foreground">Initiate your first land ownership transfer to get started.</p>
        </div>
      )}
    </div>
  );
}