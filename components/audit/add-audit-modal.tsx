"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AddAuditModalProps {
    onAddAudit: (audit: any) => void
    type: "scheduled" | "completed"
}

interface Option {
    _id: string;
    name: string;
}

// PASTIKAN FUNGSI INI DI-EXPORT DENGAN BENAR
export function AddAuditModal({ onAddAudit, type }: AddAuditModalProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const [standards, setStandards] = useState<Option[]>([])
    const [departments, setDepartments] = useState<Option[]>([])
    const [isLoadingOptions, setIsLoadingOptions] = useState(false)

    const initialFormData = {
        name: "", standard: "", department: "", auditType: "Internal", tujuan: "", date: "", auditor: "", scheduledTime: "",
    };
    const [formData, setFormData] = useState(initialFormData)

    useEffect(() => {
        if (open) {
            const fetchOptions = async () => {
                setIsLoadingOptions(true);
                try {
                    const [standardsRes, departmentsRes] = await Promise.all([
                        fetch('/api/settings/standards'),
                        fetch('/api/settings/departments')
                    ]);
                    if (!standardsRes.ok) throw new Error('Gagal memuat standar');
                    if (!departmentsRes.ok) throw new Error('Gagal memuat departemen');
                    setStandards(await standardsRes.json());
                    setDepartments(await departmentsRes.json());
                } catch (error) {
                    toast({ variant: "destructive", title: "Gagal Memuat Data", description: (error as Error).message })
                } finally {
                    setIsLoadingOptions(false);
                }
            };
            fetchOptions();
        } else {
            setFormData(initialFormData);
        }
    }, [open, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/audits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, status: type === "scheduled" ? "Scheduled" : "Completed", findings: 0 }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menyimpan audit.');
            }
            onAddAudit();
            toast({ title: "Sukses!", description: "Jadwal audit berhasil disimpan." });
            setOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Terjadi Kesalahan", description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Jadwalkan Audit</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
                <DialogHeader><DialogTitle>Jadwalkan Audit Baru</DialogTitle><DialogDescription>Buat jadwal audit baru dengan detail lengkap.</DialogDescription></DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="name">Nama Audit *</Label><Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="standard">Standar *</Label><Select required value={formData.standard} onValueChange={(v) => handleInputChange("standard", v)}><SelectTrigger id="standard"><SelectValue placeholder={isLoadingOptions ? "Memuat..." : "Pilih standar"} /></SelectTrigger><SelectContent>{isLoadingOptions ? <SelectItem value="loading" disabled>Memuat...</SelectItem> : standards.map((s) => <SelectItem key={s._id} value={s.name}>{s.name}</SelectItem>)}<SelectItem value="Multiple">Multiple Standards</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label htmlFor="auditType">Jenis Audit *</Label><Select required value={formData.auditType} onValueChange={(v) => handleInputChange("auditType", v)}><SelectTrigger id="auditType"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Internal">Audit Internal</SelectItem><SelectItem value="External">Audit Eksternal</SelectItem></SelectContent></Select></div>
                        {formData.auditType === 'External' && (
                            <div className="space-y-2"><Label htmlFor="tujuan">Tujuan Audit *</Label><Select required={formData.auditType === 'External'} value={formData.tujuan} onValueChange={(v) => handleInputChange("tujuan", v)}><SelectTrigger id="tujuan"><SelectValue placeholder="Pilih tujuan" /></SelectTrigger><SelectContent><SelectItem value="Initial">Initial</SelectItem><SelectItem value="Surveillance">Surveillance</SelectItem><SelectItem value="Re-certification">Re-certification</SelectItem></SelectContent></Select></div>
                        )}
                        <div className="space-y-2"><Label htmlFor="department">Departemen *</Label><Select required value={formData.department} onValueChange={(v) => handleInputChange("department", v)}><SelectTrigger id="department"><SelectValue placeholder={isLoadingOptions ? "Memuat..." : "Pilih departemen"} /></SelectTrigger><SelectContent>{isLoadingOptions ? <SelectItem value="loading" disabled>Memuat...</SelectItem> : departments.map((d) => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)}<SelectItem value="Semua Departemen">Semua Departemen</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label htmlFor="auditor">{formData.auditType === 'Internal' ? 'Auditor' : 'Lembaga Sertifikasi'} *</Label><Input id="auditor" value={formData.auditor} onChange={(e) => handleInputChange("auditor", e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="date">Tanggal Audit *</Label><Input id="date" type="date" value={formData.date} onChange={(e) => handleInputChange("date", e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="scheduledTime">Waktu *</Label><Input id="scheduledTime" type="time" value={formData.scheduledTime} onChange={(e) => handleInputChange("scheduledTime", e.target.value)} required /></div>
                    </div>
                    <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Jadwalkan Audit"}</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
