import { useState, createContext, useContext, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, Mail, Phone, Building, Shield, 
  CheckCircle, Clock, AlertTriangle, LogOut 
} from 'lucide-react';
import { CountrySelector } from '@/components/CountrySelector';
import { GhanaCardVerification } from '@/components/GhanaCardVerification';
import { EthereumIntegration } from '@/components/EthereumIntegration';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'landowner' | 'buyer' | 'authority' | 'arbitrator';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  country: string;
  phoneNumber: string;
  organization?: string;
  walletAddress?: string;
  idVerification?: {
    frontCardImage: string;
    backCardImage: string;
    faceImage: string;
    cardNumber: string;
    fullName: string;
    status: 'pending' | 'verified' | 'rejected';
  };
}

interface VerificationData {
  frontCardImage: string;
  backCardImage: string;
  faceImage: string;
  cardNumber: string;
  fullName: string;
  status: 'pending' | 'verified' | 'rejected';
}

interface WalletData {
  address: string;
  balance: string;
  network: string;
  connected: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would call an API
    if (email && password) {
      const mockUser: User = {
        id: 'U001',
        name: 'Kwame Asante',
        email: email,
        role: 'landowner',
        verificationStatus: 'verified',
        country: 'GH',
        phoneNumber: '+233244123456'
      };
      setCurrentUser(mockUser);
      toast.success('Login successful!');
      return true;
    }
    toast.error('Invalid credentials');
    return false;
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const newUser: User = {
        id: `U${Date.now()}`,
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'landowner',
        verificationStatus: 'pending',
        country: userData.country || 'GH',
        phoneNumber: userData.phoneNumber || '',
        organization: userData.organization
      };
      
      setCurrentUser(newUser);
      toast.success('Registration successful! Please complete verification.');
      return true;
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const { currentUser, login, register, logout, updateUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  const [showEthereumSetup, setShowEthereumSetup] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'landowner' as User['role'],
    country: 'GH',
    phoneNumber: '',
    organization: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success && currentUser?.verificationStatus === 'pending') {
      setShowVerification(true);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const success = await register(formData);
    if (success) {
      setShowVerification(true);
    }
  };

  const handleVerificationComplete = (verificationData: VerificationData) => {
    updateUser({
      idVerification: {
        ...verificationData,
        status: 'pending'
      }
    });
    setShowVerification(false);
    setShowEthereumSetup(true);
    toast.success('ID verification submitted! Setting up blockchain integration...');
  };

  const handleWalletConnected = (walletData: WalletData) => {
    updateUser({
      walletAddress: walletData.address
    });
    setShowEthereumSetup(false);
    toast.success('Account setup complete! Welcome to the platform.');
  };

  // If user is logged in and verified, don't show auth forms
  if (currentUser && !showVerification && !showEthereumSetup) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{currentUser.name}</p>
            <div className="flex items-center gap-2">
              <Badge variant={currentUser.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                {currentUser.verificationStatus === 'verified' ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {currentUser.verificationStatus}
              </Badge>
              <Badge variant="outline">
                {currentUser.role}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    );
  }

  // Show verification flow
  if (showVerification) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <GhanaCardVerification 
          onVerificationComplete={handleVerificationComplete}
          userCountry={currentUser?.country || 'GH'}
        />
      </div>
    );
  }

  // Show Ethereum setup
  if (showEthereumSetup) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <EthereumIntegration onWalletConnected={handleWalletConnected} />
      </div>
    );
  }

  // Show login/register forms
  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="w-6 h-6" />
            Ghana Land Registry
          </CardTitle>
          <CardDescription>
            Secure blockchain-based land registration system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(value) => setIsLogin(value === 'login')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as User['role']})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="landowner">Landowner</SelectItem>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="authority">Government Authority</SelectItem>
                        <SelectItem value="arbitrator">Arbitrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <CountrySelector
                  value={formData.country}
                  onChange={(value) => setFormData({...formData, country: value})}
                  label="Country"
                />

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="+233 244 123 456"
                    required
                  />
                </div>

                {(formData.role === 'authority' || formData.role === 'arbitrator') && (
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({...formData, organization: e.target.value})}
                      placeholder="e.g., Ghana Land Commission"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    After registration, you'll need to verify your identity with your national ID card 
                    and connect an Ethereum wallet for blockchain transactions.
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full">
                  Register & Verify Identity
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};