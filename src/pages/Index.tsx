import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield, Mail, Lock, Eye, EyeOff,
  UserPlus, LogIn, ShieldCheck, Gavel, MapPin, ShoppingBag, UserRound
} from 'lucide-react';
import { toast } from 'sonner';
import { NewUserRegistrationFlow } from '@/components/NewUserRegistrationFlow';
import { useAuth, ROLE_DASHBOARD } from '@/contexts/AuthContext';
import { mockUsers } from '@/lib/mockData';
import type { User } from '@/lib/mockData';
import { api } from '@/lib/api';

type Role = User['role'];

export default function Index() {
  const { isAuthenticated, user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showNewUserFlow, setShowNewUserFlow] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState<Role | ''>('');
  const [roleCredential, setRoleCredential] = useState('');

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_DASHBOARD[user.role]} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveRole: Role = loginRole || (
      /admin|landregistry\.gh|ghanalandcommission/i.test(email) ? 'admin' :
      /seller|john\.doe/i.test(email) ? 'seller' :
      /buyer|akosua|frimpong/i.test(email) ? 'buyer' :
      /arbitrator|ama\.osei/i.test(email) ? 'arbitrator' : 'seller'
    );
    if (effectiveRole === 'admin' && !roleCredential.trim()) {
      toast.error('Staff ID is required for Ghana Lands Commission admin login');
      return;
    }
    if (effectiveRole === 'arbitrator' && !roleCredential.trim()) {
      toast.error('Arbitrator registration number is required');
      return;
    }
    setIsLoading(true);
    let mockUser: User | null = null;
    try {
      const res = await api.login(email, password, effectiveRole, roleCredential.trim() || undefined, roleCredential.trim() || undefined);
      if (res.success && res.user) {
        const u = res.user;
        mockUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as Role,
          verificationStatus: u.verificationStatus || 'verified',
          country: u.country || 'GH',
          phoneNumber: u.phoneNumber,
          organization: u.organization,
          staffId: u.staffId,
          arbitratorRegNo: u.arbitratorRegNo,
          blockchainToken: u.blockchainToken,
          reputation: u.reputation,
          creditScore: u.creditScore,
          financialProfile: u.financialProfile
        } as User;
        if (fullName.trim()) mockUser.name = fullName.trim();
        login(mockUser);
        setIsLoading(false);
        const firstName = mockUser.name.split(' ')[0];
        toast.success(`Akwaaba, ${firstName}!`);
        return;
      }
    } catch {
      /* fall back to mock */
    }
    await new Promise(r => setTimeout(r, 600));
    mockUser = mockUsers.find(u => u.email === email) || null;
    if (mockUser) {
      if (mockUser.role !== effectiveRole) {
        toast.error(`No ${effectiveRole} account found with this email. Select the correct role.`);
        setIsLoading(false);
        return;
      }
      if (effectiveRole === 'admin' && mockUser.staffId && mockUser.staffId !== roleCredential.trim()) {
        toast.error('Invalid Staff ID. Please check your credentials.');
        setIsLoading(false);
        return;
      }
      if (effectiveRole === 'arbitrator' && mockUser.arbitratorRegNo && mockUser.arbitratorRegNo !== roleCredential.trim()) {
        toast.error('Invalid Arbitrator Registration Number. Please check your credentials.');
        setIsLoading(false);
        return;
      }
    } else {
      const names: Record<Role, string> = {
        admin: 'Ghana Land Commission Admin',
        seller: 'John Doe',
        buyer: 'Akosua Frimpong',
        arbitrator: 'Dr. Ama Osei'
      };
      mockUser = {
        id: Date.now().toString(),
        name: names[effectiveRole],
        email,
        role: effectiveRole,
        verificationStatus: 'verified',
        country: 'GH',
        phoneNumber: '+233244123456',
        staffId: effectiveRole === 'admin' ? roleCredential.trim() || undefined : undefined,
        arbitratorRegNo: effectiveRole === 'arbitrator' ? roleCredential.trim() || undefined : undefined,
        reputation: { score: 92, totalTransactions: 15, successfulTransactions: 14, disputesWon: 3, communityVotes: 45 },
        creditScore: { score: 785, rating: 'Excellent', paymentHistory: 95, creditUtilization: 25, lengthOfHistory: 88, newCredit: 82, creditMix: 90 },
        financialProfile: { monthlyIncome: 8500, assets: 450000, liabilities: 125000, netWorth: 325000, bankingHistory: 12 }
      } as User;
    }
    if (fullName.trim()) mockUser.name = fullName.trim();
    login(mockUser);
    setIsLoading(false);
    const firstName = mockUser!.name.split(' ')[0];
    toast.success(`Akwaaba, ${firstName}!`);
  };

  if (showNewUserFlow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_45%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.12),transparent_40%)]" />
        <div className="w-full max-w-2xl relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">New user registration</h1>
            <p className="text-muted-foreground font-medium">Ghana Card, land documents & Ghana Lands Commission verification</p>
          </div>
          <NewUserRegistrationFlow
            onSuccess={(user) => {
              setShowNewUserFlow(false);
              login(user);
            }}
            onBack={() => setShowNewUserFlow(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_45%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.12),transparent_40%)]" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_10px_24px_hsl(var(--primary)/0.28)] ring-4 ring-accent/25">
            <Shield className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
            Ghana Land Registry
          </h1>
          <p className="text-muted-foreground font-medium text-base">Secure blockchain-powered land management</p>
          <p className="text-muted-foreground text-sm mt-1">Ghana Lands Commission</p>
        </div>

        <Card className="bg-card shadow-[0_10px_28px_rgba(0,0,0,0.08)] border border-border rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 bg-card border-b border-border/70">
            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 h-12 p-1 bg-secondary rounded-xl">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold data-[state=active]:shadow rounded-lg">
                  <LogIn className="w-4 h-4 mr-2" /> Returning user
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold data-[state=active]:shadow rounded-lg">
                  <UserPlus className="w-4 h-4 mr-2" /> New user
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <CardTitle className="text-2xl font-semibold text-foreground">Sign in</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">Sign in with your role — Admin & Arbitrator need extra credentials</CardDescription>
              </TabsContent>
              <TabsContent value="register">
                <CardTitle className="text-2xl font-semibold text-foreground">Create account</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">Register with your basic details. Ghana Card verification is done after login to unlock full access.</CardDescription>
              </TabsContent>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">I am a</Label>
                    <Select value={loginRole || 'buyer'} onValueChange={(v) => { setLoginRole(v as Role); setRoleCredential(''); }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer"><ShoppingBag className="w-4 h-4 mr-2 inline" /> Buyer</SelectItem>
                        <SelectItem value="seller"><MapPin className="w-4 h-4 mr-2 inline" /> Seller</SelectItem>
                        <SelectItem value="admin"><ShieldCheck className="w-4 h-4 mr-2 inline" /> Admin (Ghana Lands Commission)</SelectItem>
                        <SelectItem value="arbitrator"><Gavel className="w-4 h-4 mr-2 inline" /> Arbitrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(loginRole === 'admin' || loginRole === 'arbitrator') && (
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        {loginRole === 'admin' ? 'Staff ID (Lands Commission)' : 'Arbitrator registration no.'}
                      </Label>
                      <Input
                        placeholder={loginRole === 'admin' ? 'e.g. GLC-EMP-2024-001' : 'e.g. ARB-GH-2023-045'}
                        value={roleCredential}
                        onChange={(e) => setRoleCredential(e.target.value)}
                        className="pl-10"
                        required={loginRole === 'admin' || loginRole === 'arbitrator'}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-foreground">Full Name</Label>
                    <div className="relative">
                      <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input id="fullName" type="text" placeholder="e.g. Akosua Frimpong" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Demo: Buyer akosua.frimpong@yahoo.com · Seller john.doe@gmail.com · Admin admin@ghanalandcommission.gov.gh + GLC-EMP-2024-001 · Arbitrator ama.osei@arbitrator.gh + ARB-GH-2023-045
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sign up takes under a minute. After registering you can explore the platform immediately.
                    Complete Ghana Card verification from your dashboard to unlock full access.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1.5 list-inside">
                    <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">1</span> Enter your name, email, phone &amp; role</li>
                    <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">2</span> Sign in and explore the platform</li>
                    <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center shrink-0 font-bold">3</span> Verify your Ghana Card to unlock transactions</li>
                  </ul>
                  <Button onClick={() => setShowNewUserFlow(true)} className="w-full h-12 text-base font-semibold">
                    Create account
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Arbitrators are assigned by Ghana Lands Commission and cannot self-register.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground font-medium mt-6">Secure land registry · Ghana Card verification · Blockchain & SSI</p>
      </div>
    </div>
  );
}
