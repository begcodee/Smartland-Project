import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, FileText, Gavel, ArrowRightLeft, Shield, Users } from 'lucide-react';
import { mockLandParcels, mockDisputes, mockTransfers } from '@/lib/mockData';
import LandRegistry from '@/components/LandRegistry';
import OwnershipTransfer from '@/components/OwnershipTransfer';
import DisputeResolution from '@/components/DisputeResolution';
import SmartContractInterface from '@/components/SmartContractInterface';

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const activeDisputes = mockDisputes.filter(d => d.status !== 'resolved');
  const pendingTransfers = mockTransfers.filter(t => t.status !== 'completed');
  const totalLandValue = mockLandParcels.reduce((sum, parcel) => sum + parcel.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
            Decentralized Land Registry
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Secure, transparent, and tamper-proof land ownership management powered by blockchain smart contracts
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:mx-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="registry" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Registry
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Transfer
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center gap-2">
              <Gavel className="w-4 h-4" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Contracts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Land Parcels</CardTitle>
                  <MapPin className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{mockLandParcels.length}</div>
                  <p className="text-xs text-blue-600">Registered on blockchain</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">${totalLandValue.toLocaleString()}</div>
                  <p className="text-xs text-green-600">USD equivalent</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
                  <Gavel className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">{activeDisputes.length}</div>
                  <p className="text-xs text-orange-600">Pending resolution</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
                  <ArrowRightLeft className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">{pendingTransfers.length}</div>
                  <p className="text-xs text-purple-600">In escrow</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="w-5 h-5" />
                    Recent Disputes
                  </CardTitle>
                  <CardDescription>Latest land dispute cases</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeDisputes.slice(0, 3).map((dispute) => (
                    <div key={dispute.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{dispute.plaintiff} vs {dispute.defendant}</p>
                        <p className="text-xs text-muted-foreground">{dispute.description.substring(0, 60)}...</p>
                      </div>
                      <Badge variant={dispute.status === 'community_voting' ? 'default' : 'secondary'}>
                        {dispute.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5" />
                    Recent Transfers
                  </CardTitle>
                  <CardDescription>Latest ownership transfers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingTransfers.map((transfer) => {
                    const parcel = mockLandParcels.find(p => p.id === transfer.landParcelId);
                    return (
                      <div key={transfer.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{parcel?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {transfer.from} → {transfer.to}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{transfer.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">${transfer.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Blockchain Network Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Blockchain Network Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg bg-green-50">
                    <div className="text-2xl font-bold text-green-600">99.9%</div>
                    <p className="text-sm text-muted-foreground">Network Uptime</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600">2.3s</div>
                    <p className="text-sm text-muted-foreground">Avg Block Time</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-purple-50">
                    <div className="text-2xl font-bold text-purple-600">1,247</div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registry">
            <LandRegistry />
          </TabsContent>

          <TabsContent value="transfer">
            <OwnershipTransfer />
          </TabsContent>

          <TabsContent value="disputes">
            <DisputeResolution />
          </TabsContent>

          <TabsContent value="contracts">
            <SmartContractInterface />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}