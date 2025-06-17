"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowUpRight, ArrowRight, ArrowDownRight, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { AddRiskModal } from "@/components/risk/add-risk-modal"
import { useState, useMemo, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { logActivity } from "@/lib/logger"
import { Badge } from "@/components/ui/badge"

interface Risk {
  _id: string;
  name: string;
  category: string;
  level: string;
  likelihood: string;
  impact: string;
  status: string;
  trend: string;
}

export default function RiskPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null as string | null, name: "" });

  const fetchRisks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/risks');
      if (!response.ok) throw new Error("Gagal mengambil data risiko dari server.");
      const data = await response.json();
      setRisks(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const riskSummary = useMemo(() => {
    const summary: Record<string, number> = { "Tinggi": 0, "Sedang": 0, "Rendah": 0 };
    risks.forEach((risk) => {
      // Mengelompokkan semua level risiko ke dalam 3 kategori besar untuk ringkasan
      if (risk.level?.includes("Tinggi")) summary.Tinggi++;
      else if (risk.level?.includes("Sedang")) summary.Sedang++;
      else summary.Rendah++;
    });
    return [
      { level: "Tinggi", count: summary.Tinggi, color: "bg-red-500" },
      { level: "Sedang", count: summary.Sedang, color: "bg-amber-500" },
      { level: "Rendah", count: summary.Rendah, color: "bg-green-500" },
    ];
  }, [risks]);

  const handleRiskAdded = () => {
    toast({ title: "Sukses", description: "Daftar risiko sedang diperbarui..."});
    fetchRisks();
  };

  const handleDeleteClick = (risk: Risk) => {
    setDeleteConfirm({ open: true, id: risk._id, name: risk.name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const response = await fetch(`/api/risks/${deleteConfirm.id}`, { method: 'DELETE' });
      if (!response.ok) { const err = await response.json(); throw new Error(err.message); }
      await logActivity('DELETE', 'Risiko', `Menghapus risiko: ${deleteConfirm.name}`);
      toast({ title: "Berhasil!", description: `Risiko "${deleteConfirm.name}" berhasil dihapus.` });
      fetchRisks();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setDeleteConfirm({ open: false, id: null, name: "" });
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "down": return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      default: return <ArrowRight className="h-4 w-4 text-amber-500" />;
    }
  };

  const getLevelColor = (level?: string) => {
    if (!level) return "text-gray-500";
    if (level.includes("Tinggi")) return "text-red-500";
    if (level.includes("Sedang")) return "text-amber-500";
    return "text-green-500";
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Open": return <Badge className="bg-red-100 text-red-800">Terbuka</Badge>;
      case "Mitigated": return <Badge className="bg-blue-100 text-blue-800">Dimitigasi</Badge>;
      case "Closed": return <Badge className="bg-green-100 text-green-800">Ditutup</Badge>;
      case "Under Review": return <Badge className="bg-yellow-100 text-yellow-800">Dalam Tinjauan</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manajemen Risiko</h1>
          <div className="flex space-x-2">
            <AddRiskModal onRiskAdded={handleRiskAdded} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {riskSummary.map((risk, index) => (
              <Card key={index}>
                <CardHeader className="pb-2"><CardTitle>Risiko {risk.level}</CardTitle><CardDescription>Total risiko dengan level {risk.level.toLowerCase()}</CardDescription></CardHeader>
                <CardContent><div className="flex items-center"><div className={`w-4 h-4 rounded-full ${risk.color} mr-2`}></div><span className="text-3xl font-bold">{risk.count}</span></div></CardContent>
              </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle>Register Risiko</CardTitle><CardDescription>Daftar semua risiko yang teridentifikasi</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b"><th className="text-left py-3 px-4">Nama Risiko</th><th className="text-left py-3 px-4">Kategori</th><th className="text-left py-3 px-4">Level</th><th className="text-left py-3 px-4">Kemungkinan</th><th className="text-left py-3 px-4">Dampak</th><th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Tren</th><th className="text-left py-3 px-4">Tindakan</th></tr></thead>
                <tbody>
                {isLoading ? (
                    <tr><td colSpan={8} className="text-center p-8">Memuat data risiko...</td></tr>
                ) : risks.length === 0 ? (
                    <tr><td colSpan={8} className="text-center p-8 text-muted-foreground">Belum ada risiko yang ditambahkan.</td></tr>
                ) : (
                    risks.map((risk) => (
                        <tr key={risk._id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 flex items-center"><AlertTriangle className={`mr-2 h-4 w-4 ${getLevelColor(risk.level)}`} /><Link href={`/risk/${risk._id}`} className="hover:underline">{risk.name}</Link></td>
                          <td className="py-3 px-4">{risk.category}</td>
                          <td className={`py-3 px-4 font-semibold ${getLevelColor(risk.level)}`}>{risk.level}</td>
                          <td className="py-3 px-4">{risk.likelihood}</td>
                          <td className="py-3 px-4">{risk.impact}</td>
                          <td className="py-3 px-4">{getStatusBadge(risk.status)}</td>
                          <td className="py-3 px-4">{getTrendIcon(risk.trend)}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <Link href={`/risk/${risk._id}`}><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link>
                              <Link href={`/risk/${risk._id}/edit`}><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></Link>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(risk)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                            </div>
                          </td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Konfirmasi Penghapusan</DialogTitle><DialogDescription>Apakah Anda yakin ingin menghapus risiko <b>{deleteConfirm.name}</b>? Tindakan ini tidak dapat dibatalkan.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeleteConfirm({ open: false, id: null, name: "" })}>Batal</Button><Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>{isLoading ? "Menghapus..." : "Hapus"}</Button></DialogFooter></DialogContent></Dialog>
      </div>
  )
}