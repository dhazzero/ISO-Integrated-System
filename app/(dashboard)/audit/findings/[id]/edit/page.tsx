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
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            setIsLoadingDepartments(true);
            try {
                const response = await fetch('/api/settings/departments');
                if (!response.ok) throw new Error('Gagal memuat data departemen.');
                setDepartments(await response.json());
            } catch (error) {
                toast({ variant: "destructive", title: "Gagal Memuat Departemen", description: (error as Error).message });
            } finally {
                setIsLoadingDepartments(false);
            }
        };
        fetchDepartments();
    }, [toast]);

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
            router.push(`/audit/findings/${findingId}`);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="container p-6 text-center">Memuat form edit...</div>;

    const isOFI = formData.findingType === "Opportunity for Improvement";

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href={`/audit/findings/${findingId}`}><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                <div><h1 className="text-3xl font-bold">Edit Temuan Audit</h1></div>
            </div>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader><CardTitle>Edit Informasi Temuan</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Jenis Temuan *</Label>
                                <Select required value={formData.findingType || ''} onValueChange={v => handleInputChange("findingType", v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Non-Conformity">Non-Conformity</SelectItem>
                                        <SelectItem value="Observation">Observation</SelectItem>
                                        <SelectItem value="Opportunity for Improvement">Opportunity for Improvement</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {!isOFI && (
                                <div className="space-y-2">
                                    <Label>Tingkat Severity *</Label>
                                    <Select required value={formData.severity || ''} onValueChange={(v) => handleInputChange("severity", v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih tingkat" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Critical">Critical</SelectItem>
                                            <SelectItem value="Major">Major</SelectItem>
                                            <SelectItem value="Minor">Minor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Klausul Standar *</Label>
                                <Input value={formData.clause || ''} onChange={e => handleInputChange("clause", e.target.value)} required placeholder="Contoh: 7.1.5" />
                            </div>
                        </div>

                        <div className="space-y-2"><Label>Deskripsi Temuan *</Label><Textarea value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} required rows={3} /></div>
                        
                        {!isOFI && (
                            <>
                                <div className="space-y-2"><Label>Bukti/Evidence</Label><Textarea value={formData.evidence || ''} onChange={e => handleInputChange('evidence', e.target.value)} rows={3} /></div>
                                <div className="space-y-2"><Label>Rekomendasi</Label><Textarea value={formData.recommendation || ''} onChange={e => handleInputChange('recommendation', e.target.value)} rows={3} /></div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Departemen</Label>
                                        <Select value={formData.department || ''} onValueChange={(v) => handleInputChange("department", v)}>
                                            <SelectTrigger><SelectValue placeholder={isLoadingDepartments ? "Memuat..." : "Pilih departemen"} /></SelectTrigger>
                                            <SelectContent>
                                                {isLoadingDepartments ? (
                                                    <SelectItem value="loading" disabled>Memuat...</SelectItem>
                                                ) : (
                                                    departments.map((d) => (
                                                        <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Penanggung Jawab</Label>
                                        <Input value={formData.responsiblePerson || ''} onChange={e => handleInputChange('responsiblePerson', e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={formData.status || ''} onValueChange={(v) => handleInputChange("status", v)}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Open">Open</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Target Penyelesaian</Label>
                                        <Input type="date" value={formData.dueDate || ''} onChange={(e) => handleInputChange("dueDate", e.target.value)} />
                                    </div>
                                </div>
                            </>
                        )}

                    </CardContent>
                </Card>
                <div className="flex justify-end mt-6"><Button type="submit" disabled={isSaving}>{isSaving ? 'Menyimpan...' : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}</Button></div>
            </form>
        </div>
    );
}