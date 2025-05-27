"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, FileText, ImageIcon, File } from "lucide-react"

interface AddCapaModalProps {
  isOpen: boolean
  onClose: () => void
  onAddCapa: (capa: any) => void
  mode: "open" | "in-progress" | "closed"
}

export default function AddCapaModal({ isOpen, onClose, onAddCapa, mode }: AddCapaModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    issue: "",
    source: "",
    department: "",
    description: "",
    rootCause: "",
    immediateAction: "",
    correctiveAction: "",
    preventiveAction: "",
    responsible: "",
    dueDate: "",
    priority: "",
    category: "",
    impact: "",
    riskLevel: "",
    resources: "",
    successCriteria: "",
    verificationMethod: "",
    notes: "",
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) {
      return <ImageIcon className="h-4 w-4" />
    } else if (["pdf", "doc", "docx"].includes(extension || "")) {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newCapa = {
      id: Date.now(),
      issue: formData.issue,
      source: formData.source,
      department: formData.department,
      description: formData.description,
      rootCause: formData.rootCause,
      immediateAction: formData.immediateAction,
      correctiveAction: formData.correctiveAction,
      preventiveAction: formData.preventiveAction,
      responsible: formData.responsible,
      dueDate: formData.dueDate,
      priority: formData.priority,
      category: formData.category,
      impact: formData.impact,
      riskLevel: formData.riskLevel,
      resources: formData.resources,
      successCriteria: formData.successCriteria,
      verificationMethod: formData.verificationMethod,
      notes: formData.notes,
      status: "Open",
      files: uploadedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      })),
      createdDate: new Date().toISOString().split("T")[0],
      createdBy: "Current User",
    }

    onAddCapa(newCapa)

    // Reset form
    setFormData({
      issue: "",
      source: "",
      department: "",
      description: "",
      rootCause: "",
      immediateAction: "",
      correctiveAction: "",
      preventiveAction: "",
      responsible: "",
      dueDate: "",
      priority: "",
      category: "",
      impact: "",
      riskLevel: "",
      resources: "",
      successCriteria: "",
      verificationMethod: "",
      notes: "",
    })
    setUploadedFiles([])
    setIsLoading(false)
    onClose()
  }

  const getModalTitle = () => {
    switch (mode) {
      case "open":
        return "Tambah CAPA Baru"
      case "in-progress":
        return "Update Progress CAPA"
      case "closed":
        return "Tambah CAPA Selesai"
      default:
        return "Tambah CAPA"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>Lengkapi informasi CAPA dengan detail dan upload dokumen pendukung</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
              <TabsTrigger value="analysis">Analisis</TabsTrigger>
              <TabsTrigger value="actions">Tindakan</TabsTrigger>
              <TabsTrigger value="files">Dokumen</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Identifikasi Masalah</CardTitle>
                  <CardDescription>Informasi dasar tentang ketidaksesuaian atau masalah</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issue">Nama Masalah/Issue *</Label>
                      <Input
                        id="issue"
                        value={formData.issue}
                        onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                        placeholder="Contoh: Ketidaksesuaian Prosedur Kalibrasi"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="source">Sumber Temuan *</Label>
                      <Select
                        value={formData.source}
                        onValueChange={(value) => setFormData({ ...formData, source: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sumber temuan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Audit Internal">Audit Internal</SelectItem>
                          <SelectItem value="Audit Eksternal">Audit Eksternal</SelectItem>
                          <SelectItem value="Keluhan Pelanggan">Keluhan Pelanggan</SelectItem>
                          <SelectItem value="Inspeksi">Inspeksi</SelectItem>
                          <SelectItem value="Review Manajemen">Review Manajemen</SelectItem>
                          <SelectItem value="Insiden">Insiden</SelectItem>
                          <SelectItem value="Monitoring">Monitoring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Departemen Terkait *</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData({ ...formData, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih departemen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Produksi">Produksi</SelectItem>
                          <SelectItem value="Quality Control">Quality Control</SelectItem>
                          <SelectItem value="HR">Human Resources</SelectItem>
                          <SelectItem value="IT">Information Technology</SelectItem>
                          <SelectItem value="Operasional">Operasional</SelectItem>
                          <SelectItem value="K3">Keselamatan & Kesehatan Kerja</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Purchasing">Purchasing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Kategori CAPA *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Corrective">Corrective Action</SelectItem>
                          <SelectItem value="Preventive">Preventive Action</SelectItem>
                          <SelectItem value="Both">Corrective & Preventive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi Masalah *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Jelaskan secara detail masalah yang ditemukan, kondisi saat ini, dan dampaknya..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="priority">Prioritas *</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih prioritas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="impact">Dampak</Label>
                      <Select
                        value={formData.impact}
                        onValueChange={(value) => setFormData({ ...formData, impact: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih dampak" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kualitas">Kualitas Produk</SelectItem>
                          <SelectItem value="Keselamatan">Keselamatan</SelectItem>
                          <SelectItem value="Lingkungan">Lingkungan</SelectItem>
                          <SelectItem value="Finansial">Finansial</SelectItem>
                          <SelectItem value="Reputasi">Reputasi</SelectItem>
                          <SelectItem value="Operasional">Operasional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="riskLevel">Level Risiko</Label>
                      <Select
                        value={formData.riskLevel}
                        onValueChange={(value) => setFormData({ ...formData, riskLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih level risiko" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Very High">Very High</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Very Low">Very Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analisis Akar Masalah</CardTitle>
                  <CardDescription>Analisis mendalam untuk mengidentifikasi penyebab utama</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rootCause">Root Cause Analysis *</Label>
                    <Textarea
                      id="rootCause"
                      value={formData.rootCause}
                      onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                      placeholder="Gunakan metode 5 Why, Fishbone, atau metode analisis lainnya untuk mengidentifikasi akar penyebab masalah..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="immediateAction">Tindakan Segera</Label>
                    <Textarea
                      id="immediateAction"
                      value={formData.immediateAction}
                      onChange={(e) => setFormData({ ...formData, immediateAction: e.target.value })}
                      placeholder="Tindakan segera yang sudah atau akan dilakukan untuk mengatasi masalah sementara..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="responsible">Penanggung Jawab *</Label>
                      <Input
                        id="responsible"
                        value={formData.responsible}
                        onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                        placeholder="Nama penanggung jawab CAPA"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Target Penyelesaian *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="resources">Sumber Daya yang Dibutuhkan</Label>
                    <Textarea
                      id="resources"
                      value={formData.resources}
                      onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                      placeholder="Sumber daya manusia, finansial, peralatan, atau material yang dibutuhkan..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rencana Tindakan</CardTitle>
                  <CardDescription>Tindakan korektif dan preventif yang akan dilakukan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="correctiveAction">Tindakan Korektif *</Label>
                    <Textarea
                      id="correctiveAction"
                      value={formData.correctiveAction}
                      onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
                      placeholder="Tindakan untuk mengatasi masalah yang sudah terjadi dan mencegah terulang kembali..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="preventiveAction">Tindakan Preventif</Label>
                    <Textarea
                      id="preventiveAction"
                      value={formData.preventiveAction}
                      onChange={(e) => setFormData({ ...formData, preventiveAction: e.target.value })}
                      placeholder="Tindakan untuk mencegah masalah serupa terjadi di area atau proses lain..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="successCriteria">Kriteria Keberhasilan</Label>
                    <Textarea
                      id="successCriteria"
                      value={formData.successCriteria}
                      onChange={(e) => setFormData({ ...formData, successCriteria: e.target.value })}
                      placeholder="Indikator atau parameter yang akan digunakan untuk mengukur keberhasilan tindakan..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="verificationMethod">Metode Verifikasi</Label>
                    <Textarea
                      id="verificationMethod"
                      value={formData.verificationMethod}
                      onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value })}
                      placeholder="Cara yang akan digunakan untuk memverifikasi efektivitas tindakan (audit, inspeksi, monitoring, dll)..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Catatan Tambahan</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Informasi tambahan, referensi, atau catatan penting lainnya..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dokumen Pendukung</CardTitle>
                  <CardDescription>Upload dokumen, foto, atau file pendukung lainnya</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">Upload dokumen pendukung</span>
                          <span className="mt-1 block text-xs text-gray-500">PDF, DOC, XLS, JPG, PNG hingga 10MB</span>
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>File yang diupload:</Label>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(file.name)}
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Jenis dokumen yang disarankan:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Foto kondisi ketidaksesuaian</li>
                      <li>• Dokumen prosedur yang terkait</li>
                      <li>• Laporan audit atau inspeksi</li>
                      <li>• Data atau record yang mendukung</li>
                      <li>• Analisis atau investigasi</li>
                      <li>• Komunikasi terkait masalah</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan CAPA"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
