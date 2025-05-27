"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function EditControlPage() {
  const params = useParams()
  const router = useRouter()
  const controlId = params.id

  const [formData, setFormData] = useState({
    name: "Kontrol Dokumen",
    description:
      "Sistem kontrol dokumen untuk memastikan dokumen yang digunakan adalah versi terkini dan telah disetujui",
    category: "Dokumentasi",
    owner: "Document Controller",
    status: "Implemented",
    effectiveness: "High",
    nextReview: "2023-12-15",
    standards: [
      { id: 1, name: "ISO 9001:2015", clause: "7.5.3", selected: true },
      { id: 2, name: "ISO 27001:2022", clause: "7.5.3", selected: true },
      { id: 3, name: "ISO 37001:2016", clause: "7.5.3", selected: true },
    ],
    gaps: [
      {
        id: 1,
        standard: "ISO 27001:2022",
        clause: "7.5.3.2",
        description: "Kontrol akses digital untuk dokumen elektronik belum sepenuhnya diterapkan",
        severity: "Medium",
        dueDate: "2023-09-30",
        responsible: "IT Manager",
      },
    ],
  })

  const [isLoading, setIsLoading] = useState(false)

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

  const handleGapChange = (gapId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      gaps: prev.gaps.map((gap) => (gap.id === gapId ? { ...gap, [field]: value } : gap)),
    }))
  }

  const addGap = () => {
    const newGap = {
      id: Date.now(),
      standard: "",
      clause: "",
      description: "",
      severity: "Medium",
      dueDate: "",
      responsible: "",
    }
    setFormData((prev) => ({
      ...prev,
      gaps: [...prev.gaps, newGap],
    }))
  }

  const removeGap = (gapId) => {
    setFormData((prev) => ({
      ...prev,
      gaps: prev.gaps.filter((gap) => gap.id !== gapId),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulasi API call
    setTimeout(() => {
      setIsLoading(false)
      router.push(`/compliance/controls/${controlId}`)
    }, 1500)
  }

  const categories = ["Dokumentasi", "Keamanan", "Operasional", "Manajemen", "Teknis"]
  const statuses = ["Implemented", "Partial", "Not Implemented", "Under Review"]
  const effectiveness = ["High", "Medium", "Low"]
  const severities = ["High", "Medium", "Low"]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href={`/compliance/controls/${controlId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Kontrol</h1>
            <p className="text-muted-foreground">Control ID: {controlId}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Umum</CardTitle>
            <CardDescription>Informasi dasar tentang kontrol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                rows={4}
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
              <Label htmlFor="nextReview">Tinjauan Berikutnya</Label>
              <Input
                id="nextReview"
                type="date"
                value={formData.nextReview}
                onChange={(e) => handleInputChange("nextReview", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pemetaan Standar</CardTitle>
            <CardDescription>Pilih standar yang terkait dengan kontrol ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.standards.map((standard) => (
              <div key={standard.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`standard-${standard.id}`}
                  checked={standard.selected}
                  onCheckedChange={(checked) => handleStandardChange(standard.id, checked)}
                />
                <Label htmlFor={`standard-${standard.id}`} className="flex-1">
                  {standard.name} - {standard.clause}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analisis Kesenjangan</CardTitle>
            <CardDescription>Identifikasi kesenjangan dalam implementasi kontrol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.gaps.map((gap, index) => (
              <div key={gap.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Kesenjangan {index + 1}</h4>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeGap(gap.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Standar</Label>
                    <Input
                      value={gap.standard}
                      onChange={(e) => handleGapChange(gap.id, "standard", e.target.value)}
                      placeholder="ISO 27001:2022"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Klausul</Label>
                    <Input
                      value={gap.clause}
                      onChange={(e) => handleGapChange(gap.id, "clause", e.target.value)}
                      placeholder="7.5.3.2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tingkat</Label>
                    <Select value={gap.severity} onValueChange={(value) => handleGapChange(gap.id, "severity", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {severities.map((severity) => (
                          <SelectItem key={severity} value={severity}>
                            {severity === "High" ? "Tinggi" : severity === "Medium" ? "Sedang" : "Rendah"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={gap.description}
                    onChange={(e) => handleGapChange(gap.id, "description", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Penyelesaian</Label>
                    <Input
                      type="date"
                      value={gap.dueDate}
                      onChange={(e) => handleGapChange(gap.id, "dueDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Penanggung Jawab</Label>
                    <Input
                      value={gap.responsible}
                      onChange={(e) => handleGapChange(gap.id, "responsible", e.target.value)}
                      placeholder="IT Manager"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addGap} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kesenjangan
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Link href={`/compliance/controls/${controlId}`}>
            <Button variant="outline">Batal</Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  )
}
