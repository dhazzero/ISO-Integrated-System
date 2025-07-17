"use client";

import { useEffect, useState } from "react";
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
import { Pencil } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const statuses = [
    "Belum Ditinjau",
    "Dalam Tinjauan",
    "Dalam Proses",
    "Sudah Dilaporkan",
];

interface OjkReport {
    _id: string;
    Bulan: string;
    Jenis_Laporan: string;
    Periode: string;
    DueDate: string;
    Pengiriman: string;
    Regulasi_acuan: string;
    Status?: string;
    Kepatuhan?: string;
    fileUrl?: string;
}

interface EditOjkReportModalProps {
    report: OjkReport;
    onUpdated: () => void;
}

export default function EditOjkReportModal({ report, onUpdated }: EditOjkReportModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const effectivenessOptions = ["Tinggi", "Sedang", "Rendah"];

    const [formData, setFormData] = useState({
        Bulan: report.Bulan,
        Jenis_Laporan: report.Jenis_Laporan,
        Periode: report.Periode,
        DueDate: report.DueDate,
        Pengiriman: report.Pengiriman,
        Regulasi_acuan: report.Regulasi_acuan,
        Status: report.Status || "",
        Kepatuhan: report.Kepatuhan || "",
    });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(report.fileUrl || null);

    useEffect(() => {
        setFormData({
            Bulan: report.Bulan,
            Jenis_Laporan: report.Jenis_Laporan,
            Periode: report.Periode,
            DueDate: report.DueDate,
            Pengiriman: report.Pengiriman,
            Regulasi_acuan: report.Regulasi_acuan,
            Status: report.Status || statuses[0],
            Kepatuhan: report.Kepatuhan || "",
        });
        setPreview(report.fileUrl || null);
    }, [report]);

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
            if (file) {
                fd.append("file", file);
            }

            const res = await fetch(`/api/compliance/ojk-reports/${report._id}`, {
                method: "PATCH",
                body: fd,
            });
            if (!res.ok) throw new Error("Failed to update report");
            setOpen(false);
            setFile(null);
            if (preview && preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }
            onUpdated();
            toast({ title: "Sukses", description: "Laporan OJK diperbarui." });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Gagal memperbarui laporan",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Laporan OJK</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`Bulan-${report._id}`}>Bulan</Label>
                        <Input
                            id={`Bulan-${report._id}`}
                            value={formData.Bulan}
                            onChange={(e) => setFormData({ ...formData, Bulan: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`Jenis_Laporan-${report._id}`}>Jenis Laporan</Label>
                        <Input
                            id={`Jenis_Laporan-${report._id}`}
                            value={formData.Jenis_Laporan}
                            onChange={(e) => setFormData({ ...formData, Jenis_Laporan: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`Periode-${report._id}`}>Periode</Label>
                        <Input
                            id={`Periode-${report._id}`}
                            value={formData.Periode}
                            onChange={(e) => setFormData({ ...formData, Periode: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`DueDate-${report._id}`}>Due Date</Label>
                        <Input
                            id={`DueDate-${report._id}`}
                            value={formData.DueDate}
                            onChange={(e) => setFormData({ ...formData, DueDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`Pengiriman-${report._id}`}>Pengiriman</Label>
                        <Input
                            id={`Pengiriman-${report._id}`}
                            value={formData.Pengiriman}
                            onChange={(e) => setFormData({ ...formData, Pengiriman: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`Regulasi_acuan-${report._id}`}>Regulasi Acuan</Label>
                        <Input
                            id={`Regulasi_acuan-${report._id}`}
                            value={formData.Regulasi_acuan}
                            onChange={(e) => setFormData({ ...formData, Regulasi_acuan: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`Status-${report._id}`}>Status</Label>
                        <Select
                            value={formData.Status}
                            onValueChange={(value) => setFormData({ ...formData, Status: value })}
                        >
                            <SelectTrigger id={`Status-${report._id}`}>
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
                        <Label htmlFor={`Kepatuhan-${report._id}`}>Kepatuhan (%)</Label>
                        <Input
                            id={`Kepatuhan-${report._id}`}
                            value={formData.Kepatuhan}
                            onChange={(e) => setFormData({ ...formData, Kepatuhan: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`file-${report._id}`}>File</Label>
                        <Input
                            id={`file-${report._id}`}
                            type="file"
                            onChange={(e) => {
                                const f = e.target.files ? e.target.files[0] : null;
                                setFile(f);
                                if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
                                setPreview(f ? URL.createObjectURL(f) : report.fileUrl || null);
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