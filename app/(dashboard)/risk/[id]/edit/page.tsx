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
import { useState, useEffect, FormEvent } from "react"
import { useToast } from "@/components/ui/use-toast"
import { logActivity } from "@/lib/logger"

// --- Tipe Data ---
interface Control { description: string; type: string; }
interface Mitigation { action: string; responsible: string; dueDate: string; }
interface RiskFormData {
  name: string; description: string; category: string; owner: string; status: string;
  asset: string; threat: string; vulnerability: string; impactDescription: string;
  inherentLikelihoodScore: string; inherentImpactScore: string;
  residualLikelihoodScore: string; residualImpactScore: string;
  relatedStandards: string[];
  controls: Control[];
  mitigationActions: Mitigation[];
  proposedAction: string; opportunity: string;
  targetDate: string; monitoring: string; pic: string;
}
interface StandardOption { _id: string; name: string; }

export default function EditRiskPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const riskId = params.id as string;

  const [formData, setFormData] = useState<Partial<RiskFormData>>({ controls: [], mitigationActions: [], relatedStandards: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableStandards, setAvailableStandards] = useState<StandardOption[]>([]);

  useEffect(() => {
    if (!riskId) return;
    const fetchInitialData = async () => { /* ... (fungsi dari sebelumnya, tidak berubah) ... */ };
    fetchInitialData();
  }, [riskId, router, toast]);

  const handleInputChange = (field: keyof RiskFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Handlers untuk Kontrol & Mitigasi Dinamis ---
  const handleDynamicListChange = (listName: 'controls' | 'mitigationActions', index: number, field: string, value: string) => {
    const updatedList = [...(formData[listName] || [])];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setFormData(prev => ({ ...prev, [listName]: updatedList }));
  };

  const addListItem = (listName: 'controls' | 'mitigationActions') => {
    const list = formData[listName] || [];
    if (list.length >= 5) {
      toast({ variant: "destructive", title: "Batas Maksimal", description: `Anda hanya bisa menambahkan maksimal 5 item.`});
      return;
    }
    const newItem = listName === 'controls' ? { description: '', type: 'Preventif' } : { action: '', responsible: '', dueDate: '' };
    setFormData(prev => ({ ...prev, [listName]: [...list, newItem] }));
  };

  const removeListItem = (listName: 'controls' | 'mitigationActions', index: number) => {
    setFormData(prev => ({ ...prev, [listName]: (prev[listName] || []).filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: FormEvent) => { /* ... (fungsi dari sebelumnya, sudah benar) ... */ };
  const scoreOptions = ["1", "2", "3", "4", "5"];
  const categories = ["Keamanan Informasi", "Operasional", "Kepatuhan", "Teknologi", "K3", "Keuangan", "Reputasi"];
  const statuses = ["Open", "In Progress", "Mitigated", "Closed"];
  const monitoringOptions = ["Daily", "Weekly", "Monthly", "Quarterly", "Semester", "Yearly"];

  if (isLoading) return <div className="container mx-auto p-6 text-center">Memuat data...</div>;

  return (
      <div className="container mx-auto px-4 py-6">
        {/* ... Header Halaman ... */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Informasi Umum</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* ... Input untuk Nama, Kategori, Deskripsi, Owner, Status ... */}
              <div className="space-y-2"><Label>Standar Terkait</Label>{/* ... Checkbox Standar ... */}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Penilaian Risiko</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div><h4 className="font-semibold text-md">Risiko Inheren</h4>{/* ... Input Inheren ... */}</div>
              <div><h4 className="font-semibold text-md">Risiko Residual</h4>{/* ... Input Residual ... */}</div>
            </CardContent>
          </Card>

          {/* --- KONTROL DINAMIS --- */}
          <Card>
            <CardHeader><CardTitle>Aktivitas Kontrol</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(formData.controls || []).map((control, index) => (
                  <div key={index} className="flex items-end gap-2 border-b pb-4">
                    <div className="flex-1 space-y-2"><Label>Deskripsi Kontrol #{index + 1}</Label><Textarea value={control.description} onChange={(e) => handleDynamicListChange('controls', index, 'description', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Tipe</Label><Select value={control.type} onValueChange={(v) => handleDynamicListChange('controls', index, 'type', v)}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Preventif">Preventif</SelectItem><SelectItem value="Detektif">Detektif</SelectItem><SelectItem value="Korektif">Korektif</SelectItem></SelectContent></Select></div>
                    <Button type="button" variant="outline" size="icon" onClick={() => removeListItem('controls', index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
              ))}
              <Button type="button" variant="outline" onClick={() => addListItem('controls')} disabled={(formData.controls?.length || 0) >= 5}><Plus className="mr-2 h-4 w-4"/>Tambah Kontrol</Button>
            </CardContent>
          </Card>

          {/* --- MITIGASI DINAMIS --- */}
          <Card>
            <CardHeader><CardTitle>Tindakan Mitigasi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(formData.mitigationActions || []).map((mitigation, index) => (
                  <div key={index} className="flex items-end gap-2 border-b pb-4">
                    <div className="flex-1 space-y-2"><Label>Deskripsi Tindakan #{index + 1}</Label><Textarea value={mitigation.action} onChange={(e) => handleDynamicListChange('mitigationActions', index, 'action', e.target.value)} /></div>
                    <div className="space-y-2"><Label>PIC</Label><Input value={mitigation.responsible} onChange={(e) => handleDynamicListChange('mitigationActions', index, 'responsible', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Target</Label><Input type="date" value={mitigation.dueDate} onChange={(e) => handleDynamicListChange('mitigationActions', index, 'dueDate', e.target.value)} /></div>
                    <Button type="button" variant="outline" size="icon" onClick={() => removeListItem('mitigationActions', index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
              ))}
              <Button type="button" variant="outline" onClick={() => addListItem('mitigationActions')} disabled={(formData.mitigationActions?.length || 0) >= 5}><Plus className="mr-2 h-4 w-4"/>Tambah Mitigasi</Button>
            </CardContent>
          </Card>

          {/* --- INPUT MONITORING MENJADI DROPDOWN --- */}
          <Card>
            <CardHeader><CardTitle>Rencana Aksi Lainnya</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Monitoring</Label><Select value={formData.monitoring} onValueChange={(v) => handleInputChange("monitoring", v)}><SelectTrigger><SelectValue placeholder="Pilih frekuensi monitoring"/></SelectTrigger><SelectContent>{monitoringOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select></div>
              {/* ... Input lain seperti Proposed Action, Opportunity, PIC, Target Date ... */}
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