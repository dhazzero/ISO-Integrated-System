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

// Tipe Data
interface Control { description: string; type: string; }
interface Mitigation { action: string; responsible: string; dueDate: string; }
interface RiskFormData {
  name: string; asset: string; threat: string; vulnerability: string; impactDescription: string;
  category: string; riskOwner: string; status: string;
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

  const [formData, setFormData] = useState<Partial<RiskFormData>>({
    controls: [], mitigationActions: [], relatedStandards: [], proposedAction: "", opportunity: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableStandards, setAvailableStandards] = useState<StandardOption[]>([]);

  useEffect(() => {
    if (!riskId) return;
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [riskRes, standardsRes] = await Promise.all([
          fetch(`/api/risks/${riskId}`),
          fetch('/api/settings/standards')
        ]);
        if (!riskRes.ok) throw new Error("Gagal memuat data risiko.");
        if (!standardsRes.ok) throw new Error('Gagal memuat daftar standar');

        const riskData = await riskRes.json();
        setAvailableStandards(await standardsRes.json());

        setFormData({
          name: riskData.name || "",
          asset: riskData.asset || "",
          threat: riskData.threat || "",
          vulnerability: riskData.vulnerability || "",
          impactDescription: riskData.impactDescription || "",
          category: riskData.category || "",
          riskOwner: riskData.riskOwner || "",
          status: riskData.status || "Open",
          inherentLikelihoodScore: riskData.inherentRisk?.likelihoodScore?.toString() || "1",
          inherentImpactScore: riskData.inherentRisk?.impactScore?.toString() || "1",
          residualLikelihoodScore: riskData.residualRisk?.likelihoodScore?.toString() || "1",
          residualImpactScore: riskData.residualRisk?.impactScore?.toString() || "1",
          relatedStandards: riskData.relatedStandards || [],
          controls: riskData.controls || [],
          mitigationActions: riskData.mitigationActions || [],
          proposedAction: riskData.proposedAction || "",
          opportunity: riskData.opportunity || "",
          targetDate: riskData.targetDate ? new Date(riskData.targetDate).toISOString().split('T')[0] : "",
          monitoring: riskData.monitoring || "Monthly",
          pic: riskData.pic || "",
        });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        router.push("/risk");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [riskId, router, toast]);

  const handleInputChange = (field: keyof RiskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStandardChange = (standardName: string, checked: boolean | 'indeterminate') => {
    const isChecked = typeof checked === 'boolean' ? checked : false;
    const currentStandards = formData.relatedStandards || [];
    const newStandards = isChecked ? [...currentStandards, standardName] : currentStandards.filter(name => name !== standardName);
    handleInputChange("relatedStandards", newStandards);
  };

  const handleDynamicListChange = (listName: 'controls' | 'mitigationActions', index: number, field: string, value: string) => {
    const list = formData[listName] ? [...formData[listName]!] : [];
    list[index] = { ...list[index], [field]: value };
    handleInputChange(listName, list);
  };

  const addListItem = (listName: 'controls' | 'mitigationActions') => {
    const list = formData[listName] || [];
    if (list.length >= 5) {
      toast({ variant: "destructive", title: "Batas Maksimal", description: `Anda hanya bisa menambahkan maksimal 5 item.`});
      return;
    }
    const newItem = listName === 'controls' ? { description: '', type: 'Preventif' } : { action: '', responsible: '', dueDate: '' };
    handleInputChange(listName, [...list, newItem]);
  };

  const removeListItem = (listName: 'controls' | 'mitigationActions', index: number) => {
    const list = formData[listName] || [];
    handleInputChange(listName, list.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/risks/${riskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal memperbarui risiko.");
      }
      await logActivity("UPDATE", "Risiko", `Memperbarui risiko: ${formData.name}`);
      toast({ title: "Sukses!", description: "Perubahan risiko berhasil disimpan." });
      router.push(`/risk/${riskId}`);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const categories = ["Keamanan Informasi", "Operasional", "Kepatuhan", "Teknologi", "K3", "Keuangan", "Reputasi"];
  const scoreOptions = ["1", "2", "3", "4", "5"];
  const statuses = ["Open", "In Progress", "Mitigated", "Closed"];
  const monitoringOptions = ["Daily", "Weekly", "Monthly", "Quarterly", "Semester", "Yearly"];

  if (isLoading) return <div className="container mx-auto p-6 text-center">Memuat data...</div>;

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href={`/risk/${riskId}`}><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div><h1 className="text-3xl font-bold">Edit Risiko</h1><p className="text-muted-foreground">ID: {riskId}</p></div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card><CardHeader><CardTitle>1. Identifikasi Risiko</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* ... semua field identifikasi risiko ... */}
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>2. Penilaian Risiko</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* ... semua field penilaian ... */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>3. Kontrol & Mitigasi</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="font-semibold">Aktivitas Kontrol</Label>
                <div className="mt-2 space-y-4">
                  {(formData.controls || []).map((control, index) => (
                      <div key={index} className="flex items-end gap-2 border-b pb-4"><div className="flex-1 space-y-2"><Label>Deskripsi Kontrol #{index + 1}</Label><Textarea value={control.description} onChange={(e) => handleDynamicListChange('controls', index, 'description', e.target.value)} /></div><div className="space-y-2"><Label>Tipe</Label><Select value={control.type} onValueChange={(v) => handleDynamicListChange('controls', index, 'type', v)}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Preventif">Preventif</SelectItem><SelectItem value="Detektif">Detektif</SelectItem><SelectItem value="Korektif">Korektif</SelectItem></SelectContent></Select></div><Button type="button" variant="outline" size="icon" onClick={() => removeListItem('controls', index)}><Trash2 className="h-4 w-4" /></Button></div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addListItem('controls')} disabled={(formData.controls?.length || 0) >= 5}><Plus className="mr-2 h-4 w-4"/>Tambah Kontrol</Button>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Tindakan Mitigasi</Label>
                <div className="mt-2 space-y-4">
                  {(formData.mitigationActions || []).map((mitigation, index) => (
                      <div key={index} className="flex items-end gap-2 border-b pb-4"><div className="flex-1 space-y-2"><Label>Deskripsi Tindakan #{index + 1}</Label><Textarea value={mitigation.action} onChange={(e) => handleDynamicListChange('mitigationActions', index, 'action', e.target.value)} /></div><div className="space-y-2"><Label>PIC</Label><Input value={mitigation.responsible} onChange={(e) => handleDynamicListChange('mitigationActions', index, 'responsible', e.target.value)} /></div><div className="space-y-2"><Label>Target</Label><Input type="date" value={mitigation.dueDate} onChange={(e) => handleDynamicListChange('mitigationActions', index, 'dueDate', e.target.value)} /></div><Button type="button" variant="outline" size="icon" onClick={() => removeListItem('mitigationActions', index)}><Trash2 className="h-4 w-4" /></Button></div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addListItem('mitigationActions')} disabled={(formData.mitigationActions?.length || 0) >= 5}><Plus className="mr-2 h-4 w-4"/>Tambah Mitigasi</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>4. Rencana Aksi Lainnya</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* ... Dropdown Monitoring dan input lainnya ... */}
            </CardContent>
          </Card>
          <div className="flex justify-end space-x-4">
            <Link href={`/risk/${riskId}`}><Button type="button" variant="outline" disabled={isSaving}>Batal</Button></Link>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan..." : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}</Button>
          </div>
        </form>
      </div>
  )
}