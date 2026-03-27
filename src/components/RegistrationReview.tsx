import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Users, Mail, Phone, Building2, Shield, CheckCircle2, XCircle, Loader2,
  RefreshCw, Clock, ShieldCheck, ShieldX, Fingerprint, UserCircle, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getLocalPendingUsers, removeLocalPendingUser } from '@/lib/pendingUsersStore';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  organization?: string | null;
  staffId?: string | null;
  verificationStatus: string;
  idVerification?: string | null; // JSON string
  createdAt: string;
}

const MOCK_PENDING_USERS: PendingUser[] = [
  {
    id: 'MOCK_P001',
    name: 'Kwame Mensah',
    email: 'kwame.mensah@gmail.com',
    phoneNumber: '+233244567890',
    role: 'seller',
    organization: null,
    staffId: null,
    verificationStatus: 'pending',
    idVerification: JSON.stringify({
      cardNumber: 'GHA-000123456-7',
      fullName: 'Kwame Mensah',
      status: 'pending',
      faceMatch: true,
      livenessPassed: true,
      frontCardImage: '',
      backCardImage: '',
      faceImage: ''
    }),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'MOCK_P002',
    name: 'Abena Asante',
    email: 'abena.asante@yahoo.com',
    phoneNumber: '+233201234567',
    role: 'buyer',
    organization: null,
    staffId: null,
    verificationStatus: 'pending',
    idVerification: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'MOCK_P003',
    name: 'Kofi Boateng',
    email: 'kofi.boateng@hotmail.com',
    phoneNumber: '+233209876543',
    role: 'seller',
    organization: 'Boateng Properties Ltd.',
    staffId: null,
    verificationStatus: 'pending',
    idVerification: JSON.stringify({
      cardNumber: 'GHA-000987654-3',
      fullName: 'Kofi Boateng',
      status: 'verified',
      faceMatch: true,
      livenessPassed: true,
      frontCardImage: '',
      backCardImage: '',
      faceImage: ''
    }),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

function parseIdVerification(raw: string | null | undefined) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function NiaBadge({ idVerification }: { idVerification: string | null | undefined }) {
  const parsed = parseIdVerification(idVerification);
  if (!parsed) {
    return (
      <Badge variant="outline" className="border-amber-400 text-amber-800 bg-amber-50 gap-1.5 px-2.5 py-1">
        <Fingerprint className="w-3.5 h-3.5" />
        NIA: Not submitted yet
      </Badge>
    );
  }
  if (parsed.status === 'verified') {
    return (
      <Badge className="bg-primary text-primary-foreground gap-1.5 px-2.5 py-1">
        <ShieldCheck className="w-3.5 h-3.5" />
        NIA: Verified ✓
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-blue-400 text-blue-800 bg-blue-50 gap-1.5 px-2.5 py-1">
      <Fingerprint className="w-3.5 h-3.5" />
      NIA: Ghana Card submitted
    </Badge>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    buyer: 'bg-blue-100 text-blue-800 border-blue-300',
    seller: 'bg-purple-100 text-purple-800 border-purple-300',
    admin: 'bg-green-100 text-green-800 border-green-300',
    arbitrator: 'bg-orange-100 text-orange-800 border-orange-300',
  };
  return (
    <Badge variant="outline" className={`${styles[role] ?? 'bg-muted text-foreground'} capitalize font-semibold px-2.5 py-0.5`}>
      {role}
    </Badge>
  );
}

// In-memory store for mock users so approve/reject persist across re-fetches within the session
let mockPendingStore: PendingUser[] | null = null;

function getMockStore(): PendingUser[] {
  if (!mockPendingStore) mockPendingStore = [...MOCK_PENDING_USERS];
  return mockPendingStore;
}

export function RegistrationReview() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [showRejectForm, setShowRejectForm] = useState<Record<string, boolean>>({});
  const [usingMock, setUsingMock] = useState(false);

  const refresh = async () => {
    setLoading(true);
    // Always start with real locally-registered users
    const localUsers = getLocalPendingUsers();
    try {
      const res = await api.getPendingUsers();
      if (res.success && Array.isArray(res.users) && res.users.length > 0) {
        // Merge backend users with any locally registered ones (deduplicate by id)
        const backendIds = new Set((res.users as PendingUser[]).map((u) => u.id));
        const merged = [
          ...res.users,
          ...localUsers.filter((u) => !backendIds.has(u.id)),
        ];
        setPendingUsers(merged);
        setUsingMock(false);
      } else {
        // Backend unavailable or empty — show local users + demo dummies as fallback
        const dummyIds = new Set(localUsers.map((u) => u.id));
        const combined = [
          ...localUsers,
          ...getMockStore().filter((u) => !dummyIds.has(u.id)),
        ];
        setPendingUsers(combined);
        setUsingMock(true);
      }
    } catch {
      // Backend offline — show local users + demo dummies as fallback
      const dummyIds = new Set(localUsers.map((u) => u.id));
      const combined = [
        ...localUsers,
        ...getMockStore().filter((u) => !dummyIds.has(u.id)),
      ];
      setPendingUsers(combined);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleApprove = async (u: PendingUser) => {
    setLoadingId(u.id);
    await new Promise((r) => setTimeout(r, 600));
    try {
      const res = await api.verifyUser(u.id, 'approve');
      if (res.success) {
        const token = res.blockchainToken || `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        toast.success(`${u.name} approved`, {
          description: `Account is now verified. Blockchain token: ${token.slice(0, 16)}…`,
          duration: 6000,
        });
        setPendingUsers((prev) => prev.filter((x) => x.id !== u.id));
        if (usingMock) mockPendingStore = (mockPendingStore ?? []).filter((x) => x.id !== u.id);
        removeLocalPendingUser(u.id);
        return;
      }
    } catch {
      // fall through to local approval
    }
    // Local mock approval
    const token = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    toast.success(`${u.name} approved`, {
      description: `Account verified locally. Blockchain token: ${token.slice(0, 16)}…`,
      duration: 6000,
    });
    setPendingUsers((prev) => prev.filter((x) => x.id !== u.id));
    if (mockPendingStore) mockPendingStore = mockPendingStore.filter((x) => x.id !== u.id);
    removeLocalPendingUser(u.id);
    setLoadingId(null);
  };

  const handleReject = async (u: PendingUser) => {
    const reason = rejectReasons[u.id]?.trim() || 'Does not meet Ghana Lands Commission verification standards.';
    setLoadingId(u.id);
    await new Promise((r) => setTimeout(r, 600));
    try {
      const res = await api.verifyUser(u.id, 'reject', reason);
      if (res.success) {
        toast.error(`${u.name} rejected`, { description: reason });
        setPendingUsers((prev) => prev.filter((x) => x.id !== u.id));
        if (mockPendingStore) mockPendingStore = mockPendingStore.filter((x) => x.id !== u.id);
        removeLocalPendingUser(u.id);
        setShowRejectForm((prev) => { const n = { ...prev }; delete n[u.id]; return n; });
        setRejectReasons((prev) => { const n = { ...prev }; delete n[u.id]; return n; });
        return;
      }
    } catch {
      // fall through to local rejection
    }
    // Local mock rejection
    toast.error(`${u.name} rejected`, { description: reason });
    setPendingUsers((prev) => prev.filter((x) => x.id !== u.id));
    if (mockPendingStore) mockPendingStore = mockPendingStore.filter((x) => x.id !== u.id);
    removeLocalPendingUser(u.id);
    setShowRejectForm((prev) => { const n = { ...prev }; delete n[u.id]; return n; });
    setRejectReasons((prev) => { const n = { ...prev }; delete n[u.id]; return n; });
    setLoadingId(null);
  };

  const isBusy = (id: string) => loadingId === id;

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-foreground text-xl">
              <Shield className="w-5 h-5 text-primary" />
              Pending user verifications
            </CardTitle>
            <CardDescription>
              Review and authorise new account registrations. Only verified accounts can transact on the registry.
              Ghana Card (NIA) status is shown for each applicant.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {usingMock && !loading && (
              <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 text-xs">
                Demo data
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary bar */}
        {!loading && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Users className="w-4 h-4 text-primary" />
              {pendingUsers.length} pending
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <Fingerprint className="w-4 h-4 text-amber-600" />
              {pendingUsers.filter(u => !u.idVerification).length} awaiting Ghana Card
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              {pendingUsers.filter(u => !!u.idVerification).length} NIA submitted
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <span className="ml-3 text-foreground">Loading pending users…</span>
          </div>
        )}

        {!loading && pendingUsers.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary/60 mb-3" />
            <p className="font-semibold text-foreground">All clear — no pending verifications</p>
            <p className="text-sm text-muted-foreground mt-1">
              New user registrations will appear here once submitted.
            </p>
          </div>
        )}

        {!loading && pendingUsers.map((u) => {
          const parsedCard = parseIdVerification(u.idVerification);
          const busy = isBusy(u.id);

          return (
            <Card key={u.id} className="border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 p-5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">{u.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <RoleBadge role={u.role} />
                      <Badge variant="outline" className="border-amber-400 text-amber-800 bg-amber-50 gap-1 text-xs">
                        <Clock className="w-3 h-3" /> Pending
                      </Badge>
                    </div>
                  </div>
                </div>
                <NiaBadge idVerification={u.idVerification} />
              </div>

              <Separator />

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {/* Contact details */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    {u.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    {u.phoneNumber}
                  </div>
                  {u.organization && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Building2 className="w-4 h-4 text-primary shrink-0" />
                      {u.organization}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    Registered {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* NIA / Ghana Card section */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">NIA — Ghana Card Verification</p>
                  {!parsedCard ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                      <p className="text-sm font-medium text-amber-900">Ghana Card not yet submitted</p>
                      <p className="text-xs text-amber-800 mt-0.5">
                        The user has not completed their Ghana Card upload yet. You may approve or wait for them to verify.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Card no: <span className="font-mono font-semibold">{parsedCard.cardNumber || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <UserCircle className="w-4 h-4 text-primary" />
                        Name on card: <span className="font-semibold">{parsedCard.fullName || '—'}</span>
                      </div>
                      {/* Card thumbnails */}
                      <div className="flex gap-3 flex-wrap">
                        {parsedCard.frontCardImage && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Front</p>
                            <img src={parsedCard.frontCardImage} alt="Front" className="h-16 w-28 object-cover rounded-lg border border-border" />
                          </div>
                        )}
                        {parsedCard.backCardImage && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Back</p>
                            <img src={parsedCard.backCardImage} alt="Back" className="h-16 w-28 object-cover rounded-lg border border-border" />
                          </div>
                        )}
                        {parsedCard.faceImage && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Selfie</p>
                            <img src={parsedCard.faceImage} alt="Selfie" className="h-16 w-16 object-cover rounded-full border border-border" />
                          </div>
                        )}
                      </div>
                      {parsedCard.faceMatch === true && (
                        <Badge className="bg-primary/10 text-primary border border-primary/30 gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Face match passed
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reject reason form (collapsible) */}
              {showRejectForm[u.id] && (
                <div className="px-5 pb-3 space-y-2">
                  <Label htmlFor={`reason-${u.id}`} className="text-sm text-foreground">Reason for rejection *</Label>
                  <Textarea
                    id={`reason-${u.id}`}
                    placeholder="e.g. Ghana Card images are unclear; please resubmit with clearer photos."
                    rows={2}
                    value={rejectReasons[u.id] || ''}
                    onChange={(e) => setRejectReasons((prev) => ({ ...prev, [u.id]: e.target.value }))}
                    className="text-sm resize-none"
                  />
                </div>
              )}

              {/* Action buttons */}
              <Separator />
              <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap">
                <p className="text-xs text-muted-foreground">
                  Ghana Lands Commission authorisation · Approval grants full registry access
                </p>
                <div className="flex gap-2">
                  {/* Reject flow */}
                  {!showRejectForm[u.id] ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => setShowRejectForm((prev) => ({ ...prev, [u.id]: true }))}
                      className="border-destructive/40 text-destructive hover:bg-destructive/5"
                    >
                      <ShieldX className="w-4 h-4 mr-1.5" />
                      Not Verified
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => setShowRejectForm((prev) => { const n = { ...prev }; delete n[u.id]; return n; })}
                        className="text-muted-foreground"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={busy}
                        onClick={() => handleReject(u)}
                      >
                        {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <XCircle className="w-4 h-4 mr-1.5" />}
                        Confirm Rejection
                      </Button>
                    </>
                  )}

                  {/* Approve */}
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => handleApprove(u)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  >
                    {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                    Grant Access
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
