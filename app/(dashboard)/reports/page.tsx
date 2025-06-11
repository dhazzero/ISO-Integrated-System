"use client";

import React, { useMemo, useState } from "react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FileText,
  PlayCircle,
  CheckCircle2,
  Clock3,
  Gauge,
  AlertTriangle,
  ListChecks,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Data Placeholder (sesuaikan dengan data aktual Anda) ---

const dashboardStatsData = {
  kepatuhanKeseluruhan: {
    title: "Kepatuhan Keseluruhan",
    value: "80%",
    description: "Rata-rata tingkat kepatuhan",
    change: "+5% dari periode sebelumnya",
    changeType: "positive" as "positive" | "negative",
    icon: <Target className="h-4 w-4 text-muted-foreground" />,
  },
  risikoAktif: {
    title: "Risiko Aktif",
    value: "23",
    description: "Total risiko yang belum dimitigasi",
    change: "-12% bulan ini",
    changeType: "negative" as "positive" | "negative",
    icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
  },
  capaTerbuka: {
    title: "CAPA Terbuka",
    value: "20",
    description: "Tindakan korektif yang belum selesai",
    change: "+2 dari periode sebelumnya",
    changeType: "positive" as "positive" | "negative",
    icon: <ListChecks className="h-4 w-4 text-muted-foreground" />,
  },
  auditSelesai: {
    title: "Audit Selesai",
    value: "12",
    description: "Total audit yang telah dilaksanakan",
    change: "+4 dari periode sebelumnya",
    changeType: "positive" as "positive" | "negative",
    icon: <ShieldCheck className="h-4 w-4 text-muted-foreground" />,
  },
};

const departmentTrainingData = [
  { name: "Produksi", value: 35, fillKey: "produksi" },
  { name: "QC", value: 20, fillKey: "qc" },
  { name: "HR", value: 15, fillKey: "hr" },
  { name: "IT", value: 25, fillKey: "it" },
  { name: "K3", value: 25, fillKey: "k3" },
];

const trainingStatus = { selesai: 95, berlangsung: 15, direncanakan: 10 };
const tingkatPenyelesaian = 79;
const efektivitasPelatihan = 87;

const ikhtisarChartData = [
  { name: "Dok. Aktif", value: 45, fillKey: "dokumen" },
  { name: "Risiko", value: parseInt(dashboardStatsData.risikoAktif.value), fillKey: "risiko" },
  { name: "CAPA", value: parseInt(dashboardStatsData.capaTerbuka.value), fillKey: "capa" },
  { name: "Audit", value: parseInt(dashboardStatsData.auditSelesai.value), fillKey: "audit" },
];

// --- ChartConfig untuk ChartContainer ---
const chartConfig = {
  value: { label: "Jumlah", color: "hsl(var(--chart-1))" },
  produksi: { label: "Produksi", color: "hsl(var(--chart-1))" },
  qc: { label: "QC", color: "hsl(var(--chart-2))" },
  hr: { label: "HR", color: "hsl(var(--chart-3))" },
  it: { label: "IT", color: "hsl(var(--chart-4))" },
  k3: { label: "K3", color: "hsl(var(--chart-5))" },
  dokumen: { label: "Dokumen", color: "hsl(var(--chart-1))" },
  risiko: { label: "Risiko", color: "hsl(var(--chart-2))" },
  capa: { label: "CAPA", color: "hsl(var(--chart-3))" },
  audit: { label: "Audit", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;


export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("pelatihan");

  const memoizedDepartmentTrainingData = useMemo(() => departmentTrainingData, []);
  const memoizedIkhtisarChartData = useMemo(() => ikhtisarChartData, []);

  return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-background text-foreground">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Pelaporan & Dasbor
          </h1>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Ekspor Laporan
          </Button>
        </div>

        {/* Kartu Statistik Utama */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.values(dashboardStatsData).map((stat) => (
              <Card key={stat.title} className="shadow-sm border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <p
                      className={cn(
                          "text-xs font-medium flex items-center",
                          stat.changeType === "positive"
                              ? "text-[hsl(var(--chart-2))]" // Warna hijau dari palet chart Anda
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
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-md md:grid-cols-6 bg-muted p-1">
            <TabsTrigger value="ikhtisar" className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Ikhtisar</TabsTrigger>
            <TabsTrigger value="kepatuhan" className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Kepatuhan</TabsTrigger>
            <TabsTrigger value="risiko" className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Risiko</TabsTrigger>
            <TabsTrigger value="audit" className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Audit</TabsTrigger>
            <TabsTrigger value="capa" className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">CAPA</TabsTrigger>
            <TabsTrigger value="pelatihan" className="rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Pelatihan</TabsTrigger>
          </TabsList>

          {/* --- KONTEN TAB IKHTISAR --- */}
          <TabsContent value="ikhtisar" className="mt-4">
            <Card className="shadow-sm border-border">
              <CardHeader>
                <CardTitle>Ikhtisar Metrik Kunci</CardTitle>
                <CardDescription>
                  Visualisasi ringkas dari berbagai metrik penting dalam sistem.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <BarChart accessibilityLayer data={memoizedIkhtisarChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }} >
                    <CartesianGrid vertical={false} className="stroke-border/50" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent className="bg-background text-foreground border-border shadow-lg" />}/>
                    <Bar dataKey="value" radius={4}>
                      {memoizedIkhtisarChartData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.fillKey]?.color || chartConfig.value.color} />
                      ))}
                      <LabelList position="top" offset={8} className="fill-foreground" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- KONTEN TAB PELATIHAN --- */}
          <TabsContent value="pelatihan" className="mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 shadow-sm border-border">
                <CardHeader>
                  <CardTitle>Pelatihan berdasarkan Departemen</CardTitle>
                  <CardDescription>
                    Distribusi jumlah pelatihan yang diikuti atau direncanakan per departemen.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart accessibilityLayer data={memoizedDepartmentTrainingData} layout="vertical" margin={{ left: 10, top: 5, right: 30, bottom: 5 }}>
                      <CartesianGrid horizontal={false} className="stroke-border/50" />
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={60} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <XAxis dataKey="value" type="number" hide />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent className="bg-background text-foreground border-border shadow-lg" />}/>
                      <Bar dataKey="value" layout="vertical" radius={[0, 4, 4, 0]}>
                        {memoizedDepartmentTrainingData.map((entry) => (
                            <Cell key={`cell-dept-${entry.name}`} fill={chartConfig[entry.fillKey]?.color || chartConfig.value.color} />
                        ))}
                        <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={12} />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="shadow-sm border-border">
                  <CardHeader className="pb-4">
                    <CardTitle>Status Pelatihan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "Selesai", value: trainingStatus.selesai, icon: <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> },
                      { label: "Berlangsung", value: trainingStatus.berlangsung, icon: <PlayCircle className="mr-2 h-4 w-4 text-blue-500" /> },
                      { label: "Direncanakan", value: trainingStatus.direncanakan, icon: <Clock3 className="mr-2 h-4 w-4 text-amber-500" /> },
                    ].map(status => (
                        <div key={status.label} className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-muted-foreground">
                            {status.icon}
                            {status.label}
                          </div>
                          <span className="font-semibold text-foreground">
                        {status.value}
                      </span>
                        </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border">
                  <CardHeader className="pb-2">
                    <CardTitle>Tingkat Penyelesaian</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold text-foreground">
                      {tingkatPenyelesaian}%
                    </div>
                    <Progress value={tingkatPenyelesaian} className="h-2" indicatorClassName="bg-primary" />
                    <p className="text-xs text-muted-foreground">
                      {tingkatPenyelesaian}% pelatihan telah selesai
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border">
                  <CardHeader className="pb-2">
                    <CardTitle>Efektivitas Pelatihan</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-start justify-center pt-2">
                    <div className="text-4xl font-bold text-primary">
                      {efektivitasPelatihan}%
                    </div>
                    <Gauge className="mt-2 h-8 w-8 text-primary opacity-70" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* --- KONTEN TAB PLACEHOLDER LAINNYA --- */}
          {["kepatuhan", "risiko", "audit", "capa"].map((tabName) => (
              <TabsContent key={tabName} value={tabName} className="mt-4">
                <Card className="shadow-sm border-border">
                  <CardHeader><CardTitle>Detail {tabName.charAt(0).toUpperCase() + tabName.slice(1)}</CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground">Konten detail untuk {tabName} akan ditampilkan di sini.</p></CardContent>
                </Card>
              </TabsContent>
          ))}
        </Tabs>
      </div>
  );
}
