"use client"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useAuditTrail } from "@/hooks/use-audit-trail"

export function AddControlModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    owner: "",
    status: "Not Implemented",
    effectiveness: "Medium",
    standards: [
      { id: 1, name: "ISO 9001:2015", selected: false },
      { id: 2, name: "ISO 27001:2022", selected: false },
      { id: 3, name: "ISO 37001:2016", selected: false },
    ],
  })

  const { logCreate } = useAuditTrail()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStandardChange = (standardId, checked) => {
    setFormData((prev) => ({
      ...prev,
      standards: prev.standards.map((std) => (std.id === standardId ? { ...std, selected: checked } : std)),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Log the create action
    logCreate(
      "Compliance",
      "Control",
      `CTRL-${Date.now()}`,
      formData.name,
      {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        owner: formData.owner,
        status: formData.status,
        effectiveness: formData.effectiveness,
        standards: formData.standards.filter((s) => s.selected).map((s) => s.name),
      },
      "Current User",
      "Compliance Officer",
    )

    // Simulasi API call
    setTimeout(() => {
      setIsLoading(false)
      setOpen(false)
      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        owner: "",
        status: "Not Implemented",
        effectiveness: "Medium",
        standards: [
          { id: 1, name: "ISO 9001:2015", selected: false },
          { id: 2, name: "ISO 27001:2022", selected: false },
          { id: 3, name: "ISO 37001:2016", selected: false },
        ],
      })
    }, 1500)
  }

  const categories = ["Dokumentasi", "Keamanan", "Operasional", "Manajemen", "Teknis"]
  const statuses = ["Implemented", "Partial", "Not Implemented", "Under Review"]
  const effectiveness = ["High", "Medium", "Low"]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kontrol
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Kontrol Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi kontrol baru yang akan ditambahkan ke sistem kepatuhan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kontrol *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Pemilik Kontrol *</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) => handleInputChange("owner", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "Implemented"
                        ? "Diterapkan"
                        : status === "Partial"
                          ? "Sebagian"
                          : status === "Not Implemented"
                            ? "Belum Diterapkan"
                            : "Dalam Tinjauan"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveness">Efektivitas *</Label>
              <Select
                value={formData.effectiveness}
                onValueChange={(value) => handleInputChange("effectiveness", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih efektivitas" />
                </SelectTrigger>
                <SelectContent>
                  {effectiveness.map((eff) => (
                    <SelectItem key={eff} value={eff}>
                      {eff === "High" ? "Tinggi" : eff === "Medium" ? "Sedang" : "Rendah"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Standar Terkait</Label>
            <div className="space-y-2">
              {formData.standards.map((standard) => (
                <div key={standard.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`standard-${standard.id}`}
                    checked={standard.selected}
                    onCheckedChange={(checked) => handleStandardChange(standard.id, checked)}
                  />
                  <Label htmlFor={`standard-${standard.id}`}>{standard.name}</Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Kontrol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
