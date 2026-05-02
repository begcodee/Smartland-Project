import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Gavel, ShieldAlert, FileText, MessagesSquare } from 'lucide-react';

type CaseRow = {
  parcelId: string;
  title: string;
  status: string;
  registryClearance: string;
  redFlag?: { code?: string; message?: string; raisedAt?: string } | null;
  createdAt?: string | null;
};

function EvidenceDialog({ row, onActionComplete }: { row: CaseRow; onActionComplete: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState<any>(null);
  const [note, setNote] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [ghanaCardPin, setGhanaCardPin] = useState('');
  const [acting, setActing] = useState(false);
  const [officialReviewStarted, setOfficialReviewStarted] = useState(false);

  const loadEvidence = useCallback(async () => {
    setLoading(true);
    try {
      const ev = await api.getArbitrationEvidence(row.parcelId);
      setEvidence(ev);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load evidence');
      setEvidence(null);
    } finally {
      setLoading(false);
    }
  }, [row.parcelId]);

  useEffect(() => {
    if (!open) return;
    void loadEvidence();
  }, [open, loadEvidence]);

  const startOfficialReview = async () => {
    setActing(true);
    try {
      await api.startArbitrationReview(row.parcelId);
      setOfficialReviewStarted(true);
      toast.success('Official review started. Full case file unlocked.');
      await loadEvidence();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setActing(false);
    }
  };

  const doAction = async (action: 'dismiss' | 'permanent_lock' | 'corrective_transfer' | 'fraud_alert_blacklist') => {
    setActing(true);
    try {
      const payload: any = { action, note: note.trim() || undefined };
      if (action === 'corrective_transfer') payload.toUserId = toUserId.trim();
      if (action === 'fraud_alert_blacklist') payload.ghanaCardPin = ghanaCardPin.trim();
      await api.arbitrationAction(row.parcelId, payload);
      toast.success('Action recorded');
      setOpen(false);
      setNote('');
      setToUserId('');
      setGhanaCardPin('');
      onActionComplete();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setActing(false);
    }
  };

  const parcel = evidence?.parcel;
  const seller = evidence?.seller;
  const conversations = Array.isArray(evidence?.conversations) ? evidence.conversations : [];
  const sellerProtocols = evidence?.sellerProtocols;

  const caseIdentitySummary = useMemo(() => {
    if (!seller) return 'Seller: Unknown';
    if (!officialReviewStarted) return 'Seller: (hidden until Official Review)';
    return `Seller: ${seller.name ?? seller.id}`;
  }, [seller, officialReviewStarted]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">Open case file</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Arbitration Case — {row.parcelId}
          </DialogTitle>
          <DialogDescription>
            Neutral review. Identities are hidden until you start Official Review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-3">
            <div className="min-w-0">
              <p className="font-medium">{row.title}</p>
              <p className="text-xs font-mono text-muted-foreground">{row.parcelId}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">{row.redFlag?.code ?? 'CASE'}</Badge>
                <Badge variant="secondary">{row.status}</Badge>
                <Badge variant="secondary">{row.registryClearance}</Badge>
              </div>
            </div>
            <Button onClick={() => void startOfficialReview()} disabled={acting || officialReviewStarted}>
              {officialReviewStarted ? 'Official Review started' : 'Start Official Review'}
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading evidence…</p>
          ) : evidence ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldAlert className="h-4 w-4" />
                    Evidence summary
                  </CardTitle>
                  <CardDescription>{caseIdentitySummary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {row.redFlag?.message ? <p className="text-muted-foreground">{row.redFlag.message}</p> : null}

                  <div className="rounded-md border p-3">
                    <p className="font-medium">Documents / hashes</p>
                    <p className="text-muted-foreground">
                      Document duplicate findings: {Array.isArray(evidence.documentHashFindings) ? evidence.documentHashFindings.length : 0}
                    </p>
                    <p className="text-muted-foreground">
                      Image duplicate findings: {Array.isArray(evidence.imageHashFindings) ? evidence.imageHashFindings.length : 0}
                    </p>
                  </div>

                  <div className="rounded-md border p-3">
                    <p className="font-medium">NIA protocols (biometric)</p>
                    <p className="text-muted-foreground">
                      {sellerProtocols?.protocolA ? `Protocol A: ${sellerProtocols.protocolA.passed ? 'PASS' : 'FAIL'}` : 'Protocol A: N/A'}
                    </p>
                    <p className="text-muted-foreground">
                      {sellerProtocols?.protocolB
                        ? `Protocol B: ${sellerProtocols.protocolB.passed ? 'PASS' : sellerProtocols.protocolB.skipped ? 'SKIPPED' : 'FAIL'}`
                        : 'Protocol B: N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Legal-grade actions
                  </CardTitle>
                  <CardDescription>Record a decision with an auditable note.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                    placeholder="Decision note (e.g., what evidence was reviewed, why action was taken)…"
                  />

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="secondary" disabled={acting} onClick={() => void doAction('dismiss')}>
                      Uphold/Dismiss (clear flag)
                    </Button>
                    <Button variant="destructive" disabled={acting} onClick={() => void doAction('permanent_lock')}>
                      Permanent Lock
                    </Button>
                  </div>

                  <div className="rounded-md border p-3 space-y-2">
                    <p className="text-sm font-medium">Corrective Transfer</p>
                    <Input value={toUserId} onChange={(e) => setToUserId(e.target.value)} placeholder="Rightful owner userId" />
                    <Button disabled={acting || !toUserId.trim()} onClick={() => void doAction('corrective_transfer')}>
                      Execute corrective transfer
                    </Button>
                  </div>

                  <div className="rounded-md border p-3 space-y-2">
                    <p className="text-sm font-medium">Automatic Fraud Alert + Blacklist</p>
                    <Input value={ghanaCardPin} onChange={(e) => setGhanaCardPin(e.target.value)} placeholder="Ghana Card PIN (e.g., GHA-123...) " />
                    <Button variant="destructive" disabled={acting || !ghanaCardPin.trim()} onClick={() => void doAction('fraud_alert_blacklist')}>
                      Send fraud alert + blacklist PIN
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessagesSquare className="h-4 w-4" />
                    Communication logs
                  </CardTitle>
                  <CardDescription>Read-only chat logs linked to this parcel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No conversations found for this parcel.</p>
                  ) : (
                    conversations.map((c: any) => (
                      <div key={c.id} className="rounded-md border p-3">
                        <p className="text-xs font-mono text-muted-foreground">Conversation {c.id}</p>
                        <div className="mt-2 space-y-2">
                          {(c.messages || []).slice(-30).map((m: any) => (
                            <div key={m.id} className="text-sm">
                              <span className="font-medium">{m.sender?.name ?? m.senderId}</span>
                              <span className="text-muted-foreground"> · {new Date(m.createdAt).toLocaleString()}</span>
                              <div className="text-foreground">{m.text}</div>
                              {Array.isArray(m.attachments) && m.attachments.length > 0 ? (
                                <div className="mt-2 space-y-2">
                                  {m.attachments.map((a: any, idx: number) => (
                                    <div key={`${m.id}-att-${idx}`} className="rounded-md border p-2">
                                      {a.kind === 'audio' ? (
                                        <div className="space-y-2">
                                          <audio controls src={a.dataUrl} className="w-full" />
                                          {a.transcript ? (
                                            <div className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                                              Transcript: {a.transcript}
                                            </div>
                                          ) : null}
                                          {a.auditHash ? (
                                            <div className="text-[10px] font-mono text-muted-foreground break-all">
                                              Hash: {a.auditHash}
                                            </div>
                                          ) : null}
                                        </div>
                                      ) : a.kind === 'image' ? (
                                        <img src={a.dataUrl} alt={a.name} className="max-h-48 w-full object-cover rounded-md border" />
                                      ) : (
                                        <a href={a.dataUrl} download={a.name} className="text-xs underline text-primary break-all">
                                          {a.name}
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No evidence found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ArbitrationCaseManager() {
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getArbitrationCases();
      const list = Array.isArray((res as any).cases) ? (res as any).cases : [];
      setRows(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load cases');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground">Neutral Case Management</CardTitle>
        <CardDescription>Cases are listed by Parcel ID to preserve neutrality.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading cases…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active arbitration cases.</p>
        ) : (
          rows.map((r) => (
            <div key={r.parcelId} className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-foreground">{r.title}</p>
                <p className="text-xs font-mono text-muted-foreground">{r.parcelId}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">{r.redFlag?.code ?? 'CASE'}</Badge>
                  <Badge variant="secondary" className="text-xs">{r.status}</Badge>
                </div>
              </div>
              <EvidenceDialog row={r} onActionComplete={load} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

