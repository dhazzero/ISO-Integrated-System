"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AddOjkReportModalProps {
    onSaved: () => void;
}

export default function AddOjkReportModal({ onSaved }: AddOjkReportModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const statuses = [
        "Belum Ditinjau",
        "Dalam Tinjauan",
        "Dalam Proses",
        "Sudah Dilaporkan",
    ];
    const effectivenessOptions = ["Tinggi", "Sedang", "Rendah"];

    const initialForm = {
        Bulan: "",
        Jenis_Laporan: "",
        Periode: "",
        DueDate: "",
        Pengiriman: "",
        Regulasi_acuan: "",
        Status: statuses[0],
        Kepatuhan: "",
        PIC_Name: "",
        PIC_Email: "",
        Recurring: false,
        Recurring_Periode: "Tahunan",
    };

    const [formData, setFormData] = useState(initialForm);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const fd = new FormData();
            fd.append("Bulan", formData.Bulan);
            fd.append("Jenis_Laporan", formData.Jenis_Laporan);
            fd.append("Periode", formData.Periode);
            fd.append("DueDate", formData.DueDate);
            fd.append("Pengiriman", formData.Pengiriman);
            fd.append("Regulasi_acuan", formData.Regulasi_acuan);
            fd.append("Status", formData.Status);
            fd.append("Kepatuhan", formData.Kepatuhan);
            if (formData.PIC_Name) fd.append("PIC_Name", formData.PIC_Name);
            if (formData.PIC_Email) fd.append("PIC_Email", formData.PIC_Email);
            fd.append("Recurring", formData.Recurring.toString());
            if (formData.Recurring) fd.append("Recurring_Periode", formData.Recurring_Periode);
            if (file) {
                fd.append("file", file);
            }

            const res = await fetch("/api/compliance/ojk-reports", {
                method: "POST",
                body: fd,
            });
            if (!res.ok) throw new Error("Failed to save report");
            setFormData(initialForm);
            setFile(null);
            if (preview) {
                URL.revokeObjectURL(preview);
                setPreview(null);
            }
            setOpen(false);
            onSaved();
            toast({ title: "Sukses", description: "Laporan OJK berhasil ditambahkan." });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Gagal menambah laporan",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Laporan
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Laporan OJK</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="Bulan">Bulan</Label>
                        <Input
                            id="Bulan"
                            value={formData.Bulan}
                            onChange={(e) => setFormData({ ...formData, Bulan: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="Jenis_Laporan">Jenis Laporan</Label>
                        <Input
                            id="Jenis_Laporan"
                            value={formData.Jenis_Laporan}
                            onChange={(e) => setFormData({ ...formData, Jenis_Laporan: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="Periode">Periode</Label>
                        <Input
                            id="Periode"
                            value={formData.Periode}
                            onChange={(e) => setFormData({ ...formData, Periode: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="DueDate">Due Date</Label>
                        <Input
                            id="DueDate"
                            type="date"
                            value={formData.DueDate}
                            onChange={(e) => setFormData({ ...formData, DueDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="Pengiriman">Pengiriman</Label>
                        <Input
                            id="Pengiriman"
                            value={formData.Pengiriman}
                            onChange={(e) => setFormData({ ...formData, Pengiriman: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="Regulasi_acuan">Regulasi Acuan</Label>
                        <Input
                            id="Regulasi_acuan"
                            value={formData.Regulasi_acuan}
                            onChange={(e) => setFormData({ ...formData, Regulasi_acuan: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="Status">Status</Label>
                        <Select
                            value={formData.Status}
                            onValueChange={(value) => setFormData({ ...formData, Status: value })}
                        >
                            <SelectTrigger id="Status">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="Kepatuhan">Kepatuhan (%)</Label>
                        <Input
                            id="Kepatuhan"
                            value={formData.Kepatuhan}
                            onChange={(e) => setFormData({ ...formData, Kepatuhan: e.target.value })}
                        />
                    </div>
                    <Separator className="my-2" />
                    <p className="text-xs text-muted-foreground">PIC Notifikasi (opsional — kosongkan untuk pakai PIC default dari Settings)</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="PIC_Name">Nama PIC</Label>
                            <Input
                                id="PIC_Name"
                                placeholder="Opsional"
                                value={formData.PIC_Name}
                                onChange={(e) => setFormData({ ...formData, PIC_Name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="PIC_Email">Email PIC</Label>
                            <Input
                                id="PIC_Email"
                                type="text"
                                placeholder="Opsional"
                                value={formData.PIC_Email}
                                onChange={(e) => setFormData({ ...formData, PIC_Email: e.target.value })}
                            />
                        </div>
                    </div>
                    <Separator className="my-2" />
                    <p className="text-xs text-muted-foreground">Pengaturan Recurring — tandai jika laporan ini berulang setiap tahun</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="Recurring"
                                checked={formData.Recurring}
                                onChange={(e) => setFormData({ ...formData, Recurring: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="Recurring">Recurring</Label>
                        </div>
                        {formData.Recurring && (
                            <div className="space-y-2">
                                <Label htmlFor="Recurring_Periode">Periode</Label>
                                <Select
                                    value={formData.Recurring_Periode}
                                    onValueChange={(value) => setFormData({ ...formData, Recurring_Periode: value })}
                                >
                                    <SelectTrigger id="Recurring_Periode">
                                        <SelectValue placeholder="Pilih periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bulanan">Bulanan</SelectItem>
                                        <SelectItem value="Semesteran">Semesteran</SelectItem>
                                        <SelectItem value="Tahunan">Tahunan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="file">File</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={(e) => {
                                const f = e.target.files ? e.target.files[0] : null;
                                setFile(f);
                                if (preview) URL.revokeObjectURL(preview);
                                setPreview(f ? URL.createObjectURL(f) : null);
                            }}
                        />
                        {preview && (
                            <iframe src={preview} className="w-full h-48 border rounded" />
                        )}
                    </div>
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
