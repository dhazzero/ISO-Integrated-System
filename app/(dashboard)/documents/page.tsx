"use client" // Client component

import { useState, useEffect } from "react"
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
import { Progress } from "@/components/ui/progress" // Import Progress jika belum ada

import { AddDocumentModal } from "@/components/documents/add-document-modal"
import { UploadDocumentModal } from "@/components/documents/upload-document-modal"
import { ViewDocumentModal } from "@/components/documents/view-document-modal"
import { EditDocumentModal } from "@/components/documents/edit-document-modal"

// Definisikan tipe untuk dokumen jika belum ada (opsional tapi direkomendasikan)
interface DocumentItem {
  id: number | string;
  name: string;
  version: string;
  status: "Aktif" | "Review" | "Draft" | "Expired";
  approver?: string;
  owner?: string;
  department?: string;
  scope?: string;
  usage?: string;
  updatedAt: string;
  nextReview: string;
  description: string;
  fileId?: string; // Untuk menyimpan ID file dari GridFS
  documentType?: string; // atau category
  category?: string; // atau documentType
}


export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  // selectedCategory tidak digunakan di kode awal, bisa dihapus jika tidak perlu
  // const [selectedCategory, setSelectedCategory] = useState("all")

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState("")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false) // State ini belum digunakan, tambahkan logika jika perlu

  const [policies, setPolicies] = useState<DocumentItem[]>([]);
  const [procedures, setProcedures] = useState<DocumentItem[]>([]);
  const [workInstructions, setWorkInstructions] = useState<DocumentItem[]>([]);
  const [forms, setForms] = useState<DocumentItem[]>([]);
  const [manuals, setManuals] = useState<DocumentItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal mengambil dokumen: ${response.statusText}`);
      }
      const rawDocs: any[] = await response.json();
      const allDocuments: DocumentItem[] = rawDocs.map((doc: any) => ({
        ...doc,
        id: doc.id ?? doc._id ?? doc._id?.toString?.() ?? '',
        fileId: doc.fileId?.toString?.(),
      }));

      // Kategorikan dokumen berdasarkan documentType atau field yang sesuai
      // Pastikan field 'documentType' atau 'category' ada di data Anda dari database
      setPolicies(allDocuments.filter(doc => doc.documentType === "Kebijakan" || doc.category === "Kebijakan"));
      setProcedures(allDocuments.filter(doc => doc.documentType === "Prosedur" || doc.category === "Prosedur"));
      setWorkInstructions(allDocuments.filter(doc => doc.documentType === "Instruksi Kerja" || doc.category === "Instruksi Kerja"));
      setForms(allDocuments.filter(doc => doc.documentType === "Formulir" || doc.category === "Formulir"));
      setManuals(allDocuments.filter(doc => doc.documentType === "Manual" || doc.category === "Manual"));

    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui saat mengambil data");
      console.error("Fetch documents error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleNewDocumentAdded = (newDocument: DocumentItem) => {
    fetchDocuments(); // Refresh data setelah dokumen baru ditambahkan
  };

  const handleDocumentUpdated = () => {
    fetchDocuments();
  };

  const getStatusBadge = (status: DocumentItem['status']) => {
    switch (status) {
      case "Aktif":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Aktif</Badge>
      case "Review":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Review</Badge>
      case "Draft":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Draft</Badge>
      case "Expired":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Expired</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: DocumentItem['status']) => {
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

  const handleAddDocumentClick = (type: string) => {
    setSelectedDocumentType(type)
    setIsAddModalOpen(true)
  }

  const handleViewDocument = (doc: DocumentItem) => {
    setSelectedDocument(doc)
    setIsViewModalOpen(true)
  }

  const handleEditDocument = (doc: DocumentItem) => {
    setSelectedDocument(doc)
    setIsEditModalOpen(true)
  }

  const handleDownloadDocument = (doc: DocumentItem) => {
    if (doc.fileId) {
      window.open(`/api/files/${doc.fileId}`, '_blank');
    } else {
      alert("Tidak ada file yang terlampir untuk dokumen ini.");
    }
  }

  const handleDeleteDocument = async (doc: DocumentItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${doc.name}?`)) return;

    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal menghapus dokumen');
      }
      fetchDocuments();
      alert(`Dokumen ${doc.name} berhasil dihapus.`);
    } catch (err) {
      console.error('Delete document error:', err);
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus');
    }
  }

  // Gabungkan semua dokumen untuk tab "Semua" dan filter
  const allDocuments = [...policies, ...procedures, ...workInstructions, ...forms, ...manuals];

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearchTerm = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearchTerm && matchesStatus;
  });

  // Hitung total dokumen untuk setiap tab
  const totalAll = policies.length + procedures.length + workInstructions.length + forms.length + manuals.length;


  const DocumentTable = ({ documents, extraColumns = [] }: { documents: DocumentItem[]; extraColumns?: string[] }) => (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Nama Dokumen</th>
            <th className="text-left py-3 px-4">Versi</th>
            <th className="text-left py-3 px-4">Status</th>
            {extraColumns.map((col) => (
                <th key={col} className="text-left py-3 px-4">
                  {/* Menggunakan judul kolom yang lebih user-friendly */}
                  {col === "approver" ? "Approver" :
                      col === "owner" ? "Owner" :
                          col === "department" ? "Department" :
                              col === "scope" ? "Scope/Standar" :
                                  col === "usage" ? "Penggunaan" :
                                      col === "category" ? "Kategori" : col}
                </th>
            ))}
            <th className="text-left py-3 px-4">Terakhir Diperbarui</th>
            <th className="text-left py-3 px-4">Review Berikutnya</th>
            <th className="text-left py-3 px-4">Tindakan</th>
          </tr>
          </thead>
          <tbody>
          {documents.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={extraColumns.length + 6} className="text-center py-10 text-muted-foreground">
                  Tidak ada dokumen yang ditemukan.
                </td>
              </tr>
          ) : (
              documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(doc.status)}
                        <div className="ml-2">
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2" title={doc.description}>{doc.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{doc.version}</td>
                    <td className="py-3 px-4">{getStatusBadge(doc.status)}</td>
                    {extraColumns.map((colKey) => (
                        <td key={colKey} className="py-3 px-4">
                          {/* @ts-ignore */}
                          {doc[colKey] || "-"}
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
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
              ))
          )}
          </tbody>
        </table>
      </div>
  );


  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Memuat data dokumen...</p>
              <Progress value={50} className="w-64 mx-auto" /> {/* Contoh progress bar */}
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return <div className="container mx-auto px-4 py-6 text-center text-red-500">Error: {error}</div>;
  }

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
                  {["Kebijakan", "Prosedur", "Instruksi Kerja", "Formulir", "Manual"].map(type => (
                      <Button key={type} variant="outline" className="justify-start" onClick={() => handleAddDocumentClick(type)}>
                        <FileText className="mr-2 h-4 w-4" />
                        {type}
                      </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Unggah
            </Button>
          </div>
        </div>

        {/* Statistics Cards - Anda bisa mengkalkulasi ini dari data yang di-fetch */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Total Dokumen</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalAll}</div><p className="text-xs text-muted-foreground">Semua kategori</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Dokumen Aktif</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{allDocuments.filter(d => d.status === "Aktif").length}</div><p className="text-xs text-muted-foreground">dari total</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Perlu Review</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">{allDocuments.filter(d => d.status === "Review").length}</div><p className="text-xs text-muted-foreground">dari total</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Draft</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-600">{allDocuments.filter(d => d.status === "Draft").length}</div><p className="text-xs text-muted-foreground">dari total</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Expired</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{allDocuments.filter(d => d.status === "Expired").length}</div><p className="text-xs text-muted-foreground">Perlu pembaruan</p></CardContent>
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
            <SelectTrigger className="w-full sm:w-[180px]">
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
            <TabsTrigger value="all">Semua ({filteredDocuments.length})</TabsTrigger>
            <TabsTrigger value="policies">Kebijakan ({policies.filter(doc => (statusFilter === "all" || doc.status === statusFilter) && (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase()))).length})</TabsTrigger>
            <TabsTrigger value="procedures">Prosedur ({procedures.filter(doc => (statusFilter === "all" || doc.status === statusFilter) && (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase()))).length})</TabsTrigger>
            <TabsTrigger value="work-instructions">Instruksi Kerja ({workInstructions.filter(doc => (statusFilter === "all" || doc.status === statusFilter) && (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase()))).length})</TabsTrigger>
            <TabsTrigger value="forms">Formulir ({forms.filter(doc => (statusFilter === "all" || doc.status === statusFilter) && (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase()))).length})</TabsTrigger>
            <TabsTrigger value="manuals">Manual ({manuals.filter(doc => (statusFilter === "all" || doc.status === statusFilter) && (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase()))).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader><CardTitle>Semua Dokumen</CardTitle><CardDescription>Daftar lengkap semua dokumen dalam sistem</CardDescription></CardHeader>
              <CardContent><DocumentTable documents={filteredDocuments} extraColumns={["category"]} /></CardContent> {/* Tampilkan 'category' atau 'documentType' */}
            </Card>
          </TabsContent>
          <TabsContent value="policies">
            <Card>
              <CardHeader><div className="flex justify-between items-center"><div><CardTitle>Kebijakan</CardTitle><CardDescription>Dokumen kebijakan tingkat organisasi</CardDescription></div><Button onClick={() => handleAddDocumentClick("Kebijakan")}><Plus className="mr-2 h-4 w-4" />Tambah Kebijakan</Button></div></CardHeader>
              <CardContent><DocumentTable documents={policies.filter(doc => (statusFilter === "all" || doc.status === statusFilter) && (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase())))} extraColumns={["approver"]} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="procedures">
            <Card>
              <CardHeader><div className="flex justify-between items-center"><div><CardTitle>Prosedur</CardTitle><CardDescription>Prosedur operasional standar</CardDescription></div><Button onClick={() => handleAddDocumentClick("Prosedur")}><Plus className="mr-2 h-4 w-4" />Tambah Prosedur</Button></div></CardHeader>
              <CardContent><DocumentTable documents={procedures.filter(doc => (statusFilter === "all" || doc.status === statusFilter) && (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase())))} extraColumns={["owner"]} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="work-instructions">
            <Card>
              <CardHeader><div className="flex justify-between items-center"><div><CardTitle>Instruksi Kerja</CardTitle><CardDescription>Instruksi kerja detail untuk operasional</CardDescription></div><Button onClick={() => handleAddDocumentClick("Instruksi Kerja")}><Plus className="mr-2 h-4 w-4" />Tambah Instruksi Kerja</Button></div></CardHeader>
              <CardContent><DocumentTable documents={workInstructions.filter(doc => (statusFilter === "all" || doc.status === statusFilter) && (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase())))} extraColumns={["department"]} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="forms">
            <Card>
              <CardHeader><div className="flex justify-between items-center"><div><CardTitle>Formulir</CardTitle><CardDescription>Formulir dan template dokumen</CardDescription></div><Button onClick={() => handleAddDocumentClick("Formulir")}><Plus className="mr-2 h-4 w-4" />Tambah Formulir</Button></div></CardHeader>
              <CardContent><DocumentTable documents={forms.filter(doc => (statusFilter === "all" || doc.status === statusFilter) && (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase())))} extraColumns={["usage"]} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="manuals">
            <Card>
              <CardHeader><div className="flex justify-between items-center"><div><CardTitle>Manual</CardTitle><CardDescription>Manual sistem manajemen</CardDescription></div><Button onClick={() => handleAddDocumentClick("Manual")}><Plus className="mr-2 h-4 w-4" />Tambah Manual</Button></div></CardHeader>
              <CardContent><DocumentTable documents={manuals.filter(doc => (statusFilter === "all" || doc.status === statusFilter) && (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase())))} extraColumns={["scope"]} /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AddDocumentModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            documentType={selectedDocumentType}
            onDocumentAdded={handleNewDocumentAdded}
        />
        <UploadDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
        <ViewDocumentModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            document={selectedDocument}
            onEdit={handleEditDocument}
        />
        <EditDocumentModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            document={selectedDocument}
            onUpdated={handleDocumentUpdated}
        />
      </div>
  );
}