"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Edit, ArrowLeft, Calendar, FileText, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function GapDetailPage() {
  const params = useParams()
  const gapId = params.id

  const [gap] = useState({
    id: gapId,
    control: "Keamanan Informasi",
    standard: "ISO 27001:2022",
    clause: "A.8.1.1",
    description: "Inventarisasi aset informasi belum lengkap dan tidak mencakup semua sistem informasi yang digunakan",
    severity: "High",
    impact: "Significant",
    dueDate: "2023-09-30",
    responsible: "IT Manager",
    status: "Open",
    createdAt: "2023-06-01",
    updatedAt: "2023-07-15",
    rootCause: "Kurangnya prosedur formal untuk inventarisasi aset dan tidak adanya sistem tracking yang terintegrasi",
    businessImpact: "Risiko kehilangan data, kesulitan dalam manajemen keamanan, dan potensi non-compliance",
    currentState: "Inventarisasi dilakukan secara manual dan tidak terstruktur, hanya mencakup 60% dari total aset",
    targetState: "Sistem inventarisasi otomatis yang mencakup 100% aset dengan update real-time",
    actions: [
      {
        id: 1,
        action: "Implementasi sistem inventarisasi aset otomatis",
        dueDate: "2023-08-15",
        status: "In Progress",
        responsible: "IT Manager",
        progress: 65,
      },
      {
        id: 2,
        action: "Pelatihan tim IT tentang manajemen aset",
        dueDate: "2023-08-30",
        status: "Planned",
        responsible: "HR Manager",
        progress: 0,
      },
      {
        id: 3,
        action: "Audit inventarisasi aset",
        dueDate: "2023-09-15",
        status: "Planned",
        responsible: "Internal Auditor",
        progress: 0,
      },
    ],
    evidence: [
      {
        id: 1,
        type: "Assessment Report",
        name: "Gap Analysis Report - Asset Management",
        date: "2023-06-01",
        status: "Completed",
      },
      {
        id: 2,
        type: "Current Inventory",
        name: "Current IT Asset List",
        date: "2023-06-15",
        status: "Partial",
      },
    ],
    relatedControls: [
      { id: 1, name: "Kontrol Akses", compliance: 75 },
      { id: 2, name: "Manajemen Konfigurasi", compliance: 60 },
      { id: 3, name: "Backup dan Recovery", compliance: 85 },
    ],
    history: [
      { date: "2023-07-15", action: "Action plan updated", user: "IT Manager" },
      { date: "2023-06-20", action: "Root cause analysis completed", user: "Security Officer" },
      { date: "2023-06-10", action: "Impact assessment completed", user: "Risk Manager" },
      { date: "2023-06-01", action: "Gap identified", user: "Internal Auditor" },
    ],
  })

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "Planned":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "Partial":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  const getComplianceColor = (compliance) => {
    if (compliance >= 85) return "text-green-600"
    if (compliance >= 70) return "text-amber-600"
    return "text-red-600"
  }

  const overallProgress = gap.actions.reduce((sum, action) => sum + action.progress, 0) / gap.actions.length

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
            <h1 className="text-3xl font-bold">Detail Kesenjangan</h1>
            <p className="text-muted-foreground">
              {gap.standard} - {gap.clause}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/compliance/gaps/${gap.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Kesenjangan
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tingkat Kesenjangan</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getSeverityColor(gap.severity)}>
              {gap.severity === "High" ? "Tinggi" : gap.severity === "Medium" ? "Sedang" : "Rendah"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(gap.status)}>{gap.status === "Open" ? "Terbuka" : gap.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Progress Penyelesaian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Target Penyelesaian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {gap.dueDate}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
          <TabsTrigger value="analysis">Analisis</TabsTrigger>
          <TabsTrigger value="actions">Rencana Tindakan</TabsTrigger>
          <TabsTrigger value="evidence">Bukti</TabsTrigger>
          <TabsTrigger value="impact">Dampak</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kesenjangan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kontrol Terkait</label>
                  <p className="mt-1">{gap.control}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                  <p className="mt-1">{gap.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dampak Bisnis</label>
                    <p className="mt-1">{gap.impact}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Penanggung Jawab</label>
                    <p className="mt-1">{gap.responsible}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kontrol Terkait</CardTitle>
                <CardDescription>Kontrol lain yang terpengaruh oleh kesenjangan ini</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gap.relatedControls.map((control) => (
                  <div key={control.id} className="flex items-center justify-between">
                    <span className="text-sm">{control.name}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={control.compliance} className="h-2 w-20" />
                      <span className={`text-sm font-bold ${getComplianceColor(control.compliance)}`}>
                        {control.compliance}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analisis Akar Penyebab</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Akar Penyebab</label>
                  <p className="mt-1 p-4 bg-muted/20 rounded-md">{gap.rootCause}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dampak Bisnis</label>
                  <p className="mt-1 p-4 bg-muted/20 rounded-md">{gap.businessImpact}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kondisi Saat Ini vs Target</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kondisi Saat Ini</label>
                  <p className="mt-1 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">{gap.currentState}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Target yang Diinginkan</label>
                  <p className="mt-1 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">{gap.targetState}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Rencana Tindakan Perbaikan</CardTitle>
              <CardDescription>Tindakan yang direncanakan untuk menutup kesenjangan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Tindakan</th>
                      <th className="text-left py-3 px-4">Target Selesai</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Penanggung Jawab</th>
                      <th className="text-left py-3 px-4">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gap.actions.map((action) => (
                      <tr key={action.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{action.action}</td>
                        <td className="py-3 px-4">{action.dueDate}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(action.status)}>
                            {action.status === "In Progress"
                              ? "Dalam Proses"
                              : action.status === "Planned"
                                ? "Direncanakan"
                                : action.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{action.responsible}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Progress value={action.progress} className="h-2 w-20" />
                            <span className="text-sm">{action.progress}%</span>
                          </div>
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
              <CardTitle>Bukti dan Dokumentasi</CardTitle>
              <CardDescription>Dokumen pendukung untuk analisis kesenjangan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Tipe</th>
                      <th className="text-left py-3 px-4">Nama Dokumen</th>
                      <th className="text-left py-3 px-4">Tanggal</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gap.evidence.map((evidence) => (
                      <tr key={evidence.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{evidence.type}</td>
                        <td className="py-3 px-4 flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-blue-500" />
                          {evidence.name}
                        </td>
                        <td className="py-3 px-4">{evidence.date}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(evidence.status)}>{evidence.status}</Badge>
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

        <TabsContent value="impact">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Dampak</CardTitle>
              <CardDescription>Dampak kesenjangan terhadap organisasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Dampak Operasional</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <AlertTriangle className="mr-2 h-4 w-4 text-amber-500 mt-0.5" />
                      Kesulitan dalam tracking dan monitoring aset IT
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="mr-2 h-4 w-4 text-amber-500 mt-0.5" />
                      Potensi kehilangan aset atau data penting
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="mr-2 h-4 w-4 text-amber-500 mt-0.5" />
                      Ineffisiensi dalam manajemen sumber daya
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Dampak Kepatuhan</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <AlertTriangle className="mr-2 h-4 w-4 text-red-500 mt-0.5" />
                      Non-compliance terhadap ISO 27001:2022
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="mr-2 h-4 w-4 text-red-500 mt-0.5" />
                      Potensi sanksi dari regulator
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="mr-2 h-4 w-4 text-red-500 mt-0.5" />
                      Risiko gagal sertifikasi
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Aktivitas</CardTitle>
              <CardDescription>Log aktivitas dan perubahan pada kesenjangan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gap.history.map((entry, index) => (
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
