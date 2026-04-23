import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ShieldCheck, ShieldAlert, X } from 'lucide-react';
import { GhanaCardVerification, type VerificationData } from '@/components/GhanaCardVerification';
import { useAuth } from '@/contexts/AuthContext';
import { updateLocalPendingUserVerification } from '@/lib/pendingUsersStore';
import { toast } from 'sonner';

interface VerifyIdentityBannerProps {
  /** Allow parent to dismiss the banner (optional) */
  onDismiss?: () => void;
}

const LOCKED_ROLES = ['seller', 'buyer'];

export function VerifyIdentityBanner({ onDismiss }: VerifyIdentityBannerProps) {
  const { user, updateUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isLockedRole = !!user && LOCKED_ROLES.includes(user.role);

  if (!user || user.verificationStatus === 'verified' || (dismissed && !isLockedRole)) return null;

  const handleVerificationComplete = (data: VerificationData) => {
    const verificationPayload = { ...data, status: 'pending' as const };
    updateUser({ verificationStatus: 'pending', idVerification: verificationPayload });
    if (user?.id) updateLocalPendingUserVerification(user.id, verificationPayload);
    setOpen(false);
    toast.success('Ghana Card details saved', {
      description: 'Watch your email — Ghana Lands Commission / NIA updates usually arrive within 24 to 48 hours.',
      duration: 8000,
    });
  };

  return (
    <>
      <Alert className={`mb-6 flex items-start gap-3 relative ${isLockedRole ? 'border-destructive/40 bg-destructive/8 pr-4' : 'border-accent/60 bg-accent/10 pr-10'}`}>
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" style={{ color: isLockedRole ? 'hsl(0 72% 51%)' : 'hsl(42 100% 40%)' }} />
        <AlertDescription className="text-foreground flex-1">
          {isLockedRole ? (
            <>
              <span className="font-semibold text-destructive">Identity verification required</span>
              {' — '}your Ghana Card has not been verified. You cannot list properties, make offers, or complete transactions until verification is complete.{' '}
            </>
          ) : (
            <>
              <span className="font-semibold">Complete Ghana Card verification</span> to unlock transactions,
              detailed parcel views, and all registry features.{' '}
            </>
          )}
          <Button
            variant="link"
            className="p-0 h-auto text-primary font-semibold underline-offset-2"
            onClick={() => setOpen(true)}
          >
            Verify now →
          </Button>
        </AlertDescription>
        {!isLockedRole && (
          <button
            type="button"
            onClick={() => { setDismissed(true); onDismiss?.(); }}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </Alert>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Ghana Card Identity Verification
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Required to unlock full access — transactions, parcel details, and registry actions.
              Your Ghana Card is only used for identity verification and is securely handled.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <GhanaCardVerification
              onVerificationComplete={handleVerificationComplete}
              userCountry={user?.country || 'GH'}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
