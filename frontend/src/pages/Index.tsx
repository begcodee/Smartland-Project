import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield, Mail, Lock, Eye, EyeOff,
  UserPlus, LogIn, ShieldCheck, Gavel, MapPin, ShoppingBag, UserRound, Fingerprint
} from 'lucide-react';
import { toast } from 'sonner';
import { NewUserRegistrationFlow } from '@/components/NewUserRegistrationFlow';
import { useAuth, ROLE_DASHBOARD } from '@/contexts/AuthContext';
import { mockUsers } from '@/lib/mockData';
import type { User } from '@/lib/mockData';
import { api } from '@/lib/api';
import { shouldForceBuyerSellerVerificationRoute } from '@/lib/verificationRouting';

type Role = User['role'];

function AuthBackgroundVideo() {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tryPlay = async () => {
      try {
        await el.play();
      } catch {
        // Autoplay can be blocked on some devices; keep UI usable.
      }
    };

    const onPause = () => void tryPlay();
    const onEnded = () => void tryPlay();
    const onVisibility = () => {
      if (!document.hidden) void tryPlay();
    };

    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    document.addEventListener('visibilitychange', onVisibility);
    void tryPlay();

    return () => {
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover opacity-85 contrast-115 saturate-110 pointer-events-none"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
    >
      <source src="/auth-bg.mp4" type="video/mp4" />
    </video>
  );
}

export default function Index() {
  const { isAuthenticated, user, login, refreshUser, authReady, authHydrating } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showNewUserFlow, setShowNewUserFlow] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState<Role | ''>('');
  const [roleCredential, setRoleCredential] = useState('');

  if (!authReady || authHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (shouldForceBuyerSellerVerificationRoute(user)) {
      return <Navigate to="/verification-status" replace />;
    }

    return <Navigate to={ROLE_DASHBOARD[user.role]} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveRole: Role = loginRole || (
      /admin|landregistry\.gh|ghanalandcommission/i.test(email) ? 'admin' :
      /seller|john\.doe/i.test(email) ? 'seller' :
      /buyer|akosua|frimpong/i.test(email) ? 'buyer' :
      /nia|nationalid|nia\.gov/i.test(email) ? 'nia' :
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
    if (effectiveRole === 'nia' && !roleCredential.trim()) {
      toast.error('NIA Staff ID is required');
      return;
    }
    setIsLoading(true);
    let mockUser: User | null = null;
    try {
      const res = await api.login(email, password, effectiveRole, roleCredential.trim() || undefined, roleCredential.trim() || undefined);
      const token = (res as { token?: string }).token;
      // Backend returns { token, user } (no success flag); require user + session or explicit success.
      if (res.user && (token || res.success)) {
        const u = res.user;
        mockUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as Role,
          verificationStatus: u.verified ? 'verified' : u.verificationStatus || 'pending',
          country: u.country || 'GH',
          phoneNumber: u.phoneNumber,
          organization: u.organization,
          staffId: u.staffId,
          arbitratorRegNo: u.arbitratorRegNo,
          blockchainToken: u.blockchainToken,
          idVerification: u.idVerification,
          niaStatus: u.niaStatus,
          niaReferenceId: u.niaReferenceId,
          reputation: u.reputation,
          creditScore: u.creditScore,
          financialProfile: u.financialProfile
        } as User;
        if (fullName.trim()) mockUser.name = fullName.trim();
        login(mockUser);
        await refreshUser();
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
        arbitrator: 'Dr. Ama Osei',
        nia: 'NIA Verification Officer'
      };
      mockUser = {
        id: Date.now().toString(),
        name: names[effectiveRole],
        email,
        role: effectiveRole,
        verificationStatus: 'pending',
        country: 'GH',
        phoneNumber: '+233244123456',
        staffId: effectiveRole === 'admin' ? roleCredential.trim() || undefined : undefined,
        arbitratorRegNo: effectiveRole === 'arbitrator' ? roleCredential.trim() || undefined : undefined,
        organization: effectiveRole === 'nia' ? 'National Identification Authority' : undefined,
        // New / unknown accounts should start unscored.
        reputation: { score: 0, totalTransactions: 0, successfulTransactions: 0, disputesWon: 0, communityVotes: 0 },
        creditScore: { score: 0, rating: 'Unscored', paymentHistory: 0, creditUtilization: 0, lengthOfHistory: 0, newCredit: 0, creditMix: 0 },
        financialProfile: { monthlyIncome: 0, assets: 0, liabilities: 0, netWorth: 0, bankingHistory: 0 }
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
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent">
        <AuthBackgroundVideo />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/20 to-black/70" />
        <div className="w-full max-w-2xl relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">New user registration</h1>
            <p className="text-slate-200/90 font-medium">Ghana Card, land documents & Ghana Lands Commission verification</p>
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent">
      <AuthBackgroundVideo />
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/20 to-black/70" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_12px_30px_rgba(0,0,0,0.55)] ring-1 ring-white/20 bg-white/90 overflow-hidden">
            <img
              src="/brands/lands-commission-logo.jpg"
              alt="Ghana Lands Commission logo"
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            Ghana Land Registry
          </h1>
          <p
            className="text-white/95 font-semibold text-lg md:text-xl tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]"
            style={{ fontFamily: 'cursive' }}
          >
            Clients satisfaction is our goal
          </p>
          <p className="text-slate-300/80 text-sm mt-1">Ghana Lands Commission</p>
        </div>

        <Card className="bg-black/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.55)] border border-white/10 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 bg-black/25 border-b border-white/10">
            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 h-12 p-1 bg-white/10 rounded-xl">
                <TabsTrigger value="login" className="text-slate-200 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow rounded-lg">
                  <LogIn className="w-4 h-4 mr-2" /> Returning user
                </TabsTrigger>
                <TabsTrigger value="register" className="text-slate-200 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow rounded-lg">
                  <UserPlus className="w-4 h-4 mr-2" /> New user
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <CardTitle className="text-2xl font-semibold text-white">Sign in</CardTitle>
                <CardDescription className="text-slate-200/80 font-medium">Sign in with your role — Admin & Arbitrator need extra credentials</CardDescription>
              </TabsContent>
              <TabsContent value="register">
                <CardTitle className="text-2xl font-semibold text-white">Create account</CardTitle>
                <CardDescription className="text-slate-200/80 font-medium">
                  Register to explore the app. Ghana Lands Commission / NIA verification is not instant — expect email updates within 24–48 hours after you submit documents.
                </CardDescription>
              </TabsContent>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-100/90">I am a</Label>
                    <Select value={loginRole || 'buyer'} onValueChange={(v) => { setLoginRole(v as Role); setRoleCredential(''); }}>
                      <SelectTrigger className="w-full bg-white/10 border-white/15 text-slate-50 placeholder:text-slate-300/70">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer"><ShoppingBag className="w-4 h-4 mr-2 inline" /> Buyer</SelectItem>
                        <SelectItem value="seller"><MapPin className="w-4 h-4 mr-2 inline" /> Seller</SelectItem>
                        <SelectItem value="admin"><ShieldCheck className="w-4 h-4 mr-2 inline" /> Admin (Ghana Lands Commission)</SelectItem>
                        <SelectItem value="arbitrator"><Gavel className="w-4 h-4 mr-2 inline" /> Arbitrator</SelectItem>
                        <SelectItem value="nia"><Fingerprint className="w-4 h-4 mr-2 inline" /> NIA Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(loginRole === 'admin' || loginRole === 'arbitrator' || loginRole === 'nia') && (
                    <div className="space-y-2">
                      <Label className="text-slate-100/90">
                        {loginRole === 'admin' ? 'Staff ID (Lands Commission)' : loginRole === 'nia' ? 'Staff ID (NIA)' : 'Arbitrator registration no.'}
                      </Label>
                      <Input
                        placeholder={loginRole === 'admin' ? 'e.g. GLC-EMP-2024-001' : loginRole === 'nia' ? 'e.g. NIA-EMP-2024-001' : 'e.g. ARB-GH-2023-045'}
                        value={roleCredential}
                        onChange={(e) => setRoleCredential(e.target.value)}
                        className="pl-10 bg-white/10 border-white/15 text-slate-50 placeholder:text-slate-300/70"
                        required={loginRole === 'admin' || loginRole === 'arbitrator' || loginRole === 'nia'}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-slate-100/90">Full Name</Label>
                    <div className="relative">
                      <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200/70 w-4 h-4" />
                      <Input id="fullName" type="text" placeholder="e.g. Akosua Frimpong" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 bg-white/10 border-white/15 text-slate-50 placeholder:text-slate-300/70" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-100/90">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200/70 w-4 h-4" />
                      <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-white/10 border-white/15 text-slate-50 placeholder:text-slate-300/70" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-100/90">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200/70 w-4 h-4" />
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 bg-white/10 border-white/15 text-slate-50 placeholder:text-slate-300/70" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-200/70 hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold bg-white/20 hover:bg-white/25 text-white border border-white/15" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                  <p className="text-xs text-slate-200/70 text-center">
                    Demo: Buyer akosua.frimpong@yahoo.com · Seller john.doe@gmail.com · Admin admin@ghanalandcommission.gov.gh + GLC-EMP-2024-001 · Arbitrator ama.osei@arbitrator.gh + ARB-GH-2023-045 · NIA nia@nia.gov.gh + NIA-EMP-2024-001
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-slate-200/80">
                    Sign up takes under a minute. After registering you can explore the platform immediately.
                    Complete Ghana Card verification from your dashboard to unlock full access.
                  </p>
                  <ul className="text-sm text-slate-200/80 space-y-1.5 list-inside">
                    <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">1</span> Enter your name, email, phone &amp; role</li>
                    <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">2</span> Sign in and explore the platform</li>
                    <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center shrink-0 font-bold">3</span> Verify your Ghana Card to unlock transactions</li>
                  </ul>
                  <Button onClick={() => setShowNewUserFlow(true)} className="w-full h-12 text-base font-semibold bg-white/20 hover:bg-white/25 text-white border border-white/15">
                    Create account
                  </Button>
                  <p className="text-xs text-slate-200/70 text-center">
                    Arbitrators are assigned by Ghana Lands Commission and cannot self-register.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-200/70 font-medium mt-6">Secure land registry · Ghana Card verification · Blockchain & SSI</p>
      </div>
    </div>
  );
}
