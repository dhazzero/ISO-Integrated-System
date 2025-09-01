"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell, PieChart, Pie, Legend, Tooltip as RechartsTooltip } from "recharts";
import {
    FileText,
    CheckCircle2,
    AlertTriangle,
    ListChecks,
    ShieldCheck,
    Target,
    Clock3,
    Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ComplianceReports from "@/components/compliance/compliance-reports";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ... (interfaces remain the same)
interface ControlItem {
    _id: string;
    status?: string;
    relatedStandards?: string[];
    documentIds?: string[];
}
interface AnnexItem {
    _id: string;
    status?: string;
    standardName?: string;
    documentIds?: string[];
}

interface DocumentItem {
    id: string | number;
    name?: string;
    version?: string;
    status?: string;
    documentType?: string;
    category?: string;
}

interface RiskItem {
    _id: string;
    name?: string;
    status?: string;
    level?: string;
    inherentRisk?: { score: number };
    residualRisk?: { score: number };
}

interface AuditItem {
    _id: string;
    name?: string;
    status: string;
    auditType?: string;
    department?: string;
}

interface FindingItem {
    _id: string;
    auditId?: string;
    status?: string;
    severity?: string;
}


const implementedStatuses = ["Diterapkan", "Diterapkan / Implemented", "Implemented", "Dilaporkan", "Sudah Dilaporkan"];
const partialStatuses = ["Partial", "Sebagian", "Partially Implemented", "Under Review"];

const isCompletedStatus = (s?: string) => {
    const v = (s || "").toLowerCase().trim();
    return v === "completed" || v === "selesai";
};

const chartConfig = {
    value: { label: "Jumlah", color: "hsl(var(--chart-1))" },
    dokumen: { label: "Dokumen Terintegrasi", color: "hsl(var(--chart-1))" },
    risiko: { label: "Risiko Aktif", color: "hsl(var(--chart-2))" },
    audit: { label: "Audit Selesai", color: "hsl(var(--chart-4))" },
    control: { label: "Kontrol Diterapkan", color: "hsl(var(--chart-3))" },
    checklist: { label: "Compliance Checklist", color: "hsl(var(--chart-1))" },
    standards: { label: "Integrated Standards", color: "hsl(var(--chart-2))" },
    annex: { label: "ISO 27001 Annex A", color: "hsl(var(--chart-3))" },
    ojk: { label: "OJK Information", color: "hsl(var(--chart-4))" },
    major: { label: "Major", color: "hsl(var(--destructive))" },
    minor: { label: "Minor", color: "hsl(var(--chart-4))" },
    opportunity: { label: "Opportunity", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState("ikhtisar");

    const [controls, setControls] = useState<ControlItem[]>([]);
    const [annex, setAnnex] = useState<AnnexItem[]>([]);
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [risks, setRisks] = useState<RiskItem[]>([]);
    const [audits, setAudits] = useState<AuditItem[]>([]);
    const [findings, setFindings] = useState<FindingItem[]>([]);
    const [standards, setStandards] = useState<unknown[]>([]);
    const [ojkReports, setOjkReports] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [cRes, aRes, dRes, rRes, auRes, fRes, sRes, ojkRes] = await Promise.all([
                    fetch("/api/compliance/controls", { cache: "no-store" }),
                    fetch("/api/compliance/annex-a", { cache: "no-store" }),
                    fetch("/api/documents", { cache: "no-store" }),
                    fetch("/api/risks", { cache: "no-store" }),
                    fetch("/api/audits", { cache: "no-store" }),
                    fetch("/api/findings", { cache: "no-store" }),
                    fetch("/api/settings/standards", { cache: "no-store" }),
                    fetch("/api/compliance/ojk-reports", { cache: "no-store" }),
                ]);
                if (cRes.ok) setControls((await cRes.json()) as ControlItem[]);
                if (aRes.ok) setAnnex((await aRes.json()) as AnnexItem[]);
                if (dRes.ok) {
                    interface RawDocument extends DocumentItem {
                        _id?: string | number;
                    }
                    const rawDocs = (await dRes.json()) as RawDocument[];
                    const mapped: DocumentItem[] = rawDocs.map((doc) => ({
                        ...doc,
                        id: doc.id ?? doc._id ?? "",
                    }));
                    setDocuments(mapped);
                }
                if (rRes.ok) setRisks((await rRes.json()) as RiskItem[]);
                if (auRes.ok) setAudits((await auRes.json()) as AuditItem[]);
                if (fRes.ok) setFindings((await fRes.json()) as FindingItem[]);
                if (sRes.ok) setStandards((await sRes.json()) as unknown[]);
                if (ojkRes.ok) setOjkReports((await ojkRes.json()) as any[]);
            } catch {
                // ignore errors
            }
        };
        void load();
    }, []);

    const metrics = useMemo(() => {
        // Kepatuhan
        const normalizedOjk = ojkReports.map(o => ({ ...o, status: o.Status, documentIds: o.fileUrl ? [o.fileUrl] : [] }));
        const combined: Array<ControlItem | AnnexItem | any> = [...controls, ...annex, ...normalizedOjk];
        const totalClauses = combined.length;
        const totalCompliant = combined.filter((x) => implementedStatuses.includes(x.status || "")).length;
        const totalPartial = combined.filter((x) => partialStatuses.includes(x.status || "")).length;
        const totalNonCompliant = combined.filter((x) => {
            const s = x.status || "";
            return s && !implementedStatuses.includes(s) && !partialStatuses.includes(s);
        }).length;
        const overallCompliance = totalClauses ? Math.round((totalCompliant / totalClauses) * 100) : 0;
        const needsAttention = totalPartial + totalNonCompliant;

        // Risiko
        const totalRisks = risks.length;
        const activeRisks = risks.filter((r) => !["closed", "mitigated"].includes((r.status || "").toLowerCase())).length;
        const mitigatedRisks = totalRisks - activeRisks;
        const mitigationRate = totalRisks ? Math.round((mitigatedRisks / totalRisks) * 100) : 0;
        const riskLevelSummary = { Tinggi: 0, Sedang: 0, Rendah: 0 };
        const riskStatusSummary: Record<string, number> = {};
        let totalInherentRisk = 0;
        let totalResidualRisk = 0;
        risks.forEach((r) => {
            const lvl = r.level || "Rendah";
            if (lvl.includes("Tinggi")) riskLevelSummary.Tinggi++;
            else if (lvl.includes("Sedang")) riskLevelSummary.Sedang++;
            else riskLevelSummary.Rendah++;
            const status = r.status || "Unknown";
            riskStatusSummary[status] = (riskStatusSummary[status] || 0) + 1;
            totalInherentRisk += r.inherentRisk?.score || 0;
            totalResidualRisk += r.residualRisk?.score || 0;
        });

        // Audit
        const totalAudits = audits.length;
        const completedAudits = audits.filter((a) => isCompletedStatus(a.status)).length;
        const scheduledAudits = totalAudits - completedAudits;
        const totalFindings = findings.length;
        const auditPerFinding = totalFindings ? completedAudits / totalFindings : 0;
        const auditFindingPercent = totalFindings ? Math.round((completedAudits / totalFindings) * 100) : 0;
        const findingSeveritySummary: Record<string, number> = {};
        const auditMap = new Map(audits.map(a => [a._id, { department: a.department, type: a.auditType || 'Unknown' }]));

        const auditFindingSummary: Record<string, Record<string, number>> = {};
        const findingsByAuditType: Record<string, Record<string, number>> = { 'Internal': {}, 'External': {}, 'Unknown': {} };

        findings.forEach((f: any) => {
            const severity = f.severity || "Unknown";
            findingSeveritySummary[severity] = (findingSeveritySummary[severity] || 0) + 1;
            const auditInfo = auditMap.get(f.auditId);
            if (auditInfo) {
                const department = auditInfo.department || "Unknown Department";
                if (!auditFindingSummary[department]) {
                    auditFindingSummary[department] = { Minor: 0, Major: 0, Opportunity: 0 };
                }
                auditFindingSummary[department][severity] = (auditFindingSummary[department][severity] || 0) + 1;

                const auditTypeKey = auditInfo.type && ['Internal', 'External'].includes(auditInfo.type) ? auditInfo.type : 'Unknown';
                if (!findingsByAuditType[auditTypeKey]) findingsByAuditType[auditTypeKey] = { Minor: 0, Major: 0, Opportunity: 0 };
                findingsByAuditType[auditTypeKey][severity] = (findingsByAuditType[auditTypeKey][severity] || 0) + 1;
            }
        });

        // Dokumen
        const totalDocuments = documents.length;
        const docStatusSummary = { Aktif: 0, Review: 0, Draft: 0, Lainnya: 0 };
        const docTypeSummary: Record<string, number> = {};
        documents.forEach((d) => {
            if (d.status === "Aktif") docStatusSummary.Aktif++;
            else if (d.status === "Review") docStatusSummary.Review++;
            else if (d.status === "Draft") docStatusSummary.Draft++;
            else docStatusSummary.Lainnya++;
            const docType = d.documentType || "Unknown";
            docTypeSummary[docType] = (docTypeSummary[docType] || 0) + 1;
        });
        const integratedIds = new Set<string>();
        controls.forEach((c) => (c.documentIds || []).forEach((id) => integratedIds.add(String(id))));
        annex.forEach((a) => (a.documentIds || []).forEach((id) => integratedIds.add(String(id))));
        const integratedDocuments = documents.filter((d) => integratedIds.has(String(d.id))).length;
        const docIntegrationRate = totalDocuments ? Math.round((integratedDocuments / totalDocuments) * 100) : 0;

        return {
            totalClauses, totalCompliant, totalPartial, totalNonCompliant, overallCompliance, needsAttention,
            totalRisks, activeRisks, mitigatedRisks, mitigationRate, riskLevelSummary, riskStatusSummary, totalInherentRisk, totalResidualRisk,
            totalAudits, completedAudits, scheduledAudits, totalFindings, auditPerFinding, auditFindingPercent, findingSeveritySummary, auditFindingSummary, findingsByAuditType,
            totalDocuments, docStatusSummary, docTypeSummary, integratedDocuments, docIntegrationRate,
            totalStandards: standards.length,
            ojkReports,
        };
    }, [controls, annex, risks, audits, documents, standards, findings, ojkReports]);

    const complianceSummaryData = useMemo(() => [
        { name: 'Compliance Checklist', value: controls.length, fillKey: 'checklist' },
        { name: 'Integrated Standards', value: metrics.integratedDocuments, fillKey: 'standards' },
        { name: 'ISO 27001 Annex A', value: annex.length, fillKey: 'annex' },
        { name: 'OJK Information', value: ojkReports.length, fillKey: 'ojk' },
    ], [controls.length, metrics.integratedDocuments, annex.length, ojkReports.length]);

    const riskStatusChartData = useMemo(() => {
        return Object.entries(metrics.riskStatusSummary).map(([name, value]) => ({ name, value }));
    }, [metrics.riskStatusSummary]);

    const findingsByAuditTypeData = useMemo(() => {
        return Object.entries(metrics.findingsByAuditType).map(([type, severities]) => ({
            type,
            ...severities
        })).filter(d => d.type !== 'Unknown');
    }, [metrics.findingsByAuditType]);

    const findingsByDeptData = useMemo(() => {
        return Object.entries(metrics.auditFindingSummary).map(([department, severities]) => ({
            department,
            ...severities
        }));
    }, [metrics.auditFindingSummary]);

    const dashboardStatsData = useMemo(
        () => {
            const riskPercent = metrics.totalRisks
                ? Math.round((metrics.activeRisks / metrics.totalRisks) * 100)
                : 0;
            return {
                kepatuhanKeseluruhan: {
                    title: "Kepatuhan Keseluruhan",
                    value: `${metrics.overallCompliance}%`,
                    description: `${metrics.totalCompliant}/${metrics.totalClauses} item diterapkan`,
                    icon: <Target className="h-8 w-8 text-blue-500" />,
                },
                risikoAktif: {
                    title: "Risiko Aktif",
                    value: `${riskPercent}%`,
                    secondaryValue: `${metrics.activeRisks} risiko aktif`,
                    description: `Perhitungan: ${metrics.activeRisks}/${metrics.totalRisks}`,
                    icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
                },
                dokumenTerintegrasi: {
                    title: "Dokumen Terintegrasi",
                    value: `${metrics.docIntegrationRate}%`,
                    secondaryValue: `${metrics.integratedDocuments} dokumen`,
                    description: `Perhitungan: ${metrics.integratedDocuments}/${metrics.totalDocuments}`,
                    icon: <FileText className="h-8 w-8 text-green-500" />,
                },
                auditTemuan: {
                    title: "Temuan per Audit",
                    value: `${metrics.auditFindingPercent}%`,
                    secondaryValue: `${metrics.auditPerFinding.toFixed(2)} audit/temuan`,
                    description: `Perhitungan: ${metrics.completedAudits}/${metrics.totalFindings}`,
                    icon: <Gauge className="h-8 w-8 text-amber-500" />,
                },
            } as const;
        },
        [metrics]
    );

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-background text-foreground">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Pelaporan &amp; Dasbor
                </h1>
                <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Ekspor Laporan
                </Button>
            </div>

            {/* Kartu Statistik Utama */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.values(dashboardStatsData).map((stat) => (
                    <Card
                        key={stat.title}
                        className="shadow-md hover:shadow-lg transition-shadow border-border"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base md:text-lg font-semibold text-foreground">
                                {stat.title}
                            </CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="text-2xl font-bold cursor-default">
                                            {stat.value}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{stat.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {stat.secondaryValue && (
                                <div className="text-sm font-medium">{stat.secondaryValue}</div>
                            )}

                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs
                defaultValue={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-2 rounded-md sm:grid-cols-3 md:grid-cols-5 bg-muted p-1">
                    <TabsTrigger value="ikhtisar">Ikhtisar</TabsTrigger>
                    <TabsTrigger value="kepatuhan">Kepatuhan</TabsTrigger>
                    <TabsTrigger value="risiko">Risiko</TabsTrigger>
                    <TabsTrigger value="audit">Audit</TabsTrigger>
                    <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
                </TabsList>

                <TabsContent value="ikhtisar" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div onClick={() => setActiveTab('kepatuhan')} className="cursor-pointer">
                            <Card className="shadow-sm border-border h-full">
                                <CardHeader>
                                    <CardTitle>Ringkasan Kepatuhan</CardTitle>
                                    <CardDescription>Total catatan per sumber kepatuhan. Klik untuk detail.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                        <BarChart data={complianceSummaryData} layout="vertical" margin={{ right: 20 }}>
                                            <CartesianGrid horizontal={false} />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                            <Bar dataKey="value" radius={4}>
                                                {complianceSummaryData.map((entry) => (
                                                    <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.fillKey]?.color || 'hsl(var(--chart-1))'} />
                                                ))}
                                                <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={12} />
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>

                        <div onClick={() => setActiveTab('risiko')} className="cursor-pointer">
                            <Card className="shadow-sm border-border h-full">
                                <CardHeader>
                                    <CardTitle>Latest Risk List</CardTitle>
                                    <CardDescription>Grafik status risiko yang ada. Klik untuk detail.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-center items-center">
                                    <ChartContainer config={chartConfig} className="h-[250px] w-full max-w-[300px]">
                                        <PieChart>
                                            <Pie data={riskStatusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {riskStatusChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                        </PieChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>

                        <div onClick={() => setActiveTab('audit')} className="cursor-pointer">
                            <Card className="shadow-sm border-border h-full">
                                <CardHeader>
                                    <CardTitle>Audit Findings Summary</CardTitle>
                                    <CardDescription>Total temuan per jenis audit. Klik untuk detail.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                        <BarChart data={findingsByAuditTypeData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="type" />
                                            <YAxis />
                                            <RechartsTooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                            <Bar dataKey="Major" stackId="a" fill={chartConfig.major.color} name="Major" />
                                            <Bar dataKey="Minor" stackId="a" fill={chartConfig.minor.color} name="Minor" />
                                            <Bar dataKey="Opportunity" stackId="a" fill={chartConfig.opportunity.color} name="Opportunity" />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>

                        <div onClick={() => setActiveTab('dokumen')} className="cursor-pointer">
                            <Card className="shadow-sm border-border h-full">
                                <CardHeader>
                                    <CardTitle>Document by Type</CardTitle>
                                    <CardDescription>Total dokumen per jenis. Klik untuk detail.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                        <BarChart data={Object.entries(metrics.docTypeSummary).map(([name, value]) => ({ name, value }))} layout="vertical">
                                            <CartesianGrid horizontal={false} />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={120} />
                                            <RechartsTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="value" fill="hsl(var(--chart-1))">
                                                <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={12} />
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="kepatuhan" className="mt-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Overall Compliance</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.overallCompliance}%</div>
                                <p className="text-xs text-muted-foreground">{metrics.totalCompliant} of {metrics.totalClauses} items implemented</p>
                                <Progress value={metrics.overallCompliance} className="mt-2 h-2" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Total Clauses</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.totalClauses}</div>
                                <p className="text-xs text-muted-foreground">Across {metrics.totalStandards} standards</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Compliant</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{metrics.totalCompliant}</div>
                                <p className="text-xs text-muted-foreground">{Math.round((metrics.totalCompliant / (metrics.totalClauses || 1)) * 100)}% of total</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Needs Attention</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{metrics.needsAttention}</div>
                                <p className="text-xs text-muted-foreground">{Math.round((metrics.needsAttention / (metrics.totalClauses || 1)) * 100)}% of total</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="shadow-sm border-border">
                            <CardHeader>
                                <CardTitle>Ringkasan Kepatuhan</CardTitle>
                                <CardDescription>Total catatan per sumber kepatuhan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                    <BarChart data={complianceSummaryData} layout="vertical" margin={{ right: 20 }}>
                                        <CartesianGrid horizontal={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                        <Bar dataKey="value" radius={4}>
                                            {complianceSummaryData.map((entry) => (
                                                <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.fillKey]?.color || 'hsl(var(--chart-1))'} />
                                            ))}
                                            <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={12} />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <ComplianceReports ojkReports={metrics.ojkReports} />
                    </div>
                </TabsContent>

                <TabsContent value="risiko" className="mt-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Total Risks</CardTitle>
                                <ListChecks className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.totalRisks}</div>
                                <p className="text-xs text-muted-foreground">Total risks identified</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Active Risks</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{metrics.activeRisks}</div>
                                <p className="text-xs text-muted-foreground">Risks that are currently open</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Mitigated Risks</CardTitle>
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{metrics.mitigatedRisks}</div>
                                <p className="text-xs text-muted-foreground">Risks that have been closed</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Mitigation Rate</CardTitle>
                                <Gauge className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.mitigationRate}%</div>
                                <p className="text-xs text-muted-foreground">Percentage of mitigated risks</p>
                                <Progress value={metrics.mitigationRate} className="mt-2 h-2"/>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Risk Mitigation Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {metrics.totalInherentRisk > 0 || metrics.totalResidualRisk > 0 ? (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2 text-center">Total Inherent Risk vs. Total Residual Risk</p>
                                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                            <BarChart data={[{ name: 'Risk', inherent: metrics.totalInherentRisk, residual: metrics.totalResidualRisk }]}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <RechartsTooltip content={<ChartTooltipContent />} />
                                                <Legend />
                                                <Bar dataKey="inherent" fill="hsl(var(--destructive))" name="Inherent Risk" />
                                                <Bar dataKey="residual" fill="hsl(var(--chart-2))" name="Residual Risk" />
                                            </BarChart>
                                        </ChartContainer>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2 text-center">Active vs. Mitigated Risks</p>
                                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                            <BarChart data={[{ name: 'Status', active: metrics.activeRisks, mitigated: metrics.mitigatedRisks }]}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <RechartsTooltip content={<ChartTooltipContent />} />
                                                <Legend />
                                                <Bar dataKey="active" fill="hsl(var(--destructive))" name="Active Risks" />
                                                <Bar dataKey="mitigated" fill="hsl(var(--chart-2))" name="Mitigated Risks" />
                                            </BarChart>
                                        </ChartContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Latest Risk List</CardTitle>
                                <CardDescription>Grafik status risiko yang ada</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center">
                                <ChartContainer config={chartConfig} className="h-[250px] w-full max-w-[300px]">
                                    <PieChart>
                                        <Pie data={riskStatusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {riskStatusChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip content={<ChartTooltipContent />} />
                                        <Legend />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="audit" className="mt-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Total Audits</CardTitle>
                                <ListChecks className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.totalAudits}</div>
                                <p className="text-xs text-muted-foreground">Total audits conducted</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Completed Audits</CardTitle>
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{metrics.completedAudits}</div>
                                <p className="text-xs text-muted-foreground">{Math.round((metrics.completedAudits / (metrics.totalAudits || 1)) * 100)}% of total</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Total Findings</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.totalFindings}</div>
                                <p className="text-xs text-muted-foreground">Across all completed audits</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Audit Completion Rate</CardTitle>
                                <Gauge className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{Math.round((metrics.completedAudits / (metrics.totalAudits || 1)) * 100)}%</div>
                                <p className="text-xs text-muted-foreground">{metrics.completedAudits} of {metrics.totalAudits} audits completed</p>
                                <Progress value={Math.round((metrics.completedAudits / (metrics.totalAudits || 1)) * 100)} className="mt-2 h-2"/>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Last Audit</CardTitle>
                                <CardDescription>Total temuan per jenis audit dan tingkat keparahan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                    <BarChart data={findingsByAuditTypeData}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="type" />
                                        <YAxis />
                                        <RechartsTooltip content={<ChartTooltipContent />} />
                                        <Legend />
                                        <Bar dataKey="Major" stackId="a" fill={chartConfig.major.color} name="Major" />
                                        <Bar dataKey="Minor" stackId="a" fill={chartConfig.minor.color} name="Minor" />
                                        <Bar dataKey="Opportunity" stackId="a" fill={chartConfig.opportunity.color} name="Opportunity" />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Findings per Department</CardTitle>
                                <CardDescription>Temuan audit per departemen dengan rincian minor, major, dan opportunity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                    <BarChart data={findingsByDeptData} layout="vertical">
                                        <CartesianGrid horizontal={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="department" type="category" width={120} tick={{ fontSize: 12 }} />
                                        <RechartsTooltip content={<ChartTooltipContent />} />
                                        <Legend />
                                        <Bar dataKey="Major" stackId="a" fill={chartConfig.major.color} name="Major" />
                                        <Bar dataKey="Minor" stackId="a" fill={chartConfig.minor.color} name="Minor" />
                                        <Bar dataKey="Opportunity" stackId="a" fill={chartConfig.opportunity.color} name="Opportunity" />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="dokumen" className="mt-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Total Documents</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.totalDocuments}</div>
                                <p className="text-xs text-muted-foreground">Total documents in the system</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Active Documents</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{metrics.docStatusSummary.Aktif}</div>
                                <p className="text-xs text-muted-foreground">Approved and active documents</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">In Review</CardTitle>
                                <Clock3 className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-500">{metrics.docStatusSummary.Review}</div>
                                <p className="text-xs text-muted-foreground">Documents pending review</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">Integrated Documents</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.integratedDocuments}</div>
                                <p className="text-xs text-muted-foreground">{metrics.docIntegrationRate}% of total documents</p>
                                <Progress value={metrics.docIntegrationRate} className="mt-2 h-2"/>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Document by Type</CardTitle>
                                <CardDescription>Total dokumen per jenis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                    <BarChart data={Object.entries(metrics.docTypeSummary).map(([name, value]) => ({ name, value }))} layout="vertical">
                                        <CartesianGrid horizontal={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={120} />
                                        <RechartsTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="value" fill="hsl(var(--chart-1))">
                                            <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={12} />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Document Status</CardTitle>
                                <CardDescription>Grafik status dokumen</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center">
                                <ChartContainer config={chartConfig} className="h-[250px] w-full max-w-[300px]">
                                    <PieChart>
                                        <Pie data={Object.entries(metrics.docStatusSummary).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {Object.entries(metrics.docStatusSummary).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip content={<ChartTooltipContent />} />
                                        <Legend />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}