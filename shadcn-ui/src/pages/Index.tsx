import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, User, Mail, Lock, Eye, EyeOff, Phone, Building,
  UserPlus, LogIn, MapPin, FileText, Gavel, Users, CheckCircle, Clock, AlertTriangle, Info,
  Home, Search, MessageSquare, TrendingUp, Settings, Bell, HelpCircle, ArrowUpDown, 
  BarChart3, Activity, Star, Award, Zap, RefreshCw, ExternalLink, CreditCard, 
  DollarSign, PieChart, Calendar, ChevronDown, Hexagon, LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { LandRegistry } from '@/components/LandRegistry';
import { GhanaMapViewer } from '@/components/GhanaMapViewer';
import { GhanaCardVerification } from '@/components/GhanaCardVerification';
import { GovernmentCardVerification } from '@/components/GovernmentCardVerification';
import { mockUsers, mockDisputes, mockTransfers, formatCurrency } from '@/lib/mockData';

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
  creditScore?: {
    score: number;
    rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    paymentHistory: number;
    creditUtilization: number;
    lengthOfHistory: number;
    newCredit: number;
    creditMix: number;
  };
  financialProfile?: {
    monthlyIncome: number;
    assets: number;
    liabilities: number;
    netWorth: number;
    bankingHistory: number;
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
        },
        creditScore: {
          score: 785,
          rating: 'Excellent',
          paymentHistory: 95,
          creditUtilization: 25,
          lengthOfHistory: 88,
          newCredit: 82,
          creditMix: 90
        },
        financialProfile: {
          monthlyIncome: 8500,
          assets: 450000,
          liabilities: 125000,
          netWorth: 325000,
          bankingHistory: 12
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
      },
      creditScore: {
        score: 650,
        rating: 'Fair',
        paymentHistory: 70,
        creditUtilization: 45,
        lengthOfHistory: 60,
        newCredit: 55,
        creditMix: 65
      },
      financialProfile: {
        monthlyIncome: 3500,
        assets: 50000,
        liabilities: 15000,
        netWorth: 35000,
        bankingHistory: 3
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

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-600';
    if (score >= 700) return 'text-cyan-600';
    if (score >= 650) return 'text-amber-600';
    return 'text-red-500';
  };

  // Show Ghana Card verification
  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-cyan-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <img src="/images/photo1764432357.jpg" alt="Blockchain" className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">Identity Verification Required</h1>
            <p className="text-slate-300">Complete Ghana Card verification to access the platform</p>
          </div>
          
          <GhanaCardVerification 
            onVerificationComplete={handleVerificationComplete}
            userCountry={currentUser?.country || 'GH'}
          />
          
          <div className="text-center mt-4">
            <Button variant="outline" onClick={() => setShowVerification(false)} className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-cyan-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <img src="/images/photo1764432357.jpg" alt="Blockchain" className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">Ghana Land Registry</h1>
            <p className="text-slate-300">Secure blockchain-powered land management</p>
          </div>

          <Card className="bg-slate-800/50 backdrop-blur-xl shadow-2xl border border-cyan-500/20">
            <CardHeader className="text-center pb-4">
              <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'register')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-700/50">
                  <TabsTrigger value="login" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
                    <LogIn className="w-4 h-4" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
                    <UserPlus className="w-4 h-4" />
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <CardTitle className="text-xl text-white">Welcome Back</CardTitle>
                  <CardDescription className="text-slate-300">
                    Sign in to access your land registry account
                  </CardDescription>
                </TabsContent>

                <TabsContent value="register">
                  <CardTitle className="text-xl text-white">Create Account</CardTitle>
                  <CardDescription className="text-slate-300">
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
                      <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-200">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 shadow-lg"
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

                    <div className="text-center text-sm text-slate-400">
                      <p>Demo accounts:</p>
                      <p className="text-xs">admin@landregistry.gh • buyer@example.com • arbitrator@example.com</p>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-slate-200">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-200">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+233 24 123 4567"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="role" className="text-slate-200">Account Type</Label>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                              <Info className="w-4 h-4 mr-1" />
                              Review Roles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-800 border-cyan-500/20">
                            <DialogHeader>
                              <DialogTitle className="text-white">Platform Actor Roles & Responsibilities</DialogTitle>
                              <DialogDescription className="text-slate-300">
                                Understand the different roles and their responsibilities in the Ghana Land Registry system
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                              {['landowner', 'buyer', 'authority', 'arbitrator'].map((roleType) => {
                                const roleInfo = getRoleDetails(roleType);
                                return (
                                  <Card key={roleType} className="border-2 border-cyan-500/20 bg-slate-700/50">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2 text-white">
                                        {getRoleIcon(roleType)}
                                        {roleInfo.title}
                                      </CardTitle>
                                      <CardDescription className="text-slate-300">{roleInfo.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold text-sm mb-2 text-cyan-400">Key Responsibilities:</h4>
                                        <ul className="text-sm space-y-1">
                                          {roleInfo.responsibilities.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2 text-slate-300">
                                              <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-sm mb-2 text-purple-400">Requirements:</h4>
                                        <ul className="text-sm space-y-1">
                                          {roleInfo.requirements.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2 text-slate-300">
                                              <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
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
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="landowner">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-emerald-400" />
                              <div>
                                <p className="font-medium text-white">Landowner</p>
                                <p className="text-xs text-slate-400">Register and manage properties</p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="buyer">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-cyan-400" />
                              <div>
                                <p className="font-medium text-white">Buyer</p>
                                <p className="text-xs text-slate-400">Search and purchase land</p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="authority">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-purple-400" />
                              <div>
                                <p className="font-medium text-white">Government Authority</p>
                                <p className="text-xs text-slate-400">Verify and approve transactions</p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="arbitrator">
                            <div className="flex items-center gap-2">
                              <Gavel className="w-4 h-4 text-amber-400" />
                              <div>
                                <p className="font-medium text-white">Arbitrator</p>
                                <p className="text-xs text-slate-400">Resolve land disputes</p>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(role === 'authority' || role === 'arbitrator') && (
                      <div className="space-y-2">
                        <Label htmlFor="organization" className="text-slate-200">Organization</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                            id="organization"
                            placeholder="e.g., Ghana Land Commission"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-slate-200">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 shadow-lg"
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

          <div className="text-center mt-6 text-sm text-slate-400">
            <p>Secured by blockchain technology</p>
          </div>
        </div>
      </div>
    );
  }

  // Main application after authentication - Updated with futuristic blockchain colors
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
      {/* Header - Updated with futuristic blockchain theme */}
      <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-cyan-900 shadow-xl border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Hexagon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Land Registry
                </h1>
                <p className="text-sm text-slate-300">
                  Secure, transparent, and tamper-proof land ownership management powered by blockchain smart contracts
                </p>
              </div>
            </div>
            
            {/* User Profile - Updated with futuristic styling and logout button */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 hover:bg-cyan-500/10 text-white">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{currentUser?.name}</p>
                      <p className="text-xs text-cyan-300 capitalize">{currentUser?.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-cyan-500/20">
                  <DropdownMenuLabel className="text-white">Account Information</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  
                  {/* Credit Score Section */}
                  {currentUser?.creditScore && (
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-cyan-400" />
                          <span className="font-medium text-white">Credit Score</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getCreditScoreColor(currentUser.creditScore.score)}`}>
                            {currentUser.creditScore.score}
                          </div>
                          <div className="text-xs text-slate-400">{currentUser.creditScore.rating}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>Payment History</span>
                          <span>{currentUser.creditScore.paymentHistory}%</span>
                        </div>
                        <Progress value={currentUser.creditScore.paymentHistory} className="h-1 bg-slate-700" />
                        
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>Credit Utilization</span>
                          <span>{currentUser.creditScore.creditUtilization}%</span>
                        </div>
                        <Progress value={100 - currentUser.creditScore.creditUtilization} className="h-1 bg-slate-700" />
                        
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>Length of History</span>
                          <span>{currentUser.creditScore.lengthOfHistory}%</span>
                        </div>
                        <Progress value={currentUser.creditScore.lengthOfHistory} className="h-1 bg-slate-700" />
                      </div>
                    </div>
                  )}
                  
                  <DropdownMenuSeparator className="bg-slate-700" />
                  
                  {/* Financial Profile */}
                  {currentUser?.financialProfile && (
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <PieChart className="w-4 h-4 text-emerald-400" />
                        <span className="font-medium text-white">Financial Profile</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Monthly Income</span>
                          <div className="font-medium text-emerald-400">{formatCurrency(currentUser.financialProfile.monthlyIncome)}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Net Worth</span>
                          <div className="font-medium text-cyan-400">{formatCurrency(currentUser.financialProfile.netWorth)}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Total Assets</span>
                          <div className="font-medium text-purple-400">{formatCurrency(currentUser.financialProfile.assets)}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Banking History</span>
                          <div className="font-medium text-white">{currentUser.financialProfile.bankingHistory} years</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <DropdownMenuSeparator className="bg-slate-700" />
                  
                  {/* Reputation Score */}
                  {currentUser?.reputation && (
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        <span className="font-medium text-white">Reputation Score</span>
                        <span className="text-lg font-bold text-cyan-400">{currentUser.reputation.score}/100</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Transactions</span>
                          <div className="font-medium text-white">{currentUser.reputation.totalTransactions}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Success Rate</span>
                          <div className="font-medium text-emerald-400">
                            {Math.round((currentUser.reputation.successfulTransactions / currentUser.reputation.totalTransactions) * 100)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400">Disputes Won</span>
                          <div className="font-medium text-purple-400">{currentUser.reputation.disputesWon}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Community Votes</span>
                          <div className="font-medium text-cyan-400">{currentUser.reputation.communityVotes}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-red-500/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Updated with futuristic styling */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-cyan-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'border-cyan-500 text-cyan-600 bg-gradient-to-t from-cyan-50 to-transparent'
                  : 'border-transparent text-slate-600 hover:text-cyan-600 hover:border-cyan-300'
              }`}
            >
              <Zap className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('registry')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'registry'
                  ? 'border-purple-500 text-purple-600 bg-gradient-to-t from-purple-50 to-transparent'
                  : 'border-transparent text-slate-600 hover:text-purple-600 hover:border-purple-300'
              }`}
            >
              <Hexagon className="w-4 h-4" />
              Registry
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'transfer'
                  ? 'border-emerald-500 text-emerald-600 bg-gradient-to-t from-emerald-50 to-transparent'
                  : 'border-transparent text-slate-600 hover:text-emerald-600 hover:border-emerald-300'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              Transfer
            </button>
            <button
              onClick={() => setActiveTab('disputes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'disputes'
                  ? 'border-amber-500 text-amber-600 bg-gradient-to-t from-amber-50 to-transparent'
                  : 'border-transparent text-slate-600 hover:text-amber-600 hover:border-amber-300'
              }`}
            >
              <Gavel className="w-4 h-4" />
              Disputes
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'contracts'
                  ? 'border-indigo-500 text-indigo-600 bg-gradient-to-t from-indigo-50 to-transparent'
                  : 'border-transparent text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
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
            {/* Welcome Banner - Updated with futuristic blockchain styling */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-cyan-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-6 h-6 text-cyan-400" />
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Welcome back, {currentUser?.name}!</h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg capitalize text-slate-300">{currentUser?.role}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        <span className="text-cyan-300">{currentUser?.reputation?.score || 92}/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-emerald-400/30">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-300">verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards - Updated with futuristic blockchain colors */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* My Properties */}
              <Card className="bg-gradient-to-br from-white to-cyan-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyan-600 mb-1">My Properties</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">8</p>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-slate-500">On blockchain</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                      <Hexagon className="w-6 h-6 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio Value */}
              <Card className="bg-gradient-to-br from-white to-emerald-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-600 mb-1">Portfolio Value</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">₵4.9M</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-slate-500">Ghana Cedis</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* My Disputes */}
              <Card className="bg-gradient-to-br from-white to-amber-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600 mb-1">My Disputes</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">1</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-slate-500">Pending resolution</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                      <Gavel className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Transfers */}
              <Card className="bg-gradient-to-br from-white to-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 mb-1">Active Transfers</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">0</p>
                      <div className="flex items-center gap-1 mt-2">
                        <RefreshCw className="w-3 h-3 text-purple-500" />
                        <span className="text-xs text-slate-500">In escrow</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <ArrowUpDown className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reputation Section - Updated with futuristic styling */}
            <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-600" />
                  <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">Your Reputation & Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      {currentUser?.reputation?.totalTransactions || 15}
                    </div>
                    <div className="text-sm text-slate-500">Total Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                      {currentUser?.reputation?.successfulTransactions || 14}
                    </div>
                    <div className="text-sm text-slate-500">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                      {currentUser?.reputation?.disputesWon || 3}
                    </div>
                    <div className="text-sm text-slate-500">Disputes Won</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      {currentUser?.reputation?.communityVotes || 45}
                    </div>
                    <div className="text-sm text-slate-500">Community Votes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity - Updated with futuristic styling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Disputes */}
              <Card className="bg-gradient-to-br from-white to-amber-50 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-amber-600">
                    <Gavel className="w-5 h-5" />
                    Recent Disputes
                  </CardTitle>
                  <CardDescription>Latest land dispute cases</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockDisputes.slice(0, 1).map((dispute) => (
                    <div key={dispute.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200/50">
                      <div>
                        <p className="font-medium text-sm text-slate-800">City Development Authority vs {currentUser?.name}</p>
                        <p className="text-xs text-slate-600 mt-1">Land acquisition for public infrastructure development...</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0">
                        under review
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Transfers */}
              <Card className="bg-gradient-to-br from-white to-purple-50 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <ArrowUpDown className="w-5 h-5" />
                    Recent Transfers
                  </CardTitle>
                  <CardDescription>Latest ownership transfers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-12 text-slate-400">
                    <div className="text-center">
                      <RefreshCw className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-sm">No transfers found</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permission Notice - Updated with futuristic styling */}
            {(currentUser?.role === 'landowner' || currentUser?.role === 'buyer') && (
              <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-cyan-600" />
                    <p className="text-sm text-cyan-800">
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
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Land Transfers</h2>
                <p className="text-slate-600">Manage property ownership transfers</p>
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-white to-emerald-50 border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUpDown className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Transfer System</h3>
                <p className="text-slate-600 mb-4">
                  Secure blockchain-based property transfers with escrow protection
                </p>
                <div className="text-sm text-slate-500">
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
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Dispute Resolution</h2>
                <p className="text-slate-600">Community-based arbitration system</p>
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-white to-amber-50 border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gavel className="w-12 h-12 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Dispute System</h3>
                <p className="text-slate-600 mb-4">
                  Advanced dispute resolution with community voting and arbitrator mediation
                </p>
                <div className="text-sm text-slate-500">
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
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Smart Contracts</h2>
                <p className="text-slate-600">Blockchain contract management</p>
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-white to-indigo-50 border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Contract Management</h3>
                <p className="text-slate-600 mb-4">
                  Automated smart contracts for land transactions and agreements
                </p>
                <div className="text-sm text-slate-500">
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