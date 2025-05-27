"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function EditRiskPage() {
  const params = useParams()
  const router = useRouter()
  const riskId = params.id

  const [formData, setFormData] = useState({
    name: "Kebocoran Data Pelanggan",
    description: "Risiko kebocoran data pelanggan akibat serangan siber atau kelalaian dalam pengelolaan data",
    category: "Keamanan Informasi",
    likelihood: "Sedang",
    impact: "Tinggi",
    status: "Open",
    owner: "Tim IT",
    inherentLikelihood: "Tinggi",
    inherentImpact: "Tinggi",
    residualLikelihood: "Sedang",
    residualImpact: "Tinggi",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulasi API call
    setTimeout(() => {
      setIsLoading(false)
      router.push(`/risk/${riskId}`)
    }, 1500)
  }

  const categories = ["Keamanan Informasi", "Operasional", "Kepatuhan", "Teknologi", "K3", "Keuangan", "Reputasi"]

  const levels = ["Rendah", "Sedang", "Tinggi"]
  const statuses = ["Open", "Closed", "Under Review"]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href={`/risk/${riskId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Risiko</h1>
            <p className="text-muted-foreground">ID: {riskId}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Umum</CardTitle>
            <CardDescription>Informasi dasar tentang risiko</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="description">Deskripsi *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Pemilik Risiko *</Label>
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
                        {status === "Open"
                          ? "Terbuka"
                          : status === "Closed"
                            ? "Tertutup"
                            : status === "Under Review"
                              ? "Dalam Tinjauan"
                              : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penilaian Risiko Inheren</CardTitle>
            <CardDescription>Penilaian risiko sebelum penerapan kontrol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inherentLikelihood">Kemungkinan *</Label>
                <Select
                  value={formData.inherentLikelihood}
                  onValueChange={(value) => handleInputChange("inherentLikelihood", value)}
                >
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
                <Label htmlFor="inherentImpact">Dampak *</Label>
                <Select
                  value={formData.inherentImpact}
                  onValueChange={(value) => handleInputChange("inherentImpact", value)}
                >
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penilaian Risiko Residual</CardTitle>
            <CardDescription>Penilaian risiko setelah penerapan kontrol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="residualLikelihood">Kemungkinan *</Label>
                <Select
                  value={formData.residualLikelihood}
                  onValueChange={(value) => handleInputChange("residualLikelihood", value)}
                >
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
                <Label htmlFor="residualImpact">Dampak *</Label>
                <Select
                  value={formData.residualImpact}
                  onValueChange={(value) => handleInputChange("residualImpact", value)}
                >
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
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Link href={`/risk/${riskId}`}>
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
