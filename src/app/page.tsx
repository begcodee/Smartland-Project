"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, FileText, Gavel, ArrowRightLeft, Shield, Users, LogIn, UserPlus,
  Zap, TrendingUp, Award, Activity, Globe, Sparkles, BarChart3, Bell, Map
} from 'lucide-react';
import { mockLandParcels, mockDisputes, mockTransfers } from '@/lib/mockData';
import { AuthProvider, useAuth, LoginForm, RegisterForm } from '@/components/UserAuth';
import { UserProfileDialog } from '@/components/UserProfile';
import { NotificationCenter } from '@/components/NotificationCenter';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { Analytics } from '@/components/Analytics';
import { GhanaMapViewer } from '@/components/GhanaMapViewer';
import { RoleBasedAccess } from '@/components/RoleBasedAccess';
import LandRegistry from '@/components/LandRegistry';
import OwnershipTransfer from '@/components/OwnershipTransfer';
import DisputeResolution from '@/components/DisputeResolution';
import SmartContractInterface from '@/components/SmartContractInterface';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const activeDisputes = mockDisputes.filter(d => d.status !== 'resolved');
  const pendingTransfers = mockTransfers.filter(t => t.status !== 'completed');

  // Filter data based on user role
  const getUserData = () => {
    if (!currentUser) return { parcels: [], disputes: [], transfers: [] };
    
    switch (currentUser.role) {
      case 'landowner':
        return {
          parcels: mockLandParcels.filter(p => p.owner === currentUser.name),
          disputes: mockDisputes.filter(d => d.plaintiff === currentUser.name || d.defendant === currentUser.name),
          transfers: mockTransfers.filter(t => t.from === currentUser.name || t.to === currentUser.name)
        };
      case 'buyer':
        return {
          parcels: [],
          disputes: mockDisputes.filter(d => d.plaintiff === currentUser.name || d.defendant === currentUser.name),
          transfers: mockTransfers.filter(t => t.to === currentUser.name)
        };
      case 'authority':
      case 'arbitrator':
        return {
          parcels: mockLandParcels,
          disputes: mockDisputes,
          transfers: mockTransfers
        };
      default:
        return { parcels: [], disputes: [], transfers: [] };
    }
  };

  const userData = getUserData();

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      {currentUser && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-blue-600 to-purple-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Akwaaba, {currentUser.name}! 🇬🇭</h2>
                  <p className="text-white/80">
                    <span className="capitalize font-medium">{currentUser.role}</span>
                    {currentUser.organization && (
                      <span className="ml-2">• {currentUser.organization}</span>
                    )}
                    {currentUser.reputation && (
                      <span className="ml-3 inline-flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {currentUser.reputation.score}/100
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Shield className="w-3 h-3 mr-1" />
                {currentUser.verificationStatus}
              </Badge>
              {currentUser.country && (
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  🇬🇭 {currentUser.country}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <SearchAndFilter 
        onFiltersChange={(filters) => console.log('Filters changed:', filters)}
        totalResults={userData.parcels.length}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-700">
                  {currentUser?.role === 'landowner' ? 'My Properties' : 'Total Properties'}
                </p>
                <p className="text-3xl font-bold text-green-900">{userData.parcels.length}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  On blockchain
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white group-hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700">Portfolio Value</p>
                <p className="text-3xl font-bold text-blue-900">
                  ${userData.parcels.reduce((sum, p) => sum + p.value, 0).toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  USD equivalent
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-700">
                  {currentUser?.role === 'landowner' || currentUser?.role === 'buyer' ? 'My Disputes' : 'Active Disputes'}
                </p>
                <p className="text-3xl font-bold text-orange-900">{userData.disputes.length}</p>
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Pending resolution
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white group-hover:scale-110 transition-transform">
                <Gavel className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-700">
                  {currentUser?.role === 'buyer' ? 'My Purchases' : 'Active Transfers'}
                </p>
                <p className="text-3xl font-bold text-purple-900">{userData.transfers.length}</p>
                <p className="text-xs text-purple-600 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  In escrow
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Reputation Card */}
      {currentUser?.reputation && (
        <Card className="border-0 bg-gradient-to-r from-indigo-50 via-white to-cyan-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">
                <Award className="h-5 w-5" />
              </div>
              Your Reputation & Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {currentUser.reputation.totalTransactions}
                </div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  {currentUser.reputation.successfulTransactions}
                </div>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  {currentUser.reputation.disputesWon}
                </div>
                <p className="text-sm text-muted-foreground">Disputes Won</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  {currentUser.reputation.communityVotes}
                </div>
                <p className="text-sm text-muted-foreground">Community Votes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <Gavel className="h-4 w-4 text-orange-600" />
              </div>
              Recent Disputes
            </CardTitle>
            <CardDescription>Latest land dispute cases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userData.disputes.slice(0, 3).map((dispute) => (
              <div key={dispute.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{dispute.plaintiff} vs {dispute.defendant}</p>
                  <p className="text-xs text-muted-foreground">{dispute.description.substring(0, 60)}...</p>
                </div>
                <Badge variant={dispute.status === 'community_voting' ? 'default' : 'secondary'} className="rounded-full">
                  {dispute.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
            {userData.disputes.length === 0 && (
              <div className="text-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mx-auto mb-3">
                  <Gavel className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground">No disputes found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <ArrowRightLeft className="h-4 w-4 text-purple-600" />
              </div>
              Recent Transfers
            </CardTitle>
            <CardDescription>Latest ownership transfers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userData.transfers.map((transfer) => {
              const parcel = mockLandParcels.find(p => p.id === transfer.landParcelId);
              return (
                <div key={transfer.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{parcel?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {transfer.from} → {transfer.to}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className="rounded-full">{transfer.status}</Badge>
                    <p className="text-xs text-muted-foreground">${transfer.amount.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
            {userData.transfers.length === 0 && (
              <div className="text-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mx-auto mb-3">
                  <ArrowRightLeft className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground">No transfers found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ghana-specific Information */}
      <RoleBasedAccess allowedRoles={['authority', 'arbitrator']}>
        <Card className="border-0 bg-gradient-to-r from-green-50 to-yellow-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                <Globe className="h-4 w-4 text-white" />
              </div>
              Ghana Land Registry Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 rounded-xl bg-white shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-1">99.9%</div>
                <p className="text-sm text-muted-foreground">Network Uptime</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-white shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-1">2.3s</div>
                <p className="text-sm text-muted-foreground">Avg Block Time</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-white shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-1">1,247</div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </RoleBasedAccess>
    </div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-green-600 to-yellow-600 text-white shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent">
            🇬🇭 Ghana Land Registry
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Secure, transparent land ownership management powered by blockchain technology for Ghana
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-white rounded-xl shadow-sm max-w-sm mx-auto">
          <Button
            variant={isLogin ? "default" : "ghost"}
            className={`flex-1 rounded-lg ${isLogin ? 'bg-gradient-to-r from-green-600 to-yellow-600' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Button>
          <Button
            variant={!isLogin ? "default" : "ghost"}
            className={`flex-1 rounded-lg ${!isLogin ? 'bg-gradient-to-r from-green-600 to-yellow-600' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Register
          </Button>
        </div>

        {isLogin ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
};

const MainApp = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-yellow-600 text-white shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent">
                🇬🇭 Ghana Land Registry
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Secure, transparent, and tamper-proof land ownership management powered by blockchain smart contracts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <UserProfileDialog />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-7 bg-white shadow-sm rounded-xl p-1">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </TabsTrigger>
              <TabsTrigger value="registry" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Registry</span>
              </TabsTrigger>
              <TabsTrigger value="transfer" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
                <ArrowRightLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Transfer</span>
              </TabsTrigger>
              <TabsTrigger value="disputes" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
                <Gavel className="w-4 h-4" />
                <span className="hidden sm:inline">Disputes</span>
              </TabsTrigger>
              <TabsTrigger value="contracts" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Contracts</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="map">
            <GhanaMapViewer />
          </TabsContent>

          <TabsContent value="registry">
            <RoleBasedAccess allowedRoles={['landowner', 'authority']}>
              <LandRegistry />
            </RoleBasedAccess>
          </TabsContent>

          <TabsContent value="transfer">
            <RoleBasedAccess allowedRoles={['landowner', 'buyer', 'authority']}>
              <OwnershipTransfer />
            </RoleBasedAccess>
          </TabsContent>

          <TabsContent value="disputes">
            <DisputeResolution />
          </TabsContent>

          <TabsContent value="contracts">
            <RoleBasedAccess allowedRoles={['authority', 'arbitrator']}>
              <SmartContractInterface />
            </RoleBasedAccess>
          </TabsContent>

          <TabsContent value="analytics">
            <RoleBasedAccess allowedRoles={['authority', 'arbitrator']}>
              <Analytics />
            </RoleBasedAccess>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default function Index() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}