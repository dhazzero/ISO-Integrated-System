"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, ArrowLeft, Calendar, User, FileText } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function RiskDetailPage() {
  const params = useParams()
  const riskId = params.id

  // Mock data - dalam implementasi nyata, ini akan diambil dari API berdasarkan ID
  const [risk] = useState({
    id: riskId,
    name: "Kebocoran Data Pelanggan",
    description: "Risiko kebocoran data pelanggan akibat serangan siber atau kelalaian dalam pengelolaan data",
    category: "Keamanan Informasi",
    level: "Tinggi",
    likelihood: "Sedang",
    impact: "Tinggi",
    status: "Open",
    trend: "up",
    owner: "Tim IT",
    createdAt: "2023-05-15",
    updatedAt: "2023-07-20",
    inherentRisk: {
      likelihood: "Tinggi",
      impact: "Tinggi",
      level: "Tinggi",
    },
    residualRisk: {
      likelihood: "Sedang",
      impact: "Tinggi",
      level: "Tinggi",
    },
    controls: [
      { id: 1, name: "Firewall dan Antivirus", status: "Implemented", effectiveness: "High" },
      { id: 2, name: "Enkripsi Data", status: "Implemented", effectiveness: "High" },
      { id: 3, name: "Pelatihan Keamanan", status: "Partial", effectiveness: "Medium" },
      { id: 4, name: "Backup Data Reguler", status: "Implemented", effectiveness: "High" },
    ],
    mitigationActions: [
      {
        id: 1,
        action: "Implementasi Multi-Factor Authentication",
        dueDate: "2023-08-15",
        status: "In Progress",
        responsible: "Tim IT",
      },
      { id: 2, action: "Audit Keamanan Berkala", dueDate: "2023-09-01", status: "Planned", responsible: "Tim Audit" },
      {
        id: 3,
        action: "Update Kebijakan Keamanan",
        dueDate: "2023-08-30",
        status: "In Progress",
        responsible: "Tim Compliance",
      },
    ],
    history: [
      { date: "2023-07-20", action: "Risk level updated from Medium to High", user: "Admin" },
      { date: "2023-07-15", action: "New mitigation action added", user: "IT Manager" },
      { date: "2023-06-01", action: "Risk assessment completed", user: "Risk Manager" },
      { date: "2023-05-15", action: "Risk created", user: "Admin" },
    ],
  })

  const getLevelColor = (level) => {
    switch (level) {
      case "Tinggi":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "Sedang":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
      case "Rendah":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Implemented":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "Partial":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "Planned":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/risk">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{risk.name}</h1>
            <p className="text-muted-foreground">ID: {risk.id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/risk/${risk.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Risiko
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Level Risiko</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getLevelColor(risk.level)}>{risk.level}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(risk.status)}>{risk.status === "Open" ? "Terbuka" : "Tertutup"}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pemilik Risiko</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              {risk.owner}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
          <TabsTrigger value="assessment">Penilaian</TabsTrigger>
          <TabsTrigger value="controls">Kontrol</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigasi</TabsTrigger>
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
                  <p className="mt-1">{risk.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                  <p className="mt-1">{risk.category}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dibuat</label>
                    <p className="mt-1 flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {risk.createdAt}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Diperbarui</label>
                    <p className="mt-1 flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {risk.updatedAt}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Penilaian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kemungkinan</label>
                  <Badge className={getLevelColor(risk.likelihood)}>{risk.likelihood}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dampak</label>
                  <Badge className={getLevelColor(risk.impact)}>{risk.impact}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Level Risiko</label>
                  <Badge className={getLevelColor(risk.level)}>{risk.level}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessment">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risiko Inheren</CardTitle>
                <CardDescription>Risiko sebelum penerapan kontrol</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kemungkinan</label>
                    <Badge className={getLevelColor(risk.inherentRisk.likelihood)}>
                      {risk.inherentRisk.likelihood}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dampak</label>
                    <Badge className={getLevelColor(risk.inherentRisk.impact)}>{risk.inherentRisk.impact}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Level Risiko</label>
                  <Badge className={getLevelColor(risk.inherentRisk.level)}>{risk.inherentRisk.level}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risiko Residual</CardTitle>
                <CardDescription>Risiko setelah penerapan kontrol</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kemungkinan</label>
                    <Badge className={getLevelColor(risk.residualRisk.likelihood)}>
                      {risk.residualRisk.likelihood}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dampak</label>
                    <Badge className={getLevelColor(risk.residualRisk.impact)}>{risk.residualRisk.impact}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Level Risiko</label>
                  <Badge className={getLevelColor(risk.residualRisk.level)}>{risk.residualRisk.level}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls">
          <Card>
            <CardHeader>
              <CardTitle>Kontrol yang Diterapkan</CardTitle>
              <CardDescription>Daftar kontrol untuk memitigasi risiko ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nama Kontrol</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Efektivitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risk.controls.map((control) => (
                      <tr key={control.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{control.name}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(control.status)}>
                            {control.status === "Implemented"
                              ? "Diterapkan"
                              : control.status === "Partial"
                                ? "Sebagian"
                                : control.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getLevelColor(control.effectiveness)}>
                            {control.effectiveness === "High"
                              ? "Tinggi"
                              : control.effectiveness === "Medium"
                                ? "Sedang"
                                : "Rendah"}
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

        <TabsContent value="mitigation">
          <Card>
            <CardHeader>
              <CardTitle>Tindakan Mitigasi</CardTitle>
              <CardDescription>Rencana tindakan untuk mengurangi risiko</CardDescription>
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
                    {risk.mitigationActions.map((action) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Perubahan</CardTitle>
              <CardDescription>Log aktivitas dan perubahan pada risiko ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {risk.history.map((entry, index) => (
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
