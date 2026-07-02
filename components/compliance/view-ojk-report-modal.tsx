"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function ViewOjkReportModal({ report }: { report: OjkReport }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detail Laporan OJK</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-2">
                        <Label htmlFor={`view-Bulan-${report._id}`}>Bulan</Label>
                        <Input id={`view-Bulan-${report._id}`} value={report.Bulan} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`view-Jenis_Laporan-${report._id}`}>Jenis Laporan</Label>
                        <Input id={`view-Jenis_Laporan-${report._id}`} value={report.Jenis_Laporan} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`view-Periode-${report._id}`}>Periode</Label>
                        <Input id={`view-Periode-${report._id}`} value={report.Periode} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`view-DueDate-${report._id}`}>Due Date</Label>
                        <Input id={`view-DueDate-${report._id}`} value={report.DueDate} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`view-Pengiriman-${report._id}`}>Pengiriman</Label>
                        <Input id={`view-Pengiriman-${report._id}`} value={report.Pengiriman} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`view-Regulasi-${report._id}`}>Regulasi Acuan</Label>
                        <Input id={`view-Regulasi-${report._id}`} value={report.Regulasi_acuan} disabled />
                    </div>
                    {report.Status && (
                        <div className="space-y-2">
                            <Label htmlFor={`view-Status-${report._id}`}>Status</Label>
                            <Input id={`view-Status-${report._id}`} value={report.Status} disabled />
                        </div>
                    )}

                    {report.Kepatuhan && (
                        <div className="space-y-2">
                            <Label htmlFor={`view-Kepatuhan-${report._id}`}>Kepatuhan (%)</Label>
                            <Input id={`view-Kepatuhan-${report._id}`} value={`${report.Kepatuhan}%`} disabled />
                        </div>
                    )}
                    {report.fileUrl && (
                        <div className="space-y-2">
                            <Label>Dokumen</Label>
                            <iframe
                                src={report.fileUrl}
                                className="w-full h-64 border rounded"
                            />
                            <a
                                href={report.fileUrl}
                                target="_blank"
                                className="text-sm text-blue-600 underline"
                                rel="noopener noreferrer"
                            >
                                Unduh file
                            </a>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" onClick={() => setOpen(false)}>
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}