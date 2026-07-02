"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Record {
    document: string;
    rev: string;
    effectiveDate: string;
    iso9001?: string;
    iso27001?: string;
    iso37001?: string;
}

export default function IntegratedStandardTable() {
    const [records, setRecords] = useState<Record[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/compliance/integrated-standards');
                if (res.ok) {
                    const data = await res.json();
                    setRecords(data);
                }
            } catch {
                // ignore errors
            }
        }
        load();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Integrated Standards</CardTitle>
                <CardDescription>
                    Cross reference of documents against ISO 9001, ISO 27001, and ISO 37001 clauses
                </CardDescription>
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
                            </tr>
                            </thead>
                            <tbody>
                            {records.map((r, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="py-2 px-3">{r.document}</td>
                                    <td className="py-2 px-3">{r.rev}</td>
                                    <td className="py-2 px-3">{r.effectiveDate}</td>
                                    <td className="py-2 px-3">{r.iso9001 || '-'}</td>
                                    <td className="py-2 px-3">{r.iso27001 || '-'}</td>
                                    <td className="py-2 px-3">{r.iso37001 || '-'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No integrated standard records found.</p>
                )}
            </CardContent>
        </Card>
    );
}
