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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useState, FormEvent } from "react"
import { useToast } from "@/components/ui/use-toast"

export function AddRiskModal({ onRiskAdded }: { onRiskAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast();

  const initialFormData = {
    name: "",
    description: "",
    category: "",
    owner: "",
    status: "Open",
    inherentLikelihood: "",
    inherentImpact: "",
    residualLikelihood: "",
    residualImpact: "",
  }
  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateRiskLevel = (likelihood: string, impact: string): string => {
    const scoreMap: { [key: string]: number } = { "Sangat Rendah": 1, "Rendah": 2, "Sedang": 3, "Tinggi": 4, "Sangat Tinggi": 5 };
    const likeScore = scoreMap[likelihood] || 0;
    const impactScore = scoreMap[impact] || 0;
    const totalScore = likeScore * impactScore;

    if (totalScore >= 15) return "Sangat Tinggi";
    if (totalScore >= 9) return "Tinggi";
    if (totalScore >= 5) return "Sedang";
    if (totalScore >= 2) return "Rendah";
    return "Sangat Rendah";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const riskDataToSave = {
      ...formData,
      inherentLevel: calculateRiskLevel(formData.inherentLikelihood, formData.inherentImpact),
      residualLevel: calculateRiskLevel(formData.residualLikelihood, formData.residualImpact),
      level: calculateRiskLevel(formData.residualLikelihood, formData.residualImpact),
    };

    try {
      const response = await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riskDataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan risiko');
      }

      toast({ title: "Sukses", description: "Risiko baru berhasil ditambahkan." });
      onRiskAdded();
      setOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["Keamanan Informasi", "Operasional", "Kepatuhan", "Teknologi", "K3", "Keuangan", "Reputasi"];
  const levels = ["Sangat Rendah", "Rendah", "Sedang", "Tinggi", "Sangat Tinggi"];
  const statuses = ["Open", "Closed", "Under Review", "Mitigated"];

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Risiko
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Risiko Baru</DialogTitle>
            <DialogDescription>Lengkapi semua informasi risiko termasuk penilaian inheren dan residual.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <Card>
              <CardHeader><CardTitle>Informasi Umum</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="name">Nama Risiko *</Label><Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="category">Kategori *</Label><Select value={formData.category} onValueChange={(v) => handleInputChange("category", v)}><SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger><SelectContent>{categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label htmlFor="description">Deskripsi</Label><Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={3} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="owner">Pemilik Risiko *</Label><Input id="owner" value={formData.owner} onChange={(e) => handleInputChange("owner", e.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="status">Status *</Label><Select value={formData.status} onValueChange={(v) => handleInputChange("status", v)}><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger><SelectContent>{statuses.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Penilaian Risiko Inheren</CardTitle><CardDescription>Penilaian risiko sebelum penerapan kontrol.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="inherentLikelihood">Kemungkinan *</Label><Select value={formData.inherentLikelihood} onValueChange={(v) => handleInputChange("inherentLikelihood", v)}><SelectTrigger><SelectValue placeholder="Pilih kemungkinan" /></SelectTrigger><SelectContent>{levels.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-2"><Label htmlFor="inherentImpact">Dampak *</Label><Select value={formData.inherentImpact} onValueChange={(v) => handleInputChange("inherentImpact", v)}><SelectTrigger><SelectValue placeholder="Pilih dampak" /></SelectTrigger><SelectContent>{levels.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent></Select></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Penilaian Risiko Residual</CardTitle><CardDescription>Penilaian risiko setelah penerapan kontrol.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="residualLikelihood">Kemungkinan *</Label><Select value={formData.residualLikelihood} onValueChange={(v) => handleInputChange("residualLikelihood", v)}><SelectTrigger><SelectValue placeholder="Pilih kemungkinan" /></SelectTrigger><SelectContent>{levels.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-2"><Label htmlFor="residualImpact">Dampak *</Label><Select value={formData.residualImpact} onValueChange={(v) => handleInputChange("residualImpact", v)}><SelectTrigger><SelectValue placeholder="Pilih dampak" /></SelectTrigger><SelectContent>{levels.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent></Select></div>
                </div>
              </CardContent>
            </Card>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan Risiko"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}