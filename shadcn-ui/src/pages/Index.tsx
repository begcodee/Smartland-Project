import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, FileText, Search, Bell, BarChart3, 
  Shield, Users, Gavel, User, LogOut 
} from 'lucide-react';
import { LandRegistry } from '@/components/LandRegistry';
import { GhanaMapViewer } from '@/components/GhanaMapViewer';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Analytics } from '@/components/Analytics';
import { RoleBasedUI } from '@/components/RoleBasedUI';
import { AuthProvider, useAuth } from '@/components/UserAuth';

// Mock user for demonstration
const mockUser = {
  id: 'U001',
  name: 'Kwame Asante',
  email: 'kwame.asante@example.com',
  role: 'landowner' as const,
  verificationStatus: 'verified' as const,
  country: 'GH',
  phoneNumber: '+233244123456',
  walletAddress: '0x742d35Cc6634C0532925a3b8D5c9C9b2f6e4C1F2'
};

const MainApp = () => {
  const [currentUser] = useState(mockUser);
  const [activeTab, setActiveTab] = useState('registry');

  const tabs = [
    { id: 'registry', label: 'Land Registry', icon: <FileText className="w-4 h-4" /> },
    { id: 'map', label: 'Ghana Map', icon: <MapPin className="w-4 h-4" /> },
    { id: 'search', label: 'Search & Filter', icon: <Search className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    ...(currentUser.role === 'authority' || currentUser.role === 'arbitrator' 
      ? [{ id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }] 
      : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ghana Land Registry</h1>
                <p className="text-sm text-gray-500">Blockchain-Powered Land Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {currentUser.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {currentUser.role}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {currentUser.name}!
                </h2>
                <p className="text-gray-600">
                  Manage your land properties with blockchain security and transparency.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Wallet: {currentUser.walletAddress?.slice(0, 6)}...{currentUser.walletAddress?.slice(-4)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 bg-white p-1 rounded-lg shadow-sm">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="registry" className="space-y-6">
            <LandRegistry />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Interactive Ghana Map
                </CardTitle>
                <CardDescription>
                  Explore registered land parcels across Ghana's regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GhanaMapViewer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Advanced Search & Filters
                </CardTitle>
                <CardDescription>
                  Find land properties by location, price, type, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SearchAndFilter />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Center
                </CardTitle>
                <CardDescription>
                  Stay updated on your land transactions and system alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationCenter />
              </CardContent>
            </Card>
          </TabsContent>

          {(currentUser.role === 'authority' || currentUser.role === 'arbitrator') && (
            <TabsContent value="analytics" className="space-y-6">
              <Analytics />
            </TabsContent>
          )}
        </Tabs>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {currentUser.role === 'landowner' ? '3' : '156'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.role === 'landowner' ? 'My Properties' : 'Total Properties'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {currentUser.verificationStatus === 'verified' ? '✓' : '⏳'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Verification Status
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  {currentUser.role === 'arbitrator' ? (
                    <Gavel className="w-6 h-6 text-purple-600" />
                  ) : (
                    <Users className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {currentUser.role === 'arbitrator' ? '2' : '89'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.role === 'arbitrator' ? 'Active Disputes' : 'Active Users'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>System Features</CardTitle>
              <CardDescription>
                Comprehensive land management with blockchain security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Blockchain Security</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Document Verification</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Interactive Mapping</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">Analytics Dashboard</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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