"use client"

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Upload, X } from "lucide-react";

interface Audit {
  _id: string;
  name: string;
  standard: string;
  department: string;
  auditor: string;
  date: string;
  scope?: string;
  objectives?: string;
  criteria?: string;
  completedDate?: string;
  duration?: string;
  findings?: number;
  conclusion?: string;
  reportFile?: string;
  evidenceFiles?: string[];
}

export default function FinishAuditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const auditId = params.id as string;

  const [audit, setAudit] = useState<Audit | null>(null);
  const [formData, setFormData] = useState<Partial<Audit>>({});
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auditId) return;
    const fetchAudit = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/audits/${auditId}`);
        if (!res.ok) throw new Error("Gagal memuat data audit.");
        const data: Audit = await res.json();
        setAudit(data);
        setFormData({
          name: data.name,
          standard: data.standard,
          department: data.department,
          auditor: data.auditor,
          date: data.date,
          scope: data.scope || "",
          objectives: data.objectives || "",
          criteria: data.criteria || "",
          completedDate: new Date().toISOString().split("T")[0],
          duration: data.duration || "",
          findings: data.findings || 0,
          conclusion: data.conclusion || "",
        });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: (error as Error).message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAudit();
  }, [auditId, toast]);

  const handleReportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReportFile(file);
  };

  const handleEvidenceChange = (files: FileList | null) => {
    if (!files) return;
    setEvidenceFiles(Array.from(files));
  };

  const removeEvidenceFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: keyof Audit, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!audit) return;
    setIsSaving(true);
    try {
      let reportFileId = audit.reportFile || null;
      if (reportFile) {
        const data = new FormData();
        data.append("file", reportFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: data });
        if (!uploadRes.ok) throw new Error("Gagal mengupload laporan.");
        const uploadResult = await uploadRes.json();
        reportFileId = uploadResult.fileId;
      }

      let evidenceFileIds = audit.evidenceFiles ? [...audit.evidenceFiles] : [];
      for (const file of evidenceFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error("Gagal mengupload evidence.");
        const upRes = await up.json();
        evidenceFileIds.push(upRes.fileId);
      }

      const payload = {
        ...audit,
        ...formData,
        status: "Completed",
        reportFile: reportFileId,
        evidenceFiles: evidenceFileIds,
      };

      const res = await fetch(`/api/audits/${audit._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menyelesaikan audit.");
      toast({ title: "Sukses", description: "Audit telah diselesaikan." });
      router.push(`/audit/${audit._id}`);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="container p-6 text-center">Memuat form...</div>;
  if (!audit) return <div className="container p-6 text-center text-red-500">Audit tidak ditemukan.</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link href={`/audit/${audit._id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Selesaikan Audit</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Audit *</Label>
                <Input id="name" value={formData.name || ""} onChange={e => handleInputChange("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="standard">Standar *</Label>
                <Input id="standard" value={formData.standard || ""} onChange={e => handleInputChange("standard", e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Departemen *</Label>
                <Input id="department" value={formData.department || ""} onChange={e => handleInputChange("department", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auditor">Auditor *</Label>
                <Input id="auditor" value={formData.auditor || ""} onChange={e => handleInputChange("auditor", e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal Mulai *</Label>
                <Input id="date" type="date" value={formData.date || ""} onChange={e => handleInputChange("date", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completedDate">Tanggal Selesai *</Label>
                <Input id="completedDate" type="date" value={formData.completedDate || ""} onChange={e => handleInputChange("completedDate", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi</Label>
                <Input id="duration" value={formData.duration || ""} onChange={e => handleInputChange("duration", e.target.value)} placeholder="Contoh: 2 hari" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detail Audit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scope">Ruang Lingkup Audit</Label>
              <Textarea id="scope" value={formData.scope || ""} onChange={e => handleInputChange("scope", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objectives">Tujuan Audit</Label>
              <Textarea id="objectives" value={formData.objectives || ""} onChange={e => handleInputChange("objectives", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criteria">Kriteria Audit</Label>
              <Textarea id="criteria" value={formData.criteria || ""} onChange={e => handleInputChange("criteria", e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hasil Audit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="findings">Jumlah Temuan</Label>
                <Input id="findings" type="number" value={formData.findings ?? ""} onChange={e => handleInputChange("findings", parseInt(e.target.value || "0"))} min="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conclusion">Kesimpulan Audit</Label>
              <Textarea id="conclusion" value={formData.conclusion || ""} onChange={e => handleInputChange("conclusion", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportFile">Upload Laporan Audit</Label>
              <div className="flex items-center space-x-2">
                <Input id="reportFile" type="file" accept=".pdf,.doc,.docx" onChange={handleReportChange} className="flex-1" />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {reportFile && <p className="text-sm text-muted-foreground">{reportFile.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="evidenceFiles">Upload Bukti/Evidence (Multiple Files)</Label>
              <div className="flex items-center space-x-2">
                <Input id="evidenceFiles" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" onChange={e => handleEvidenceChange(e.target.files)} className="flex-1" />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {evidenceFiles.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Files uploaded:</p>
                  {evidenceFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{file.name}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeEvidenceFile(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan..." : <><Save className="mr-2 h-4 w-4" /> Simpan Audit</>}</Button>
        </div>
      </form>
    </div>
  );
}
