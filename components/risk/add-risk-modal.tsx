"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useState, FormEvent } from "react"
import { useToast } from "@/components/ui/use-toast"

export function AddRiskModal({ onRiskAdded }: { onRiskAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initialFormData = {
    name: "", asset: "", threat: "", vulnerability: "", impactDescription: "",
    category: "", riskOwner: "", pic: "",
    inherentLikelihoodScore: "0", inherentImpactScore: "0",
    residualLikelihoodScore: "0", residualImpactScore: "0",
    controlActivities: "", proposedAction: "", opportunity: "",
    targetDate: "", monitoring: "", status: "Open",
  };
  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/risks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || 'Gagal'); }
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

  const scoreOptions = ["1", "2", "3", "4", "5"];
  const categories = ["Keamanan Informasi", "Operasional", "Kepatuhan", "Teknologi", "K3", "Keuangan", "Reputasi"];
  const statuses = ["Open", "In Progress", "Mitigated", "Closed"];

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Tambah Risiko</Button></DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tambah Risiko Baru (Sesuai Register)</DialogTitle><DialogDescription>Lengkapi semua informasi risiko.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">

            <Card>
              <CardHeader><CardTitle>1. Identifikasi Risiko</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Nama Risiko *</Label><Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required /></div><div className="space-y-2"><Label>Aset / Proses Terkait</Label><Input value={formData.asset} onChange={(e) => handleInputChange("asset", e.target.value)} /></div></div>
                <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Ancaman (Threat)</Label><Input value={formData.threat} onChange={(e) => handleInputChange("threat", e.target.value)} /></div><div className="space-y-2"><Label>Kelemahan (Vulnerability)</Label><Input value={formData.vulnerability} onChange={(e) => handleInputChange("vulnerability", e.target.value)} /></div></div>
                <div className="space-y-2"><Label>Uraian Dampak Risiko</Label><Textarea value={formData.impactDescription} onChange={(e) => handleInputChange("impactDescription", e.target.value)} /></div>
                <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Kategori *</Label><Select value={formData.category} onValueChange={(v) => handleInputChange("category", v)}><SelectTrigger><SelectValue placeholder="Pilih Kategori"/></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Risk Owner *</Label><Input value={formData.riskOwner} onChange={(e) => handleInputChange("riskOwner", e.target.value)} required/></div></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>2. Penilaian Risiko</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div><h4 className="font-semibold text-md">Risiko Inheren (Sebelum Kontrol)</h4>
                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2"><Label>Kemungkinan (Skor 1-5) *</Label><Select value={formData.inherentLikelihoodScore} onValueChange={(v) => handleInputChange("inherentLikelihoodScore", v)} required><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{scoreOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Dampak (Skor 1-5) *</Label><Select value={formData.inherentImpactScore} onValueChange={(v) => handleInputChange("inherentImpactScore", v)} required><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{scoreOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                  </div></div>
                <div><h4 className="font-semibold text-md">Risiko Residual (Setelah Kontrol)</h4>
                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2"><Label>Kemungkinan (Skor 1-5) *</Label><Select value={formData.residualLikelihoodScore} onValueChange={(v) => handleInputChange("residualLikelihoodScore", v)} required><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{scoreOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Dampak (Skor 1-5) *</Label><Select value={formData.residualImpactScore} onValueChange={(v) => handleInputChange("residualImpactScore", v)} required><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{scoreOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                  </div></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>3. Rencana Tindakan & Mitigasi</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Aktivitas Kontrol Saat Ini</Label><Textarea value={formData.controlActivities} onChange={(e) => handleInputChange("controlActivities", e.target.value)} /></div>
                <div className="space-y-2"><Label>Usulan Tindakan Mitigasi</Label><Textarea value={formData.proposedAction} onChange={(e) => handleInputChange("proposedAction", e.target.value)} /></div>
                <div className="space-y-2"><Label>Peluang (Opportunity)</Label><Textarea value={formData.opportunity} onChange={(e) => handleInputChange("opportunity", e.target.value)} /></div>
                <div className="space-y-2"><Label>Monitoring</Label><Textarea value={formData.monitoring} onChange={(e) => handleInputChange("monitoring", e.target.value)} /></div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Target Penyelesaian</Label><Input type="date" value={formData.targetDate} onChange={(e) => handleInputChange("targetDate", e.target.value)} /></div>
                  <div className="space-y-2"><Label>PIC</Label><Input value={formData.pic} onChange={(e) => handleInputChange("pic", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(v) => handleInputChange("status", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button><Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan Risiko"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}