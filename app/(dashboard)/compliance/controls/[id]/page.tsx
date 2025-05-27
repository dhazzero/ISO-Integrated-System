"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Edit, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function ControlDetailPage() {
  const params = useParams()
  const controlId = params.id

  const [control] = useState({
    id: controlId,
    name: "Kontrol Dokumen",
    description:
      "Sistem kontrol dokumen untuk memastikan dokumen yang digunakan adalah versi terkini dan telah disetujui",
    category: "Dokumentasi",
    owner: "Document Controller",
    status: "Implemented",
    effectiveness: "High",
    lastReview: "2023-06-15",
    nextReview: "2023-12-15",
    createdAt: "2022-01-15",
    updatedAt: "2023-06-15",
    standards: [
      { name: "ISO 9001:2015", clause: "7.5.3", requirement: "Documented Information Control", compliance: 95 },
      { name: "ISO 14001:2015", clause: "7.5.3", requirement: "Documented Information Control", compliance: 90 },
      { name: "ISO 45001:2018", clause: "7.5.3", requirement: "Documented Information Control", compliance: 92 },
      { name: "ISO 27001:2022", clause: "7.5.3", requirement: "Documented Information Control", compliance: 88 },
    ],
    documents: [
      {
        id: 1,
        name: "Prosedur Kontrol Dokumen",
        type: "Procedure",
        version: "2.1",
        status: "Active",
        lastUpdated: "2023-06-15",
      },
      {
        id: 2,
        name: "Form Permintaan Perubahan Dokumen",
        type: "Form",
        version: "1.3",
        status: "Active",
        lastUpdated: "2023-05-20",
      },
      {
        id: 3,
        name: "Daftar Induk Dokumen",
        type: "Record",
        version: "Current",
        status: "Active",
        lastUpdated: "2023-07-01",
      },
    ],
    gaps: [
      {
        id: 1,
        standard: "ISO 27001:2022",
        clause: "7.5.3.2",
        description: "Kontrol akses digital untuk dokumen elektronik belum sepenuhnya diterapkan",
        severity: "Medium",
        impact: "Moderate",
        dueDate: "2023-09-30",
        responsible: "IT Manager",
        status: "Open",
      },
      {
        id: 2,
        standard: "ISO 14001:2015",
        clause: "7.5.3.1",
        description: "Identifikasi dokumen lingkungan perlu diperbaiki",
        severity: "Low",
        impact: "Minor",
        dueDate: "2023-08-15",
        responsible: "Environmental Officer",
        status: "In Progress",
      },
    ],
    evidence: [
      {
        id: 1,
        type: "Audit Report",
        name: "Internal Audit Report - Document Control",
        date: "2023-06-10",
        result: "Compliant",
        auditor: "Internal Auditor",
      },
      {
        id: 2,
        type: "Training Record",
        name: "Document Control Training - Q2 2023",
        date: "2023-04-15",
        result: "Completed",
        participants: 25,
      },
      {
        id: 3,
        type: "Management Review",
        name: "Document Control Effectiveness Review",
        date: "2023-05-30",
        result: "Effective",
        reviewer: "Quality Manager",
      },
    ],
    metrics: [
      { name: "Document Accuracy", value: 98, target: 95, trend: "up" },
      { name: "Version Control Compliance", value: 96, target: 98, trend: "stable" },
      { name: "Access Control Effectiveness", value: 85, target: 90, trend: "down" },
      { name: "Review Timeliness", value: 92, target: 90, trend: "up" },
    ],
    history: [
      { date: "2023-06-15", action: "Control effectiveness updated to High", user: "Quality Manager" },
      { date: "2023-05-30", action: "Management review completed", user: "Quality Manager" },
      { date: "2023-04-15", action: "Training conducted for 25 staff", user: "Training Coordinator" },
      { date: "2023-03-01", action: "Gap analysis completed", user: "Compliance Officer" },
    ],
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "Implemented":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "Partial":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
      case "Not Implemented":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "Active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "Open":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "In Progress":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
      case "Closed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  const getComplianceColor = (compliance) => {
    if (compliance >= 95) return "text-green-600"
    if (compliance >= 85) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/compliance">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{control.name}</h1>
            <p className="text-muted-foreground">Control ID: {control.id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/compliance/controls/${control.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Kontrol
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(control.status)}>
              {control.status === "Implemented" ? "Diterapkan" : control.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Efektivitas</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(control.effectiveness)}>
              {control.effectiveness === "High" ? "Tinggi" : control.effectiveness}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Standar Terkait</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{control.standards.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Kesenjangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{control.gaps.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
          <TabsTrigger value="standards">Standar</TabsTrigger>
          <TabsTrigger value="documents">Dokumen</TabsTrigger>
          <TabsTrigger value="gaps">Kesenjangan</TabsTrigger>
          <TabsTrigger value="evidence">Bukti</TabsTrigger>
          <TabsTrigger value="metrics">Metrik</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Umum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                  <p className="mt-1">{control.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                    <p className="mt-1">{control.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pemilik</label>
                    <p className="mt-1">{control.owner}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tinjauan Terakhir</label>
                    <p className="mt-1">{control.lastReview}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tinjauan Berikutnya</label>
                    <p className="mt-1">{control.nextReview}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Kepatuhan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {control.standards.map((standard, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{standard.name}</span>
                      <span className={`text-sm font-bold ${getComplianceColor(standard.compliance)}`}>
                        {standard.compliance}%
                      </span>
                    </div>
                    <Progress value={standard.compliance} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="standards">
          <Card>
            <CardHeader>
              <CardTitle>Pemetaan Standar</CardTitle>
              <CardDescription>Standar yang terkait dengan kontrol ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Standar</th>
                      <th className="text-left py-3 px-4">Klausul</th>
                      <th className="text-left py-3 px-4">Persyaratan</th>
                      <th className="text-left py-3 px-4">Kepatuhan</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {control.standards.map((standard, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{standard.name}</td>
                        <td className="py-3 px-4">{standard.clause}</td>
                        <td className="py-3 px-4">{standard.requirement}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Progress value={standard.compliance} className="h-2 w-20" />
                            <span className={`text-sm font-bold ${getComplianceColor(standard.compliance)}`}>
                              {standard.compliance}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {standard.compliance >= 95 ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              Compliant
                            </Badge>
                          ) : standard.compliance >= 85 ? (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                              Partial
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                              Non-Compliant
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Dokumen Terkait</CardTitle>
              <CardDescription>Dokumen yang mendukung implementasi kontrol ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nama Dokumen</th>
                      <th className="text-left py-3 px-4">Tipe</th>
                      <th className="text-left py-3 px-4">Versi</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Terakhir Diperbarui</th>
                      <th className="text-left py-3 px-4">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {control.documents.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-blue-500" />
                          {doc.name}
                        </td>
                        <td className="py-3 px-4">{doc.type}</td>
                        <td className="py-3 px-4">{doc.version}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                        </td>
                        <td className="py-3 px-4">{doc.lastUpdated}</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            Lihat
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Kesenjangan</CardTitle>
              <CardDescription>Kesenjangan yang teridentifikasi dalam implementasi kontrol</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Standar</th>
                      <th className="text-left py-3 px-4">Klausul</th>
                      <th className="text-left py-3 px-4">Deskripsi</th>
                      <th className="text-left py-3 px-4">Tingkat</th>
                      <th className="text-left py-3 px-4">Dampak</th>
                      <th className="text-left py-3 px-4">Target</th>
                      <th className="text-left py-3 px-4">PIC</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {control.gaps.map((gap) => (
                      <tr key={gap.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{gap.standard}</td>
                        <td className="py-3 px-4">{gap.clause}</td>
                        <td className="py-3 px-4">{gap.description}</td>
                        <td className="py-3 px-4">
                          <Badge className={getSeverityColor(gap.severity)}>{gap.severity}</Badge>
                        </td>
                        <td className="py-3 px-4">{gap.impact}</td>
                        <td className="py-3 px-4">{gap.dueDate}</td>
                        <td className="py-3 px-4">{gap.responsible}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(gap.status)}>
                            {gap.status === "Open"
                              ? "Terbuka"
                              : gap.status === "In Progress"
                                ? "Dalam Proses"
                                : "Selesai"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle>Bukti Kepatuhan</CardTitle>
              <CardDescription>Bukti yang menunjukkan efektivitas kontrol</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Tipe</th>
                      <th className="text-left py-3 px-4">Nama</th>
                      <th className="text-left py-3 px-4">Tanggal</th>
                      <th className="text-left py-3 px-4">Hasil</th>
                      <th className="text-left py-3 px-4">Detail</th>
                      <th className="text-left py-3 px-4">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {control.evidence.map((evidence) => (
                      <tr key={evidence.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{evidence.type}</td>
                        <td className="py-3 px-4">{evidence.name}</td>
                        <td className="py-3 px-4">{evidence.date}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              evidence.result === "Compliant" || evidence.result === "Effective"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : evidence.result === "Completed"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                            }
                          >
                            {evidence.result}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {evidence.auditor && `Auditor: ${evidence.auditor}`}
                          {evidence.participants && `Peserta: ${evidence.participants}`}
                          {evidence.reviewer && `Reviewer: ${evidence.reviewer}`}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            Lihat
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Metrik Kinerja</CardTitle>
              <CardDescription>Indikator kinerja untuk mengukur efektivitas kontrol</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {control.metrics.map((metric, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{metric.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Aktual</span>
                          <span className="text-2xl font-bold">{metric.value}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Target</span>
                          <span className="text-sm text-muted-foreground">{metric.target}%</span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Tren</span>
                          <span className="text-xs">
                            {metric.trend === "up" ? "📈" : metric.trend === "down" ? "📉" : "➡️"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Aktivitas</CardTitle>
              <CardDescription>Log aktivitas dan perubahan pada kontrol ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {control.history.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{entry.action}</p>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                        <span>{entry.date}</span>
                        <span>•</span>
                        <span>{entry.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
