// components/documents/add-document-modal.tsx
"use client"

import { useState, useEffect } from "react"
import type React from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileText } from "lucide-react"

// Definisikan tipe data untuk opsi dropdown
interface Approver {
  _id: string;
  title: string;
}

interface Standard {
  _id: string;
  name: string;
}

interface Department {
  _id: string;
  name: string;
}

interface AddDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  documentType: string
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
    fileId: null as string | null,
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State untuk menyimpan opsi dropdown dinamis
  const [approverOptions, setApproverOptions] = useState<Approver[]>([]);
  const [standardOptions, setStandardOptions] = useState<Standard[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<Department[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // useEffect untuk mengambil data saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const fetchOptions = async () => {
        setIsLoadingOptions(true);
        try {
          const [approverRes, standardRes, departmentRes] = await Promise.all([
            fetch('/api/settings/approvers'),
            fetch('/api/settings/standards'),
            fetch('/api/settings/departments')
          ]);

          if (!approverRes.ok || !standardRes.ok || !departmentRes.ok) {
            throw new Error('Gagal memuat data pengaturan.');
          }

          setApproverOptions(await approverRes.json());
          setStandardOptions(await standardRes.json());
          setDepartmentOptions(await departmentRes.json());

        } catch (error) {
          console.error("Failed to fetch dropdown options:", error);
          // Anda bisa menambahkan notifikasi error di sini
        } finally {
          setIsLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    setFormData(prev => ({ ...prev, fileId: null }));
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    setUploadError(null);
    let uploadedFileId: string | null = null;

    if (selectedFile) {
      const fileData = new FormData();
      fileData.append('file', selectedFile);
      try {
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: fileData });
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || `File upload failed`);
        }
        const uploadResult = await uploadResponse.json();
        uploadedFileId = uploadResult.fileId;
      } catch (error) {
        setUploadError((error as Error).message);
        setIsUploading(false);
        return;
      }
    }

    try {
      const documentPayload = {
        ...formData,
        documentType: documentType,
        fileId: uploadedFileId,
      };

      const docResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentPayload),
      });

      if (!docResponse.ok) {
        const errorData = await docResponse.json();
        throw new Error(errorData.message || `Document creation failed`);
      }

      const newDocument = await docResponse.json();
      onDocumentAdded(newDocument);
      setFormData(initialFormData);
      setSelectedFile(null);
      onClose();

    } catch (error) {
      setUploadError((error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const getDocumentTypeFields = () => {
    switch (documentType) {
      case "Kebijakan":
        return (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approver">Approver</Label>
                <Select required value={formData.approver} onValueChange={(value) => setFormData({ ...formData, approver: value })}>
                  <SelectTrigger id="approver">
                    <SelectValue placeholder={isLoadingOptions ? "Memuat..." : "Pilih approver"} />
                  </SelectTrigger>
                  <SelectContent>
                    {approverOptions.map((approver) => (
                        <SelectItem key={approver._id} value={approver.title}>
                          {approver.title}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scope">Ruang Lingkup</Label>
                <Select required value={formData.scope} onValueChange={(value) => setFormData({ ...formData, scope: value })}>
                  <SelectTrigger id="scope">
                    <SelectValue placeholder={isLoadingOptions ? "Memuat..." : "Pilih standar"} />
                  </SelectTrigger>
                  <SelectContent>
                    {standardOptions.map((standard) => (
                        <SelectItem key={standard._id} value={standard.name}>
                          {standard.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
        );

      case "Prosedur":
      case "Instruksi Kerja":
        return (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="owner">Process Owner / PIC</Label>
                <Input id="owner" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} placeholder="Nama penanggung jawab" />
              </div>
              <div>
                <Label htmlFor="department">Departemen</Label>
                <Select required value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingOptions ? "Memuat..." : "Pilih departemen"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((dept) => (
                        <SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah {documentType} Baru</DialogTitle>
            <DialogDescription>Lengkapi informasi untuk membuat {documentType.toLowerCase()} baru</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama Dokumen</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={`Nama ${documentType.toLowerCase()}`} />
              </div>
              <div>
                <Label htmlFor="version">Versi</Label>
                <Input id="version" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} placeholder="1.0" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={`Deskripsi ${documentType.toLowerCase()}`} rows={3} />
            </div>
            {getDocumentTypeFields()}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="effectiveDate">Tanggal Efektif</Label>
                <Input id="effectiveDate" type="date" value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="reviewDate">Tanggal Review</Label>
                <Input id="reviewDate" type="date" value={formData.reviewDate} onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="file-upload">Upload File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">Drag dan drop file atau klik untuk browse</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange} />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX hingga 10MB</p>
                </div>
              </div>
              {selectedFile && (
                  <div className="mt-4">
                    <Label>File yang dipilih:</Label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="text-sm">{selectedFile.name}</span>
                        <Badge variant="secondary" className="ml-2">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={removeFile}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
              )}
              {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isUploading}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isUploading || !formData.name || !documentType}>{isUploading ? "Menyimpan..." : `Simpan ${documentType}`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}