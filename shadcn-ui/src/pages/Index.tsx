import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Fingerprint, CreditCard, Globe, 
  CheckCircle, Users, BarChart3, Settings,
  Smartphone, Eye, Lock, User
} from 'lucide-react';
import { GovernmentCardVerification } from '@/components/GovernmentCardVerification';
import { PasskeyAuthentication } from '@/components/PasskeyAuthentication';
import { AfricaMapViewer } from '@/components/AfricaMapViewer';
import { VerificationAnalytics } from '@/components/VerificationAnalytics';
import { BiometricSecurity } from '@/components/BiometricSecurity';
import { AuthProvider } from '@/components/UserAuth';

// Mock user for demonstration
const mockUser = {
  id: 'U001',
  name: 'Amara Okafor',
  email: 'amara.okafor@gov.ng',
  role: 'government_official' as const,
  verificationStatus: 'verified' as const,
  country: 'NG',
  phoneNumber: '+234901234567',
  department: 'National Identity Management Commission'
};

const MainApp = () => {
  const [currentUser] = useState(mockUser);
  const [activeTab, setActiveTab] = useState('verification');

  const tabs = [
    { id: 'verification', label: 'Card Verification', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'passkey', label: 'Passkey Security', icon: <Fingerprint className="w-4 h-4" /> },
    { id: 'biometrics', label: 'Biometric Auth', icon: <Eye className="w-4 h-4" /> },
    { id: 'map', label: 'Africa Coverage', icon: <Globe className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  AfricaVerify
                </h1>
                <p className="text-sm text-slate-500">Government Card Verification Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                    <Badge variant="outline" className="text-xs text-slate-600 border-slate-200">
                      {currentUser.role.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-slate-200/60">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Welcome, {currentUser.name}
                </h2>
                <p className="text-slate-600">
                  Secure government card verification across Africa with advanced biometric authentication.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/80 px-4 py-2 rounded-lg border border-slate-200/60">
                <Lock className="w-4 h-4 text-green-600" />
                <span>Passkey Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/60 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-slate-200/60">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="verification" className="space-y-6">
            <GovernmentCardVerification />
          </TabsContent>

          <TabsContent value="passkey" className="space-y-6">
            <PasskeyAuthentication />
          </TabsContent>

          <TabsContent value="biometrics" className="space-y-6">
            <BiometricSecurity />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  Africa Coverage Map
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Government card verification coverage across African countries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AfricaMapViewer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <VerificationAnalytics />
          </TabsContent>
        </Tabs>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">2,847</p>
                  <p className="text-sm text-slate-500">Cards Verified Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                  <Fingerprint className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">98.7%</p>
                  <p className="text-sm text-slate-500">Biometric Match Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">54</p>
                  <p className="text-sm text-slate-500">Countries Supported</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">156K</p>
                  <p className="text-sm text-slate-500">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8">
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-slate-900">Platform Features</CardTitle>
              <CardDescription className="text-slate-600">
                Advanced government card verification with cutting-edge security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                  <Fingerprint className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">Passkey Authentication</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <Eye className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">Biometric Verification</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-700">Multi-Country Support</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-slate-700">Mobile Integration</span>
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