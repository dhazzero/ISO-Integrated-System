"use client"


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileText } from "lucide-react"


interface EditDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document: any
  onUpdated: () => void
}

export function EditDocumentModal({ isOpen, onClose, document, onUpdated }: EditDocumentModalProps) {
  const documentType = document?.documentType || document?.category || ""

  const getDocumentTypeFields = () => {
    switch (documentType) {
      case "Kebijakan":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approver">Approver</Label>
                <Select
                  value={formData.approver}
                  onValueChange={(value) => setFormData({ ...formData, approver: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih approver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direktur">Direktur</SelectItem>
                    <SelectItem value="ciso">CISO</SelectItem>
                    <SelectItem value="hse-manager">HSE Manager</SelectItem>
                    <SelectItem value="env-manager">Environmental Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scope">Ruang Lingkup</Label>
                <Select value={formData.scope} onValueChange={(value) => setFormData({ ...formData, scope: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih standar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iso-9001">ISO 9001</SelectItem>
                    <SelectItem value="iso-14001">ISO 14001</SelectItem>
                    <SelectItem value="iso-45001">ISO 45001</SelectItem>
                    <SelectItem value="iso-27001">ISO 27001</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )
      case "Prosedur":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="owner">Process Owner</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Nama process owner"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qa">Quality Assurance</SelectItem>
                    <SelectItem value="risk">Risk Management</SelectItem>
                    <SelectItem value="hse">HSE</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )
      case "Instruksi Kerja":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produksi">Produksi</SelectItem>
                    <SelectItem value="qc">Quality Control</SelectItem>
                    <SelectItem value="hse">HSE</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="owner">PIC</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Person in charge"
                />
              </div>
            </div>
          </>
        )
      case "Formulir":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usage">Penggunaan</Label>
                <Select value={formData.scope} onValueChange={(value) => setFormData({ ...formData, scope: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih penggunaan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audit">Audit</SelectItem>
                    <SelectItem value="hse">HSE</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="owner">Form Owner</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Pemilik formulir"
                />
              </div>
            </div>
          </>
        )
      case "Manual":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scope">Standar ISO</Label>
                <Select value={formData.scope} onValueChange={(value) => setFormData({ ...formData, scope: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih standar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iso-9001">ISO 9001</SelectItem>
                    <SelectItem value="iso-14001">ISO 14001</SelectItem>
                    <SelectItem value="iso-45001">ISO 45001</SelectItem>
                    <SelectItem value="iso-27001">ISO 27001</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="approver">Approver</Label>
                <Select
                  value={formData.approver}
                  onValueChange={(value) => setFormData({ ...formData, approver: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih approver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direktur">Direktur</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }
  const [formData, setFormData] = useState({
    name: document?.name || "",
    description: document?.description || "",
    version: document?.version || "1.0",
    status: document?.status || "Draft",
    owner: document?.owner || "",
    department: document?.department || "",
    scope: document?.scope || "",
    approver: document?.approver || "",
    reviewDate: document?.reviewDate || "",
    effectiveDate: document?.effectiveDate || "",
  })
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  useEffect(() => {
    setFormData({
      name: document?.name || "",
      description: document?.description || "",
      version: document?.version || "1.0",
      status: document?.status || "Draft",
      owner: document?.owner || "",
      department: document?.department || "",
      scope: document?.scope || "",
      approver: document?.approver || "",
      reviewDate: document?.reviewDate || "",
      effectiveDate: document?.effectiveDate || "",
    })
    setSelectedFile(null)
  }, [document])
  const [formData, setFormData] = useState({
    name: document?.name || "",
    description: document?.description || "",
    status: document?.status || "Draft",
    version: document?.version || "1.0",
  })
  const [saving, setSaving] = useState(false)


  const handleSave = async () => {
    if (!document) return
    setSaving(true)
    try {
      let newFileId: string | undefined
      if (selectedFile) {
        const fd = new FormData()
        fd.append('file', selectedFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) {
          const d = await uploadRes.json()
          throw new Error(d.message || 'Gagal mengunggah file')
        }
        const upData = await uploadRes.json()
        newFileId = upData.fileId
      }

      const res = await fetch(`/api/documents/${document.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          updatedBy: "admin",
          ...(newFileId ? { fileId: newFileId } : {}),
        }),
      const res = await fetch(`/api/documents/${document.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, updatedBy: "admin" }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Gagal memperbarui dokumen")
      }
      onUpdated()
      onClose()
      setSelectedFile(null)

    } catch (err) {
      console.error("Update document error", err)
      alert(err instanceof Error ? err.message : "Gagal memperbarui dokumen")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {documentType}</DialogTitle>
          <DialogDescription>Perbarui informasi {documentType.toLowerCase()}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nama Dokumen</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="version">Versi</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Document Type Specific Fields */}
          {getDocumentTypeFields()}

          {/* Status and Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="effectiveDate">Tanggal Efektif</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reviewDate">Tanggal Review</Label>
              <Input
                id="reviewDate"
                type="date"
                value={formData.reviewDate}
                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload">Upload File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Drag dan drop file atau klik untuk browse
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX hingga 10MB</p>
              </div>
            </div>

            {/* Existing File */}
            {!selectedFile && document?.fileId && (
              <div className="mt-4">
                <Label>File saat ini:</Label>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <a href={`/api/files/${document.fileId}?inline=1`} target="_blank" className="text-blue-600 underline text-sm">Lihat file</a>
                  </div>
                </div>
              </div>
            )}

            {/* Selected File */}
            {selectedFile && (
              <div className="mt-4">
                <Label>File yang dipilih:</Label>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm">{selectedFile.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Dokumen</DialogTitle>
          <DialogDescription>Perbarui informasi dokumen</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Nama Dokumen</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="version">Versi</Label>
            <Input id="version" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Input id="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
