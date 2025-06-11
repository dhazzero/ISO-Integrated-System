// components/documents/edit-document-modal.tsx
"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

interface EditDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document: any
  onUpdated: () => void
}

export function EditDocumentModal({ isOpen, onClose, document, onUpdated }: EditDocumentModalProps) {
  const [formData, setFormData] = useState({
    name: "", description: "", version: "", status: "", owner: "",
    department: "", scope: "", approver: "", reviewDate: "", effectiveDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State untuk dropdown
  const [approverOptions, setApproverOptions] = useState<Approver[]>([]);
  const [standardOptions, setStandardOptions] = useState<Standard[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<Department[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    if (document) {
      setFormData({
        name: document.name || "",
        description: document.description || "",
        version: document.version || "1.0",
        status: document.status || "Draft",
        owner: document.owner || "",
        department: document.department || "",
        scope: document.scope || "",
        approver: document.approver || "",
        reviewDate: document.reviewDate ? new Date(document.reviewDate).toISOString().split('T')[0] : "",
        effectiveDate: document.effectiveDate ? new Date(document.effectiveDate).toISOString().split('T')[0] : "",
      });
    }
    setSelectedFile(null);

    if (isOpen) {
      const fetchOptions = async () => {
        setIsLoadingOptions(true);
        try {
          const [approverRes, standardRes, departmentRes] = await Promise.all([
            fetch('/api/settings/approvers'),
            fetch('/api/settings/standards'),
            fetch('/api/settings/departments')
          ]);
          if (!approverRes.ok || !standardRes.ok || !departmentRes.ok) throw new Error('Gagal memuat data pengaturan.');

          setApproverOptions(await approverRes.json());
          setStandardOptions(await standardRes.json());
          setDepartmentOptions(await departmentRes.json());
        } catch (error) {
          console.error("Failed to fetch dropdown options:", error);
        } finally {
          setIsLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [document, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const removeFile = () => setSelectedFile(null);

  const handleSave = async () => {
    if (!document) return;
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value as string);
      });
      if (selectedFile) {
        payload.append('file', selectedFile);
      }

      const res = await fetch(`/api/documents/${document.id}`, {
        method: 'PUT',
        body: payload,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal memperbarui dokumen');
      }
      onUpdated();
      onClose();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const documentType = document?.documentType || document?.category || "";

  const getDocumentTypeFields = () => {
    switch (documentType) {
      case "Kebijakan":
        return (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editApprover">Approver</Label>
                <Select value={formData.approver} onValueChange={(value) => setFormData({ ...formData, approver: value })}>
                  <SelectTrigger id="editApprover">
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
                <Label htmlFor="editScope">Ruang Lingkup</Label>
                <Select value={formData.scope} onValueChange={(value) => setFormData({ ...formData, scope: value })}>
                  <SelectTrigger id="editScope">
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
            <DialogTitle>Edit {documentType}</DialogTitle>
            <DialogDescription>Perbarui informasi {documentType.toLowerCase()}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama Dokumen</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="version">Versi</Label>
                <Input id="version" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
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
              <Label htmlFor="file-upload">Upload File Baru (Opsional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Drag dan drop atau klik untuk mengganti file
                  </span>
                    <input id="file-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange} />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">Jika tidak ada file baru yang dipilih, file lama akan tetap digunakan.</p>
                </div>
              </div>
              {!selectedFile && document?.fileId && (
                  <div className="mt-4">
                    <Label>File saat ini:</Label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <a href={`/api/files/${document.fileId}?inline=1`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Lihat file</a>
                      </div>
                    </div>
                  </div>
              )}
              {selectedFile && (
                  <div className="mt-4">
                    <Label>File baru yang akan diupload:</Label>
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}