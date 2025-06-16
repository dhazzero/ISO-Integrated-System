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
import { Badge } from "@/components/ui/badge" // <-- Pastikan Badge di-import

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

  useEffect(() => { fetchRisks(); }, []);

  const riskSummary = useMemo(() => {
    const summary: Record<string, number> = { "Tinggi": 0, "Sedang": 0, "Rendah": 0 };
    risks.forEach((risk) => {
      const levelKey = risk.level.includes("Tinggi") ? "Tinggi" : risk.level.includes("Sedang") ? "Sedang" : "Rendah";
      if (summary.hasOwnProperty(levelKey)) {
        summary[levelKey]++;
      }
    });
    return [
      { level: "Tinggi", count: summary.Tinggi, color: "bg-red-500" },
      { level: "Sedang", count: summary.Sedang, color: "bg-amber-500" },
      { level: "Rendah", count: summary.Rendah, color: "bg-green-500" },
    ];
  }, [risks]);

  const handleRiskAdded = () => { fetchRisks(); };
  const handleDeleteClick = (risk: Risk) => setDeleteConfirm({ open: true, id: risk._id, name: risk.name });
  const confirmDelete = async () => { /* ... (fungsi dari sebelumnya, tidak berubah) ... */ };
  const getTrendIcon = (trend: string) => { /* ... (fungsi dari sebelumnya, tidak berubah) ... */ };
  const getLevelColor = (level: string) => { /* ... (fungsi dari sebelumnya, tidak berubah) ... */ };

  // --- FUNGSI BARU UNTUK MENAMPILKAN STATUS DENGAN BENAR ---
  const getStatusBadge = (status: string) => {
    let text: string;
    let style: string;

    switch (status) {
      case "Open":
        text = "Terbuka";
        style = "bg-red-100 text-red-800";
        break;
      case "Mitigated":
        text = "Dimitigasi";
        style = "bg-blue-100 text-blue-800";
        break;
      case "Closed":
        text = "Ditutup";
        style = "bg-green-100 text-green-800";
        break;
      case "Under Review":
        text = "Dalam Tinjauan";
        style = "bg-yellow-100 text-yellow-800";
        break;
      default:
        text = status;
        style = "bg-gray-100 text-gray-800";
    }
    return <Badge className={style}>{text}</Badge>;
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
                          <td className="py-3 px-4">
                            {/* --- PERBAIKAN DI SINI: Memanggil fungsi baru --- */}
                            {getStatusBadge(risk.status)}
                          </td>
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

        {/* ... Dialog Konfirmasi Hapus ... */}
        <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}>{/* ... */}</Dialog>
      </div>
  )
}