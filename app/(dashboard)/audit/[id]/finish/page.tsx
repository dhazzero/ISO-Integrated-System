"use client";


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
    standard: string | string[];
    department: string;
    auditType?: string;
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
    positiveFindings?: string[];
    recommendations?: string[];
    nextAuditDate?: string;
    divergingOpinions?: string;
    conformityStatement?: string;
    systemEffectiveness?: string;
}

export default function FinishAuditPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const auditId = params.id as string;

    const [audit, setAudit] = useState<Audit | null>(null);
    const [formData, setFormData] = useState<Partial<Audit>>({});
    const [positiveFindingsText, setPositiveFindingsText] = useState("");
    const [recommendationsText, setRecommendationsText] = useState("");
    const [nextAuditDate, setNextAuditDate] = useState("");
    const [reportFile, setReportFile] = useState<File | null>(null);
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
    const [findingsList, setFindingsList] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    
    useEffect(() => {
        if (!auditId) return;
        const fetchAuditData = async () => {
            setIsLoading(true);
            try {
                const [res, findingsRes] = await Promise.all([
                    fetch(`/api/audits/${auditId}`),
                    fetch(`/api/findings?auditId=${auditId}`)
                ]);
                if (!res.ok) throw new Error("Gagal memuat data audit.");
                const data: Audit = await res.json();
                
                if (findingsRes.ok) {
                    const findingsData = await findingsRes.json();
                    setFindingsList(findingsData);
                    data.findings = findingsData.length;
                }
                
                setAudit(data);
                setFormData({
                    name: data.name,
                    standard: data.standard,
                    department: data.department,
                    auditType: data.auditType,
                    auditor: data.auditor,
                    date: data.date,
                    scope: data.scope || "",
                    objectives: data.objectives || "",
                    criteria: data.criteria || "",
                    completedDate: new Date().toISOString().split("T")[0],
                    duration: data.duration || "",
                    findings: data.findings || 0,
                    conclusion: data.conclusion || "",
                    conformityStatement: data.conformityStatement || "",
                    systemEffectiveness: data.systemEffectiveness || "",
                    divergingOpinions: data.divergingOpinions || "",
                });
                setPositiveFindingsText((data.positiveFindings || []).join("\n"));
                setRecommendationsText((data.recommendations || []).join("\n"));
                setNextAuditDate(data.nextAuditDate || "");
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: (error as Error).message,
                });
            } finally {
                setIsLoading(false);
            }
    };

        fetchAuditData();
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
        setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
    };


    const handleInputChange = (field: keyof Audit, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!audit) return;
        setIsSaving(true);
        try {
            const findingsRes = await fetch(`/api/findings?auditId=${audit._id}`);
            if (!findingsRes.ok) throw new Error("Gagal memeriksa status temuan.");
            const findingsData = await findingsRes.json();
            const openFindings = findingsData.filter(
                (f: any) => f.status && f.status.toLowerCase() !== "closed",
            );
            if (openFindings.length > 0) {
                const proceed = window.confirm(
                    `Terdapat ${openFindings.length} temuan yang masih berstatus Open atau In Progress.\n\n` +
                    `Sesuai dengan panduan ISO 19011:2018, audit dapat diselesaikan dan temuan ini akan terus dipantau pada tahap audit follow-up (tindak lanjut).\n\n` +
                    `Apakah Anda yakin ingin menyelesaikan audit ini sekarang?`
                );
                if (!proceed) {
                    setIsSaving(false);
                    return;
                }
            }
            let reportFileId = audit.reportFile || null;
            if (reportFile) {
                const data = new FormData();
                data.append("file", reportFile);
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: data,
                });
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
                positiveFindings: positiveFindingsText
                    .split("\n")
                    .map((f) => f.trim())
                    .filter((f) => f),
                recommendations: recommendationsText
                    .split("\n")
                    .map((r) => r.trim())
                    .filter((r) => r),
                nextAuditDate,
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
            toast({
                variant: "destructive",
                title: "Error",
                description: (error as Error).message,
            });
        } finally {
            setIsSaving(false);
        }
    };
    if (isLoading)
        return <div className="container p-6 text-center">Memuat form...</div>;
    if (!audit)

    return (
        <div className="container p-6 text-center text-red-500">
            Audit tidak ditemukan.
        </div>
    );
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
                        <CardTitle className="font-bold">Informasi Dasar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Audit *</Label>
                                <Input
                                    id="name"
                                    value={formData.name || ""}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="standard">Standar *</Label>
                                <Input
                                    id="standard"
                                    value={Array.isArray(formData.standard) ? formData.standard.join(", ") : formData.standard || ""}
                                    onChange={(e) =>
                                        handleInputChange("standard", e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="department">
                                    {formData.auditType === 'External' ? 'Lembaga Sertifikasi *' : 'Departemen *'}
                                </Label>
                                <Input
                                    id="department"
                                    value={formData.department || ""}
                                    onChange={(e) =>
                                        handleInputChange("department", e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="auditor">Auditor *</Label>
                                <Input
                                    id="auditor"
                                    value={formData.auditor || ""}
                                    onChange={(e) => handleInputChange("auditor", e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Tanggal Mulai *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date || ""}
                                    onChange={(e) => handleInputChange("date", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="completedDate">Tanggal Selesai *</Label>
                                <Input
                                    id="completedDate"
                                    type="date"
                                    value={formData.completedDate || ""}
                                    onChange={(e) =>
                                        handleInputChange("completedDate", e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Durasi</Label>
                                <Input
                                    id="duration"
                                    value={formData.duration || ""}
                                    onChange={(e) =>
                                        handleInputChange("duration", e.target.value)
                                    }
                                    placeholder="Contoh: 2 hari"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nextAuditDate">Jadwal Audit Berikutnya</Label>
                                <Input
                                    id="nextAuditDate"
                                    type="date"
                                    value={nextAuditDate}
                                    onChange={(e) => setNextAuditDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-bold">Detail Audit</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="scope">Ruang Lingkup Audit</Label>
                            <Textarea
                                id="scope"
                                value={formData.scope || ""}
                                onChange={(e) => handleInputChange("scope", e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="objectives">Tujuan Audit</Label>
                            <Textarea
                                id="objectives"
                                value={formData.objectives || ""}
                                onChange={(e) =>
                                    handleInputChange("objectives", e.target.value)
                                }
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="criteria">Kriteria Audit</Label>
                            <Textarea
                                id="criteria"
                                value={formData.criteria || ""}
                                onChange={(e) => handleInputChange("criteria", e.target.value)}
                                rows={2}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-bold">Daftar Temuan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {findingsList.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-3 font-semibold">Deskripsi</th>
                                            <th className="p-3 font-semibold">Jenis</th>
                                            <th className="p-3 font-semibold">Status</th>
                                            <th className="p-3 font-semibold text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {findingsList.map(finding => (
                                            <tr key={finding._id} className="border-b">
                                                <td className="p-3">{finding.description}</td>
                                                <td className="p-3">{finding.findingType}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${finding.status === 'Closed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {finding.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <a href={`/audit/findings/${finding._id}/edit`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center justify-center space-x-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                        <span>Edit</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Tidak ada temuan untuk audit ini.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-bold">Hasil Audit</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="findings">Jumlah Temuan</Label>
                                <Input
                                    id="findings"
                                    type="number"
                                    value={formData.findings ?? ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "findings",
                                            parseInt(e.target.value || "0"),
                                        )
                                    }
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="conclusion">Kesimpulan Audit</Label>
                            <Textarea
                                id="conclusion"
                                value={formData.conclusion || ""}
                                onChange={(e) =>
                                    handleInputChange("conclusion", e.target.value)
                                }
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2 border-l-2 border-blue-500 pl-4 py-1 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-md">
                            <Label htmlFor="conformityStatement" className="font-semibold text-blue-950 dark:text-blue-200">
                                Pernyataan Kesesuaian / Statement of Conformity (ISO 19011:2018)
                            </Label>
                            <select
                                id="conformityStatement"
                                value={formData.conformityStatement || ""}
                                onChange={(e) => handleInputChange("conformityStatement", e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">-- Pilih Tingkat Kesesuaian --</option>
                                <option value="Fully Conformant">Memenuhi Seluruh Kriteria (Fully Conformant)</option>
                                <option value="Partially Conformant">Memenuhi Sebagian Besar Kriteria dengan Temuan Minor (Partially Conformant)</option>
                                <option value="Non-Conformant">Tidak Memenuhi Kriteria Utama / Temuan Mayor (Non-Conformant)</option>
                                <option value="Inconclusive">Belum Dapat Dinilai Sepenuhnya (Inconclusive)</option>
                            </select>
                        </div>
                        <div className="space-y-2 border-l-2 border-blue-500 pl-4 py-1 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-md">
                            <Label htmlFor="systemEffectiveness" className="font-semibold text-blue-950 dark:text-blue-200">
                                Efektivitas Sistem Manajemen / Management System Effectiveness (ISO 19011:2018)
                            </Label>
                            <Textarea
                                id="systemEffectiveness"
                                value={formData.systemEffectiveness || ""}
                                onChange={(e) => handleInputChange("systemEffectiveness", e.target.value)}
                                placeholder="Evaluasi mengenai efektivitas implementasi, pemeliharaan, dan peningkatan sistem manajemen."
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2 border-l-2 border-blue-500 pl-4 py-1 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-md">
                            <Label htmlFor="divergingOpinions" className="font-semibold text-blue-950 dark:text-blue-200">
                                Ketidaksepakatan / Unresolved Diverging Opinions (ISO 19011:2018)
                            </Label>
                            <Textarea
                                id="divergingOpinions"
                                value={formData.divergingOpinions || ""}
                                onChange={(e) => handleInputChange("divergingOpinions", e.target.value)}
                                placeholder="Catat jika ada perbedaan pendapat atau ketidaksepakatan yang belum terselesaikan antara tim audit dan auditee."
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="positiveFindings">
                                Temuan Positif (pisahkan per baris)
                            </Label>
                            <Textarea
                                id="positiveFindings"
                                value={positiveFindingsText}
                                onChange={(e) => setPositiveFindingsText(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recommendations">
                                Rekomendasi Umum (pisahkan per baris)
                            </Label>
                            <Textarea
                                id="recommendations"
                                value={recommendationsText}
                                onChange={(e) => setRecommendationsText(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reportFile">Upload Laporan Audit</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="reportFile"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleReportChange}
                                    className="flex-1"
                                />
                                <Upload className="h-4 w-4 text-muted-foreground" />
                            </div>
                            {reportFile && (
                                <p className="text-sm text-muted-foreground">
                                    {reportFile.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="evidenceFiles">
                                Upload Bukti/Evidence (Multiple Files)
                            </Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="evidenceFiles"
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                                    onChange={(e) => handleEvidenceChange(e.target.files)}
                                    className="flex-1"
                                />
                                <Upload className="h-4 w-4 text-muted-foreground" />
                            </div>
                            {evidenceFiles.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Files uploaded:</p>
                                    {evidenceFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between text-sm text-muted-foreground"
                                        >
                                            <span>{file.name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeEvidenceFile(index)}
                                            >
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
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                            "Menyimpan..."
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Simpan Audit
                            </>
                        )}
                    </Button>
        </div>
            </form>
        </div>
    );
}