"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Eye, Edit, Filter, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { AddControlModal } from "@/components/compliance/add-control-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuditLogModal } from "@/components/audit-trail/audit-log-modal"
import { useAuditTrail } from "@/hooks/use-audit-trail"

export default function CompliancePage() {
  const [filterStandard, setFilterStandard] = useState("all")
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newMapping, setNewMapping] = useState({
    requirement: "",
    iso9001: "",
    iso14001: "",
    iso45001: "",
    iso27001: "",
    iso37001: "",
  })

  const { logDelete, logUpdate, logView } = useAuditTrail()

  const standards = [
    { id: 1, name: "ISO 27001:2022", compliance: 85, controls: 42, implemented: 36 },
    { id: 2, name: "ISO 9001:2015", compliance: 78, controls: 38, implemented: 30 },
    { id: 3, name: "ISO 37001:2016", compliance: 92, controls: 45, implemented: 41 },
  ]

  const controls = [
    {
      id: 1,
      name: "Kontrol Dokumen",
      standards: ["ISO 9001", "ISO 27001", "ISO 37001"],
      status: "Implemented",
      effectiveness: "High",
      compliance: 95,
    },
    {
      id: 2,
      name: "Manajemen Risiko",
      standards: ["ISO 9001", "ISO 27001", "ISO 37001"],
      status: "Implemented",
      effectiveness: "High",
      compliance: 92,
    },
    {
      id: 3,
      name: "Audit Internal",
      standards: ["ISO 9001", "ISO 27001", "ISO 37001"],
      status: "Implemented",
      effectiveness: "Medium",
      compliance: 88,
    },
    {
      id: 4,
      name: "Tinjauan Manajemen",
      standards: ["ISO 9001", "ISO 27001", "ISO 37001"],
      status: "Implemented",
      effectiveness: "High",
      compliance: 90,
    },
    {
      id: 5,
      name: "Keamanan Informasi",
      standards: ["ISO 27001"],
      status: "Partial",
      effectiveness: "Medium",
      compliance: 65,
    },
    {
      id: 6,
      name: "Anti-Penyuapan",
      standards: ["ISO 37001"],
      status: "Implemented",
      effectiveness: "High",
      compliance: 88,
    },
  ]

  const gaps = [
    {
      id: 1,
      control: "Keamanan Informasi",
      standard: "ISO 27001:2022",
      clause: "A.8.1.1",
      description: "Inventarisasi aset informasi belum lengkap",
      severity: "High",
      impact: "Significant",
      dueDate: "2023-09-30",
      responsible: "IT Manager",
      status: "Open",
    },
    {
      id: 2,
      control: "Kontrol Dokumen",
      standard: "ISO 27001:2022",
      clause: "7.5.3.2",
      description: "Kontrol akses digital untuk dokumen elektronik belum sepenuhnya diterapkan",
      severity: "Medium",
      impact: "Moderate",
      dueDate: "2023-08-15",
      responsible: "Document Controller",
      status: "In Progress",
    },
    {
      id: 3,
      control: "Anti-Penyuapan",
      standard: "ISO 37001:2016",
      clause: "8.2",
      description: "Prosedur due diligence untuk mitra bisnis perlu diperkuat",
      severity: "Medium",
      impact: "Moderate",
      dueDate: "2023-10-15",
      responsible: "Compliance Officer",
      status: "Open",
    },
    {
      id: 4,
      control: "Pelatihan Kesadaran",
      standard: "ISO 37001:2016",
      clause: "7.3",
      description: "Program pelatihan anti-penyuapan untuk semua karyawan belum lengkap",
      severity: "Low",
      impact: "Minor",
      dueDate: "2023-11-30",
      responsible: "HR Manager",
      status: "Planned",
    },
  ]

  const mapping = [
    {
      id: 1,
      requirement: "Kontrol Dokumen",
      iso9001: "7.5.3",
      iso27001: "7.5.3",
      iso37001: "7.5.3",
      overlap: 3,
    },
    {
      id: 2,
      requirement: "Manajemen Risiko",
      iso9001: "6.1",
      iso27001: "6.1.1",
      iso37001: "6.1",
      overlap: 3,
    },
    {
      id: 3,
      requirement: "Audit Internal",
      iso9001: "9.2",
      iso27001: "9.2",
      iso37001: "9.2",
      overlap: 3,
    },
    {
      id: 4,
      requirement: "Tinjauan Manajemen",
      iso9001: "9.3",
      iso27001: "9.3",
      iso37001: "9.3",
      overlap: 3,
    },
    {
      id: 5,
      requirement: "Kompetensi",
      iso9001: "7.2",
      iso27001: "7.2",
      iso37001: "7.2",
      overlap: 3,
    },
    {
      id: 6,
      requirement: "Anti-Penyuapan",
      iso9001: "",
      iso27001: "",
      iso37001: "8.2",
      overlap: 1,
    },
  ]

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: "", id: null, name: "" })

  const handleDelete = (type, id, name) => {
    setDeleteConfirm({ open: true, type, id, name })
  }

  const confirmDelete = async () => {
    setIsLoading(true)

    // Log the delete action
    const entityData =
        deleteConfirm.type === "control"
            ? controls.find((c) => c.id === deleteConfirm.id)
            : deleteConfirm.type === "gap"
                ? gaps.find((g) => g.id === deleteConfirm.id)
                : mapping.find((m) => m.id === deleteConfirm.id)

    logDelete(
        "Compliance",
        deleteConfirm.type === "control" ? "Control" : deleteConfirm.type === "gap" ? "Gap" : "Mapping",
        deleteConfirm.id.toString(),
        deleteConfirm.name,
        entityData,
        "Admin User",
        "System Administrator",
    )

    // Simulasi API call untuk delete
    setTimeout(() => {
      console.log(`Deleting ${deleteConfirm.type} with ID: ${deleteConfirm.id}`)
      setIsLoading(false)
      setDeleteConfirm({ open: false, type: "", id: null, name: "" })
      // Refresh data here
    }, 1500)
  }

  const handleAddMapping = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulasi API call
    setTimeout(() => {
      setIsLoading(false)
      setIsAddMappingOpen(false)
      setNewMapping({
        requirement: "",
        iso9001: "",
        iso14001: "",
        iso45001: "",
        iso27001: "",
        iso37001: "",
      })
    }, 1500)
  }

  const filteredMapping =
      filterStandard === "all"
          ? mapping
          : mapping.filter((item) => {
            switch (filterStandard) {
              case "iso9001":
                return item.iso9001
              case "iso27001":
                return item.iso27001
              case "iso37001":
                return item.iso37001
              default:
                return true
            }
          })

  const getStatusColor = (status) => {
    switch (status) {
      case "Implemented":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "Partial":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
      case "Not Implemented":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "Open":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "Planned":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pemetaan Kepatuhan</h1>
          <div className="flex space-x-2">
            <AddControlModal />
            <AuditLogModal />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {standards.map((standard) => (
              <Card key={standard.id}>
                <CardHeader className="pb-2">
                  <CardTitle>{standard.name}</CardTitle>
                  <CardDescription>Tingkat Kepatuhan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{standard.compliance}%</span>
                      <span className="text-sm text-muted-foreground">
                    {standard.implemented}/{standard.controls} kontrol
                  </span>
                    </div>
                    <Progress value={standard.compliance} className="h-2" />
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>

        <Tabs defaultValue="controls" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="controls">Kontrol Terintegrasi</TabsTrigger>
            <TabsTrigger value="gaps">Kesenjangan</TabsTrigger>
            <TabsTrigger value="mapping">Pemetaan Standar</TabsTrigger>
          </TabsList>

          <TabsContent value="controls">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Kontrol Lintas Standar</CardTitle>
                <CardDescription>Kontrol yang diterapkan di beberapa standar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nama Kontrol</th>
                      <th className="text-left py-3 px-4">Standar Terkait</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Efektivitas</th>
                      <th className="text-left py-3 px-4">Kepatuhan</th>
                      <th className="text-left py-3 px-4">Tindakan</th>
                    </tr>
                    </thead>
                    <tbody>
                    {controls.map((control) => (
                        <tr key={control.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 flex items-center">
                            <ClipboardList className="mr-2 h-4 w-4 text-green-500" />
                            <Link href={`/compliance/controls/${control.id}`} className="hover:underline">
                              {control.name}
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {control.standards.map((std, idx) => (
                                  <span
                                      key={idx}
                                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs"
                                  >
                                {std}
                              </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(control.status)}>
                              {control.status === "Implemented" ? "Diterapkan" : "Sebagian"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                                className={
                                  control.effectiveness === "High"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                                }
                            >
                              {control.effectiveness === "High" ? "Tinggi" : "Sedang"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Progress value={control.compliance} className="h-2 w-16" />
                              <span className={`text-sm font-bold ${getComplianceColor(control.compliance)}`}>
                              {control.compliance}%
                            </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <Link href={`/compliance/controls/${control.id}`}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        logView(
                                            "Compliance",
                                            "Control",
                                            control.id.toString(),
                                            control.name,
                                            "Current User",
                                            "User",
                                        )
                                    }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/compliance/controls/${control.id}/edit`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete("control", control.id, control.name)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
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

          <TabsContent value="gaps">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Analisis Kesenjangan</CardTitle>
                <CardDescription>Kesenjangan yang teridentifikasi dalam implementasi kontrol</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Kontrol</th>
                      <th className="text-left py-3 px-4">Standar</th>
                      <th className="text-left py-3 px-4">Klausul</th>
                      <th className="text-left py-3 px-4">Deskripsi</th>
                      <th className="text-left py-3 px-4">Tingkat</th>
                      <th className="text-left py-3 px-4">Dampak</th>
                      <th className="text-left py-3 px-4">Target</th>
                      <th className="text-left py-3 px-4">PIC</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Tindakan</th>
                    </tr>
                    </thead>
                    <tbody>
                    {gaps.map((gap) => (
                        <tr key={gap.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <Link href={`/compliance/controls/${gap.id}`} className="hover:underline text-blue-600">
                              {gap.control}
                            </Link>
                          </td>
                          <td className="py-3 px-4">{gap.standard}</td>
                          <td className="py-3 px-4">{gap.clause}</td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="truncate" title={gap.description}>
                              {gap.description}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getSeverityColor(gap.severity)}>
                              {gap.severity === "High" ? "Tinggi" : gap.severity === "Medium" ? "Sedang" : "Rendah"}
                            </Badge>
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
                                      : gap.status === "Planned"
                                          ? "Direncanakan"
                                          : "Selesai"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <Link href={`/compliance/gaps/${gap.id}`}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        logView("Compliance", "Gap", gap.id.toString(), gap.control, "Current User", "User")
                                    }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete("gap", gap.id, gap.description)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
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

          <TabsContent value="mapping">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Matriks Pemetaan Standar</CardTitle>
                    <CardDescription>Pemetaan persyaratan lintas standar ISO</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Select value={filterStandard} onValueChange={setFilterStandard}>
                      <SelectTrigger className="w-48">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter Standar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Standar</SelectItem>
                        <SelectItem value="iso9001">ISO 9001:2015</SelectItem>
                        <SelectItem value="iso27001">ISO 27001:2022</SelectItem>
                        <SelectItem value="iso37001">ISO 37001:2016</SelectItem>
                      </SelectContent>
                    </Select>

                    <Dialog open={isAddMappingOpen} onOpenChange={setIsAddMappingOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Tambah Pemetaan
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Tambah Pemetaan Standar Baru</DialogTitle>
                          <DialogDescription>Masukkan pemetaan persyaratan baru untuk standar ISO.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddMapping} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="requirement">Persyaratan *</Label>
                            <Input
                                id="requirement"
                                value={newMapping.requirement}
                                onChange={(e) => setNewMapping((prev) => ({ ...prev, requirement: e.target.value }))}
                                placeholder="Nama persyaratan"
                                required
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="iso9001">ISO 9001:2015</Label>
                              <Input
                                  id="iso9001"
                                  value={newMapping.iso9001}
                                  onChange={(e) => setNewMapping((prev) => ({ ...prev, iso9001: e.target.value }))}
                                  placeholder="Klausul (contoh: 7.5.3)"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="iso27001">ISO 27001:2022</Label>
                              <Input
                                  id="iso27001"
                                  value={newMapping.iso27001}
                                  onChange={(e) => setNewMapping((prev) => ({ ...prev, iso27001: e.target.value }))}
                                  placeholder="Klausul (contoh: 7.5.3)"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="iso37001">ISO 37001:2016</Label>
                              <Input
                                  id="iso37001"
                                  value={newMapping.iso37001}
                                  onChange={(e) => setNewMapping((prev) => ({ ...prev, iso37001: e.target.value }))}
                                  placeholder="Klausul (contoh: 7.5.3)"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddMappingOpen(false)}>
                              Batal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? "Menyimpan..." : "Simpan Pemetaan"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Persyaratan</th>
                      <th className="text-left py-3 px-4">ISO 9001:2015</th>
                      <th className="text-left py-3 px-4">ISO 27001:2022</th>
                      <th className="text-left py-3 px-4">ISO 37001:2016</th>
                      <th className="text-left py-3 px-4">Overlap</th>
                      <th className="text-left py-3 px-4">Tindakan</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredMapping.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{item.requirement}</td>
                          <td className="py-3 px-4">
                            {item.iso9001 ? (
                                <Badge variant="outline">{item.iso9001}</Badge>
                            ) : (
                                <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {item.iso27001 ? (
                                <Badge variant="outline">{item.iso27001}</Badge>
                            ) : (
                                <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {item.iso37001 ? (
                                <Badge variant="outline">{item.iso37001}</Badge>
                            ) : (
                                <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                              {item.overlap} standar
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete("mapping", item.id, item.requirement)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
                {filteredMapping.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Tidak ada pemetaan yang sesuai dengan filter yang dipilih.
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus{" "}
                {deleteConfirm.type === "control" ? "kontrol" : deleteConfirm.type === "gap" ? "kesenjangan" : "pemetaan"}{" "}
                "{deleteConfirm.name}"?
                <br />
                <span className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, type: "", id: null, name: "" })}>
                Batal
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
                {isLoading ? "Menghapus..." : "Hapus"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}
