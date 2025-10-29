import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Gavel, Users, FileText, Plus, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { mockDisputes, mockLandParcels, blockchainService } from '@/lib/mockData';
import { Dispute } from '@/types';
import { toast } from 'sonner';

export default function DisputeResolution() {
  const [disputes, setDisputes] = useState(mockDisputes);
  const [newDispute, setNewDispute] = useState({
    landParcelId: '',
    plaintiff: '',
    defendant: '',
    description: '',
    evidence: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDispute = async () => {
    if (!newDispute.landParcelId || !newDispute.plaintiff || !newDispute.defendant || !newDispute.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const disputeData = {
        landParcelId: newDispute.landParcelId,
        plaintiff: newDispute.plaintiff,
        defendant: newDispute.defendant,
        description: newDispute.description,
        evidence: newDispute.evidence.split(',').map(e => e.trim()).filter(e => e),
        status: 'pending' as const,
        filedDate: new Date().toISOString().split('T')[0]
      };

      const result = await blockchainService.createDispute(disputeData);

      if (result.success) {
        const dispute: Dispute = {
          ...disputeData,
          id: `D${String(disputes.length + 1).padStart(3, '0')}`
        };

        setDisputes([...disputes, dispute]);
        setNewDispute({ landParcelId: '', plaintiff: '', defendant: '', description: '', evidence: '' });
        toast.success(`Dispute filed successfully! Gas used: ${result.gasUsed}`);
      }
    } catch (error) {
      toast.error('Failed to file dispute on blockchain');
    } finally {
      setIsCreating(false);
    }
  };

  const handleVote = async (disputeId: string, vote: 'support' | 'against' | 'abstain') => {
    try {
      const result = await blockchainService.voteOnDispute(disputeId, vote);
      
      if (result.success) {
        setDisputes(disputes.map(dispute => {
          if (dispute.id === disputeId && dispute.votes) {
            const newVotes = { ...dispute.votes };
            newVotes[vote]++;
            return { ...dispute, votes: newVotes };
          }
          return dispute;
        }));
        toast.success(`Vote recorded! Gas used: ${result.gasUsed}`);
      }
    } catch (error) {
      toast.error('Failed to record vote on blockchain');
    }
  };

  const handleResolveDispute = (disputeId: string, resolution: string) => {
    setDisputes(disputes.map(dispute => 
      dispute.id === disputeId 
        ? { ...dispute, status: 'resolved', resolution }
        : dispute
    ));
    toast.success('Dispute resolved successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'community_voting': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVotePercentage = (votes: { support: number; against: number; abstain: number }, type: keyof typeof votes) => {
    const total = votes.support + votes.against + votes.abstain;
    return total > 0 ? (votes[type] / total) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Dispute Resolution</h2>
          <p className="text-muted-foreground">Community-driven land dispute resolution system</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              File New Dispute
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>File Land Dispute</DialogTitle>
              <DialogDescription>
                Submit a new land dispute for community resolution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parcel">Land Parcel</Label>
                <Select value={newDispute.landParcelId} onValueChange={(value) => 
                  setNewDispute({ ...newDispute, landParcelId: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the disputed land parcel" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLandParcels.map((parcel) => (
                      <SelectItem key={parcel.id} value={parcel.id}>
                        {parcel.title} - {parcel.owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plaintiff">Plaintiff (Your Name)</Label>
                  <Input
                    id="plaintiff"
                    placeholder="Your full name"
                    value={newDispute.plaintiff}
                    onChange={(e) => setNewDispute({ ...newDispute, plaintiff: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defendant">Defendant</Label>
                  <Input
                    id="defendant"
                    placeholder="Name of the opposing party"
                    value={newDispute.defendant}
                    onChange={(e) => setNewDispute({ ...newDispute, defendant: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Dispute Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed description of the dispute, including timeline and key facts..."
                  value={newDispute.description}
                  onChange={(e) => setNewDispute({ ...newDispute, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evidence">Evidence Files (comma-separated)</Label>
                <Textarea
                  id="evidence"
                  placeholder="family_tree.pdf, old_land_records.pdf, witness_statements.pdf"
                  value={newDispute.evidence}
                  onChange={(e) => setNewDispute({ ...newDispute, evidence: e.target.value })}
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateDispute} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? 'Filing Dispute...' : 'File Dispute'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dispute Resolution Process */}
      <Card>
        <CardHeader>
          <CardTitle>Resolution Process</CardTitle>
          <CardDescription>How community-driven dispute resolution works</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <h4 className="font-medium">File</h4>
              <p className="text-xs text-muted-foreground">Submit dispute with evidence</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <h4 className="font-medium">Review</h4>
              <p className="text-xs text-muted-foreground">Authority preliminary review</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <h4 className="font-medium">Vote</h4>
              <p className="text-xs text-muted-foreground">Community voting period</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">4</div>
              <h4 className="font-medium">Resolve</h4>
              <p className="text-xs text-muted-foreground">Automated resolution</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Disputes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {disputes.map((dispute) => {
          const parcel = mockLandParcels.find(p => p.id === dispute.landParcelId);
          return (
            <Card key={dispute.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{parcel?.title}</CardTitle>
                  <Badge className={getStatusColor(dispute.status)}>
                    {dispute.status.replace('_', ' ')}
                  </Badge>
                </div>
                <CardDescription>
                  {dispute.plaintiff} vs {dispute.defendant}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{dispute.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Filed Date</p>
                    <p className="font-medium">{dispute.filedDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Evidence Files</p>
                    <p className="font-medium">{dispute.evidence.length} files</p>
                  </div>
                </div>

                {dispute.evidence.length > 0 && (
                  <div>
                    <Label>Evidence</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dispute.evidence.map((evidence, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          {evidence}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {dispute.status === 'community_voting' && dispute.votes && (
                  <div className="space-y-3">
                    <Label>Community Votes</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-green-600" />
                          Support ({dispute.votes.support})
                        </span>
                        <span>{getVotePercentage(dispute.votes, 'support').toFixed(1)}%</span>
                      </div>
                      <Progress value={getVotePercentage(dispute.votes, 'support')} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3 text-red-600" />
                          Against ({dispute.votes.against})
                        </span>
                        <span>{getVotePercentage(dispute.votes, 'against').toFixed(1)}%</span>
                      </div>
                      <Progress value={getVotePercentage(dispute.votes, 'against')} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Minus className="w-3 h-3 text-gray-600" />
                          Abstain ({dispute.votes.abstain})
                        </span>
                        <span>{getVotePercentage(dispute.votes, 'abstain').toFixed(1)}%</span>
                      </div>
                      <Progress value={getVotePercentage(dispute.votes, 'abstain')} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleVote(dispute.id, 'support')}
                        className="flex-1"
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Support
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleVote(dispute.id, 'against')}
                        className="flex-1"
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        Against
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleVote(dispute.id, 'abstain')}
                        className="flex-1"
                      >
                        <Minus className="w-3 h-3 mr-1" />
                        Abstain
                      </Button>
                    </div>
                  </div>
                )}

                {dispute.status === 'under_review' && dispute.arbitrator && (
                  <div className="text-sm bg-blue-50 p-3 rounded">
                    <p className="font-medium">Under Review</p>
                    <p className="text-muted-foreground">Arbitrator: {dispute.arbitrator}</p>
                  </div>
                )}

                {dispute.status === 'resolved' && dispute.resolution && (
                  <div className="text-sm bg-green-50 p-3 rounded">
                    <p className="font-medium text-green-800">Resolution</p>
                    <p className="text-green-700">{dispute.resolution}</p>
                  </div>
                )}

                {dispute.status === 'pending' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setDisputes(disputes.map(d => 
                        d.id === dispute.id ? { ...d, status: 'under_review', arbitrator: 'District Authority' } : d
                      ));
                      toast.success('Dispute moved to review stage');
                    }}
                    className="w-full"
                  >
                    <Gavel className="w-3 h-3 mr-1" />
                    Move to Review
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {disputes.length === 0 && (
        <div className="text-center py-12">
          <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No disputes found</h3>
          <p className="text-muted-foreground">File your first land dispute to get started with the resolution process.</p>
        </div>
      )}
    </div>
  );
}