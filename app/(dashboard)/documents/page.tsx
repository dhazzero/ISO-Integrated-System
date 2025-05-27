"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileText,
  Upload,
  Download,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react"

import { AddDocumentModal } from "@/components/documents/add-document-modal"
import { UploadDocumentModal } from "@/components/documents/upload-document-modal"
import { ViewDocumentModal } from "@/components/documents/view-document-modal"

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState("")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Data untuk setiap kategori dokumen
  const policies = [
    {
      id: 1,
      name: "Kebijakan Mutu ISO 9001",
      version: "2.1",
      status: "Aktif",
      approver: "Direktur",
      updatedAt: "2024-01-15",
      nextReview: "2024-07-15",
      description: "Kebijakan mutu perusahaan sesuai ISO 9001:2015",
    },
    {
      id: 2,
      name: "Kebijakan Keamanan Informasi",
      version: "1.3",
      status: "Review",
      approver: "CISO",
      updatedAt: "2024-01-10",
      nextReview: "2024-06-10",
      description: "Kebijakan keamanan informasi ISO 27001",
    },
    {
      id: 3,
      name: "Kebijakan K3 ISO 45001",
      version: "1.8",
      status: "Aktif",
      approver: "HSE Manager",
      updatedAt: "2024-01-20",
      nextReview: "2024-08-20",
      description: "Kebijakan keselamatan dan kesehatan kerja",
    },
    {
      id: 4,
      name: "Kebijakan Lingkungan ISO 14001",
      version: "2.0",
      status: "Draft",
      approver: "Environmental Manager",
      updatedAt: "2024-01-25",
      nextReview: "2024-07-25",
      description: "Kebijakan manajemen lingkungan",
    },
  ]

  const procedures = [
    {
      id: 1,
      name: "Prosedur Audit Internal",
      version: "3.2",
      status: "Aktif",
      owner: "QA Manager",
      updatedAt: "2024-01-12",
      nextReview: "2024-07-12",
      description: "Prosedur pelaksanaan audit internal",
    },
    {
      id: 2,
      name: "Prosedur Manajemen Risiko",
      version: "2.1",
      status: "Aktif",
      owner: "Risk Manager",
      updatedAt: "2024-01-18",
      nextReview: "2024-07-18",
      description: "Prosedur identifikasi dan pengelolaan risiko",
    },
    {
      id: 3,
      name: "Prosedur CAPA",
      version: "1.9",
      status: "Review",
      owner: "QA Manager",
      updatedAt: "2024-01-08",
      nextReview: "2024-06-08",
      description: "Prosedur corrective and preventive action",
    },
    {
      id: 4,
      name: "Prosedur Manajemen Dokumen",
      version: "2.3",
      status: "Aktif",
      owner: "Document Controller",
      updatedAt: "2024-01-22",
      nextReview: "2024-08-22",
      description: "Prosedur pengendalian dokumen dan rekaman",
    },
    {
      id: 5,
      name: "Prosedur Kalibrasi Alat",
      version: "1.5",
      status: "Draft",
      owner: "Maintenance Manager",
      updatedAt: "2024-01-28",
      nextReview: "2024-07-28",
      description: "Prosedur kalibrasi peralatan ukur",
    },
  ]

  const workInstructions = [
    {
      id: 1,
      name: "IK Pengoperasian Mesin Produksi",
      version: "1.4",
      status: "Aktif",
      department: "Produksi",
      updatedAt: "2024-01-14",
      nextReview: "2024-07-14",
      description: "Instruksi kerja pengoperasian mesin produksi utama",
    },
    {
      id: 2,
      name: "IK Inspeksi Kualitas Produk",
      version: "2.2",
      status: "Aktif",
      department: "QC",
      updatedAt: "2024-01-16",
      nextReview: "2024-07-16",
      description: "Instruksi kerja inspeksi kualitas produk",
    },
    {
      id: 3,
      name: "IK Penanganan Material Berbahaya",
      version: "1.7",
      status: "Review",
      department: "HSE",
      updatedAt: "2024-01-11",
      nextReview: "2024-06-11",
      description: "Instruksi kerja penanganan bahan berbahaya",
    },
    {
      id: 4,
      name: "IK Backup Data Sistem",
      version: "1.2",
      status: "Aktif",
      department: "IT",
      updatedAt: "2024-01-19",
      nextReview: "2024-07-19",
      description: "Instruksi kerja backup dan restore data",
    },
    {
      id: 5,
      name: "IK Maintenance Preventif",
      version: "2.0",
      status: "Draft",
      department: "Maintenance",
      updatedAt: "2024-01-26",
      nextReview: "2024-07-26",
      description: "Instruksi kerja maintenance preventif peralatan",
    },
  ]

  const forms = [
    {
      id: 1,
      name: "Form Audit Internal",
      version: "1.8",
      status: "Aktif",
      usage: "Audit",
      updatedAt: "2024-01-13",
      nextReview: "2024-07-13",
      description: "Formulir checklist audit internal",
    },
    {
      id: 2,
      name: "Form Laporan Insiden",
      version: "2.1",
      status: "Aktif",
      usage: "HSE",
      updatedAt: "2024-01-17",
      nextReview: "2024-07-17",
      description: "Formulir pelaporan insiden keselamatan",
    },
    {
      id: 3,
      name: "Form Permintaan CAPA",
      version: "1.5",
      status: "Review",
      usage: "Quality",
      updatedAt: "2024-01-09",
      nextReview: "2024-06-09",
      description: "Formulir permintaan tindakan korektif",
    },
    {
      id: 4,
      name: "Form Evaluasi Pelatihan",
      version: "1.3",
      status: "Aktif",
      usage: "Training",
      updatedAt: "2024-01-21",
      nextReview: "2024-07-21",
      description: "Formulir evaluasi efektivitas pelatihan",
    },
    {
      id: 5,
      name: "Form Risk Assessment",
      version: "2.0",
      status: "Draft",
      usage: "Risk",
      updatedAt: "2024-01-27",
      nextReview: "2024-07-27",
      description: "Formulir penilaian risiko",
    },
  ]

  const manuals = [
    {
      id: 1,
      name: "Manual Sistem Manajemen Mutu",
      version: "3.0",
      status: "Aktif",
      scope: "ISO 9001",
      updatedAt: "2024-01-15",
      nextReview: "2024-07-15",
      description: "Manual sistem manajemen mutu ISO 9001:2015",
    },
    {
      id: 2,
      name: "Manual Keamanan Informasi",
      version: "2.1",
      status: "Aktif",
      scope: "ISO 27001",
      updatedAt: "2024-01-20",
      nextReview: "2024-07-20",
      description: "Manual sistem manajemen keamanan informasi",
    },
    {
      id: 3,
      name: "Manual K3",
      version: "1.9",
      status: "Review",
      scope: "ISO 45001",
      updatedAt: "2024-01-12",
      nextReview: "2024-06-12",
      description: "Manual sistem manajemen K3",
    },
    {
      id: 4,
      name: "Manual Lingkungan",
      version: "2.2",
      status: "Aktif",
      scope: "ISO 14001",
      updatedAt: "2024-01-18",
      nextReview: "2024-07-18",
      description: "Manual sistem manajemen lingkungan",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case "Review":
        return <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>
      case "Draft":
        return <Badge className="bg-blue-100 text-blue-800">Draft</Badge>
      case "Expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Aktif":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Review":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Draft":
        return <Edit className="h-4 w-4 text-blue-500" />
      case "Expired":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const handleAddDocument = (type: string) => {
    setSelectedDocumentType(type)
    setIsAddModalOpen(true)
  }

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc)
    setIsViewModalOpen(true)
  }

  const handleEditDocument = (doc: any) => {
    setSelectedDocument(doc)
    setIsEditModalOpen(true)
  }

  const handleDownloadDocument = (doc: any) => {
    // Simulate download
    const link = document.createElement("a")
    link.href = `/api/documents/${doc.id}/download`
    link.download = `${doc.name}_v${doc.version}.pdf`
    link.click()
  }

  const handleDeleteDocument = (doc: any) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${doc.name}?`)) {
      console.log("Deleting document:", doc.id)
      // Implement delete logic
    }
  }

  const DocumentTable = ({ documents, extraColumns = [] }: { documents: any[]; extraColumns?: string[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Nama Dokumen</th>
            <th className="text-left py-3 px-4">Versi</th>
            <th className="text-left py-3 px-4">Status</th>
            {extraColumns.map((col) => (
              <th key={col} className="text-left py-3 px-4">
                {col}
              </th>
            ))}
            <th className="text-left py-3 px-4">Terakhir Diperbarui</th>
            <th className="text-left py-3 px-4">Review Berikutnya</th>
            <th className="text-left py-3 px-4">Tindakan</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4">
                <div className="flex items-center">
                  {getStatusIcon(doc.status)}
                  <div className="ml-2">
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-muted-foreground">{doc.description}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">{doc.version}</td>
              <td className="py-3 px-4">{getStatusBadge(doc.status)}</td>
              {extraColumns.map((col) => (
                <td key={col} className="py-3 px-4">
                  {doc[col.toLowerCase().replace(" ", "")] ||
                    doc[
                      Object.keys(doc).find((key) => key.toLowerCase().includes(col.toLowerCase().split(" ")[0])) || ""
                    ]}
                </td>
              ))}
              <td className="py-3 px-4">{doc.updatedAt}</td>
              <td className="py-3 px-4">{doc.nextReview}</td>
              <td className="py-3 px-4">
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" title="Lihat" onClick={() => handleViewDocument(doc)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEditDocument(doc)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Download" onClick={() => handleDownloadDocument(doc)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Hapus" onClick={() => handleDeleteDocument(doc)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
        <h1 className="text-3xl font-bold">Manajemen Dokumentasi</h1>
        <div className="flex space-x-2">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Buat Dokumen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Buat Dokumen Baru</DialogTitle>
                <DialogDescription>Pilih jenis dokumen yang akan dibuat</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Button variant="outline" className="justify-start" onClick={() => handleAddDocument("Kebijakan")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Kebijakan
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleAddDocument("Prosedur")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Prosedur
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleAddDocument("Instruksi Kerja")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Instruksi Kerja
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleAddDocument("Formulir")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Formulir
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleAddDocument("Manual")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Manual
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Unggah
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Dokumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Semua kategori</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Dokumen Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">10</div>
            <p className="text-xs text-muted-foreground">43% dari total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Perlu Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">5</div>
            <p className="text-xs text-muted-foreground">22% dari total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8</div>
            <p className="text-xs text-muted-foreground">35% dari total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-xs text-muted-foreground">Perlu pembaruan</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari dokumen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Aktif">Aktif</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Semua (23)</TabsTrigger>
          <TabsTrigger value="policies">Kebijakan (4)</TabsTrigger>
          <TabsTrigger value="procedures">Prosedur (5)</TabsTrigger>
          <TabsTrigger value="work-instructions">Instruksi Kerja (5)</TabsTrigger>
          <TabsTrigger value="forms">Formulir (5)</TabsTrigger>
          <TabsTrigger value="manuals">Manual (4)</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Semua Dokumen</CardTitle>
              <CardDescription>Daftar lengkap semua dokumen dalam sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentTable
                documents={[...policies, ...procedures, ...workInstructions, ...forms, ...manuals]}
                extraColumns={["Kategori"]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Kebijakan</CardTitle>
                  <CardDescription>Dokumen kebijakan tingkat organisasi</CardDescription>
                </div>
                <Button onClick={() => handleAddDocument("Kebijakan")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kebijakan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DocumentTable documents={policies} extraColumns={["Approver"]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Prosedur</CardTitle>
                  <CardDescription>Prosedur operasional standar</CardDescription>
                </div>
                <Button onClick={() => handleAddDocument("Prosedur")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Prosedur
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DocumentTable documents={procedures} extraColumns={["Owner"]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-instructions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Instruksi Kerja</CardTitle>
                  <CardDescription>Instruksi kerja detail untuk operasional</CardDescription>
                </div>
                <Button onClick={() => handleAddDocument("Instruksi Kerja")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Instruksi Kerja
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DocumentTable documents={workInstructions} extraColumns={["Department"]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Formulir</CardTitle>
                  <CardDescription>Formulir dan template dokumen</CardDescription>
                </div>
                <Button onClick={() => handleAddDocument("Formulir")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Formulir
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DocumentTable documents={forms} extraColumns={["Usage"]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manuals">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Manual</CardTitle>
                  <CardDescription>Manual sistem manajemen</CardDescription>
                </div>
                <Button onClick={() => handleAddDocument("Manual")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Manual
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DocumentTable documents={manuals} extraColumns={["Scope"]} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        documentType={selectedDocumentType}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

      {/* View Document Modal */}
      <ViewDocumentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        document={selectedDocument}
      />
    </div>
  )
}
