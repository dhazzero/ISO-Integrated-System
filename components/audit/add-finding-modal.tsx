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
import { Plus } from "lucide-react"

interface AddFindingModalProps {
  onAddFinding: (finding: any) => void
  audits: any[]
}

export function AddFindingModal({ onAddFinding, audits }: AddFindingModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    auditId: "",
    findingType: "",
    severity: "",
    description: "",
    clause: "",
    evidence: "",
    recommendation: "",
    status: "Open",
    dueDate: "",
    responsiblePerson: "",
    department: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find selected audit details
    const selectedAudit = audits.find((audit) => audit.id === Number.parseInt(formData.auditId))

    const newFinding = {
      id: Date.now(), // Generate unique ID
      auditId: Number.parseInt(formData.auditId),
      auditName: selectedAudit?.name || "",
      findingType: formData.findingType,
      severity: formData.severity,
      description: formData.description,
      clause: formData.clause,
      evidence: formData.evidence,
      recommendation: formData.recommendation,
      department: formData.department || selectedAudit?.department || "",
      status: formData.status,
      dueDate: formData.dueDate,
      responsiblePerson: formData.responsiblePerson,
      createdDate: new Date().toISOString().split("T")[0],
    }

    onAddFinding(newFinding)

    // Reset form
    setFormData({
      auditId: "",
      findingType: "",
      severity: "",
      description: "",
      clause: "",
      evidence: "",
      recommendation: "",
      status: "Open",
      dueDate: "",
      responsiblePerson: "",
      department: "",
    })

    setIsLoading(false)
    setOpen(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Filter only completed audits for finding creation
  const completedAudits = audits.filter((audit) => audit.status === "Completed")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Finding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Finding Baru</DialogTitle>
          <DialogDescription>Tambahkan temuan audit baru ke dalam sistem</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auditId">Audit *</Label>
              <Select value={formData.auditId} onValueChange={(value) => handleInputChange("auditId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih audit" />
                </SelectTrigger>
                <SelectContent>
                  {completedAudits.map((audit) => (
                    <SelectItem key={audit.id} value={audit.id.toString()}>
                      {audit.name} - {audit.standard}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="findingType">Jenis Temuan *</Label>
              <Select value={formData.findingType} onValueChange={(value) => handleInputChange("findingType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis temuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Non-Conformity">Non-Conformity</SelectItem>
                  <SelectItem value="Observation">Observation</SelectItem>
                  <SelectItem value="Opportunity for Improvement">Opportunity for Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Tingkat Severity *</Label>
              <Select value={formData.severity} onValueChange={(value) => handleInputChange("severity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tingkat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Major">Major</SelectItem>
                  <SelectItem value="Minor">Minor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clause">Klausul Standar *</Label>
              <Input
                id="clause"
                value={formData.clause}
                onChange={(e) => handleInputChange("clause", e.target.value)}
                placeholder="Contoh: 7.1.5, 8.2.1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Temuan *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Jelaskan temuan secara detail..."
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Bukti/Evidence</Label>
            <Textarea
              id="evidence"
              value={formData.evidence}
              onChange={(e) => handleInputChange("evidence", e.target.value)}
              placeholder="Jelaskan bukti yang mendukung temuan..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendation">Rekomendasi</Label>
            <Textarea
              id="recommendation"
              value={formData.recommendation}
              onChange={(e) => handleInputChange("recommendation", e.target.value)}
              placeholder="Berikan rekomendasi perbaikan..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Departemen</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="Departemen terkait"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsiblePerson">Penanggung Jawab</Label>
              <Input
                id="responsiblePerson"
                value={formData.responsiblePerson}
                onChange={(e) => handleInputChange("responsiblePerson", e.target.value)}
                placeholder="Nama penanggung jawab"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Target Penyelesaian</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Finding"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
