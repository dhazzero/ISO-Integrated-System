"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewDocumentModal } from '@/components/documents/view-document-modal';

interface IntegratedStandardRecord {
    _id: string;
    document: string;
    documentId?: string;
    rev: string;
    effectiveDate: string;
    iso9001?: string;
    iso27001?: string;
    iso37001?: string;
}

interface DocumentOption { id: string; name: string; raw: any; }

export default function EditIntegratedStandardModal({
                                                        record,
                                                        onSaved,
                                                    }: {
    record: IntegratedStandardRecord;
    onSaved: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<IntegratedStandardRecord>(record);
    const [docs, setDocs] = useState<DocumentOption[]>([]);
    const [viewOpen, setViewOpen] = useState(false);

    useEffect(() => {
        setForm(record);
    }, [record]);

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
        try {
            const res = await fetch(`/api/compliance/integrated-standards/${record._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                onSaved();
                setOpen(false);
            }
        } catch {
            // ignore
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Record</DialogTitle>
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
                            <Button type="button" variant="outline" size="icon" disabled={!form.documentId} onClick={() => setViewOpen(true)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                        </div>
                        <Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} placeholder="Nama dokumen" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rev">Rev</Label>
                        <Input id="rev" value={form.rev} onChange={(e) => setForm({ ...form, rev: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="effectiveDate">Tgl Berlaku</Label>
                        <Input
                            id="effectiveDate"
                            value={form.effectiveDate}
                            onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="iso9001">ISO 9001</Label>
                        <Input
                            id="iso9001"
                            value={form.iso9001 || ''}
                            onChange={(e) => setForm({ ...form, iso9001: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="iso27001">ISO 27001</Label>
                        <Input
                            id="iso27001"
                            value={form.iso27001 || ''}
                            onChange={(e) => setForm({ ...form, iso27001: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="iso37001">ISO 37001</Label>
                        <Input
                            id="iso37001"
                            value={form.iso37001 || ''}
                            onChange={(e) => setForm({ ...form, iso37001: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
                <ViewDocumentModal
                    isOpen={viewOpen}
                    onClose={() => setViewOpen(false)}
                    document={docs.find(d => d.id === form.documentId)?.raw}
                    onEdit={() => { /* open edit elsewhere if needed */ }}
                />
            </DialogContent>
        </Dialog>
    );
}