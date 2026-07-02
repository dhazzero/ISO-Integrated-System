"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EditIntegratedStandardModal from './edit-integrated-standard-modal';
import AddIntegratedStandardModal from './add-integrated-standard-modal';
import { Trash2, Eye } from 'lucide-react';
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

export default function IntegratedStandardTable() {
    const [records, setRecords] = useState<IntegratedStandardRecord[]>([]);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

    const load = async () => {
        try {
            const res = await fetch('/api/compliance/integrated-standards');
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch {
            // ignore errors
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Integrated Standards</CardTitle>
                    <CardDescription>
                        Cross reference of documents against ISO 9001, ISO 27001, and ISO 37001 clauses
                    </CardDescription>
                </div>
                <AddIntegratedStandardModal onSaved={load} />
            </CardHeader>
            <CardContent>
                {records.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-3">Dokumen</th>
                                <th className="text-left py-2 px-3">Rev</th>
                                <th className="text-left py-2 px-3">Tgl Berlaku</th>
                                <th className="text-left py-2 px-3">ISO 9001</th>
                                <th className="text-left py-2 px-3">ISO 27001</th>
                                <th className="text-left py-2 px-3">ISO 37001</th>
                                <th className="text-left py-2 px-3">Tindakan</th>
                            </tr>
                            </thead>
                            <tbody>
                            {records.map((r) => (
                                <tr key={r._id} className="border-b">
                                    <td className="py-2 px-3">{r.document}</td>
                                    <td className="py-2 px-3">{r.rev}</td>
                                    <td className="py-2 px-3">{r.effectiveDate}</td>
                                    <td className="py-2 px-3">{r.iso9001 || '-'}</td>
                                    <td className="py-2 px-3">{r.iso27001 || '-'}</td>
                                    <td className="py-2 px-3">{r.iso37001 || '-'}</td>
                                    <td className="py-2 px-3">
                                        <div className="flex gap-2">
                                            <EditIntegratedStandardModal record={r} onSaved={load} />
                                            {r.documentId && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch('/api/documents');
                                                            if (res.ok) {
                                                                const data = await res.json();
                                                                const doc = (data || []).find((d: any) => (d.id || d._id?.toString?.()) === r.documentId);
                                                                if (doc) {
                                                                    setSelectedDoc(doc);
                                                                    setViewOpen(true);
                                                                } else {
                                                                    alert('Dokumen tidak ditemukan.');
                                                                }
                                                            }
                                                        } catch {
                                                            // ignore
                                                        }
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={async () => {
                                                    if (!confirm('Hapus baris ini?')) return;
                                                    await fetch(`/api/compliance/integrated-standards/${r._id}`, { method: 'DELETE' });
                                                    load();
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No integrated standard records found.</p>
                )}
            </CardContent>
            <ViewDocumentModal
                isOpen={viewOpen}
                onClose={() => setViewOpen(false)}
                document={selectedDoc}
                onEdit={() => { /* open edit in documents page if needed */ }}
            />
        </Card>
    );
}
//         </div>
//     );
// }