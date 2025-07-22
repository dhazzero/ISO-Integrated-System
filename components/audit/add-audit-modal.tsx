"use client"

import React, { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuditTrail } from "@/hooks/use-audit-trail"

interface AddAuditModalProps {
  onAddAudit: () => void
  type: "scheduled" | "completed"
}

interface Option {
  _id: string
  name: string
}

export function AddAuditModal({ onAddAudit, type }: AddAuditModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { logCreate } = useAuditTrail()

  const [standards, setStandards] = useState<Option[]>([])
  const [departments, setDepartments] = useState<Option[]>([])
  const [selectedStandards, setSelectedStandards] = useState<string[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    auditType: "Internal",
    tujuan: "",
    date: "",
    auditor: "",
    scheduledTime: "",
  })

  useEffect(() => {
    if (!open) return

    async function fetchOptions() {
      setIsLoadingOptions(true)
      try {
        const [sRes, dRes] = await Promise.all([
          fetch("/api/settings/standards"),
          fetch("/api/settings/departments"),
        ])
        if (!sRes.ok) throw new Error("Gagal memuat standar")
        if (!dRes.ok) throw new Error("Gagal memuat departemen")
        setStandards(await sRes.json())
        setDepartments(await dRes.json())
      } catch (err) {
        toast({ variant: "destructive", title: "Gagal Memuat Data", description: (err as Error).message })
      } finally {
        setIsLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [open, toast])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const payload = {
        ...formData,
        standard: selectedStandards,
        status: type === "scheduled" ? "Scheduled" : "Completed",
        findings: 0,
      }
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Gagal menyimpan audit.")
      }
      const newAudit = await res.json()
      onAddAudit()
      logCreate(
        "Audit",
        "Audit",
        newAudit._id || `AUD-${Date.now()}`,
        newAudit.name,
        newAudit,
      )
      toast({ title: "Sukses!", description: "Jadwal audit berhasil disimpan." })
      setOpen(false)
      setSelectedStandards([])
      setFormData({
        name: "",
        department: "",
        auditType: "Internal",
        tujuan: "",
        date: "",
        auditor: "",
        scheduledTime: "",
      })
    } catch (err) {
      toast({ variant: "destructive", title: "Terjadi Kesalahan", description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" />Jadwalkan Audit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Jadwalkan Audit Baru</DialogTitle>
          <DialogDescription>Buat jadwal audit baru dengan detail lengkap.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Audit *</Label>
              <Input id="name" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standard">Standar *</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                {isLoadingOptions ? (
                  <p className="text-sm text-muted-foreground">Memuat standar...</p>
                ) : standards.length > 0 ? (
                  standards.map((s) => (
                    <div key={s._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`std-${s._id}`}
                        checked={selectedStandards.includes(s.name)}
                        onCheckedChange={(checked) =>
                          setSelectedStandards((prev) =>
                            checked ? [...prev, s.name] : prev.filter((name) => name !== s.name)
                          )
                        }
                      />
                      <Label htmlFor={`std-${s._id}`}>{s.name}</Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada standar yang ditemukan. Tambahkan di menu Pengaturan.
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auditType">Jenis Audit *</Label>
              <Select required value={formData.auditType} onValueChange={v => handleInputChange("auditType", v)}>
                <SelectTrigger id="auditType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Internal">Audit Internal</SelectItem>
                  <SelectItem value="External">Audit Eksternal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.auditType === "External" && (
              <div className="space-y-2">
                <Label htmlFor="tujuan">Tujuan Audit *</Label>
                <Select required value={formData.tujuan} onValueChange={v => handleInputChange("tujuan", v)}>
                  <SelectTrigger id="tujuan">
                    <SelectValue placeholder="Pilih tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Initial">Initial</SelectItem>
                    <SelectItem value="Surveillance">Surveillance</SelectItem>
                    <SelectItem value="Re-certification">Re-certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="department">Departemen *</Label>
              <Select required value={formData.department} onValueChange={v => handleInputChange("department", v)}>
                <SelectTrigger id="department">
                  <SelectValue placeholder={isLoadingOptions ? "Memuat..." : "Pilih departemen"} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingOptions ? (
                    <SelectItem value="loading" disabled>Memuat...</SelectItem>
                  ) : (
                    departments.map(d => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)
                  )}
                  <SelectItem value="Semua Departemen">Semua Departemen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auditor">{formData.auditType === "Internal" ? "Auditor" : "Lembaga Sertifikasi"} *</Label>
              <Input id="auditor" value={formData.auditor} onChange={e => handleInputChange("auditor", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal Audit *</Label>
              <Input id="date" type="date" value={formData.date} onChange={e => handleInputChange("date", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Waktu *</Label>
              <Input id="scheduledTime" type="time" value={formData.scheduledTime} onChange={e => handleInputChange("scheduledTime", e.target.value)} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Jadwalkan Audit"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
