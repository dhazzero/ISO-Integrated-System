"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, X } from "lucide-react"

interface AddAuditModalProps {
  onAddAudit: (audit: any) => void
  type: "scheduled" | "completed"
}

export function AddAuditModal({ onAddAudit, type }: AddAuditModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    name: "",
    standard: "",
    department: "",
    date: "",
    auditor: "",
    scope: "",
    objectives: "",
    criteria: "",
    // For scheduled audits
    scheduledTime: "",
    preparationNotes: "",
    checklistFile: null as File | null,
    // For completed audits
    completedDate: "",
    duration: "",
    findings: "",
    conclusion: "",
    reportFile: null as File | null,
    evidenceFiles: [] as File[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newAudit = {
      id: Date.now(),
      name: formData.name,
      standard: formData.standard,
      department: formData.department,
      date: formData.date,
      auditor: formData.auditor,
      scope: formData.scope,
      objectives: formData.objectives,
      criteria: formData.criteria,
      status: type === "scheduled" ? "Scheduled" : "Completed",
      findings: type === "completed" ? Number.parseInt(formData.findings) || 0 : 0,
      // Scheduled specific
      ...(type === "scheduled" && {
        scheduledTime: formData.scheduledTime,
        preparationNotes: formData.preparationNotes,
        checklistFile: formData.checklistFile?.name,
      }),
      // Completed specific
      ...(type === "completed" && {
        completedDate: formData.completedDate,
        duration: formData.duration,
        conclusion: formData.conclusion,
        reportFile: formData.reportFile?.name,
        evidenceFiles: formData.evidenceFiles.map((file) => file.name),
      }),
      createdDate: new Date().toISOString().split("T")[0],
    }

    onAddAudit(newAudit)

    // Reset form
    setFormData({
      name: "",
      standard: "",
      department: "",
      date: "",
      auditor: "",
      scope: "",
      objectives: "",
      criteria: "",
      scheduledTime: "",
      preparationNotes: "",
      checklistFile: null,
      completedDate: "",
      duration: "",
      findings: "",
      conclusion: "",
      reportFile: null,
      evidenceFiles: [],
    })
    setUploadedFiles([])

    setIsLoading(false)
    setOpen(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  const handleMultipleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setFormData((prev) => ({ ...prev, evidenceFiles: [...prev.evidenceFiles, ...fileArray] }))
    }
  }

  const removeEvidenceFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index),
    }))
  }

  const isScheduled = type === "scheduled"
  const isCompleted = type === "completed"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {isScheduled ? "Jadwalkan Audit" : "Tambah Audit Selesai"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isScheduled ? "Jadwalkan Audit Baru" : "Tambah Audit yang Telah Selesai"}</DialogTitle>
          <DialogDescription>
            {isScheduled
              ? "Buat jadwal audit baru dengan detail lengkap"
              : "Tambahkan audit yang telah selesai dilaksanakan"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Dasar</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Audit *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Contoh: Audit Sistem Manajemen Mutu"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="standard">Standar *</Label>
                <Select value={formData.standard} onValueChange={(value) => handleInputChange("standard", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih standar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ISO 9001:2015">ISO 9001:2015</SelectItem>
                    <SelectItem value="ISO 14001:2015">ISO 14001:2015</SelectItem>
                    <SelectItem value="ISO 45001:2018">ISO 45001:2018</SelectItem>
                    <SelectItem value="ISO 27001:2022">ISO 27001:2022</SelectItem>
                    <SelectItem value="Multiple">Multiple Standards</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Departemen *</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Produksi">Produksi</SelectItem>
                    <SelectItem value="Operasional">Operasional</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Semua Departemen">Semua Departemen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditor">Auditor *</Label>
                <Input
                  id="auditor"
                  value={formData.auditor}
                  onChange={(e) => handleInputChange("auditor", e.target.value)}
                  placeholder="Nama auditor"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">{isScheduled ? "Tanggal Audit" : "Tanggal Mulai"} *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>

              {isScheduled && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Waktu *</Label>
                  <Input
                    id="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                    placeholder="Contoh: 09:00 - 17:00"
                    required
                  />
                </div>
              )}

              {isCompleted && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="completedDate">Tanggal Selesai *</Label>
                    <Input
                      id="completedDate"
                      type="date"
                      value={formData.completedDate}
                      onChange={(e) => handleInputChange("completedDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durasi</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      placeholder="Contoh: 2 hari"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Audit Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detail Audit</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scope">Ruang Lingkup Audit</Label>
                <Textarea
                  id="scope"
                  value={formData.scope}
                  onChange={(e) => handleInputChange("scope", e.target.value)}
                  placeholder="Jelaskan ruang lingkup audit..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Tujuan Audit</Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => handleInputChange("objectives", e.target.value)}
                  placeholder="Jelaskan tujuan audit..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="criteria">Kriteria Audit</Label>
                <Textarea
                  id="criteria"
                  value={formData.criteria}
                  onChange={(e) => handleInputChange("criteria", e.target.value)}
                  placeholder="Jelaskan kriteria audit..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Scheduled Specific Fields */}
          {isScheduled && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Persiapan Audit</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preparationNotes">Catatan Persiapan</Label>
                  <Textarea
                    id="preparationNotes"
                    value={formData.preparationNotes}
                    onChange={(e) => handleInputChange("preparationNotes", e.target.value)}
                    placeholder="Catatan persiapan audit..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checklistFile">Upload Checklist Audit</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="checklistFile"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => handleFileUpload("checklistFile", e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {formData.checklistFile && (
                    <p className="text-sm text-muted-foreground">File: {formData.checklistFile.name}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Completed Specific Fields */}
          {isCompleted && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hasil Audit</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="findings">Jumlah Temuan</Label>
                    <Input
                      id="findings"
                      type="number"
                      value={formData.findings}
                      onChange={(e) => handleInputChange("findings", e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conclusion">Kesimpulan Audit</Label>
                  <Textarea
                    id="conclusion"
                    value={formData.conclusion}
                    onChange={(e) => handleInputChange("conclusion", e.target.value)}
                    placeholder="Kesimpulan hasil audit..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportFile">Upload Laporan Audit</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="reportFile"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload("reportFile", e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {formData.reportFile && (
                    <p className="text-sm text-muted-foreground">File: {formData.reportFile.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidenceFiles">Upload Bukti/Evidence (Multiple Files)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="evidenceFiles"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                      onChange={(e) => handleMultipleFileUpload(e.target.files)}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {formData.evidenceFiles.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Files uploaded:</p>
                      {formData.evidenceFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{file.name}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeEvidenceFile(index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : isScheduled ? "Jadwalkan Audit" : "Simpan Audit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
