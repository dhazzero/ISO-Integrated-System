"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import { useState, useEffect, FormEvent } from "react"
import { useToast } from "@/components/ui/use-toast"

// Tipe data untuk form
interface Control { description: string; type: string; status: string; }
interface Mitigation { action: string; responsible: string; dueDate: string; }
interface Opportunity { description: string; }
interface StandardOption { _id: string; name: string; }

export function AddRiskModal({ onRiskAdded }: { onRiskAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initialFormData = {
    name: "", asset: "", threat: "", vulnerability: "", impactDescription: "",
    category: "", riskOwner: "", pic: "",
    inherentLikelihoodScore: "1", inherentImpactScore: "1",
    residualLikelihoodScore: "1", residualImpactScore: "1",
    proposedAction: "", targetDate: "", monitoring: "Monthly", status: "Open",
    relatedStandards: [] as string[],
    controls: [] as Control[],
    mitigationActions: [] as Mitigation[],
    opportunities: [] as Opportunity[], // Added for dynamic opportunities
  };
  const [formData, setFormData] = useState(initialFormData);
  const [availableStandards, setAvailableStandards] = useState<StandardOption[]>([]);


  useEffect(() => {
    if (open) {
      const fetchStandards = async () => { /* ... (fungsi dari sebelumnya, tidak berubah) ... */ };
      fetchStandards();
    }
  }, [open, toast]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDynamicListChange = (listName: 'controls' | 'mitigationActions' | 'opportunities', index: number, field: string, value: string) => {
    const updatedList = [...formData[listName]];
    updatedList[index] = { ...updatedList[index], [field]: value };
    handleInputChange(listName, updatedList);
  };

  const addListItem = (listName: 'controls' | 'mitigationActions' | 'opportunities') => {
    const list = formData[listName];
    if (list.length >= 5) {
      toast({ variant: "destructive", title: "Batas Maksimal", description: `Anda hanya bisa menambahkan maksimal 5 item.`});
      return;
    }
    let newItem: Control | Mitigation | Opportunity;
    if (listName === 'controls') {
      newItem = { description: '', type: 'Preventif', status: 'Diterapkan' };
    } else if (listName === 'mitigationActions') {
      newItem = { action: '', responsible: '', dueDate: '' };
    } else { // opportunities
      newItem = { description: '' };
    }
    handleInputChange(listName, [...list, newItem]);
  };

  const removeListItem = (listName: 'controls' | 'mitigationActions' | 'opportunities', index: number) => {
    handleInputChange(listName, formData[listName].filter((_, i) => i !== index));
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
  const monitoringOptions = ["Daily", "Weekly", "Monthly", "Quarterly", "Semester", "Yearly"];
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
              <CardHeader><CardTitle>3. Kontrol & Mitigasi</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-semibold">Aktivitas Kontrol Saat Ini</Label>
                  <div className="mt-2 space-y-4">
                    {(formData.controls).map((control, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-end gap-2 border-b pb-4">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor={`ctrl-desc-${index}`}>Deskripsi Kontrol #{index + 1}</Label>
                            <Textarea id={`ctrl-desc-${index}`} value={control.description} onChange={(e) => handleDynamicListChange('controls', index, 'description', e.target.value)} />
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                            <div className="space-y-2 flex-1">
                              <Label htmlFor={`ctrl-type-${index}`}>Tipe</Label>
                              <Select value={control.type} onValueChange={(v) => handleDynamicListChange('controls', index, 'type', v)}>
                                <SelectTrigger id={`ctrl-type-${index}`}><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Preventif">Preventif</SelectItem>
                                  <SelectItem value="Detektif">Detektif</SelectItem>
                                  <SelectItem value="Korektif">Korektif</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 flex-1">
                              <Label htmlFor={`ctrl-status-${index}`}>Status</Label>
                              <Select value={control.status} onValueChange={(v) => handleDynamicListChange('controls', index, 'status', v)}>
                                <SelectTrigger id={`ctrl-status-${index}`}><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Diterapkan">Diterapkan</SelectItem>
                                  <SelectItem value="Sebagian">Sebagian</SelectItem>
                                  <SelectItem value="Belum Diterapkan">Belum</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button type="button" variant="outline" size="icon" onClick={() => removeListItem('controls', index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addListItem('controls')} disabled={formData.controls.length >= 5}><Plus className="mr-2 h-4 w-4"/>Tambah Kontrol</Button>
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">Tindakan Mitigasi yang Direncanakan</Label>
                  <div className="mt-2 space-y-4">
                    {(formData.mitigationActions).map((mitigation, index) => (
                        <div key={index} className="flex items-end gap-2 border-b pb-4">
                          <div className="flex-1 space-y-2"><Label htmlFor={`mit-action-${index}`}>Tindakan #{index + 1}</Label><Textarea id={`mit-action-${index}`} value={mitigation.action} onChange={(e) => handleDynamicListChange('mitigationActions', index, 'action', e.target.value)} /></div>
                          <div className="space-y-2"><Label htmlFor={`mit-resp-${index}`}>PIC</Label><Input id={`mit-resp-${index}`} value={mitigation.responsible} onChange={(e) => handleDynamicListChange('mitigationActions', index, 'responsible', e.target.value)} /></div>
                          <div className="space-y-2"><Label htmlFor={`mit-date-${index}`}>Target</Label><Input id={`mit-date-${index}`} type="date" value={mitigation.dueDate} onChange={(e) => handleDynamicListChange('mitigationActions', index, 'dueDate', e.target.value)} /></div>
                          <Button type="button" variant="outline" size="icon" onClick={() => removeListItem('mitigationActions', index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addListItem('mitigationActions')} disabled={formData.mitigationActions.length >= 5}><Plus className="mr-2 h-4 w-4"/>Tambah Mitigasi</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>4. Rencana Aksi Lainnya</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-semibold">Peluang (Opportunity)</Label>
                  <div className="mt-2 space-y-4">
                    {(formData.opportunities).map((opportunity, index) => (
                        <div key={index} className="flex items-end gap-2 border-b pb-4">
                          <div className="flex-1 space-y-2"><Label htmlFor={`opp-desc-${index}`}>Deskripsi Peluang #{index + 1}</Label><Textarea id={`opp-desc-${index}`} value={opportunity.description} onChange={(e) => handleDynamicListChange('opportunities', index, 'description', e.target.value)} /></div>
                          <Button type="button" variant="outline" size="icon" onClick={() => removeListItem('opportunities', index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addListItem('opportunities')} disabled={formData.opportunities.length >= 5}><Plus className="mr-2 h-4 w-4"/>Tambah Peluang</Button>
                  </div>
                </div>
                <div className="space-y-2"><Label>Monitoring</Label><Select value={formData.monitoring} onValueChange={(v) => handleInputChange("monitoring", v)}><SelectTrigger><SelectValue placeholder="Pilih frekuensi monitoring"/></SelectTrigger><SelectContent>{monitoringOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Target Penyelesaian</Label><Input type="date" value={formData.targetDate} onChange={(e) => handleInputChange("targetDate", e.target.value)} /></div>
                <div className="space-y-2"><Label>PIC</Label><Input value={formData.pic} onChange={(e) => handleInputChange("pic", e.target.value)} /></div>
                <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(v) => handleInputChange("status", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              </CardContent>
            </Card>

            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button><Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan Risiko"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}


