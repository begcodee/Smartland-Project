import { useState, createContext, useContext, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User as UserType } from '@/types';
import { mockUsers } from '@/lib/mockData';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: UserType | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<UserType, 'id' | 'joinedDate' | 'lastActive' | 'reputation'>) => Promise<boolean>;
  updateProfile: (updates: Partial<UserType>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>(mockUsers);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = users.find(u => u.email === email);
    if (user) {
      // Update last active
      const updatedUser = { ...user, lastActive: new Date().toISOString().split('T')[0] };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    }
    toast.error('Invalid credentials');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    toast.success('Logged out successfully');
  };

  const register = async (userData: Omit<UserType, 'id' | 'joinedDate' | 'lastActive' | 'reputation'>): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      toast.error('User with this email already exists');
      return false;
    }

    const newUser: UserType = {
      ...userData,
      id: `U${String(users.length + 1).padStart(3, '0')}`,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      reputation: {
        score: 50, // Starting reputation
        totalTransactions: 0,
        successfulTransactions: 0,
        disputesWon: 0,
        disputesLost: 0,
        communityVotes: 0,
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    toast.success('Account created successfully!');
    return true;
  };

  const updateProfile = (updates: Partial<UserType>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      toast.success('Profile updated successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login to Land Registry</CardTitle>
        <CardDescription>Access your account to manage land assets</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="mb-2">Demo accounts:</p>
          <div className="space-y-1 text-xs">
            <p>• john.doe@example.com (Landowner)</p>
            <p>• maria.garcia@example.com (Landowner)</p>
            <p>• authority@district.gov.in (Authority)</p>
            <p>• ahmed.hassan@example.com (Buyer)</p>
            <p>• priya.sharma@arbitrator.org (Arbitrator)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '' as UserType['role'],
    walletAddress: '',
    profile: {
      phone: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
      dateOfBirth: '',
      nationalId: '',
      bio: '',
      avatar: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const userData = {
      ...formData,
      verificationStatus: 'pending' as const
    };
    
    await register(userData);
    setIsLoading(false);
  };

  const generateWalletAddress = () => {
    const address = `0x${Math.random().toString(16).substr(2, 40)}`;
    setFormData({ ...formData, walletAddress: address });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join the decentralized land registry</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value: UserType['role']) => 
                setFormData({ ...formData, role: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landowner">Landowner</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="authority">Authority</SelectItem>
                  <SelectItem value="arbitrator">Arbitrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+91 9876543210"
                value={formData.profile.phone}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, phone: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street address"
                value={formData.profile.address}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, address: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.profile.city}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, city: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="State"
                value={formData.profile.state}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, state: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.profile.dateOfBirth}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, dateOfBirth: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                placeholder="AADHAAR-1234-5678-9012"
                value={formData.profile.nationalId}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, nationalId: e.target.value }
                })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="wallet">Wallet Address *</Label>
            <div className="flex gap-2">
              <Input
                id="wallet"
                placeholder="0x..."
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                required
              />
              <Button type="button" variant="outline" onClick={generateWalletAddress}>
                Generate
              </Button>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};