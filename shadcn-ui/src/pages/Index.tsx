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
  Home, Search, MessageSquare, TrendingUp, Settings, Bell, HelpCircle, ArrowUpDown, 
  BarChart3, Activity, Star, Award, Zap, RefreshCw, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { LandRegistry } from '@/components/LandRegistry';
import { GhanaMapViewer } from '@/components/GhanaMapViewer';
import { GhanaCardVerification } from '@/components/GhanaCardVerification';
import { GovernmentCardVerification } from '@/components/GovernmentCardVerification';
import { mockUsers, mockDisputes, mockTransfers } from '@/lib/mockData';

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
              'John Doe',
        email: email,
        role: email === 'admin@landregistry.gh' ? 'authority' : 
              email === 'buyer@example.com' ? 'buyer' :
              email === 'arbitrator@example.com' ? 'arbitrator' :
              'landowner',
        verificationStatus: 'verified',
        country: 'GH',
        phoneNumber: '+233244123456',
        reputation: {
          score: 92,
          totalTransactions: 15,
          successfulTransactions: 14,
          disputesWon: 3,
          communityVotes: 45
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

  // Show Ghana Card verification
  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img src="/assets/blockchain-logo_variant_3.png" alt="Blockchain" className="w-10 h-10" />
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
              <img src="/assets/blockchain-logo_variant_4.png" alt="Blockchain" className="w-10 h-10" />
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

  // Main application after authentication - Recreating the exact old system design
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Exactly like the old system */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Land Registry
                </h1>
                <p className="text-sm text-gray-500">
                  Secure, transparent, and tamper-proof land ownership management powered by blockchain smart contracts
                </p>
              </div>
            </div>
            
            {/* User Profile - Exactly like old system */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Exactly like old system */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Zap className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('registry')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'registry'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Registry
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'transfer'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              Transfer
            </button>
            <button
              onClick={() => setActiveTab('disputes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'disputes'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Gavel className="w-4 h-4" />
              Disputes
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'contracts'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              Contracts
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Banner - Exactly like old system */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-6 h-6" />
                      <h2 className="text-2xl font-bold">Welcome back, {currentUser?.name}!</h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg capitalize">{currentUser?.role}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>{currentUser?.reputation?.score || 92}/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">verified</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            </div>

            {/* Stats Cards - Exactly like old system */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* My Properties */}
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">My Properties</p>
                      <p className="text-3xl font-bold text-gray-900">1</p>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">On blockchain</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio Value */}
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Portfolio Value</p>
                      <p className="text-3xl font-bold text-gray-900">$75,000</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-gray-500">USD equivalent</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* My Disputes */}
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 mb-1">My Disputes</p>
                      <p className="text-3xl font-bold text-gray-900">1</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-gray-500">Pending resolution</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Gavel className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Transfers */}
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 mb-1">Active Transfers</p>
                      <p className="text-3xl font-bold text-gray-900">0</p>
                      <div className="flex items-center gap-1 mt-2">
                        <RefreshCw className="w-3 h-3 text-purple-500" />
                        <span className="text-xs text-gray-500">In escrow</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <ArrowUpDown className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reputation Section - Exactly like old system */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Your Reputation & Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {currentUser?.reputation?.totalTransactions || 15}
                    </div>
                    <div className="text-sm text-gray-500">Total Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {currentUser?.reputation?.successfulTransactions || 14}
                    </div>
                    <div className="text-sm text-gray-500">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {currentUser?.reputation?.disputesWon || 3}
                    </div>
                    <div className="text-sm text-gray-500">Disputes Won</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {currentUser?.reputation?.communityVotes || 45}
                    </div>
                    <div className="text-sm text-gray-500">Community Votes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity - Two columns like old system */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Disputes */}
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Gavel className="w-5 h-5" />
                    Recent Disputes
                  </CardTitle>
                  <CardDescription>Latest land dispute cases</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockDisputes.slice(0, 1).map((dispute) => (
                    <div key={dispute.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">City Development Authority vs {currentUser?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Land acquisition for public infrastructure development...</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        under review
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Transfers */}
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <ArrowUpDown className="w-5 h-5" />
                    Recent Transfers
                  </CardTitle>
                  <CardDescription>Latest ownership transfers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-12 text-gray-400">
                    <div className="text-center">
                      <RefreshCw className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-sm">No transfers found</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permission Notice - Like old system */}
            {(currentUser?.role === 'landowner' || currentUser?.role === 'buyer') && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      You don't have permission to access this feature. Required roles: authority, arbitrator.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'registry' && (
          <LandRegistry currentUser={currentUser} />
        )}

        {activeTab === 'transfer' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Land Transfers</h2>
                <p className="text-muted-foreground">Manage property ownership transfers</p>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-12 text-center">
                <ArrowUpDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Transfer System</h3>
                <p className="text-gray-600 mb-4">
                  Secure blockchain-based property transfers with escrow protection
                </p>
                <div className="text-sm text-gray-500">
                  Features: Escrow management • Multi-signature approval • Transfer history • Smart contracts
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'disputes' && (
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
                <h3 className="text-xl font-semibold mb-2">Dispute System</h3>
                <p className="text-gray-600 mb-4">
                  Advanced dispute resolution with community voting and arbitrator mediation
                </p>
                <div className="text-sm text-gray-500">
                  Features: Community voting • Expert arbitration • Evidence submission • Resolution tracking
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Smart Contracts</h2>
                <p className="text-muted-foreground">Blockchain contract management</p>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Contract Management</h3>
                <p className="text-gray-600 mb-4">
                  Automated smart contracts for land transactions and agreements
                </p>
                <div className="text-sm text-gray-500">
                  Features: Contract templates • Automated execution • Legal compliance • Transaction history
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}