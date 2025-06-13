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
import { useState, useEffect, FormEvent } from "react"
import { useToast } from "@/components/ui/use-toast"

// Definisikan tipe data untuk risiko
interface RiskData {
  name: string;
  description: string;
  category: string;
  owner: string;
  status: string;
  inherentLikelihood: string;
  inherentImpact: string;
  residualLikelihood: string;
  residualImpact: string;
  // Level akan dihitung, jadi tidak perlu di form state
}

export default function EditRiskPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const riskId = params.id as string;

  const [formData, setFormData] = useState<Partial<RiskData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- LANGKAH 1: Mengambil data risiko dari database saat halaman dimuat ---
  useEffect(() => {
    if (!riskId) return;

    const fetchRiskData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/risks/${riskId}`);
        if (!response.ok) {
          throw new Error("Gagal memuat data risiko.");
        }
        const data = await response.json();
        // Mengisi form dengan data dari database
        setFormData({
          name: data.name,
          description: data.description,
          category: data.category,
          owner: data.owner,
          status: data.status,
          inherentLikelihood: data.inherentRisk.likelihood,
          inherentImpact: data.inherentRisk.impact,
          residualLikelihood: data.residualRisk.likelihood,
          residualImpact: data.residualRisk.impact,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: (error as Error).message,
        });
        router.push("/risk");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskData();
  }, [riskId, router, toast]);

  const handleInputChange = (field: keyof RiskData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateRiskLevel = (likelihood?: string, impact?: string): string => {
    const scoreMap: { [key: string]: number } = { "Sangat Rendah": 1, "Rendah": 2, "Sedang": 3, "Tinggi": 4, "Sangat Tinggi": 5 };
    const likeScore = scoreMap[likelihood || ""] || 0;
    const impactScore = scoreMap[impact || ""] || 0;
    const totalScore = likeScore * impactScore;
    if (totalScore >= 15) return "Sangat Tinggi";
    if (totalScore >= 9) return "Tinggi";
    if (totalScore >= 5) return "Sedang";
    if (totalScore >= 2) return "Rendah";
    return "Sangat Rendah";
  };

  // --- LANGKAH 2: Memperbarui fungsi handleSubmit untuk menyimpan ke database ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const riskDataToUpdate = {
        ...formData,
        inherentRisk: {
          likelihood: formData.inherentLikelihood,
          impact: formData.inherentImpact,
          level: calculateRiskLevel(formData.inherentLikelihood, formData.inherentImpact),
        },
        residualRisk: {
          likelihood: formData.residualLikelihood,
          impact: formData.residualImpact,
          level: calculateRiskLevel(formData.residualLikelihood, formData.residualImpact),
        },
        // Level utama risiko adalah level residual
        level: calculateRiskLevel(formData.residualLikelihood, formData.residualImpact),
      };

      const response = await fetch(`/api/risks/${riskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riskDataToUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal memperbarui risiko.");
      }

      toast({ title: "Sukses!", description: "Perubahan risiko berhasil disimpan." });
      router.push(`/risk/${riskId}`); // Kembali ke halaman detail setelah berhasil
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const categories = ["Keamanan Informasi", "Operasional", "Kepatuhan", "Teknologi", "K3", "Keuangan", "Reputasi"];
  const levels = ["Sangat Rendah", "Rendah", "Sedang", "Tinggi", "Sangat Tinggi"];
  const statuses = ["Open", "Closed", "Under Review", "Mitigated"];

  if (isLoading) {
    return <div className="container mx-auto p-6 text-center">Memuat data untuk diedit...</div>;
  }

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href={`/risk/${riskId}`}><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div><h1 className="text-3xl font-bold">Edit Risiko</h1><p className="text-muted-foreground">ID: {riskId}</p></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- LANGKAH 3: Menyesuaikan tampilan form --- */}
          <Card>
            <CardHeader><CardTitle>Informasi Umum</CardTitle><CardDescription>Informasi dasar tentang risiko</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="name">Nama Risiko *</Label><Input id="name" value={formData.name || ''} onChange={(e) => handleInputChange("name", e.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="category">Kategori *</Label><Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}><SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger><SelectContent>{categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Deskripsi *</Label><Textarea id="description" value={formData.description || ''} onChange={(e) => handleInputChange("description", e.target.value)} rows={4} required /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="owner">Pemilik Risiko *</Label><Input id="owner" value={formData.owner || ''} onChange={(e) => handleInputChange("owner", e.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="status">Status *</Label><Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger><SelectContent>{statuses.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Penilaian Risiko Inheren</CardTitle><CardDescription>Penilaian risiko sebelum penerapan kontrol</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="inherentLikelihood">Kemungkinan *</Label><Select value={formData.inherentLikelihood} onValueChange={(value) => handleInputChange("inherentLikelihood", value)}><SelectTrigger><SelectValue placeholder="Pilih kemungkinan" /></SelectTrigger><SelectContent>{levels.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="inherentImpact">Dampak *</Label><Select value={formData.inherentImpact} onValueChange={(value) => handleInputChange("inherentImpact", value)}><SelectTrigger><SelectValue placeholder="Pilih dampak" /></SelectTrigger><SelectContent>{levels.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg"><Label className="text-sm font-medium">Level Risiko Inheren (Otomatis):</Label><p className="text-lg font-semibold">{calculateRiskLevel(formData.inherentLikelihood, formData.inherentImpact)}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Penilaian Risiko Residual</CardTitle><CardDescription>Penilaian risiko setelah penerapan kontrol</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="residualLikelihood">Kemungkinan *</Label><Select value={formData.residualLikelihood} onValueChange={(value) => handleInputChange("residualLikelihood", value)}><SelectTrigger><SelectValue placeholder="Pilih kemungkinan" /></SelectTrigger><SelectContent>{levels.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="residualImpact">Dampak *</Label><Select value={formData.residualImpact} onValueChange={(value) => handleInputChange("residualImpact", value)}><SelectTrigger><SelectValue placeholder="Pilih dampak" /></SelectTrigger><SelectContent>{levels.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg"><Label className="text-sm font-medium">Level Risiko Residual (Otomatis):</Label><p className="text-lg font-semibold">{calculateRiskLevel(formData.residualLikelihood, formData.residualImpact)}</p></div>
            </CardContent>
          </Card>
          <div className="flex justify-end space-x-4">
            <Link href={`/risk/${riskId}`}><Button type="button" variant="outline">Batal</Button></Link>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan..." : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}</Button>
          </div>
        </form>
      </div>
  )
}