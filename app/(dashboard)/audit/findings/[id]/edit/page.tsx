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

export default function EditFindingPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const findingId = params.id as string;

    const [formData, setFormData] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!findingId) return;
        const fetchFinding = async () => {
            try {
                const res = await fetch(`/api/findings/${findingId}`);
                if (!res.ok) throw new Error("Gagal mengambil data temuan.");
                const data = await res.json();
                if (data.dueDate) data.dueDate = new Date(data.dueDate).toISOString().split('T')[0];
                setFormData(data);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: (error as Error).message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchFinding();
    }, [findingId, toast]);

    const handleInputChange = (field: string, value: string) => { setFormData(prev => ({ ...prev, [field]: value })); };

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
            <div className="flex items-center space-x-4 mb-6"><Link href="/audit"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><div><h1 className="text-3xl font-bold">Edit Temuan Audit</h1></div></div>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader><CardTitle>Edit Informasi Temuan</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Deskripsi</Label><Textarea value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Bukti</Label><Textarea value={formData.evidence || ''} onChange={e => handleInputChange('evidence', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Rekomendasi</Label><Textarea value={formData.recommendation || ''} onChange={e => handleInputChange('recommendation', e.target.value)} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Penanggung Jawab</Label><Input value={formData.responsiblePerson || ''} onChange={e => handleInputChange('responsiblePerson', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Status</Label><Select value={formData.status || ''} onValueChange={(v) => handleInputChange("status", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select></div>
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-end mt-6"><Button type="submit" disabled={isSaving}>{isSaving ? 'Menyimpan...' : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}</Button></div>
            </form>
        </div>
    );
}