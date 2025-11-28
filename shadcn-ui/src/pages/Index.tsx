import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, User, Mail, Lock, Eye, EyeOff, Phone, Building,
  UserPlus, LogIn, MapPin, FileText, Gavel, Users, CheckCircle, Clock, AlertTriangle, Info,
  Home, Search, MessageSquare, TrendingUp, Settings, Bell, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { LandRegistry } from '@/components/LandRegistry';
import { GhanaMapViewer } from '@/components/GhanaMapViewer';
import { GhanaCardVerification } from '@/components/GhanaCardVerification';
import { GovernmentCardVerification } from '@/components/GovernmentCardVerification';
import { mockUsers } from '@/lib/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'landowner' | 'buyer' | 'authority' | 'arbitrator';
  verificationStatus: 'verified' | 'pending' | 'unverified';
  country: string;
  phoneNumber: string;
  organization?: string;
  reputation?: {
    score: number;
    totalTransactions: number;
    successfulTransactions: number;
    disputesWon: number;
    communityVotes: number;
  };
  idVerification?: {
    frontCardImage: string;
    backCardImage: string;
    faceImage: string;
    cardNumber: string;
    fullName: string;
    status: 'pending' | 'verified' | 'rejected';
  };
}

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showVerification, setShowVerification] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'landowner' | 'buyer' | 'authority' | 'arbitrator'>('landowner');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [organization, setOrganization] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Find user from mock data or create based on email
    let mockUser = mockUsers.find(user => user.email === email);
    
    if (!mockUser) {
      // Create user based on email pattern
      mockUser = {
        id: Date.now().toString(),
        name: email === 'admin@landregistry.gh' ? 'Ghana Land Commission Admin' : 
              email === 'buyer@example.com' ? 'Akosua Frimpong' :
              email === 'arbitrator@example.com' ? 'Dr. Ama Osei' :
              'New User',
        email: email,
        role: email === 'admin@landregistry.gh' ? 'authority' : 
              email === 'buyer@example.com' ? 'buyer' :
              email === 'arbitrator@example.com' ? 'arbitrator' :
              'landowner',
        verificationStatus: 'verified',
        country: 'GH',
        phoneNumber: '+233244123456',
        reputation: {
          score: 85,
          totalTransactions: 5,
          successfulTransactions: 4,
          disputesWon: 1,
          communityVotes: 12
        }
      };
    }

    setCurrentUser(mockUser);
    setIsAuthenticated(true);
    setIsLoading(false);
    toast.success(`Welcome back, ${mockUser.name}!`);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate registration process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      verificationStatus: 'pending',
      country: 'GH',
      phoneNumber,
      organization: (role === 'authority' || role === 'arbitrator') ? organization : undefined,
      reputation: {
        score: 0,
        totalTransactions: 0,
        successfulTransactions: 0,
        disputesWon: 0,
        communityVotes: 0
      }
    };

    setCurrentUser(newUser);
    setShowVerification(true);
    setIsLoading(false);
    toast.success(`Account created successfully! Please complete Ghana Card verification.`);
  };

  const handleVerificationComplete = (verificationData: any) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        verificationStatus: 'verified' as const,
        idVerification: {
          ...verificationData,
          status: 'verified' as const
        }
      };
      setCurrentUser(updatedUser);
      setShowVerification(false);
      setIsAuthenticated(true);
      toast.success('Ghana Card verification completed! Welcome to the platform.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setName('');
    setPhoneNumber('');
    setOrganization('');
    setShowVerification(false);
    setActiveTab('dashboard');
    toast.info('Logged out successfully');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'landowner': return <MapPin className="w-4 h-4" />;
      case 'buyer': return <User className="w-4 h-4" />;
      case 'authority': return <Shield className="w-4 h-4" />;
      case 'arbitrator': return <Gavel className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'landowner': return 'Register and manage your land properties on the blockchain';
      case 'buyer': return 'Search, evaluate and purchase verified land properties';
      case 'authority': return 'Verify land ownership, approve transactions and maintain registry integrity';
      case 'arbitrator': return 'Resolve land disputes through community-based arbitration system';
      default: return 'Access land registry services';
    }
  };

  const getRoleDetails = (role: string) => {
    switch (role) {
      case 'landowner':
        return {
          title: 'Landowner',
          description: 'Property owners who register and manage their land assets',
          responsibilities: [
            'Register land parcels with proper documentation',
            'Upload land certificates and survey documents',
            'Manage property listings and pricing',
            'Respond to buyer inquiries and negotiations',
            'Maintain accurate property information'
          ],
          requirements: [
            'Valid Ghana Card or National ID',
            'Land ownership documents',
            'Survey certificates and site plans',
            'Ethereum wallet for blockchain transactions'
          ]
        };
      case 'buyer':
        return {
          title: 'Buyer/Investor',
          description: 'Individuals or organizations seeking to purchase land properties',
          responsibilities: [
            'Search and filter available properties',
            'Conduct due diligence on land titles',
            'Submit purchase offers and negotiate terms',
            'Complete secure blockchain-based transactions',
            'Verify land ownership and legal status'
          ],
          requirements: [
            'Valid Ghana Card or National ID',
            'Proof of funds or financing approval',
            'Ethereum wallet for payments',
            'Legal representation (recommended)'
          ]
        };
      case 'authority':
        return {
          title: 'Government Authority',
          description: 'Official government agencies overseeing land administration',
          responsibilities: [
            'Verify authenticity of land documents',
            'Approve or reject land registration applications',
            'Investigate fraudulent activities',
            'Maintain official land records and databases',
            'Ensure compliance with land laws and regulations'
          ],
          requirements: [
            'Official government credentials',
            'Authorized access to national land database',
            'Digital signature certificates',
            'Multi-factor authentication setup'
          ]
        };
      case 'arbitrator':
        return {
          title: 'Arbitrator/Mediator',
          description: 'Certified professionals who resolve land-related disputes',
          responsibilities: [
            'Review and analyze dispute cases',
            'Facilitate mediation between conflicting parties',
            'Conduct fair and impartial hearings',
            'Issue binding arbitration decisions',
            'Maintain detailed case documentation'
          ],
          requirements: [
            'Certified arbitration credentials',
            'Legal background in property law',
            'Ghana Bar Association membership',
            'Conflict of interest declarations'
          ]
        };
      default:
        return {
          title: 'User',
          description: 'General platform user',
          responsibilities: [],
          requirements: []
        };
    }
  };

  const getReputationColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReputationBadge = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'New';
  };

  // Show Ghana Card verification
  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img src="/assets/blockchain-logo.png" alt="Blockchain" className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification Required</h1>
            <p className="text-gray-600">Complete Ghana Card verification to access the platform</p>
          </div>
          
          <GhanaCardVerification 
            onVerificationComplete={handleVerificationComplete}
            userCountry={currentUser?.country || 'GH'}
          />
          
          <div className="text-center mt-4">
            <Button variant="outline" onClick={() => setShowVerification(false)}>
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img src="/assets/blockchain-logo_variant_1.png" alt="Blockchain" className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ghana Land Registry</h1>
            <p className="text-gray-600">Secure blockchain-powered land management</p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'register')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <CardTitle className="text-xl text-gray-900">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-600">
                    Sign in to access your land registry account
                  </CardDescription>
                </TabsContent>

                <TabsContent value="register">
                  <CardTitle className="text-xl text-gray-900">Create Account</CardTitle>
                  <CardDescription className="text-gray-600">
                    Join the Ghana Land Registry platform
                  </CardDescription>
                </TabsContent>
              </Tabs>
            </CardHeader>

            <CardContent>
              <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'register')}>
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </>
                      )}
                    </Button>

                    <div className="text-center text-sm text-gray-600">
                      <p>Demo accounts:</p>
                      <p className="text-xs">admin@landregistry.gh • buyer@example.com • arbitrator@example.com</p>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+233 24 123 4567"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="role">Account Type</Label>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              <Info className="w-4 h-4 mr-1" />
                              Review Roles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Platform Actor Roles & Responsibilities</DialogTitle>
                              <DialogDescription>
                                Understand the different roles and their responsibilities in the Ghana Land Registry system
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                              {['landowner', 'buyer', 'authority', 'arbitrator'].map((roleType) => {
                                const roleInfo = getRoleDetails(roleType);
                                return (
                                  <Card key={roleType} className="border-2">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                        {getRoleIcon(roleType)}
                                        {roleInfo.title}
                                      </CardTitle>
                                      <CardDescription>{roleInfo.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold text-sm mb-2">Key Responsibilities:</h4>
                                        <ul className="text-sm space-y-1">
                                          {roleInfo.responsibilities.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                              <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
                                        <ul className="text-sm space-y-1">
                                          {roleInfo.requirements.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                              <AlertTriangle className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Select value={role} onValueChange={(value) => setRole(value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="landowner">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="font-medium">Landowner</p>
                                <p className="text-xs text-gray-500">Register and manage properties</p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="buyer">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="font-medium">Buyer</p>
                                <p className="text-xs text-gray-500">Search and purchase land</p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="authority">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="font-medium">Government Authority</p>
                                <p className="text-xs text-gray-500">Verify and approve transactions</p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="arbitrator">
                            <div className="flex items-center gap-2">
                              <Gavel className="w-4 h-4 text-orange-600" />
                              <div>
                                <p className="font-medium">Arbitrator</p>
                                <p className="text-xs text-gray-500">Resolve land disputes</p>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(role === 'authority' || role === 'arbitrator') && (
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="organization"
                            placeholder="e.g., Ghana Land Commission"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Account & Verify
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-sm text-gray-600">
            <p>Secured by blockchain technology</p>
          </div>
        </div>
      </div>
    );
  }

  // Main application after authentication - Modern Tabbed Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <img src="/assets/blockchain-logo_variant_2.png" alt="Blockchain" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ghana Land Registry</h1>
                <p className="text-sm text-gray-500">Blockchain-Powered Land Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* User Profile Card */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {getRoleIcon(currentUser?.role || 'landowner')}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {currentUser?.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending'}
                    </Badge>
                    {currentUser?.reputation && (
                      <Badge variant="outline" className={`text-xs ${getReputationColor(currentUser.reputation.score)}`}>
                        {getReputationBadge(currentUser.reputation.score)} ({currentUser.reputation.score})
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-12 bg-transparent border-0 p-0">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 h-12 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="registry" 
                className="flex items-center gap-2 h-12 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
              >
                <FileText className="w-4 h-4" />
                Land Registry
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="flex items-center gap-2 h-12 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
              >
                <MapPin className="w-4 h-4" />
                Map View
              </TabsTrigger>
              <TabsTrigger 
                value="disputes" 
                className="flex items-center gap-2 h-12 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
              >
                <Gavel className="w-4 h-4" />
                Disputes
              </TabsTrigger>
              <TabsTrigger 
                value="verification" 
                className="flex items-center gap-2 h-12 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
              >
                <Shield className="w-4 h-4" />
                Verification
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {currentUser?.name}!
                  </h2>
                  <p className="text-gray-600">
                    {getRoleDescription(currentUser?.role || 'landowner')}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure & Verified</span>
                </div>
              </div>
            </div>

            {/* User Reputation Card */}
            {currentUser?.reputation && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Your Reputation Score
                  </CardTitle>
                  <CardDescription>
                    Build trust through successful transactions and community participation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getReputationColor(currentUser.reputation.score)}`}>
                        {currentUser.reputation.score}
                      </div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {currentUser.reputation.totalTransactions}
                      </div>
                      <div className="text-sm text-gray-600">Total Transactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {currentUser.reputation.successfulTransactions}
                      </div>
                      <div className="text-sm text-gray-600">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentUser.reputation.communityVotes}
                      </div>
                      <div className="text-sm text-gray-600">Community Votes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('registry')}>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Manage Properties</h3>
                  <p className="text-sm text-gray-600">Register new land or view existing properties</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('map')}>
                <CardContent className="p-6 text-center">
                  <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Explore Map</h3>
                  <p className="text-sm text-gray-600">View properties on interactive Ghana map</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('verification')}>
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Verification</h3>
                  <p className="text-sm text-gray-600">Complete identity verification process</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="registry">
            <LandRegistry currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="map">
            <GhanaMapViewer />
          </TabsContent>

          <TabsContent value="disputes">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Dispute Resolution</h2>
                  <p className="text-muted-foreground">Community-based arbitration system</p>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-12 text-center">
                  <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Dispute System Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced dispute resolution with community voting and arbitrator mediation
                  </p>
                  <div className="text-sm text-gray-500">
                    Features: Community voting • Expert arbitration • Evidence submission • Resolution tracking
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verification">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Identity Verification</h2>
                  <p className="text-muted-foreground">Verify government-issued identity documents</p>
                </div>
              </div>
              
              <GovernmentCardVerification />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}