import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { BookMarked, Loader2, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'sonner';

type RuleEntry = {
  role?: string;
  narrative?: string;
  allowed?: string[];
  requiredForAutomatedSettlement?: string[];
  requiredForCheckout?: string[];
  blockingRules?: string[];
  obligations?: string[];
};

export function VerificationRulesPanel() {
  const [thesis, setThesis] = useState<string | null>(null);
  const [rules, setRules] = useState<Record<string, RuleEntry> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getVerificationDashboardRules();
      setThesis(typeof res.thesis === 'string' ? res.thesis : null);
      setRules((res.rules as Record<string, RuleEntry>) ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load dashboard rules');
      setRules(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const renderList = (label: string, items?: string[]) => {
    if (!items?.length) return null;
    return (
      <div className="mt-3 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <ul className="list-disc pl-5 text-sm text-foreground space-y-1">
          {items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-primary" />
            Verification & dashboard rules
          </CardTitle>
          <CardDescription>
            Live rule matrix from <span className="font-mono text-xs">GET /api/verify/dashboard-rules</span> — NIA IVS
            simulation, Lands Commission gates, and settlement requirements.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !rules ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading rule matrix…
          </div>
        ) : null}

        {thesis ? (
          <Alert className="border-primary/25 bg-primary/5">
            <BookMarked className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground text-sm">{thesis}</AlertDescription>
          </Alert>
        ) : null}

        {rules && Object.keys(rules).length > 0 ? (
          <Accordion type="multiple" className="w-full border border-border rounded-lg px-2">
            {Object.entries(rules).map(([key, rule]) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-left text-foreground hover:no-underline [&>svg]:shrink-0">
                  <div className="flex flex-col items-start gap-0.5 pr-2">
                    <span className="font-medium capitalize">{rule.role ?? key}</span>
                    {rule.narrative ? (
                      <span className="text-xs font-normal text-muted-foreground line-clamp-2">{rule.narrative}</span>
                    ) : null}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 space-y-2">
                  {rule.narrative ? <p className="text-foreground">{rule.narrative}</p> : null}
                  {renderList('Allowed / endpoints', rule.allowed)}
                  {renderList('Required for automated settlement', rule.requiredForAutomatedSettlement)}
                  {renderList('Required for checkout', rule.requiredForCheckout)}
                  {renderList('Blocking rules', rule.blockingRules)}
                  {renderList('Obligations', rule.obligations)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : !loading ? (
          <p className="text-sm text-muted-foreground">No rules returned. Is the API running?</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
