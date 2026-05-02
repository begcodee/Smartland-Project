import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Clock, XCircle } from 'lucide-react';
import { useAuth, ROLE_DASHBOARD } from '@/contexts/AuthContext';
import { GhanaCardVerification, type VerificationData } from '@/components/GhanaCardVerification';

export default function VerificationStatusPage() {
  const { user, updateUser } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  // State-aware router logic (DB-driven via /auth/me; local fallback also persists).
  const nia = user.niaStatus ?? null;
  const lands = user.verificationStatus;

  // SUCCESS = NIA verified + Lands Commission verified.
  if (nia === 'verified' && lands === 'verified') {
    return <Navigate to={ROLE_DASHBOARD[user.role]} replace />;
  }

  // FAILED = NIA rejected or Lands Commission rejected.
  if (nia === 'rejected' || lands === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Verification failed
            </CardTitle>
            <CardDescription>
              Your verification could not be completed. If you believe this is an error, contact support or request a manual review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant="secondary">Status: Rejected</Badge>
            <Button variant="outline" onClick={() => window.location.href = ROLE_DASHBOARD[user.role]}>
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PENDING = submitted to NIA or awaiting Lands Commission approval.
  const underReview =
    nia === 'pending' || (nia === 'verified' && lands === 'pending');

  if (underReview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Under review
            </CardTitle>
            <CardDescription>
              Your submission was received. You will be notified of your verification status within <strong>24–48 hours</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>NIA status: {nia ?? 'not submitted'} · Lands Commission: {lands}</span>
            </div>
            <Badge variant="secondary">Read-only</Badge>
            <p className="text-xs text-muted-foreground">
              Transactions stay blocked until Ghana Lands Commission and (where applicable) NIA complete review. You can sign out and sign back in anytime — your submission stays on file.
            </p>
            <Button onClick={() => (window.location.href = ROLE_DASHBOARD[user.role])}>
              Continue to dashboard (browsing mode)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // NULL / NOT SUBMITTED = show upload/verification flow (but prevent re-submit if already saved).
  const alreadySubmitted = !!user.idVerification;

  const handleVerificationComplete = (data: VerificationData) => {
    const verificationPayload = { ...data, status: 'pending' as const };
    updateUser({ verificationStatus: 'pending', idVerification: verificationPayload, niaStatus: 'pending' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Ghana Card verification
          </CardTitle>
          <CardDescription>
            Complete Ghana Card verification to unlock transactions. If you already submitted, you will see “Under review”.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alreadySubmitted ? (
            <div className="space-y-3">
              <Badge variant="secondary">Already submitted</Badge>
              <p className="text-sm text-muted-foreground">
                Your verification is already on file. Refreshing won’t restart it.
              </p>
              <Button onClick={() => window.location.href = "/verification-status"}>View status</Button>
            </div>
          ) : (
            <GhanaCardVerification onVerificationComplete={handleVerificationComplete} userCountry={user.country || 'GH'} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

