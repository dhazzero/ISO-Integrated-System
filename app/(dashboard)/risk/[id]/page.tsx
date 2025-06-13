// app/(dashboard)/risk/[id]/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, ArrowLeft, Calendar, User } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

// Definisikan tipe data yang lebih lengkap
interface RiskDetail {
  _id: string;
  name: string;
  description: string;
  category: string;
  owner: string;
  status: string;
  inherentRisk: { likelihood: string; impact: string; level: string; };
  residualRisk: { likelihood: string; impact: string; level: string; };
  controls: any[];
  mitigationActions: any[];
  history: any[];
  createdAt: string;
  updatedAt: string;
}

export default function RiskDetailPage() {
  const params = useParams();
  const riskId = params.id as string;
  const { toast } = useToast();

  const [risk, setRisk] = useState<RiskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!riskId) return;

    const fetchRiskDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/risks/${riskId}`); // Memanggil API backend
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal mengambil detail risiko.');
        }
        setRisk(await response.json());
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        setRisk(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskDetail();
  }, [riskId, toast]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Sangat Tinggi": return "bg-purple-100 text-purple-800";
      case "Tinggi": return "bg-red-100 text-red-800";
      case "Sedang": return "bg-amber-100 text-amber-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-6 text-center">Memuat detail risiko...</div>;
  }

  if (!risk) {
    return <div className="container mx-auto p-6 text-center text-red-500">Risiko dengan ID ini tidak ditemukan.</div>;
  }

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/risk"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-3xl font-bold">{risk.name}</h1>
              <p className="text-muted-foreground">ID: {risk._id}</p>
            </div>
          </div>
          <div>
            <Link href={`/risk/${risk._id}/edit`}><Button><Edit className="mr-2 h-4 w-4" />Edit Risiko</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card><CardHeader className="pb-2"><CardTitle>Level Risiko (Residual)</CardTitle></CardHeader><CardContent><Badge className={getLevelColor(risk.residualRisk.level)}>{risk.residualRisk.level}</Badge></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle>Status</CardTitle></CardHeader><CardContent><Badge>{risk.status}</Badge></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle>Pemilik Risiko</CardTitle></CardHeader><CardContent><div className="flex items-center"><User className="mr-2 h-4 w-4" />{risk.owner}</div></CardContent></Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
            <TabsTrigger value="assessment">Penilaian</TabsTrigger>
            <TabsTrigger value="controls">Kontrol</TabsTrigger>
            <TabsTrigger value="mitigation">Mitigasi</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Informasi Umum</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><label className="text-sm font-medium text-muted-foreground">Deskripsi</label><p className="mt-1">{risk.description}</p></div>
                  <div><label className="text-sm font-medium text-muted-foreground">Kategori</label><p className="mt-1">{risk.category}</p></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-muted-foreground">Dibuat</label><p className="mt-1 flex items-center"><Calendar className="mr-1 h-4 w-4" />{new Date(risk.createdAt).toLocaleDateString('id-ID')}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Diperbarui</label><p className="mt-1 flex items-center"><Calendar className="mr-1 h-4 w-4" />{new Date(risk.updatedAt).toLocaleDateString('id-ID')}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Ringkasan Penilaian</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* Menggunakan data dari residualRisk untuk ringkasan utama */}
                  <div><label className="text-sm font-medium text-muted-foreground">Kemungkinan</label><Badge className={getLevelColor(risk.residualRisk.likelihood)}>{risk.residualRisk.likelihood}</Badge></div>
                  <div><label className="text-sm font-medium text-muted-foreground">Dampak</label><Badge className={getLevelColor(risk.residualRisk.impact)}>{risk.residualRisk.impact}</Badge></div>
                  <div><label className="text-sm font-medium text-muted-foreground">Level Risiko</label><Badge className={getLevelColor(risk.residualRisk.level)}>{risk.residualRisk.level}</Badge></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle>Risiko Inheren</CardTitle><CardDescription>Risiko sebelum penerapan kontrol</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex justify-between"><label className="text-sm font-medium text-muted-foreground">Kemungkinan</label><Badge className={getLevelColor(risk.inherentRisk.likelihood)}>{risk.inherentRisk.likelihood}</Badge></div><div className="flex justify-between"><label className="text-sm font-medium text-muted-foreground">Dampak</label><Badge className={getLevelColor(risk.inherentRisk.impact)}>{risk.inherentRisk.impact}</Badge></div><div className="flex justify-between"><label className="text-sm font-medium text-muted-foreground">Level Risiko</label><Badge className={getLevelColor(risk.inherentRisk.level)}>{risk.inherentRisk.level}</Badge></div></CardContent></Card>
              <Card><CardHeader><CardTitle>Risiko Residual</CardTitle><CardDescription>Risiko setelah penerapan kontrol</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex justify-between"><label className="text-sm font-medium text-muted-foreground">Kemungkinan</label><Badge className={getLevelColor(risk.residualRisk.likelihood)}>{risk.residualRisk.likelihood}</Badge></div><div className="flex justify-between"><label className="text-sm font-medium text-muted-foreground">Dampak</label><Badge className={getLevelColor(risk.residualRisk.impact)}>{risk.residualRisk.impact}</Badge></div><div className="flex justify-between"><label className="text-sm font-medium text-muted-foreground">Level Risiko</label><Badge className={getLevelColor(risk.residualRisk.level)}>{risk.residualRisk.level}</Badge></div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="controls"><p>Konten untuk tab Kontrol akan ditampilkan di sini.</p></TabsContent>
          <TabsContent value="mitigation"><p>Konten untuk tab Mitigasi akan ditampilkan di sini.</p></TabsContent>
          <TabsContent value="history"><p>Konten untuk tab Riwayat akan ditampilkan di sini.</p></TabsContent>
        </Tabs>
      </div>
  )
}