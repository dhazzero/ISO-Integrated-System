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
import { Plus } from "lucide-react"
import { useState } from "react"

export function AddRiskModal({ addRisk }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    likelihood: "",
    impact: "",
    status: "Open",
    trend: "stable",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Function to calculate risk level based on likelihood and impact
  const calculateRiskLevel = (likelihood, impact) => {
    const levelMap = {
      Rendah: 1,
      Sedang: 2,
      Tinggi: 3,
    }

    const likelihoodScore = levelMap[likelihood] || 0
    const impactScore = levelMap[impact] || 0
    const totalScore = likelihoodScore * impactScore

    if (totalScore >= 6) return "Tinggi"
    if (totalScore >= 3) return "Sedang"
    return "Rendah"
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Calculate risk level automatically
    const level = calculateRiskLevel(formData.likelihood, formData.impact)

    // Generate a simple incremental ID
    const newRiskId = Date.now()

    // Create a new risk object with the form data and calculated level
    const newRisk = {
      id: newRiskId,
      ...formData,
      level: level,
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setOpen(false)

      // Call the addRisk callback with the new risk data
      addRisk(newRisk)

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        likelihood: "",
        impact: "",
        status: "Open",
        trend: "stable",
      })
    }, 1500)
  }

  const categories = ["Keamanan Informasi", "Operasional", "Kepatuhan", "Teknologi", "K3", "Keuangan", "Reputasi"]
  const levels = ["Rendah", "Sedang", "Tinggi"]
  const statusOptions = ["Open", "Mitigated", "Closed"]
  const trendOptions = [
    { value: "up", label: "Meningkat" },
    { value: "stable", label: "Stabil" },
    { value: "down", label: "Menurun" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Risiko
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Risiko Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi risiko baru yang akan ditambahkan ke register risiko.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Risiko *</Label>
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
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              placeholder="Deskripsi risiko (opsional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="likelihood">Kemungkinan *</Label>
              <Select value={formData.likelihood} onValueChange={(value) => handleInputChange("likelihood", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kemungkinan" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="impact">Dampak *</Label>
              <Select value={formData.impact} onValueChange={(value) => handleInputChange("impact", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dampak" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "Open" ? "Terbuka" : status === "Mitigated" ? "Dimitigasi" : "Ditutup"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trend">Tren *</Label>
              <Select value={formData.trend} onValueChange={(value) => handleInputChange("trend", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tren" />
                </SelectTrigger>
                <SelectContent>
                  {trendOptions.map((trend) => (
                    <SelectItem key={trend.value} value={trend.value}>
                      {trend.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.likelihood && formData.impact && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Level Risiko (Otomatis):</Label>
              <p
                className={`text-lg font-semibold ${
                  calculateRiskLevel(formData.likelihood, formData.impact) === "Tinggi"
                    ? "text-red-500"
                    : calculateRiskLevel(formData.likelihood, formData.impact) === "Sedang"
                      ? "text-amber-500"
                      : "text-green-500"
                }`}
              >
                {calculateRiskLevel(formData.likelihood, formData.impact)}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Risiko"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
