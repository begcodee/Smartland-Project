import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, User, Mail, Lock, Eye, EyeOff,
  UserPlus, LogIn, MapPin, FileText, Gavel, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { LandRegistry } from '@/components/LandRegistry';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'landowner' | 'buyer' | 'authority' | 'arbitrator';
  verificationStatus: 'verified' | 'pending' | 'unverified';
  country: string;
  phoneNumber: string;
}

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'landowner' | 'buyer' | 'authority' | 'arbitrator'>('landowner');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock user data based on email
    const mockUser: User = {
      id: 'U001',
      name: email === 'admin@landregistry.gh' ? 'Admin User' : 'Kwame Asante',
      email: email,
      role: email === 'admin@landregistry.gh' ? 'authority' : 'landowner',
      verificationStatus: 'verified',
      country: 'GH',
      phoneNumber: '+233244123456'
    };

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
      phoneNumber
    };

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setIsLoading(false);
    toast.success(`Account created successfully! Welcome, ${newUser.name}!`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setName('');
    setPhoneNumber('');
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
      case 'landowner': return 'Register and manage your land properties';
      case 'buyer': return 'Search and purchase land properties';
      case 'authority': return 'Verify and approve land transactions';
      case 'arbitrator': return 'Resolve land disputes and conflicts';
      default: return 'Access land registry services';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
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
                      <p className="text-xs">admin@landregistry.gh (Authority) | user@example.com (Landowner)</p>
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
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+233 24 123 4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Account Type</Label>
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
                          Create Account
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

  // Main application after authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
                  {getRoleIcon(currentUser?.role || 'landowner')}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {currentUser?.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {currentUser?.role}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
        </div>

        {/* Main Land Registry Component */}
        <LandRegistry currentUser={currentUser} />
      </div>
    </div>
  );
}