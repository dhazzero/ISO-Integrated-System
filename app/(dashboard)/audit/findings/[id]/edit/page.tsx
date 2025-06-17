"use client"

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

// Definisikan tipe data
interface DepartmentOption {
    _id: string;
    name: string;
}

export default function EditFindingPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const findingId = params.id as string;

    const [formData, setFormData] = useState<any>({});
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!findingId) return;

        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [findingRes, deptsRes] = await Promise.all([
                    fetch(`/api/findings/${findingId}`),
                    fetch('/api/settings/departments')
                ]);

                if (!findingRes.ok) throw new Error("Gagal mengambil data temuan.");
                if (!deptsRes.ok) throw new Error("Gagal memuat data departemen.");

                const findingData = await findingRes.json();
                // Format tanggal untuk input type="date"
                if (findingData.dueDate) {
                    findingData.dueDate = new Date(findingData.dueDate).toISOString().split('T')[0];
                }

                setFormData(findingData);
                setDepartments(await deptsRes.json());

            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: (error as Error).message });
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [findingId, toast]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await fetch(`/api/findings/${findingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Gagal memperbarui temuan.");

            toast({ title: "Sukses!", description: "Temuan berhasil diperbarui." });
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
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/audit"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                <div><h1 className="text-3xl font-bold">Edit Temuan Audit</h1></div>
            </div>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader><CardTitle>Edit Informasi Temuan</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Audit Terkait</Label><Input value={formData.auditName || ''} readOnly /></div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="findingType">Jenis Temuan</Label><Select value={formData.findingType || ''} onValueChange={(v) => handleInputChange("findingType", v)}><SelectTrigger id="findingType"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Non-Conformity">Non-Conformity</SelectItem><SelectItem value="Observation">Observation</SelectItem><SelectItem value="Opportunity for Improvement">Opportunity for Improvement</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="severity">Tingkat Severity</Label><Select value={formData.severity || ''} onValueChange={(v) => handleInputChange("severity", v)}><SelectTrigger id="severity"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Critical">Critical</SelectItem><SelectItem value="Major">Major</SelectItem><SelectItem value="Minor">Minor</SelectItem></SelectContent></Select></div>
                        </div>

                        <div className="space-y-2"><Label htmlFor="clause">Klausul Standar</Label><Input id="clause" value={formData.clause || ''} onChange={e => handleInputChange('clause', e.target.value)} /></div>
                        <div className="space-y-2"><Label htmlFor="description">Deskripsi Temuan</Label><Textarea id="description" value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} rows={3}/></div>
                        <div className="space-y-2"><Label htmlFor="evidence">Bukti/Evidence</Label><Textarea id="evidence" value={formData.evidence || ''} onChange={e => handleInputChange('evidence', e.target.value)} rows={3}/></div>
                        <div className="space-y-2"><Label htmlFor="recommendation">Rekomendasi</Label><Textarea id="recommendation" value={formData.recommendation || ''} onChange={e => handleInputChange('recommendation', e.target.value)} rows={3}/></div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Departemen</Label><Select value={formData.department || ''} onValueChange={(v) => handleInputChange("department", v)}><SelectTrigger><SelectValue placeholder="Pilih departemen" /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label>Penanggung Jawab</Label><Input value={formData.responsiblePerson || ''} onChange={e => handleInputChange('responsiblePerson', e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Status</Label><Select value={formData.status || 'Open'} onValueChange={(v) => handleInputChange("status", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label>Target Penyelesaian</Label><Input type="date" value={formData.dueDate || ''} onChange={e => handleInputChange('dueDate', e.target.value)} /></div>
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