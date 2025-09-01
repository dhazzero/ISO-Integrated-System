"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AddOjkReportModal from "./add-ojk-report-modal";
import EditOjkReportModal from "./edit-ojk-report-modal";
import ViewOjkReportModal from "./view-ojk-report-modal";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function OjkComplianceReport() {
    const [reports, setReports] = useState<OjkReport[]>([]);
    const [order, setOrder] = useState<"asc" | "desc">("desc");

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/compliance/ojk-reports?order=${order}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch {
            // ignore
        }
    }, [order]);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus laporan ini?")) return;
        await fetch(`/api/compliance/ojk-reports/${id}`, { method: "DELETE" });
        load();
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Informasi OJK</CardTitle>
                    <CardDescription>Daftar laporan kepatuhan OJK</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setOrder(order === "asc" ? "desc" : "asc")}>ID {order === "asc" ? "↑" : "↓"}</Button>
                    <AddOjkReportModal onSaved={load} />
                </div>
            </CardHeader>
            <CardContent>
                {reports.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-3">Bulan</th>
                                <th className="text-left py-2 px-3">Jenis Laporan</th>
                                <th className="text-left py-2 px-3">Periode</th>
                                <th className="text-left py-2 px-3">Due Date</th>
                                <th className="text-left py-2 px-3">Pengiriman</th>
                                <th className="text-left py-2 px-3">Regulasi Acuan</th>
                                <th className="text-left py-2 px-3">Status</th>
                                <th className="text-left py-2 px-3">Kepatuhan</th>
                                <th className="text-left py-2 px-3">Tindakan</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reports.map((r) => (
                                <tr key={r._id} className="border-b">
                                    <td className="py-2 px-3">{r.Bulan}</td>
                                    <td className="py-2 px-3">{r.Jenis_Laporan}</td>
                                    <td className="py-2 px-3">{r.Periode}</td>
                                    <td className="py-2 px-3">{r.DueDate}</td>
                                    <td className="py-2 px-3">{r.Pengiriman}</td>
                                    <td className="py-2 px-3">{r.Regulasi_acuan}</td>
                                    <td className="py-2 px-3">{r.Status ? <Badge variant={
                                        (() => {
                                            const s = r.Status.toLowerCase();
                                            if (s.includes("implemented") || s.includes("diterapkan") || s.includes("dilaporkan")) return "default";
                                            if (s.includes("not implemented") || s.includes("belum")) return "destructive";
                                            if (s.includes("partial") || s.includes("sebagian") || s.includes("proses")) return "secondary";
                                            return "outline";
                                        })()
                                    }>{r.Status}</Badge> : "-"}</td>
                                    <td className="py-2 px-3">
                                        {r.Kepatuhan ? <Badge variant="outline">{`${r.Kepatuhan}%`}</Badge> : "-"}
                                    </td>
                                    <td className="py-2 px-3">
                                        <div className="flex gap-2">
                                            <ViewOjkReportModal report={r} />
                                            <EditOjkReportModal report={r} onUpdated={load} />
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(r._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Belum ada laporan</p>
                )}
            </CardContent>
        </Card>
    );
}

