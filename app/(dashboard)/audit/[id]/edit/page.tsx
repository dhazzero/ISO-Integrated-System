"use client"

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface AuditData { name: string; standard: string; department: string; auditType: string; tujuan?: string; date: string; auditor: string; scheduledTime?: string; }

export default function EditAuditPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const auditId = params.id as string;

    const [formData, setFormData] = useState<Partial<AuditData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!auditId) return;
        const fetchAudit = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/audits/${auditId}`);
                if (!res.ok) throw new Error("Gagal mengambil data audit.");
                const data = await res.json();
                data.date = new Date(data.date).toISOString().split('T')[0];
                setFormData(data);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: (error as Error).message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchAudit();
    }, [auditId, toast]);

    const handleInputChange = (field: keyof AuditData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await fetch(`/api/audits/${auditId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Gagal memperbarui audit.");
            toast({ title: "Sukses!", description: "Audit berhasil diperbarui." });
            router.push(`/audit`);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="container p-6 text-center">Memuat form edit...</div>;

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-4 mb-6"><Link href="/audit"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><div><h1 className="text-3xl font-bold">Edit Audit</h1></div></div>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader><CardTitle>Edit Informasi Audit</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Nama Audit</Label><Input value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Standar</Label><Input value={formData.standard || ''} onChange={e => handleInputChange('standard', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Jenis Audit</Label><Select value={formData.auditType} onValueChange={(v) => handleInputChange("auditType", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Internal">Internal</SelectItem><SelectItem value="External">Eksternal</SelectItem></SelectContent></Select></div>
                            {formData.auditType === 'External' && <div className="space-y-2"><Label>Tujuan</Label><Input value={formData.tujuan || ''} onChange={e => handleInputChange('tujuan', e.target.value)} /></div>}
                            <div className="space-y-2"><Label>{formData.auditType === 'Internal' ? 'Departemen' : 'Lembaga'}</Label><Input value={formData.department || ''} onChange={e => handleInputChange('department', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Auditor</Label><Input value={formData.auditor || ''} onChange={e => handleInputChange('auditor', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Tanggal</Label><Input type="date" value={formData.date || ''} onChange={e => handleInputChange('date', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Waktu</Label><Input type="time" value={formData.scheduledTime || ''} onChange={e => handleInputChange('scheduledTime', e.target.value)} /></div>
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-end mt-6">
                    <Button type="submit" disabled={isSaving}>{isSaving ? 'Menyimpan...' : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}</Button>
                </div>
            </form>
        </div>
    );
}