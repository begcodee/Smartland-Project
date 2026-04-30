import { useCallback, useEffect, useState } from 'react';
import { api, type LawCategory, type LawRecord, type LawStatus } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { BookOpen, Pencil, Plus, Trash2, X } from 'lucide-react';

const emptyForm = {
  code: '',
  title: '',
  summary: '',
  body: '',
  category: 'general' as LawCategory,
  effectiveFrom: '',
  status: 'draft' as LawStatus,
};

export function LawsManagement() {
  const [laws, setLaws] = useState<LawRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { laws: list } = await api.getLaws();
      setLaws(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load laws');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (law: LawRecord) => {
    setEditingId(law.id);
    setForm({
      code: law.code,
      title: law.title,
      summary: law.summary,
      body: law.body,
      category: law.category,
      effectiveFrom: law.effectiveFrom || '',
      status: law.status,
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.updateLaw(editingId, {
          code: form.code,
          title: form.title,
          summary: form.summary,
          body: form.body,
          category: form.category,
          effectiveFrom: form.effectiveFrom,
          status: form.status,
        });
        toast.success('Law updated');
      } else {
        await api.createLaw({
          code: form.code || undefined,
          title: form.title,
          summary: form.summary,
          body: form.body,
          category: form.category,
          effectiveFrom: form.effectiveFrom,
          status: form.status,
        });
        toast.success('Law created');
      }
      resetForm();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this law record?')) return;
    try {
      await api.deleteLaw(id);
      toast.success('Deleted');
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Registry laws & policy</CardTitle>
            <CardDescription>
              Create and maintain policy text shown to staff and used as reference in the prototype.
              Only admins can change records.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              {editingId ? 'Edit law' : 'New law'}
            </p>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="gap-1">
                <X className="h-4 w-4" />
                Cancel edit
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="law-code">Reference code</Label>
              <Input
                id="law-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="e.g. REG-GLC-003"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="law-title">Title</Label>
              <Input
                id="law-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Short title"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="law-summary">Summary</Label>
            <Input
              id="law-summary"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              placeholder="One-line summary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="law-body">Full text</Label>
            <Textarea
              id="law-body"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Policy details…"
              rows={5}
              className="resize-y"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v as LawCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="dispute">Dispute</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="law-effective">Effective from</Label>
              <Input
                id="law-effective"
                type="date"
                value={form.effectiveFrom}
                onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as LawStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={saving} className="gap-2">
            {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {saving ? 'Saving…' : editingId ? 'Update law' : 'Create law'}
          </Button>
        </form>

        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            {loading ? 'Loading…' : `${laws.length} record${laws.length === 1 ? '' : 's'}`}
          </h3>
          <ul className="space-y-3">
            {laws.map((law) => (
              <li
                key={law.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{law.code}</span>
                    <Badge variant={law.status === 'active' ? 'default' : 'secondary'}>{law.status}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {law.category}
                    </Badge>
                  </div>
                  <p className="font-medium text-foreground">{law.title}</p>
                  {law.summary ? (
                    <p className="text-sm text-muted-foreground">{law.summary}</p>
                  ) : null}
                  {law.body ? (
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{law.body}</p>
                  ) : null}
                  {law.effectiveFrom ? (
                    <p className="text-xs text-muted-foreground">Effective: {law.effectiveFrom}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => startEdit(law)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => remove(law.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
