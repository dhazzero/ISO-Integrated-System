"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Edit,
  Download,
  FileText,
  ImageIcon,
  File,
} from "lucide-react"
import Link from "next/link"
import AddCapaModal from "@/components/capa/add-capa-modal"

export default function CapaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"open" | "in-progress" | "closed">("open")
  const [capas, setCapas] = useState([
    {
      id: 1,
      issue: "Ketidaksesuaian Prosedur Kalibrasi",
      source: "Audit Internal",
      department: "Produksi",
      dueDate: "2023-08-15",
      status: "Open",
      priority: "High",
      responsible: "Ahmad Susanto",
      category: "Corrective",
      description: "Ditemukan ketidaksesuaian dalam prosedur kalibrasi alat ukur",
      files: [
        { name: "foto-ketidaksesuaian.jpg", type: "image", url: "#" },
        { name: "prosedur-kalibrasi.pdf", type: "document", url: "#" },
      ],
    },
    {
      id: 2,
      issue: "Dokumentasi Pelatihan Tidak Lengkap",
      source: "Audit Eksternal",
      department: "HR",
      dueDate: "2023-07-30",
      status: "In Progress",
      priority: "Medium",
      responsible: "Siti Nurhaliza",
      category: "Corrective",
      description: "Record pelatihan karyawan tidak lengkap dan tidak ter-update",
      files: [{ name: "audit-report.pdf", type: "document", url: "#" }],
    },
    {
      id: 3,
      issue: "Pengelolaan Limbah Tidak Sesuai",
      source: "Inspeksi",
      department: "Operasional",
      dueDate: "2023-08-05",
      status: "In Progress",
      priority: "High",
      responsible: "Budi Santoso",
      category: "Both",
      description: "Pengelolaan limbah B3 tidak sesuai dengan prosedur yang ditetapkan",
      files: [
        { name: "foto-limbah.jpg", type: "image", url: "#" },
        { name: "prosedur-limbah.pdf", type: "document", url: "#" },
        { name: "analisis-limbah.xls", type: "spreadsheet", url: "#" },
      ],
    },
    {
      id: 4,
      issue: "Keamanan Data Pelanggan",
      source: "Audit Keamanan",
      department: "IT",
      dueDate: "2023-06-20",
      status: "Closed",
      priority: "High",
      responsible: "Andi Wijaya",
      category: "Preventive",
      description: "Sistem keamanan data pelanggan perlu diperkuat",
      files: [
        { name: "security-assessment.pdf", type: "document", url: "#" },
        { name: "implementation-report.pdf", type: "document", url: "#" },
      ],
    },
    {
      id: 5,
      issue: "Prosedur Tanggap Darurat Tidak Diikuti",
      source: "Simulasi",
      department: "K3",
      dueDate: "2023-07-10",
      status: "Closed",
      priority: "Medium",
      responsible: "Dewi Sartika",
      category: "Corrective",
      description: "Karyawan tidak mengikuti prosedur tanggap darurat dengan benar",
      files: [
        { name: "simulasi-report.pdf", type: "document", url: "#" },
        { name: "training-material.pdf", type: "document", url: "#" },
      ],
    },
  ])

  const capaSummary = useMemo(() => {
    const open = capas.filter((c) => c.status === "Open").length
    const inProgress = capas.filter((c) => c.status === "In Progress").length
    const closed = capas.filter((c) => c.status === "Closed").length

    return [
      { status: "Terbuka", count: open, color: "bg-red-500" },
      { status: "Dalam Proses", count: inProgress, color: "bg-amber-500" },
      { status: "Selesai", count: closed, color: "bg-green-500" },
    ]
  }, [capas])

  const addCapa = (newCapa: any) => {
    setCapas((prev) => [...prev, newCapa])
  }

  const openModal = (mode: "open" | "in-progress" | "closed") => {
    setModalMode(mode)
    setIsModalOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "Closed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "Open":
        return "Terbuka"
      case "In Progress":
        return "Dalam Proses"
      case "Closed":
        return "Selesai"
      default:
        return status
    }
  }

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
      case "High":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
      case "Medium":
        return "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100"
      case "Low":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "Kritis"
      case "High":
        return "Tinggi"
      case "Medium":
        return "Sedang"
      case "Low":
        return "Rendah"
      default:
        return priority
    }
  }

  const getCategoryClass = (category: string) => {
    switch (category) {
      case "Corrective":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100"
      case "Preventive":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
      case "Both":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "Corrective":
        return "Korektif"
      case "Preventive":
        return "Preventif"
      case "Both":
        return "Korektif & Preventif"
      default:
        return category
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const filterCapasByStatus = (status: string) => {
    return capas.filter((capa) => capa.status === status)
  }

  const renderCapaTable = (filteredCapas: any[], showAdditionalColumns = false) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Masalah</th>
            <th className="text-left py-3 px-4">Kategori</th>
            <th className="text-left py-3 px-4">Sumber</th>
            <th className="text-left py-3 px-4">Departemen</th>
            <th className="text-left py-3 px-4">Penanggung Jawab</th>
            <th className="text-left py-3 px-4">Due Date</th>
            <th className="text-left py-3 px-4">Prioritas</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Files</th>
            <th className="text-left py-3 px-4">Tindakan</th>
          </tr>
        </thead>
        <tbody>
          {filteredCapas.map((capa) => (
            <tr key={capa.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4">
                <div className="flex items-start">
                  <Shield className="mr-2 h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <Link href={`/capa/${capa.id}`} className="hover:underline font-medium">
                      {capa.issue}
                    </Link>
                    {capa.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{capa.description}</p>}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge className={`text-xs ${getCategoryClass(capa.category)}`}>{getCategoryText(capa.category)}</Badge>
              </td>
              <td className="py-3 px-4">{capa.source}</td>
              <td className="py-3 px-4">{capa.department}</td>
              <td className="py-3 px-4">{capa.responsible}</td>
              <td className="py-3 px-4">{capa.dueDate}</td>
              <td className="py-3 px-4">
                <Badge className={`text-xs ${getPriorityClass(capa.priority)}`}>{getPriorityText(capa.priority)}</Badge>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  {getStatusIcon(capa.status)}
                  <span className="ml-1 text-sm">{getStatusText(capa.status)}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {capa.files?.map((file: any, index: number) => (
                    <Button key={index} variant="ghost" size="sm" className="h-6 px-2 text-xs" title={file.name}>
                      {getFileIcon(file.type)}
                      <Download className="h-3 w-3 ml-1" />
                    </Button>
                  ))}
                  {(!capa.files || capa.files.length === 0) && <span className="text-xs text-gray-400">No files</span>}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-1">
                  <Link href={`/capa/${capa.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/capa/${capa.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen CAPA</h1>
        <div className="flex space-x-2">
          <Button onClick={() => openModal("open")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah CAPA
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {capaSummary.map((capa, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle>CAPA {capa.status}</CardTitle>
              <CardDescription>Total CAPA dengan status {capa.status.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${capa.color} mr-2`}></div>
                <span className="text-3xl font-bold">{capa.count}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Semua CAPA</TabsTrigger>
          <TabsTrigger value="open">Terbuka</TabsTrigger>
          <TabsTrigger value="in-progress">Dalam Proses</TabsTrigger>
          <TabsTrigger value="closed">Selesai</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Daftar Semua CAPA</CardTitle>
              <CardDescription>Daftar semua tindakan korektif dan preventif</CardDescription>
            </CardHeader>
            <CardContent>{renderCapaTable(capas)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="open">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>CAPA Terbuka</CardTitle>
                <CardDescription>CAPA yang baru dibuat dan belum mulai dikerjakan</CardDescription>
              </div>
              <Button onClick={() => openModal("open")}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah CAPA Baru
              </Button>
            </CardHeader>
            <CardContent>{renderCapaTable(filterCapasByStatus("Open"))}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>CAPA Dalam Proses</CardTitle>
                <CardDescription>CAPA yang sedang dalam tahap implementasi</CardDescription>
              </div>
              <Button onClick={() => openModal("in-progress")}>
                <Plus className="mr-2 h-4 w-4" />
                Update Progress
              </Button>
            </CardHeader>
            <CardContent>{renderCapaTable(filterCapasByStatus("In Progress"))}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closed">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>CAPA Selesai</CardTitle>
                <CardDescription>CAPA yang sudah selesai dan diverifikasi efektivitasnya</CardDescription>
              </div>
              <Button onClick={() => openModal("closed")}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah CAPA Selesai
              </Button>
            </CardHeader>
            <CardContent>{renderCapaTable(filterCapasByStatus("Closed"))}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddCapaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddCapa={addCapa} mode={modalMode} />
    </div>
  )
}
