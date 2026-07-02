"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddOjkReportModal from "./add-ojk-report-modal";
import EditOjkReportModal from "./edit-ojk-report-modal";
import ViewOjkReportModal from "./view-ojk-report-modal";
import { Trash2, RefreshCw, CalendarPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

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
    PIC_Name?: string;
    PIC_Email?: string;
    Tahun?: number;
    Recurring?: boolean;
    Recurring_Periode?: string;
    fileUrl?: string;
}

export default function OjkComplianceReport() {
    const [reports, setReports] = useState<OjkReport[]>([]);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/compliance/ojk-reports?order=${order}&year=${selectedYear}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                if (data.records) {
                    setReports(data.records);
                    setAvailableYears(data.years || [new Date().getFullYear()]);
                } else {
                    // Backward compatibility: if API returns array directly
                    setReports(Array.isArray(data) ? data : []);
                }
            }
        } catch {
            // ignore
        }
    }, [order, selectedYear]);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus laporan ini?")) return;
        await fetch(`/api/compliance/ojk-reports/${id}`, { method: "DELETE" });
        load();
    };

    const handleGenerate = async () => {
        const fromYear = parseInt(selectedYear);
        const toYear = fromYear + 1;
        if (!confirm(`Generate laporan recurring dari tahun ${fromYear} ke tahun ${toYear}?\n\nSemua laporan dengan flag "Recurring" akan diduplikasi dengan DueDate +1 tahun dan status reset ke "Belum Ditinjau".`)) return;

        setIsGenerating(true);
        try {
            const res = await fetch('/api/compliance/ojk-reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromYear, toYear }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast({ title: "Sukses ✅", description: data.message });
                setSelectedYear(toYear.toString());
            } else {
                toast({ variant: "destructive", title: "Error", description: data.error || 'Gagal generate' });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Pelaporan Regulasi</CardTitle>
                    <CardDescription>Daftar pelaporan kepatuhan regulasi</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map((y) => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setOrder(order === "asc" ? "desc" : "asc")}>ID {order === "asc" ? "↑" : "↓"}</Button>
                    <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating} title={`Generate laporan recurring ke tahun ${parseInt(selectedYear) + 1}`}>
                        {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
                        <span className="ml-1 hidden sm:inline">{isGenerating ? 'Generating...' : `→ ${parseInt(selectedYear) + 1}`}</span>
                    </Button>
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
                                    <th className="text-left py-2 px-3">PIC</th>
                                    <th className="text-left py-2 px-3">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((r) => (
                                    <tr key={r._id} className="border-b">
                                        <td className="py-2 px-3">{r.Bulan}</td>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-1">
                                                {r.Jenis_Laporan}
                                                {r.Recurring && (
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1" title={`Recurring ${r.Recurring_Periode || ''}`}>
                                                        🔄
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
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
                                        <td className="py-2 px-3 text-xs">
                                            {r.PIC_Name ? (
                                                <span title={r.PIC_Email || ''}>{r.PIC_Name}</span>
                                            ) : (
                                                <span className="text-muted-foreground">Default</span>
                                            )}
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
                    <p className="text-sm text-muted-foreground">Belum ada laporan untuk tahun {selectedYear}</p>
                )}
            </CardContent>
        </Card>
    );
}
