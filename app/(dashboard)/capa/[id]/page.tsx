"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, ArrowLeft, Calendar, User, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function CapaDetailPage() {
  const params = useParams()
  const capaId = params.id

  const [capa] = useState({
    id: capaId,
    issue: "Ketidaksesuaian Prosedur Kalibrasi",
    description: "Ditemukan ketidaksesuaian dalam pelaksanaan prosedur kalibrasi alat ukur di laboratorium produksi",
    source: "Audit Internal",
    department: "Produksi",
    dueDate: "2023-08-15",
    status: "Open",
    priority: "High",
    assignedTo: "Supervisor Produksi",
    createdAt: "2023-06-15",
    updatedAt: "2023-07-20",
    rootCause: "Kurangnya pelatihan operator tentang prosedur kalibrasi terbaru",
    correctiveActions: [
      {
        id: 1,
        action: "Pelatihan ulang operator kalibrasi",
        dueDate: "2023-07-30",
        status: "Completed",
        responsible: "HR Manager",
      },
      {
        id: 2,
        action: "Update prosedur kalibrasi",
        dueDate: "2023-08-10",
        status: "In Progress",
        responsible: "QA Manager",
      },
      { id: 3, action: "Audit follow-up", dueDate: "2023-08-15", status: "Planned", responsible: "Internal Auditor" },
    ],
    preventiveActions: [
      {
        id: 1,
        action: "Implementasi checklist kalibrasi",
        dueDate: "2023-08-20",
        status: "Planned",
        responsible: "QA Manager",
      },
      {
        id: 2,
        action: "Pelatihan berkala operator",
        dueDate: "2023-09-01",
        status: "Planned",
        responsible: "HR Manager",
      },
    ],
    attachments: [
      { id: 1, name: "Laporan Audit.pdf", size: "2.5 MB", uploadedAt: "2023-06-15" },
      { id: 2, name: "Foto Ketidaksesuaian.jpg", size: "1.2 MB", uploadedAt: "2023-06-15" },
    ],
    history: [
      { date: "2023-07-20", action: "Status updated to In Progress", user: "QA Manager" },
      { date: "2023-07-15", action: "Corrective action completed", user: "HR Manager" },
      { date: "2023-06-20", action: "Root cause analysis completed", user: "QA Manager" },
      { date: "2023-06-15", action: "CAPA created", user: "Internal Auditor" },
    ],
  })

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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/capa">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{capa.issue}</h1>
            <p className="text-muted-foreground">CAPA ID: {capa.id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/capa/${capa.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit CAPA
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
            <Badge className={getStatusColor(capa.status)}>
              {capa.status === "Open"
                ? "Terbuka"
                : capa.status === "In Progress"
                  ? "Dalam Proses"
                  : capa.status === "Completed"
                    ? "Selesai"
                    : capa.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Prioritas</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getPriorityColor(capa.priority)}>
              {capa.priority === "High" ? "Tinggi" : capa.priority === "Medium" ? "Sedang" : "Rendah"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tenggat Waktu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {capa.dueDate}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Penanggung Jawab</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              {capa.assignedTo}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
          <TabsTrigger value="analysis">Analisis</TabsTrigger>
          <TabsTrigger value="actions">Tindakan</TabsTrigger>
          <TabsTrigger value="attachments">Lampiran</TabsTrigger>
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
                  <label className="text-sm font-medium text-muted-foreground">Deskripsi Masalah</label>
                  <p className="mt-1">{capa.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sumber</label>
                    <p className="mt-1">{capa.source}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Departemen</label>
                    <p className="mt-1">{capa.department}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dibuat</label>
                    <p className="mt-1">{capa.createdAt}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Diperbarui</label>
                    <p className="mt-1">{capa.updatedAt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Tindakan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tindakan Korektif</span>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {capa.correctiveActions.filter((a) => a.status === "Completed").length}/
                    {capa.correctiveActions.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tindakan Preventif</span>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                    {capa.preventiveActions.filter((a) => a.status === "Completed").length}/
                    {capa.preventiveActions.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lampiran</span>
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                    {capa.attachments.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Akar Masalah</CardTitle>
              <CardDescription>Hasil analisis untuk mengidentifikasi penyebab utama masalah</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Akar Penyebab</label>
                  <p className="mt-1 p-4 bg-muted/20 rounded-md">{capa.rootCause}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Metode Analisis</label>
                  <p className="mt-1">5 Why Analysis, Fishbone Diagram</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tim Analisis</label>
                  <p className="mt-1">QA Manager, Supervisor Produksi, Internal Auditor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tindakan Korektif</CardTitle>
                <CardDescription>Tindakan untuk memperbaiki masalah yang telah terjadi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Tindakan</th>
                        <th className="text-left py-3 px-4">Tenggat Waktu</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Penanggung Jawab</th>
                      </tr>
                    </thead>
                    <tbody>
                      {capa.correctiveActions.map((action) => (
                        <tr key={action.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{action.action}</td>
                          <td className="py-3 px-4">{action.dueDate}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(action.status)}>
                              {action.status === "Completed"
                                ? "Selesai"
                                : action.status === "In Progress"
                                  ? "Dalam Proses"
                                  : action.status === "Planned"
                                    ? "Direncanakan"
                                    : action.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{action.responsible}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tindakan Preventif</CardTitle>
                <CardDescription>Tindakan untuk mencegah terulangnya masalah serupa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Tindakan</th>
                        <th className="text-left py-3 px-4">Tenggat Waktu</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Penanggung Jawab</th>
                      </tr>
                    </thead>
                    <tbody>
                      {capa.preventiveActions.map((action) => (
                        <tr key={action.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{action.action}</td>
                          <td className="py-3 px-4">{action.dueDate}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(action.status)}>
                              {action.status === "Completed"
                                ? "Selesai"
                                : action.status === "In Progress"
                                  ? "Dalam Proses"
                                  : action.status === "Planned"
                                    ? "Direncanakan"
                                    : action.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{action.responsible}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Lampiran</CardTitle>
              <CardDescription>Dokumen dan file yang terkait dengan CAPA ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {capa.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.size} • Diunggah {attachment.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Unduh
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Aktivitas</CardTitle>
              <CardDescription>Log aktivitas dan perubahan pada CAPA ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {capa.history.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
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
