"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { useToast } from "@/components/ui/use-toast"

// Definisikan tipe data untuk props
interface AuditOption {
  _id: string;
  name: string;
  department: string;
}

interface DepartmentOption {
  _id: string;
  name: string;
}

interface AddFindingModalProps {
  onAddFinding: (auditId: string) => void;
  audits: AuditOption[];
}

export function AddFindingModal({ onAddFinding, audits }: AddFindingModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast();

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  const initialFormState = {
    auditId: "",
    findingType: "",
    severity: "Minor",
    description: "",
    clause: "",
    evidence: "",
    recommendation: "",
    status: "Open",
    dueDate: "",
    responsiblePerson: "",
    department: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch data departemen saat modal dibuka
  useEffect(() => {
    if (open) {
      const fetchDepartments = async () => {
        setIsLoadingDepartments(true);
        try {
          const response = await fetch('/api/settings/departments');
          if (!response.ok) throw new Error('Gagal memuat data departemen.');
          setDepartments(await response.json());
        } catch (error) {
          toast({ variant: "destructive", title: "Gagal Memuat Opsi", description: (error as Error).message });
        } finally {
          setIsLoadingDepartments(false);
        }
      };
      fetchDepartments();
    }
  }, [open, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const selectedAudit = audits.find((audit) => audit._id === formData.auditId);
    const findingData = {
      ...formData,
      auditName: selectedAudit?.name || "N/A",
      department: selectedAudit?.department || formData.department,
    };

    try {
      const response = await fetch('/api/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(findingData),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Gagal menyimpan temuan.');

    toast({ title: "Sukses", description: "Temuan baru berhasil ditambahkan." });
    onAddFinding(formData.auditId);
    setFormData(initialFormState);
    setOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button><Plus className="mr-2 h-4 w-4" />Tambah Finding</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Finding Baru</DialogTitle>
            <DialogDescription>Tambahkan temuan audit baru ke dalam sistem.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="auditId">Audit *</Label><Select required value={formData.auditId} onValueChange={(v) => handleInputChange("auditId", v)}><SelectTrigger id="auditId"><SelectValue placeholder="Pilih dari jadwal audit" /></SelectTrigger><SelectContent>{audits.length > 0 ? audits.map(audit => (<SelectItem key={audit._id} value={audit._id}>{audit.name}</SelectItem>)) : <SelectItem value="none" disabled>Tidak ada audit tersedia.</SelectItem>}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="findingType">Jenis Temuan *</Label><Select required value={formData.findingType} onValueChange={v => handleInputChange("findingType", v)}><SelectTrigger id="findingType"><SelectValue placeholder="Pilih jenis" /></SelectTrigger><SelectContent><SelectItem value="Non-Conformity">Non-Conformity</SelectItem><SelectItem value="Observation">Observation</SelectItem><SelectItem value="Opportunity for Improvement">Opportunity for Improvement</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="severity">Tingkat Severity *</Label><Select required value={formData.severity} onValueChange={v => handleInputChange("severity", v)}><SelectTrigger id="severity"><SelectValue placeholder="Pilih tingkat" /></SelectTrigger><SelectContent><SelectItem value="Critical">Critical</SelectItem><SelectItem value="Major">Major</SelectItem><SelectItem value="Minor">Minor</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="clause">Klausul Standar *</Label><Input id="clause" value={formData.clause} onChange={e => handleInputChange("clause", e.target.value)} required placeholder="Contoh: 7.1.5"/></div>
            </div>

            <div className="space-y-2"><Label htmlFor="description">Deskripsi Temuan *</Label><Textarea id="description" value={formData.description} onChange={e => handleInputChange("description", e.target.value)} required rows={3} placeholder="Jelaskan temuan secara detail..."/></div>

            <div className="space-y-2"><Label htmlFor="evidence">Bukti/Evidence</Label><Textarea id="evidence" value={formData.evidence} onChange={e => handleInputChange("evidence", e.target.value)} rows={3} placeholder="Jelaskan bukti yang mendukung temuan..."/></div>
            <div className="space-y-2"><Label htmlFor="recommendation">Rekomendasi</Label><Textarea id="recommendation" value={formData.recommendation} onChange={e => handleInputChange("recommendation", e.target.value)} rows={3} placeholder="Berikan rekomendasi perbaikan..."/></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Departemen</Label>
                <Select value={formData.department} onValueChange={(v) => handleInputChange("department", v)}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder={isLoadingDepartments ? "Memuat..." : "Pilih departemen"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDepartments ? (
                        <SelectItem value="loading" disabled>Memuat...</SelectItem>
                    ) : (
                        departments.map((d) => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="responsiblePerson">Penanggung Jawab</Label><Input id="responsiblePerson" value={formData.responsiblePerson} onChange={e => handleInputChange("responsiblePerson", e.target.value)} placeholder="Nama penanggung jawab"/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={(v) => handleInputChange("status", v)}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="dueDate">Target Penyelesaian</Label><Input id="dueDate" type="date" value={formData.dueDate} onChange={e => handleInputChange("dueDate", e.target.value)} /></div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan Finding"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  )
}
