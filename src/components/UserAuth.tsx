import { createContext, useContext, useState, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CountrySelector } from '@/components/CountrySelector';
import { 
  User, Lock, Mail, Phone, Building, 
  CheckCircle, AlertCircle, Shield, Award 
} from 'lucide-react';
import { mockUsers, User as UserType } from '@/lib/mockData';

interface AuthContextType {
  currentUser: UserType | null;
  login: (email: string, password: string) => boolean;
  register: (userData: RegisterData) => boolean;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'landowner' | 'buyer' | 'authority' | 'arbitrator';
  country: string;
  phoneNumber: string;
  organization?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const login = (email: string, password: string): boolean => {
    // Simple mock authentication
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (userData: RegisterData): boolean => {
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return false;
    }

    // Create new user
    const newUser: UserType = {
      id: `U${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      verificationStatus: 'pending',
      country: userData.country,
      phoneNumber: userData.phoneNumber,
      organization: userData.organization,
      ...(userData.role === 'landowner' || userData.role === 'buyer' ? {
        reputation: {
          score: 50,
          totalTransactions: 0,
          successfulTransactions: 0,
          disputesWon: 0,
          communityVotes: 0
        }
      } : {})
    };

    // Add to mock users (in real app, this would be an API call)
    mockUsers.push(newUser);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  const demoAccounts = [
    { email: 'kwame.asante@gmail.com', role: 'Landowner', name: 'Kwame Asante' },
    { email: 'akosua.frimpong@yahoo.com', role: 'Buyer', name: 'Akosua Frimpong' },
    { email: 'admin@ghanalandcommission.gov.gh', role: 'Ghana Land Commission', name: 'Authority' },
    { email: 'ama.osei@arbitrator.gh', role: 'Arbitrator', name: 'Dr. Ama Osei' }
  ];

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="w-5 h-5" />
          Login to Your Account
        </CardTitle>
        <CardDescription>
          Access your Ghana Land Registry account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">Demo Accounts (Click to use):</p>
          </div>
          <div className="grid gap-2">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail(account.email);
                  setPassword('demo123');
                }}
                className="justify-start text-left h-auto p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span className="font-medium text-xs">{account.name}</span>
                    <Badge variant="secondary" className="text-xs">{account.role}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{account.email}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const RegisterForm = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    role: 'landowner',
    country: 'GH',
    phoneNumber: '',
    organization: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const success = register(formData);
    if (!success) {
      setError('Email already exists');
    }
    setLoading(false);
  };

  const updateFormData = (key: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'landowner': return 'Own and manage land properties';
      case 'buyer': return 'Purchase and invest in land';
      case 'authority': return 'Government/regulatory oversight';
      case 'arbitrator': return 'Resolve land disputes';
      default: return '';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2">
          <User className="w-5 h-5" />
          Create Your Account
        </CardTitle>
        <CardDescription>
          Join the Ghana Land Registry Platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <CountrySelector
            value={formData.country}
            onChange={(value) => updateFormData('country', value)}
            label="Country"
            placeholder="Select your country"
          />

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => updateFormData('phoneNumber', e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Account Type
            </Label>
            <Select value={formData.role} onValueChange={(value: 'landowner' | 'buyer' | 'authority' | 'arbitrator') => updateFormData('role', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="landowner">
                  <div className="space-y-1">
                    <p className="font-medium">Landowner</p>
                    <p className="text-xs text-muted-foreground">Own and manage land properties</p>
                  </div>
                </SelectItem>
                <SelectItem value="buyer">
                  <div className="space-y-1">
                    <p className="font-medium">Buyer</p>
                    <p className="text-xs text-muted-foreground">Purchase and invest in land</p>
                  </div>
                </SelectItem>
                <SelectItem value="authority">
                  <div className="space-y-1">
                    <p className="font-medium">Authority</p>
                    <p className="text-xs text-muted-foreground">Government/regulatory oversight</p>
                  </div>
                </SelectItem>
                <SelectItem value="arbitrator">
                  <div className="space-y-1">
                    <p className="font-medium">Arbitrator</p>
                    <p className="text-xs text-muted-foreground">Resolve land disputes</p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.role === 'authority' || formData.role === 'arbitrator') && (
            <div className="space-y-2">
              <Label htmlFor="organization" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Organization
              </Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => updateFormData('organization', e.target.value)}
                placeholder="e.g., Ghana Land Commission, AMA"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
};