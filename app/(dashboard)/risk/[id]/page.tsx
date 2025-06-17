"use client"

export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Edit, ArrowLeft, Calendar, User, Shield, Clock, Target, Eye, FileText  } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

// Tipe Data Lengkap untuk Detail Risiko
interface RiskDetail {
  _id: string;
  name: string;
  description?: string;
  asset?: string;
  threat?: string;
  vulnerability?: string;
  impactDescription?: string;
  category: string;
  riskOwner: string;
  status: string;
  relatedStandards?: string[];
  inherentRisk: {
    likelihood: string;
    impact: string;
    level: string;
    score: number;
    treatment: string;
    likelihoodScore?: number;
    impactScore?: number;
  };
  residualRisk: {
    likelihood: string;
    impact: string;
    level: string;
    score: number;
    treatment: string;
    likelihoodScore?: number;
    impactScore?: number;
  };
  controls: { description: string; type: string; status: string; }[];
  mitigationActions: { action: string; responsible: string; dueDate: string; }[];
  opportunities: { description: string }[];
  targetDate?: string;
  monitoring: string;
  pic: string;
  history:
      {
    date: string;
    action: string;
    user: string;
    details?: string[];
      }[];
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
    if (!riskId) {
      setIsLoading(false);
      return;
    };

    const fetchRiskDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/risks/${riskId}`);
        if (!response.ok) {
          throw new Error('Gagal mengambil detail risiko.');
        }
        setRisk(await response.json());
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        setRisk(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskDetail(); // <--- Pastikan baris ini bersih tanpa tambahan apapun

  }, [riskId, toast]);

  const getLevelColor = (level?: string) => {
    switch (level) {
      case "Ekstrim": return "bg-red-700 text-white";
      case "Tinggi": return "bg-red-100 text-red-800";
      case "Sedang": return "bg-amber-100 text-amber-800";
      case "Rendah": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Open": return "bg-red-100 text-red-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Mitigated": return "bg-yellow-100 text-yellow-800";
      case "Closed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  const getControlStatusBadge = (status?: string) => {
    switch (status) {
      case "Diterapkan":
        return <Badge className="bg-green-100 text-green-800">Diterapkan</Badge>;
      case "Sebagian":
        return <Badge className="bg-yellow-100 text-yellow-800">Sebagian</Badge>;
      case "Belum Diterapkan":
        return <Badge className="bg-red-100 text-red-800">Belum</Badge>;
      default:
        return <Badge variant="secondary">{status || 'N/A'}</Badge>;
    }
  };
  if (isLoading) {
    return <div className="container mx-auto p-6 text-center">Memuat detail risiko...</div>;
  }

  if (!risk) {
    return <div className="container mx-auto p-6 text-center text-red-500">Risiko tidak ditemukan atau gagal dimuat.</div>;
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
          <Card><CardHeader className="pb-2"><CardTitle>Level Risiko (Residual)</CardTitle></CardHeader><CardContent><Badge className={getLevelColor(risk.residualRisk?.level)}>{risk.residualRisk?.level || 'N/A'}</Badge></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle>Status</CardTitle></CardHeader><CardContent><Badge className={getStatusColor(risk.status)}>{risk.status}</Badge></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle>Pemilik Risiko</CardTitle></CardHeader><CardContent><div className="flex items-center"><User className="mr-2 h-4 w-4" />{risk.riskOwner}</div></CardContent></Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
            <TabsTrigger value="assessment">Penilaian</TabsTrigger>
            <TabsTrigger value="mitigation">Kontrol & Mitigasi</TabsTrigger>
            <TabsTrigger value="actionplan">Rencana Aksi</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card><CardHeader><CardTitle>Ikhtisar Risiko</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Nama Risiko</p><p>{risk.name}</p></div>
                  <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Aset/Proses</p><p>{risk.asset || "-"}</p></div>
                  <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Risk Owner</p><p>{risk.riskOwner}</p></div>
                  <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Ancaman</p><p>{risk.threat || "-"}</p></div>
                  <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Kelemahan</p><p>{risk.vulnerability || "-"}</p></div>
                  <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Kategori</p><p>{risk.category}</p></div>
                </div>
                <div className="space-y-1 pt-4 border-t mt-4"><p className="text-sm font-medium text-muted-foreground">Uraian Dampak</p><p className="text-sm">{risk.impactDescription || risk.description}</p></div>

                {/* --- TAMBAHKAN BLOK INI --- */}
                <div className="space-y-2 pt-4 border-t mt-4">
                  <p className="text-sm font-medium text-muted-foreground">Standar Terkait</p>
                  <div className="flex flex-wrap gap-2">
                    {(risk.relatedStandards && risk.relatedStandards.length > 0) ? (
                        risk.relatedStandards.map(std => (
                            <Badge key={std} variant="secondary">{std}</Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">-</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Dibuat</p>
                        <p className="text-sm text-muted-foreground">{new Date(risk.createdAt).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Diperbarui</p>
                        <p className="text-sm text-muted-foreground">{new Date(risk.updatedAt).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* ------------------------- */}


              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Risiko Inheren</CardTitle><CardDescription>Risiko sebelum penerapan kontrol</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm font-medium text-muted-foreground">Kemungkinan</span><Badge variant="outline">{risk.inherentRisk?.likelihood} (Skor: {risk.inherentRisk?.likelihoodScore})</Badge></div>
                  <div className="flex justify-between items-center"><span className="text-sm font-medium text-muted-foreground">Dampak</span><Badge variant="outline">{risk.inherentRisk?.impact} (Skor: {risk.inherentRisk?.impactScore})</Badge></div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
                    <span className="text-xl font-bold">{risk.inherentRisk?.score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Level Risiko</span>
                    <Badge className={getLevelColor(risk.inherentRisk?.level)}>{risk.inherentRisk?.level}</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Risiko Residual</CardTitle><CardDescription>Risiko setelah penerapan kontrol</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm font-medium text-muted-foreground">Kemungkinan</span><Badge variant="outline">{risk.residualRisk?.likelihood} (Skor: {risk.residualRisk?.likelihoodScore})</Badge></div>
                  <div className="flex justify-between items-center"><span className="text-sm font-medium text-muted-foreground">Dampak</span><Badge variant="outline">{risk.residualRisk?.impact} (Skor: {risk.residualRisk?.impactScore})</Badge></div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
                    <span className="text-xl font-bold">{risk.residualRisk?.score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Level Risiko</span>
                    <Badge className={getLevelColor(risk.residualRisk?.level)}>{risk.residualRisk?.level}</Badge>
                  </div>

                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="mitigation">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Kontrol yang Diterapkan</CardTitle>
                  <CardDescription>Daftar kontrol yang sudah ada untuk memitigasi risiko ini.</CardDescription>
                </CardHeader>
                <CardContent>
                  {(risk.controls && risk.controls.length > 0) ? (

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                          <tr className="border-b">
                            <th className="p-2 text-left font-medium">Deskripsi Kontrol</th>
                            <th className="p-2 text-left font-medium">Tipe</th>
                            <th className="p-2 text-left font-medium">Status</th>
                          </tr>
                          </thead>
                          <tbody>
                          {(risk.controls).map((control, index) => (
                              <tr key={index} className="border-b last:border-b-0">
                                <td className="p-2 flex items-start">
                                  <Shield className="h-4 w-4 mr-3 mt-1 flex-shrink-0 text-blue-500" />
                                  {control.description}
                                </td>
                                <td className="p-2">
                                  <Badge variant="outline">{control.type}</Badge>
                                </td>
                                <td className="p-2">
                                  {getControlStatusBadge(control.status)}
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                  ) : (<p className="text-sm text-muted-foreground">Tidak ada kontrol yang ditambahkan.</p>)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tindakan Mitigasi yang Direncanakan</CardTitle>
                  <CardDescription>Rencana aksi spesifik untuk mengurangi level risiko.</CardDescription>
                </CardHeader>
                <CardContent>
                  {(risk.mitigationActions && risk.mitigationActions.length > 0) ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                          <tr className="border-b">
                            <th className="p-2 text-left font-medium">Tindakan</th>
                            <th className="p-2 text-left font-medium">PIC</th>
                            <th className="p-2 text-left font-medium">Target Selesai</th>
                          </tr>
                          </thead>
                          <tbody>
                          {(risk.mitigationActions).map((mitigation, index) => (
                              <tr key={index} className="border-b last:border-b-0">
                                <td className="p-2">{mitigation.action}</td>
                                <td className="p-2">{mitigation.responsible}</td>
                                <td className="p-2">{new Date(mitigation.dueDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                  ) : (<p className="text-sm text-muted-foreground">Tidak ada tindakan mitigasi yang ditambahkan.</p>)}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="actionplan">
            <Card>
              <CardHeader><CardTitle>Rencana Aksi Detail</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Peluang (Opportunity)</h4>
                  {(risk.opportunities && risk.opportunities.length > 0) ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {risk.opportunities.map((opp, index) => <li key={index}>{opp.description}</li>)}
                      </ul>
                  ) : <p className="text-sm text-muted-foreground">Tidak ada.</p>}
                </div>
                <Separator/>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground flex items-center"><User className="w-4 h-4 mr-1"/> PIC</p><p>{risk.pic}</p></div>
                  <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground flex items-center"><Target className="w-4 h-4 mr-1"/> Target Selesai</p><p>{risk.targetDate ? new Date(risk.targetDate).toLocaleDateString('id-ID') : '-'}</p></div>
                  <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground flex items-center"><Eye className="w-4 h-4 mr-1"/> Frekuensi Monitoring</p><Badge variant="outline">{risk.monitoring}</Badge></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader><CardTitle>Riwayat Perubahan</CardTitle><CardDescription>Log aktivitas dan perubahan pada risiko ini</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(risk.history || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry, index) => (
                      // --- PERBARUI TAMPILAN LOG DI SINI ---
                      <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                        <div className="flex-shrink-0 pt-1">
                                            <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                            </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{entry.action} oleh <b>{entry.user}</b></p>
                          <div className="text-xs text-muted-foreground mb-2">{new Date(entry.date).toLocaleString('id-ID')}</div>
                          {entry.details && entry.details.length > 0 && (
                              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {entry.details.map((detail, detailIndex) => (
                                    <li key={detailIndex}>{detail}</li>
                                ))}
                              </ul>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}