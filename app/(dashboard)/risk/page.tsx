"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowUpRight, ArrowRight, ArrowDownRight, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { AddRiskModal } from "@/components/risk/add-risk-modal"
import { useState, useMemo, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

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
    const summary = { Tinggi: 0, Sedang: 0, Rendah: 0 };
    risks.forEach((risk) => {
      if (summary.hasOwnProperty(risk.level)) {
        summary[risk.level as keyof typeof summary]++;
      }
    });
    return [
      { level: "Tinggi", count: summary.Tinggi, color: "bg-red-500" },
      { level: "Sedang", count: summary.Sedang, color: "bg-amber-500" },
      { level: "Rendah", count: summary.Rendah, color: "bg-green-500" },
    ];
  }, [risks]);

  const handleRiskAdded = () => {
    toast({ title: "Sukses", description: "Daftar risiko sedang diperbarui..."});
    fetchRisks(); // Panggil ulang fetchRisks untuk refresh data
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "down": return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      default: return <ArrowRight className="h-4 w-4 text-amber-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Tinggi": return "text-red-500";
      case "Sedang": return "text-amber-500";
      case "Rendah": return "text-green-500";
      default: return "";
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
                <CardHeader className="pb-2">
                  <CardTitle>Risiko {risk.level}</CardTitle>
                  <CardDescription>Total risiko dengan level {risk.level.toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${risk.color} mr-2`}></div>
                    <span className="text-3xl font-bold">{risk.count}</span>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Register Risiko</CardTitle>
            <CardDescription>Daftar semua risiko yang teridentifikasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nama Risiko</th>
                  <th className="text-left py-3 px-4">Kategori</th>
                  <th className="text-left py-3 px-4">Level</th>
                  <th className="text-left py-3 px-4">Kemungkinan</th>
                  <th className="text-left py-3 px-4">Dampak</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Tren</th>
                  <th className="text-left py-3 px-4">Tindakan</th>
                </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <tr><td colSpan={8} className="text-center p-8">Memuat data risiko...</td></tr>
                ) : (
                    risks.map((risk) => (
                        <tr key={risk._id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 flex items-center">
                            <AlertTriangle className={`mr-2 h-4 w-4 ${getLevelColor(risk.level)}`} />
                            <Link href={`/risk/${risk._id}`} className="hover:underline">{risk.name}</Link>
                          </td>
                          <td className="py-3 px-4">{risk.category}</td>
                          <td className={`py-3 px-4 ${getLevelColor(risk.level)}`}>{risk.level}</td>
                          <td className="py-3 px-4">{risk.likelihood}</td>
                          <td className="py-3 px-4">{risk.impact}</td>
                          <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${risk.status === "Open" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>{risk.status === "Open" ? "Terbuka" : "Dimitigasi"}</span></td>
                          <td className="py-3 px-4">{getTrendIcon(risk.trend)}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <Link href={`/risk/${risk._id}`}><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link>
                              <Link href={`/risk/${risk._id}/edit`}><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></Link>
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
      </div>
  )
}