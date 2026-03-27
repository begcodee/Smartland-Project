import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User, Mail, Lock, Phone, Building, Eye, EyeOff,
  ShieldCheck, Loader2, InfoIcon
} from 'lucide-react';
import { toast } from 'sonner';
import type { User as UserType } from '@/lib/mockData';
import { api } from '@/lib/api';
import { addLocalPendingUser } from '@/lib/pendingUsersStore';

type Role = UserType['role'];

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: 'buyer', label: 'Buyer / Investor', description: 'Search and purchase land parcels' },
  { value: 'seller', label: 'Seller (Landowner / Agent)', description: 'List and sell land parcels' },
  { value: 'admin', label: 'Admin (Ghana Lands Commission)', description: 'Oversee registry and users' },
];

interface NewUserRegistrationFlowProps {
  onSuccess: (user: UserType) => void;
  onBack: () => void;
}

export function NewUserRegistrationFlow({ onSuccess, onBack }: NewUserRegistrationFlowProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'buyer' as Role,
    organization: '',
    password: '',
    confirmPassword: '',
    staffId: '',
  });

  const canSubmit =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.phoneNumber.trim() &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    (formData.role !== 'admin' || !!formData.staffId.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      let newUser: UserType;

      try {
        // Try real backend registration
        const res = await api.register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phoneNumber: formData.phoneNumber.trim(),
          role: formData.role,
          organization: formData.organization.trim() || undefined,
          password: formData.password,
          staffId: formData.role === 'admin' ? formData.staffId.trim() : undefined,
        });
        // Backend created the user — use the returned user object
        newUser = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          verificationStatus: res.user.verificationStatus || 'pending',
          country: res.user.country || 'GH',
          phoneNumber: res.user.phoneNumber,
          organization: res.user.organization,
          staffId: res.user.staffId,
        } as UserType;
      } catch (apiErr) {
        const apiMsg = apiErr instanceof Error ? apiErr.message : '';
        if (/already exists/i.test(apiMsg)) {
          toast.error('An account with this email already exists. Please sign in.');
          return;
        }
        // Fallback: create local pending user if backend is unreachable
        newUser = {
          id: `user-${Date.now()}`,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          verificationStatus: 'pending',
          country: 'GH',
          phoneNumber: formData.phoneNumber.trim(),
          organization: formData.organization.trim() || undefined,
          staffId: formData.role === 'admin' ? formData.staffId.trim() : undefined,
        };
        // Register in the shared pending users store so the admin dashboard can see them
        addLocalPendingUser(newUser);
      }

      toast.success(`Welcome, ${newUser.name}!`, {
        description: 'Your account is created and pending Ghana Lands Commission verification. You can explore the platform while you wait.',
        duration: 7000,
      });
      onSuccess(newUser);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Create your account
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Fill in your basic details to get started. You can verify your Ghana Card after signing in.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Alert className="mb-5 border-primary/30 bg-primary/8">
          <InfoIcon className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground text-sm">
            <strong>Quick sign-up:</strong> Register with your details and explore the platform.
            Ghana Card verification is done after login and unlocks transactions and full registry access.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role picker */}
          <div className="space-y-2">
            <Label className="text-foreground">I am a *</Label>
            <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as Role, staffId: '' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    <span className="font-medium">{o.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {ROLE_OPTIONS.find((o) => o.value === formData.role)?.description}
            </p>
          </div>

          {/* Admin extras */}
          {formData.role === 'admin' && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-secondary/40">
              <div className="space-y-2">
                <Label className="text-foreground">Organization *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="e.g. Ghana Lands Commission"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Staff ID *</Label>
                <Input
                  placeholder="e.g. GLC-EMP-2024-001"
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Issued by Ghana Lands Commission. Required for admin login.</p>
              </div>
            </div>
          )}

          {/* Full name */}
          <div className="space-y-2">
            <Label className="text-foreground">Full name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-foreground">Email address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-foreground">Phone number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="tel"
                placeholder="+233 24 123 4567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label className="text-foreground">Password * <span className="text-xs text-muted-foreground">(min 6 characters)</span></Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label className="text-foreground">Confirm password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`pl-10 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-destructive' : ''}`}
                required
              />
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onBack} className="shrink-0">
              Back
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting} className="flex-1">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
              ) : (
                'Create account & sign in'
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-1">
            Arbitrator accounts are assigned by Ghana Lands Commission and cannot self-register.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
