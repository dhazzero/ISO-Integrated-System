"use client"

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface AuditData {
  name: string
  standard: string | string[]
  department: string
  auditType: string
  tujuan?: string
  date: string
  auditor: string
  scheduledTime?: string
}

interface Option {
  _id: string
  name: string
}

export default function EditAuditPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const auditId = params.id as string;

    const [formData, setFormData] = useState<Partial<AuditData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [standards, setStandards] = useState<Option[]>([]);
    const [departments, setDepartments] = useState<Option[]>([]);
    const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    useEffect(() => {
        if (!auditId) return;
        const fetchData = async () => {
            setIsLoading(true);
            setIsLoadingOptions(true);
            try {
                const [auditRes, sRes, dRes] = await Promise.all([
                    fetch(`/api/audits/${auditId}`),
                    fetch('/api/settings/standards'),
                    fetch('/api/settings/departments'),
                ]);
                if (!auditRes.ok) throw new Error('Gagal mengambil data audit.');
                if (!sRes.ok) throw new Error('Gagal memuat standar');
                if (!dRes.ok) throw new Error('Gagal memuat departemen');

                const auditData = await auditRes.json();
                auditData.date = new Date(auditData.date).toISOString().split('T')[0];
                setFormData(auditData);
                setSelectedStandards(Array.isArray(auditData.standard) ? auditData.standard : auditData.standard ? [auditData.standard] : []);

                setStandards(await sRes.json());
                setDepartments(await dRes.json());
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
            } finally {
                setIsLoading(false);
                setIsLoadingOptions(false);
            }
        };
        fetchData();
    }, [auditId, toast]);

    const handleInputChange = (field: keyof AuditData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = { ...formData, standard: selectedStandards };
            const response = await fetch(`/api/audits/${auditId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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
                            <div className="space-y-2">
                                <Label>Standar *</Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                                    {isLoadingOptions ? (
                                        <p className="text-sm text-muted-foreground">Memuat standar...</p>
                                    ) : standards.length > 0 ? (
                                        standards.map((s) => (
                                            <div key={s._id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`std-${s._id}`}
                                                    checked={selectedStandards.includes(s.name)}
                                                    onCheckedChange={(checked) =>
                                                        setSelectedStandards((prev) =>
                                                            checked ? [...prev, s.name] : prev.filter((name) => name !== s.name)
                                                        )
                                                    }
                                                />
                                                <Label htmlFor={`std-${s._id}`}>{s.name}</Label>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Tidak ada standar yang ditemukan. Tambahkan di menu Pengaturan.</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2"><Label>Jenis Audit</Label><Select value={formData.auditType} onValueChange={(v) => handleInputChange("auditType", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Internal">Internal</SelectItem><SelectItem value="External">Eksternal</SelectItem></SelectContent></Select></div>
                            {formData.auditType === 'External' && (
                                <div className="space-y-2">
                                    <Label>Tujuan</Label>
                                    <Input value={formData.tujuan || ''} onChange={e => handleInputChange('tujuan', e.target.value)} />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>{formData.auditType === 'Internal' ? 'Departemen' : 'Lembaga Sertifikasi'}</Label>
                                <Select required value={formData.department || ''} onValueChange={v => handleInputChange('department', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingOptions ? 'Memuat...' : 'Pilih departemen'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingOptions ? (
                                            <SelectItem value="loading" disabled>Memuat...</SelectItem>
                                        ) : (
                                            departments.map(d => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)
                                        )}
                                        <SelectItem value="Semua Departemen">Semua Departemen</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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