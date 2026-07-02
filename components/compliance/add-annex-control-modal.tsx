"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AddAnnexControlModalProps {
    onAdded: () => void;
}

// FIX: Define the initial state outside the component for reusability.
const initialFormData = {
    control_id: "",
    title: "",
    requirement: "",
    pic: "",
    status: "Belum Diterapkan",
    effectiveness: "Sedang",
    compliance: "",
};

export default function AddAnnexControlModal({ onAdded }: AddAnnexControlModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // FIX: Corrected the initial state. Removed the duplicate 'effectiveness' key.
    const [formData, setFormData] = useState(initialFormData);

    const statuses = ["Belum Diterapkan", "Dalam Tinjauan", "Sebagian", "Diterapkan"]
    const effectivenessOptions = ["Tinggi", "Sedang", "Rendah"]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch("/api/compliance/annex-a", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    category: "Annex A",
                    Standard: "ISO27001",
                    standardName: "ISO 27001",
                    version: "2022",
                    framework: "ISO",
                }),
            });

            if (!res.ok) {
                // IMPROVEMENT: Try to parse error message from the server response.
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.message || "Gagal menyimpan kontrol");
            }

            toast({ title: "Sukses", description: "Kontrol berhasil ditambahkan." });
            setOpen(false);
            // IMPROVEMENT: Reset form to its initial state consistently.
            setFormData(initialFormData);
            onAdded();
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Annex
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Annex A Control</DialogTitle>
                </DialogHeader>
                {/* FIX: The <form> should wrap the DialogFooter as well. */}
                <form onSubmit={handleSubmit}>
                    {/* IMPROVEMENT: Wrapped form fields in a div for consistent spacing */}
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="control_id">ID Kontrol</Label>
                            {/* IMPROVEMENT: Added placeholder text for better UX */}
                            <Input id="control_id" placeholder="Contoh: A.5.1" value={formData.control_id} onChange={(e) => setFormData({ ...formData, control_id: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Judul Kontrol</Label>
                            <Textarea id="title" placeholder="Masukkan judul atau keterangan singkat..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} rows={2} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="requirement">Requirement</Label>
                            <Textarea id="requirement" placeholder="Jelaskan requirement untuk kontrol ini..." value={formData.requirement} onChange={(e) => setFormData({ ...formData, requirement: e.target.value })} rows={3} />
                        </div>
                        {/* FIX: Corrected the grid layout. This is now one flat grid. */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pic">PIC</Label>
                                <Input id="pic" placeholder="Nama PIC" value={formData.pic} onChange={(e) => setFormData({ ...formData, pic: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                {/* FIX: Changed Input to Select for 'effectiveness'. */}
                                <Label htmlFor="effectiveness">Efektivitas</Label>
                                <Select value={formData.effectiveness} onValueChange={(v) => setFormData({ ...formData, effectiveness: v })}>
                                    <SelectTrigger><SelectValue placeholder="Pilih efektivitas" /></SelectTrigger>
                                    <SelectContent>
                                        {effectivenessOptions.map((opt) => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="compliance">Kepatuhan (%)</Label>
                                <Input id="compliance" type="number" placeholder="0-100" value={formData.compliance} onChange={(e) => setFormData({ ...formData, compliance: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    {/* FIX: Moved DialogFooter inside the form but outside the main content div. */}
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}