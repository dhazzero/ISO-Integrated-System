"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye } from "lucide-react";
import { ViewDocumentModal } from "@/components/documents/view-document-modal";

interface AddIntegratedStandardModalProps {
  onSaved: () => void;
}

interface DocumentOption { id: string; name: string; raw: any; }

interface FormState {
  document: string;
  documentId?: string;
  rev: string;
  effectiveDate: string;
  iso9001?: string;
  iso27001?: string;
  iso37001?: string;
}

const initialForm: FormState = {
  document: "",
  documentId: undefined,
  rev: "",
  effectiveDate: "",
  iso9001: "",
  iso27001: "",
  iso37001: "",
};

export default function AddIntegratedStandardModal({ onSaved }: AddIntegratedStandardModalProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [docs, setDocs] = useState<DocumentOption[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const selectedDoc = docs.find(d => d.id === form.documentId);

  useEffect(() => {
    const loadDocs = async () => {
      if (!open) return;
      try {
        const res = await fetch('/api/documents');
        if (res.ok) {
          const data = await res.json();
          const mapped = (data || []).map((d: any) => ({ id: d.id || d._id?.toString?.(), name: d.name, raw: d }));
          setDocs(mapped);
        }
      } catch {
        // ignore
      }
    };
    loadDocs();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      // keep backward compatibility: ensure 'document' has a value, use selected document name if available
      if (!payload.document && selectedDoc) payload.document = selectedDoc.name;
      const res = await fetch("/api/compliance/integrated-standards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let message = "Failed to save";
        try { const j = await res.json(); message = j?.message || message; } catch {}
        throw new Error(message);
      }
      onSaved();
      setForm(initialForm);
      setOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Integrated Standard</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Dokumen</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select value={form.documentId} onValueChange={(v) => {
                  const doc = docs.find(d => d.id === v);
                  setForm({ ...form, documentId: v, document: doc?.name || '' });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    {docs.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" size="icon" disabled={!selectedDoc} onClick={() => setViewOpen(true)}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            {/* Keep a read-only field to show selected doc name, ensures backward compatibility */}
            <Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} placeholder="Nama dokumen" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rev">Rev</Label>
            <Input id="rev" value={form.rev} onChange={(e) => setForm({ ...form, rev: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="effectiveDate">Tgl Berlaku</Label>
            <Input id="effectiveDate" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iso9001">ISO 9001</Label>
            <Input id="iso9001" value={form.iso9001} onChange={(e) => setForm({ ...form, iso9001: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iso27001">ISO 27001</Label>
            <Input id="iso27001" value={form.iso27001} onChange={(e) => setForm({ ...form, iso27001: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iso37001">ISO 37001</Label>
            <Input id="iso37001" value={form.iso37001} onChange={(e) => setForm({ ...form, iso37001: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
        <ViewDocumentModal
          isOpen={viewOpen}
          onClose={() => setViewOpen(false)}
          document={selectedDoc ? selectedDoc.raw : null}
          onEdit={() => { /* no-op from add modal */ }}
        />
      </DialogContent>
    </Dialog>
  );
}
