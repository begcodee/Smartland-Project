import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Fingerprint, RefreshCw, Shield, ScanFace, IdCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

type NiaUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  idVerification?: string | Record<string, unknown> | null;
  niaStatus?: string;
  niaReferenceId?: string | null;
};

function parseIdVerification(raw: unknown) {
  if (raw == null) return null;
  if (typeof raw === 'object') return raw as Record<string, unknown>;
  try {
    return JSON.parse(String(raw)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default function NiaDashboard() {
  const [users, setUsers] = useState<NiaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [empBusy, setEmpBusy] = useState(false);
  const [empStaffId, setEmpStaffId] = useState('');
  const [empCardNo, setEmpCardNo] = useState('');
  const [empName, setEmpName] = useState('');
  const [empBiometric, setEmpBiometric] = useState('');
  const [empResult, setEmpResult] = useState<{ decision?: string; attempt?: { flaggedReason?: string } } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.niaListUsers();
      setUsers(res.users as unknown as NiaUser[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load NIA queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pending = useMemo(
    () => users.filter((u) => (u.niaStatus ?? 'pending') !== 'verified' && (u.niaStatus ?? 'pending') !== 'rejected'),
    [users]
  );

  const decide = async (userId: string, action: 'verify' | 'reject') => {
    setBusyId(userId);
    try {
      await api.niaDecision(userId, action);
      toast.success(action === 'verify' ? 'NIA verified' : 'NIA rejected');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update decision');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout
      role="nia"
      title="NIA Dashboard"
      subtitle="National Identification Authority — Ghana Card verification queue"
    >
      <div className="space-y-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-xl">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4" /> User verification
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Employee verification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-primary" />
                    Verification queue
                  </CardTitle>
                  <CardDescription>
                    Verify users against the NIA database, then Lands Commission can proceed with parcel document checks.
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => void load()} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{pending.length} pending</Badge>
                  <Badge variant="outline">{users.length - pending.length} decided</Badge>
                </div>
                <Separator />

                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : pending.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users awaiting NIA verification right now.</p>
                ) : (
                  <div className="space-y-3">
                    {pending.map((u) => {
                      const parsed = parseIdVerification(u.idVerification);
                      const gh = (parsed?.ghanaCard as Record<string, unknown> | undefined) ?? parsed;
                      const cardNumber =
                        (gh?.cardNumber as string) ||
                        (parsed?.cardNumber as string | undefined);
                      const fullNameOnCard =
                        (gh?.fullName as string) ||
                        (parsed?.fullName as string | undefined);
                      const selfieSource = parsed?.selfieSource as string | undefined;
                      const sp = parsed?.smartlandProtocols as Record<string, unknown> | undefined;
                      const pa = sp?.protocolA as { passed?: boolean } | undefined;
                      const pb = sp?.protocolB as { passed?: boolean | null; skipped?: boolean; similarity?: number } | undefined;
                      return (
                        <div key={u.id} className="rounded-xl border border-border p-4 bg-card space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.email} · {u.phoneNumber}</p>
                              <p className="text-xs text-muted-foreground">Role: {u.role}</p>
                            </div>
                            <Badge variant="outline" className="font-mono text-xs">
                              {cardNumber ?? 'No card number'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={pa?.passed ? 'default' : 'secondary'} className="text-xs">
                              Protocol A {pa?.passed ? 'OK' : '—'}
                            </Badge>
                            <Badge variant={pb?.skipped ? 'outline' : pb?.passed ? 'default' : 'destructive'} className="text-xs">
                              Protocol B {pb?.skipped ? 'manual' : pb?.passed ? `${pb.similarity ?? 'OK'}` : 'fail'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Name on card: <span className="text-foreground font-medium">{fullNameOnCard ?? '—'}</span>
                            {selfieSource ? (
                              <span className="ml-2">Selfie: <span className="text-foreground font-medium">{selfieSource}</span></span>
                            ) : null}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="flex-1"
                              onClick={() => void decide(u.id, 'verify')}
                              disabled={busyId === u.id}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Verify
                            </Button>
                            <Button
                              className="flex-1"
                              variant="destructive"
                              onClick={() => void decide(u.id, 'reject')}
                              disabled={busyId === u.id}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  NIA employee verification (demo)
                </CardTitle>
                <CardDescription>
                  This follows the conceptual NIA procedure (ID → card auth → biometric match → HR validation → decision), using demo data (no real databases).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Alert className="border-border bg-muted/40">
                  <AlertDescription className="text-sm text-foreground">
                    Demo biometric samples you can use:
                    <span className="block font-mono text-xs mt-2">
                      - Ama: demo-fingerprint-ama (staffId NIA-STAFF-0001)<br/>
                      - Kojo: demo-fingerprint-kojo (staffId NIA-STAFF-0002)
                    </span>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><IdCard className="h-4 w-4 text-primary" /> Staff ID (internal)</Label>
                    <Input value={empStaffId} onChange={(e) => setEmpStaffId(e.target.value)} placeholder="e.g. NIA-STAFF-0001" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Fingerprint className="h-4 w-4 text-primary" /> Ghana Card number</Label>
                    <Input value={empCardNo} onChange={(e) => setEmpCardNo(e.target.value)} placeholder="GHA-123456789-1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Full name on card (optional)</Label>
                    <Input value={empName} onChange={(e) => setEmpName(e.target.value)} placeholder="Ama Serwaa Owusu" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><ScanFace className="h-4 w-4 text-primary" /> Biometric sample (demo)</Label>
                    <Input value={empBiometric} onChange={(e) => setEmpBiometric(e.target.value)} placeholder="demo-fingerprint-ama" />
                  </div>
                </div>

                <Button
                  disabled={empBusy || !empStaffId.trim() || !empCardNo.trim()}
                  onClick={async () => {
                    setEmpBusy(true);
                    setEmpResult(null);
                    try {
                      const data = await api.niaVerifyEmployee({
                        staffId: empStaffId,
                        ghanaCardNumber: empCardNo,
                        fullNameOnCard: empName,
                        biometricSample: empBiometric
                      });
                      setEmpResult(data);
                      toast.success(`Decision: ${data.decision}`);
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Failed');
                    } finally {
                      setEmpBusy(false);
                    }
                  }}
                  className="w-full"
                >
                  {empBusy ? 'Verifying…' : 'Run employee verification (Steps 1–5)'}
                </Button>

                {empResult && (
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <p className="text-sm font-semibold text-foreground">Result</p>
                    <p className="text-sm text-muted-foreground">
                      Decision: <span className="font-medium text-foreground">{(empResult as any).decision}</span>
                    </p>
                    {(empResult as any).attempt?.flaggedReason && (
                      <p className="text-sm text-muted-foreground">
                        Reason: <span className="font-medium text-foreground">{(empResult as any).attempt.flaggedReason}</span>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

