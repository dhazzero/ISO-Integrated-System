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

interface EditDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document: any
  onUpdated: () => void
}

export function EditDocumentModal({ isOpen, onClose, document, onUpdated }: EditDocumentModalProps) {
  const [formData, setFormData] = useState({
    name: document?.name || "",
    description: document?.description || "",
    status: document?.status || "Draft",
    version: document?.version || "1.0",
  })
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
  }

  useEffect(() => {
    setFormData({
      name: document?.name || "",
      description: document?.description || "",
      status: document?.status || "Draft",
      version: document?.version || "1.0",
    })
    setSelectedFile(null)
  }, [document])

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
          <div>
            <Label>File Saat Ini</Label>
            {document?.fileId ? (
              <a href={`/api/files/${document.fileId}`} target="_blank" className="text-blue-600 underline text-sm">Lihat file</a>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada file</p>
            )}
          </div>
          <div>
            <Label htmlFor="file">Ganti File</Label>
            <Input id="file" type="file" onChange={handleFileChange} />
            {selectedFile && (
              <p className="text-sm mt-1">{selectedFile.name}</p>
            )}
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
