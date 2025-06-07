// components/documents/add-document-modal.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button" //
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog" //
import { Input } from "@/components/ui/input" //
import { Label } from "@/components/ui/label" //
import { Textarea } from "@/components/ui/textarea" //
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" //
import { Badge } from "@/components/ui/badge" //
import { Upload, X, FileText } from "lucide-react"

interface AddDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  documentType: string
  // Callback untuk memberitahu parent component bahwa dokumen baru telah ditambahkan
  onDocumentAdded: (newDocument: any) => void;
}

export function AddDocumentModal({ isOpen, onClose, documentType, onDocumentAdded }: AddDocumentModalProps) {
  const initialFormData = {
    name: "",
    description: "",
    version: "1.0",
    status: "Draft",
    owner: "",
    department: "",
    scope: "",
    approver: "",
    reviewDate: "",
    effectiveDate: "",
    // tambahkan fileId atau fileIds untuk menyimpan ID file dari GridFS
    fileId: null as string | null, // Untuk satu file
    // fileIds: [] as string[], // Untuk multiple file
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Hanya satu file untuk contoh ini
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null); // Reset error jika file baru dipilih
    } else {
      setSelectedFile(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    // Jika Anda menyimpan fileId di formData, reset juga:
    setFormData(prev => ({ ...prev, fileId: null }));
  };


  const handleSubmit = async () => {
    setIsUploading(true);
    setUploadError(null);
    let uploadedFileId: string | null = null;

    // 1. Upload file jika ada
    if (selectedFile) {
      const fileData = new FormData();
      fileData.append('file', selectedFile);

      try {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: fileData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || `File upload failed with status: ${uploadResponse.status}`);
        }
        const uploadResult = await uploadResponse.json();
        uploadedFileId = uploadResult.fileId;
      } catch (error) {
        console.error("File upload error:", error);
        setUploadError(error instanceof Error ? error.message : "File upload failed");
        setIsUploading(false);
        return; // Hentikan proses jika upload file gagal
      }
    }

    // 2. Submit metadata dokumen (termasuk fileId jika ada)
    try {
      const documentPayload = {
        ...formData,
        documentType: documentType, // Pastikan documentType disertakan
        fileId: uploadedFileId, // Sertakan fileId yang didapat dari upload
        // Jika Anda menggunakan fileIds (untuk multiple files), sesuaikan di sini
      };

      const docResponse = await fetch('/api/documents', { //
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentPayload),
      });

      if (!docResponse.ok) {
        const errorData = await docResponse.json();
        throw new Error(errorData.message || `Document creation failed with status: ${docResponse.status}`);
      }

      const newDocument = await docResponse.json();
      onDocumentAdded(newDocument); // Callback ke parent
      console.log("Document created successfully:", newDocument);

      // Reset form dan state setelah berhasil
      setFormData(initialFormData);
      setSelectedFile(null);
      onClose();

    } catch (error) {
      console.error("Document creation error:", error);
      setUploadError(error instanceof Error ? error.message : "Document creation failed");
      // Pertimbangkan: jika file berhasil diupload tapi metadata gagal disimpan,
      // mungkin perlu logika untuk menghapus file yang sudah terupload (rollback).
      // Untuk saat ini, kita hanya tampilkan error.
    } finally {
      setIsUploading(false);
    }
  };


  const getDocumentTypeFields = () => {
    // ... (fungsi getDocumentTypeFields Anda yang sudah ada)
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


  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah {documentType} Baru</DialogTitle>
            <DialogDescription>Lengkapi informasi untuk membuat {documentType.toLowerCase()} baru</DialogDescription>
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
                    placeholder={`Nama ${documentType.toLowerCase()}`}
                />
              </div>
              <div>
                <Label htmlFor="version">Versi</Label>
                <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={`Deskripsi ${documentType.toLowerCase()}`}
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
                        onChange={handleFileChange} // Updated handler
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX hingga 10MB</p>
                </div>
              </div>

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
              {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading || !formData.name || !documentType}>
              {isUploading ? "Menyimpan..." : `Simpan ${documentType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}