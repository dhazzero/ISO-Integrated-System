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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell } from "recharts";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ListChecks,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Target,
  Clock3,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ComplianceReports from "@/components/compliance/compliance-reports";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
}

interface AuditItem {
  _id: string;
  name?: string;
  status: string;
  auditType?: string;
}

interface FindingItem {
  _id: string;
  status?: string;
  severity?: string;
}

const implementedStatuses = ["Diterapkan", "Diterapkan / Implemented", "Implemented"];
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
} satisfies ChartConfig;

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("ikhtisar");

  const [controls, setControls] = useState<ControlItem[]>([]);
  const [annex, setAnnex] = useState<AnnexItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [standards, setStandards] = useState<unknown[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, aRes, dRes, rRes, auRes, fRes, sRes] = await Promise.all([
          fetch("/api/compliance/controls", { cache: "no-store" }),
          fetch("/api/compliance/annex-a", { cache: "no-store" }),
          fetch("/api/documents", { cache: "no-store" }),
          fetch("/api/risks", { cache: "no-store" }),
          fetch("/api/audits", { cache: "no-store" }),
          fetch("/api/findings", { cache: "no-store" }),
          fetch("/api/settings/standards", { cache: "no-store" }),
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
      } catch {
        // ignore errors
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (activeTab !== "kepatuhan") return;
    const loadCompliance = async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          fetch("/api/compliance/controls", { cache: "no-store" }),
          fetch("/api/compliance/annex-a", { cache: "no-store" }),
        ]);
        if (cRes.ok) setControls((await cRes.json()) as ControlItem[]);
        if (aRes.ok) setAnnex((await aRes.json()) as AnnexItem[]);
      } catch {
        // ignore errors
      }
    };
    void loadCompliance();
  }, [activeTab]);

  const metrics = useMemo(() => {
    const combined: Array<ControlItem | AnnexItem> = [...controls, ...annex];
    const totalClauses = combined.length;
    const totalCompliant = combined.filter((x) =>
        implementedStatuses.includes(x.status || "")
    ).length;
    const totalPartial = combined.filter((x) =>
        partialStatuses.includes(x.status || "")
    ).length;
    const totalNonCompliant = combined.filter((x) => {
      const s = x.status || "";
      return s && !implementedStatuses.includes(s) && !partialStatuses.includes(s);
    }).length;
    const overallCompliance = totalClauses
        ? Math.round((totalCompliant / totalClauses) * 100)
        : 0;
    const needsAttention = totalPartial + totalNonCompliant;


    const totalRisks = risks.length;
    const activeRisks = risks.filter((r) => {
      const s = (r.status || "").toLowerCase();
      return s !== "closed" && s !== "mitigated";
    }).length;

    const totalAudits = audits.length;
    const completedAudits = audits.filter((a) =>
        isCompletedStatus(a.status)
    ).length;
    const totalFindings = findings.length;
    const auditPerFinding = totalFindings
        ? completedAudits / totalFindings
        : 0;
    const auditFindingPercent = totalFindings
        ? Math.round((completedAudits / totalFindings) * 100)
        : 0;

    const totalDocuments = documents.length;
    const integratedIds = new Set<string>();
    controls.forEach((c) => (c.documentIds || []).forEach((id) => integratedIds.add(String(id))));
    annex.forEach((a) => (a.documentIds || []).forEach((id) => integratedIds.add(String(id))));
    const integratedDocuments = documents.filter((d) =>
        integratedIds.has(String(d.id))
    ).length;
    const docIntegrationRate = totalDocuments
        ? Math.round((integratedDocuments / totalDocuments) * 100)
        : 0;

    return {
      totalClauses,
      totalCompliant,
      totalPartial,
      totalNonCompliant,
      overallCompliance,
      needsAttention,
      activeRisks,
      totalRisks,
      totalAudits,
      completedAudits,
      totalFindings,
      auditPerFinding,
      auditFindingPercent,
      totalDocuments,
      integratedDocuments,
      docIntegrationRate,
      totalStandards: standards.length,
    };
  }, [controls, annex, risks, audits, documents, standards, findings]);

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
            change: "",
            changeType: "positive" as const,
            icon: <Target className="h-4 w-4 text-muted-foreground" />,
          },
          risikoAktif: {
            title: "Risiko Aktif",
            value: `${riskPercent}%`,
            secondaryValue: `${metrics.activeRisks} risiko aktif`,
            description: `Perhitungan: ${metrics.activeRisks}/${metrics.totalRisks}`,
            change: "",
            changeType: "negative" as const,
            icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
          },
          dokumenTerintegrasi: {
            title: "Dokumen Terintegrasi",
            value: `${metrics.docIntegrationRate}%`,
            secondaryValue: `${metrics.integratedDocuments} dokumen`,
            description: `Perhitungan: ${metrics.integratedDocuments}/${metrics.totalDocuments}`,
            change: "",
            changeType: "positive" as const,
            icon: <FileText className="h-4 w-4 text-muted-foreground" />,
          },
          auditTemuan: {
            title: "Temuan per Audit",
            value: `${metrics.auditFindingPercent}%`,
            secondaryValue: `${metrics.auditPerFinding.toFixed(2)} audit/temuan`,
            description: `Perhitungan: ${metrics.completedAudits}/${metrics.totalFindings}`,
            change: "",
            changeType: "positive" as const,
            icon: <Gauge className="h-4 w-4 text-muted-foreground" />,
          },
        } as const;
      },
      [metrics]
  );

  const memoizedIkhtisarChartData = useMemo(
      () => [
        { name: "Dokumen", value: metrics.integratedDocuments, fillKey: "dokumen" },
        { name: "Risiko", value: metrics.activeRisks, fillKey: "risiko" },
        { name: "Audit", value: metrics.completedAudits, fillKey: "audit" },
        { name: "Kontrol", value: metrics.totalCompliant, fillKey: "control" },
      ],
      [metrics]
  );

  const complianceChartData = useMemo(
      () => [
        { name: "Overall Compliance", value: metrics.overallCompliance },
        { name: "Total Clauses", value: metrics.totalClauses },
        { name: "Compliant", value: metrics.totalCompliant },
        { name: "Needs Attention", value: metrics.needsAttention },
      ],
      [metrics]
  ); // <-- This was the missing parenthesis

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
                  <p
                      className={cn(
                          "text-xs font-medium flex items-center mt-1",
                          stat.changeType === "positive"
                              ? "text-[hsl(var(--chart-2))]"
                              : "text-[hsl(var(--destructive))]"
                      )}
                  >
                    {stat.changeType === "positive" ? (
                        <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                        <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
          ))}
        </div>

        {/* Navigasi Tab */}
        <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 rounded-md md:grid-cols-5 bg-muted p-1">
            <TabsTrigger
                value="ikhtisar"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Ikhtisar
            </TabsTrigger>
            <TabsTrigger
                value="kepatuhan"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Kepatuhan
            </TabsTrigger>
            <TabsTrigger
                value="risiko"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Risiko
            </TabsTrigger>
            <TabsTrigger
                value="audit"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Audit
            </TabsTrigger>
            <TabsTrigger
                value="dokumen"
                className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Dokumen
            </TabsTrigger>
          </TabsList>

          {/* Tab Ikhtisar */}
          <TabsContent value="ikhtisar" className="mt-4">
            <Card className="shadow-sm border-border">
              <CardHeader>
                <CardTitle>Ikhtisar Metrik Kunci</CardTitle>
                <CardDescription>
                  Visualisasi ringkas dari berbagai metrik penting dalam
                  sistem.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <BarChart
                      accessibilityLayer
                      data={memoizedIkhtisarChartData}
                      margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} className="stroke-border/50" />
                    <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent className="bg-background text-foreground border-border shadow-lg" />
                        }
                    />
                    <Bar dataKey="value" radius={4}>
                      {memoizedIkhtisarChartData.map((entry) => (
                          <Cell
                              key={`cell-${entry.name}`}
                              fill={
                                  chartConfig[entry.fillKey]?.color || chartConfig.value.color
                              }
                          />
                      ))}
                      <LabelList
                          position="top"
                          offset={8}
                          className="fill-foreground"
                          fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Kepatuhan */}
          <TabsContent value="kepatuhan" className="mt-4 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-md border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-blue-500" />
                    Overall Compliance
                  </CardTitle>
                  <CardDescription>
                    {metrics.totalCompliant}/{metrics.totalClauses} item
                    diterapkan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metrics.overallCompliance}%
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Progress
                              value={metrics.overallCompliance}
                              className="h-2"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {metrics.totalCompliant}/{metrics.totalClauses} controls
                          implemented
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>

              <Card className="shadow-md border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-purple-500" />
                    Total Clauses
                  </CardTitle>
                  <CardDescription>
                    Across {metrics.totalStandards} standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {metrics.totalClauses}
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mt-2">
                          <Progress value={100} className="h-2" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{metrics.totalClauses} clauses total</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                </CardContent>
              </Card>

              <Card className="shadow-md border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                    Compliant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {metrics.totalCompliant}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {metrics.totalClauses
                        ? Math.round((metrics.totalCompliant / metrics.totalClauses) * 100)
                        : 0}% of total
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mt-2">
                          <Progress
                              value={
                                metrics.totalClauses
                                    ? (metrics.totalCompliant / metrics.totalClauses) * 100
                                    : 0
                              }
                              className="h-2"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {metrics.totalCompliant}/{metrics.totalClauses} compliant
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>

              <Card className="shadow-md border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                    Needs Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {metrics.needsAttention}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {metrics.totalClauses
                        ? Math.round((metrics.needsAttention / metrics.totalClauses) * 100)
                        : 0}% of total
                  </p>
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mt-2">
                        <Progress
                            value={
                              metrics.totalClauses
                                  ? (metrics.needsAttention / metrics.totalClauses) * 100
                                  : 0
                            }
                            className="h-2"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {metrics.needsAttention}/{metrics.totalClauses} need attention
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-sm border-border">
              <CardHeader>
                <CardTitle>Ringkasan Kepatuhan</CardTitle>
                <CardDescription>Perbandingan metrik kepatuhan</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={complianceChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill={chartConfig.value.color}>
                      <LabelList position="top" />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <ComplianceReports />
          </TabsContent>

          {/* Tab Risiko */}
          <TabsContent value="risiko" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(() => {
                const summary: Record<string, number> = {
                  Tinggi: 0,
                  Sedang: 0,
                  Rendah: 0,
                };
                risks.forEach((r) => {
                  const lvl = r.level || "Rendah";
                  if (lvl.includes("Tinggi")) summary.Tinggi++;
                  else if (lvl.includes("Sedang")) summary.Sedang++;
                  else summary.Rendah++;
                });
                const items = [
                  {
                    title: "Risiko Tinggi",
                    count: summary.Tinggi,
                    icon: <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />,
                  },
                  {
                    title: "Risiko Sedang",
                    count: summary.Sedang,
                    icon: <Gauge className="mr-2 h-5 w-5 text-amber-500" />,
                  },
                  {
                    title: "Risiko Rendah",
                    count: summary.Rendah,
                    icon: <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />,
                  },
                ];
                return items.map((it) => {
                  const pct = Math.round((it.count / (risks.length || 1)) * 100);
                  return (
                      <Card key={it.title} className="shadow-md border-border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center">
                            {it.icon}
                            {it.title}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">
                            Perhitungan: {it.count}/{risks.length} ({pct}%)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-2">{it.count}</div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Progress value={pct} className="h-2" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{pct}% dari total risiko</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardContent>
                      </Card>
                  );
                });
              })()}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                const mitigatedRisks = metrics.totalRisks - metrics.activeRisks;
                const mitigationRate = metrics.totalRisks
                    ? Math.round((mitigatedRisks / metrics.totalRisks) * 100)
                    : 0;
                return (
                    <Card className="shadow-md border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <ShieldCheck className="mr-2 h-5 w-5 text-green-500" />
                          Status Mitigasi Risiko
                        </CardTitle>
                        <CardDescription>Progress penanganan risiko</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-red-600">
                              {metrics.activeRisks}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Risiko Terbuka
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {mitigatedRisks}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Risiko Dimitigasi
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <div className="text-sm font-medium">Tingkat Mitigasi</div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Progress value={mitigationRate} className="h-2" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Perhitungan: {mitigatedRisks}/{metrics.totalRisks}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="text-xs text-muted-foreground text-center">
                            {mitigationRate}% risiko telah dimitigasi
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                );
              })()}

              <Card className="shadow-sm border-border">
                <CardHeader>
                  <CardTitle>Daftar Risiko Terbaru</CardTitle>
                  <CardDescription>5 risiko terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Nama</th>
                        <th className="text-left py-2 px-3">Level</th>
                        <th className="text-left py-2 px-3">Status</th>
                      </tr>
                      </thead>
                      <tbody>
                      {risks.slice(-5).reverse().map((r) => (
                          <tr key={r._id} className="border-b">
                            <td className="py-2 px-3">{r.name || r._id}</td>
                            <td className="py-2 px-3">{r.level || "-"}</td>
                            <td className="py-2 px-3">{r.status || "-"}</td>
                          </tr>
                      ))}
                      {risks.length === 0 && (
                          <tr>
                            <td colSpan={3} className="text-center p-6 text-muted-foreground">
                              Belum ada risiko
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Audit */}
          <TabsContent value="audit" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {(() => {
                const completed = audits.filter((a) => isCompletedStatus(a.status)).length;
                const scheduled = audits.filter((a) => !isCompletedStatus(a.status)).length;
                const totalFindings = findings.length;
                const items = [
                  {
                    title: "Audit Selesai",
                    count: completed,
                    desc: `Perhitungan: ${completed}/${audits.length}`,
                    icon: <ShieldCheck className="mr-2 h-5 w-5 text-green-500" />,
                  },
                  {
                    title: "Audit Dijadwalkan",
                    count: scheduled,
                    desc: "Belum selesai",
                    icon: <Clock3 className="mr-2 h-5 w-5 text-blue-500" />,
                  },
                  {
                    title: "Total Temuan",
                    count: totalFindings,
                    desc: "Semua temuan",
                    icon: <ListChecks className="mr-2 h-5 w-5 text-amber-500" />,
                  },
                ];
                return items.map((it) => (
                    <Card key={it.title} className="shadow-md border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          {it.icon}
                          {it.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          {it.desc}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{it.count}</p>
                      </CardContent>
                    </Card>
                ));
              })()}
            </div>
            <Card className="shadow-sm border-border">
              <CardHeader>
                <CardTitle>Audit Terakhir</CardTitle>
                <CardDescription>5 audit terakhir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Nama</th>
                      <th className="text-left py-2 px-3">Jenis</th>
                      <th className="text-left py-2 px-3">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {audits.slice(-5).reverse().map((a) => (
                        <tr key={a._id} className="border-b">
                          <td className="py-2 px-3">{a.name}</td>
                          <td className="py-2 px-3">{a.auditType || "-"}</td>
                          <td className="py-2 px-3">{a.status}</td>
                        </tr>
                    ))}
                    {audits.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center p-6 text-muted-foreground">
                            Belum ada audit
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Dokumen */}
          <TabsContent value="dokumen" className="mt-4">
            {(() => {
              const total = documents.length;
              const aktif = documents.filter((d) => d.status === "Aktif").length;
              const review = documents.filter((d) => d.status === "Review").length;
              const draft = documents.filter((d) => d.status === "Draft").length;
              const items = [
                {
                  title: "Total Dokumen",
                  count: total,
                  desc: "Semua kategori",
                  icon: <FileText className="mr-2 h-5 w-5 text-blue-500" />,
                  valueClass: "",
                },
                {
                  title: "Dokumen Aktif",
                  count: aktif,
                  desc: "dari total",
                  icon: <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />,
                  valueClass: "text-green-600",
                },
                {
                  title: "Perlu Review",
                  count: review,
                  desc: "dari total",
                  icon: <Clock3 className="mr-2 h-5 w-5 text-yellow-500" />,
                  valueClass: "text-yellow-600",
                },
                {
                  title: "Draft",
                  count: draft,
                  desc: "dari total",
                  icon: <FileText className="mr-2 h-5 w-5 text-purple-500" />,
                  valueClass: "text-purple-600",
                },
              ];
              return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {items.map((it) => (
                        <Card key={it.title} className="shadow-md border-border">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center">
                              {it.icon}
                              {it.title}
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                              {it.desc}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className={cn("text-2xl font-bold", it.valueClass)}>
                              {it.count}
                            </p>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
              );
            })()}
            <Card className="shadow-sm border-border">
              <CardHeader>
                <CardTitle>Dokumen Terakhir</CardTitle>
                <CardDescription>5 dokumen terakhir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Nama</th>
                      <th className="text-left py-2 px-3">Versi</th>
                      <th className="text-left py-2 px-3">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {documents.slice(-5).reverse().map((d) => (
                        <tr key={d.id} className="border-b">
                          <td className="py-2 px-3">{d.name}</td>
                          <td className="py-2 px-3">{d.version}</td>
                          <td className="py-2 px-3">{d.status}</td>
                        </tr>
                    ))}
                    {documents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center p-6 text-muted-foreground">
                            Belum ada dokumen
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}