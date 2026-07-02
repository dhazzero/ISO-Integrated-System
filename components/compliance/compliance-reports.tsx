"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

interface ControlItem {
    _id: string;
    name?: string;
    relatedStandards?: string[];
    status?: string;
    effectiveness?: string;
    compliance?: string;
    documentIds?: string[];
}

interface AnnexItem {
    _id: string;
    control_id: string;
    title?: string;
    standardName?: string;
    status?: string;
    effectiveness?: string;
    compliance?: string;
    evidence?: string;
}

const implementedStatuses = ["Diterapkan", "Diterapkan / Implemented", "Implemented"];

function toCsv(rows: any[]): string {
    if (rows.length === 0) return "";
    const headers = Object.keys(rows[0]);
    const escape = (v: any) => {
        const s = String(v ?? "");
        return s.includes(",") || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
    return lines.join("\n");
}

function downloadCsv(filename: string, rows: any[]) {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function ComplianceReports({ ojkReports }: { ojkReports: any[] }) {
    const [standards, setStandards] = useState<any[]>([]);
    const [controls, setControls] = useState<ControlItem[]>([]);
    const [annex, setAnnex] = useState<AnnexItem[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [sRes, cRes, aRes] = await Promise.all([
                    fetch("/api/settings/standards"),
                    fetch("/api/compliance/controls", { cache: "no-store" }),
                    fetch("/api/compliance/annex-a", { cache: "no-store" }),
                ]);
                if (sRes.ok) {
                    setStandards(await sRes.json());
                }
                if (cRes.ok) setControls(await cRes.json());
                if (aRes.ok) setAnnex(await aRes.json());
            } catch {
                // ignore
            }
        };
        void load();
    }, []);

    const combinedStatusSummary = useMemo(() => {
        const allStatuses = new Set<string>();
        const statusColors: { [key: string]: string } = {
            "Implemented": "hsl(var(--chart-2))",
            "Diterapkan": "hsl(var(--chart-2))",
            "Diterapkan / Implemented": "hsl(var(--chart-2))",
            "Partial": "hsl(var(--chart-4))",
            "Sebagian": "hsl(var(--chart-4))",
            "Partially Implemented": "hsl(var(--chart-4))",
            "Under Review": "hsl(var(--chart-4))",
            "Not Implemented": "hsl(var(--destructive))",
            "Belum Diterapkan": "hsl(var(--destructive))",
            "Unknown": "hsl(var(--muted))",
        };

        const data = [
            { name: "Control Checklist", source: controls },
            { name: "Annex A", source: annex },
            { name: "OJK Reports", source: ojkReports.map(o => ({ ...o, status: o.Status })) },
        ];

        const summary = data.map(d => {
            const statusCounts = d.source.reduce((acc: Record<string, number>, item: any) => {
                const status = item.status || "Unknown";
                allStatuses.add(status);
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});
            return { name: d.name, ...statusCounts };
        });

        return { summary, statuses: Array.from(allStatuses), colors: statusColors };
    }, [controls, annex, ojkReports]);

    const complianceSummaryCsvData = useMemo(() => {
        const checklistData = controls.map(c => ({
            source: 'Compliance Checklist',
            id: c._id,
            name: c.name || '',
            standard: (c.relatedStandards || []).join(', '),
            status: c.status || 'Unknown',
            effectiveness: c.effectiveness || 'N/A',
            compliance: c.compliance || 'N/A',
        }));

        const standardsData = standards.map(s => ({
            source: 'Integrated Standard',
            id: s._id,
            name: s.name || s.title || '',
            standard: s.name || s.title || '',
            status: 'N/A',
            effectiveness: 'N/A',
            compliance: 'N/A',
        }));

        const annexData = annex.map(a => ({
            source: 'ISO 27001 Annex A',
            id: a.control_id,
            name: a.title || '',
            standard: a.standardName || 'N/A',
            status: a.status || 'Unknown',
            effectiveness: a.effectiveness || 'N/A',
            compliance: a.compliance || 'N/A',
        }));

        const ojkData = ojkReports.map(o => ({
            source: 'OJK Information',
            id: o._id,
            name: o.Jenis_Laporan || '',
            standard: o.Regulasi_acuan || 'N/A',
            status: o.Status || 'Unknown',
            effectiveness: 'N/A',
            compliance: o.Kepatuhan || 'N/A',
        }));

        return [...checklistData, ...standardsData, ...annexData, ...ojkData];
    }, [controls, standards, annex, ojkReports]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Laporan Kepatuhan Gabungan</CardTitle>
                <CardDescription>Ringkasan status dari berbagai sumber kepatuhan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => downloadCsv("compliance_summary.csv", complianceSummaryCsvData)}>Ringkasan Kepatuhan (CSV)</Button>
                    <Button variant="outline" onClick={() => downloadCsv("iso_27001_annex_a.csv", annex)}>ISO 27001 Annex A (CSV)</Button>
                    <Button variant="secondary" onClick={() => downloadCsv("pelaporan_regulasi.csv", ojkReports)}>Pelaporan Regulasi (CSV)</Button>
                </div>
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <BarChart data={combinedStatusSummary.summary} layout="vertical" stackOffset="expand">
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey="name" type="category" width={120} />
                        <XAxis type="number" hide />
                        <RechartsTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        {combinedStatusSummary.statuses.map(status => (
                            <Bar key={status} dataKey={status} stackId="a" fill={combinedStatusSummary.colors[status] || "#8884d8"} />
                        ))}
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
