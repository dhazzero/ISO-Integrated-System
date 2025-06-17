"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, FileText, Calendar, User, Building, CheckCircle2, AlertTriangle, XCircle, ListChecks } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/components/ui/use-toast';

// Definisikan tipe data di sini
interface Finding {
  _id: string;
  findingType: string;
  severity: string;
  clause: string;
  description: string;
  evidence: string;
  recommendation: string;
  status: string;
}

interface AuditReportData {
  _id: string;
  name: string;
  standard: string;
  department: string;
  auditDate: string;
  completedDate: string;
  auditTeam: string[];
  scope: string;
  objective: string;
  summary: string;
  positiveFindings: string[];
  recommendations: string[];
  nextAuditDate: string;
  findings: Finding[];
}


export default function AuditReportPage() {
  const params = useParams();
  const { toast } = useToast();
  const auditId = params.id as string;
  const [report, setReport] = useState<AuditReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auditId) return;

    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        // Ambil detail audit dan semua finding yang terkait
        const [auditRes, findingsRes] = await Promise.all([
          fetch(`/api/audits/${auditId}`),
          fetch(`/api/findings?auditId=${auditId}`) // API findings perlu mendukung filter ini
        ]);

        if (!auditRes.ok || !findingsRes.ok) throw new Error("Gagal memuat data laporan audit.");

        const auditData = await auditRes.json();
        const findingsData = await findingsRes.json();

        // Gabungkan data menjadi satu objek report
        setReport({
          ...auditData,
          auditDate: auditData.date, // Ganti nama field jika perlu
          auditTeam: [auditData.auditor], // Asumsi auditor adalah tim
          summary: "Audit dilaksanakan selama 2 hari...", // Data statis untuk contoh
          positiveFindings: ["Sistem dokumentasi baik.", "Komitmen manajemen tinggi."], // Data statis
          recommendations: ["Perbaiki sistem kalibrasi.", "Lengkapi training record."], // Data statis
          nextAuditDate: "2025-05-15", // Data statis
          findings: findingsData,
        });

      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: (error as Error).message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [auditId, toast]);

  const getSeverityColor = (severity: string) => { /* ... (fungsi sama seperti sebelumnya) */ };
  const getStatusColor = (status: string) => { /* ... (fungsi sama seperti sebelumnya) */ };

  if (isLoading) return <div className="container p-6 text-center">Memuat laporan...</div>;
  if (!report) return <div className="container p-6 text-center text-red-500">Laporan tidak ditemukan.</div>;

  return (
      <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/audit"><Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Kembali</Button></Link>
            <div><h1 className="text-3xl font-bold">Laporan Audit</h1><p className="text-muted-foreground">{report.name}</p></div>
          </div>
          <div><Button variant="outline"><Download className="mr-2 h-4 w-4" />Export PDF</Button></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* ... (Kartu Informasi Audit, Ringkasan Eksekutif, dll) ... */}
            <Card><CardHeader><CardTitle>Temuan Audit</CardTitle><CardDescription>Detail temuan dan rekomendasi perbaikan</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                {report.findings.map((finding, index) => (
                    <div key={finding._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-semibold">Temuan #{index + 1}</span>
                          <Badge variant="outline">{finding.findingType}</Badge>
                          <Badge variant="destructive">{finding.severity}</Badge>
                          <Badge variant="secondary">Klausul {finding.clause}</Badge>
                        </div>
                        <Badge className={getStatusColor(finding.status)}>{finding.status}</Badge>
                      </div>
                      <div className="space-y-3 mt-2">
                        <div><label className="text-sm font-medium text-muted-foreground">Deskripsi</label><p className="text-sm mt-1">{finding.description}</p></div>
                        <div><label className="text-sm font-medium text-muted-foreground">Bukti</label><p className="text-sm mt-1">{finding.evidence}</p></div>
                        <div><label className="text-sm font-medium text-muted-foreground">Rekomendasi</label><p className="text-sm mt-1">{finding.recommendation}</p></div>
                      </div>
                    </div>
                ))}
              </CardContent>
            </Card>
            <Card><CardHeader><CardTitle>Temuan Positif</CardTitle></CardHeader><CardContent><ul className="list-disc pl-5 space-y-2">{report.positiveFindings.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle>Rekomendasi Umum</CardTitle></CardHeader><CardContent><ul className="list-disc pl-5 space-y-2">{report.recommendations.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent></Card>
          </div>
          <div className="space-y-6">{/* ... (Sidebar: Ringkasan, Aksi Cepat) ... */}</div>
        </div>
      </div>
  )
}