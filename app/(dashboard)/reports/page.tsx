"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Download,
  FileText,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Calendar,
} from "lucide-react"

export default function ReportsPage() {
  // Data dari semua modul - dalam implementasi nyata akan diambil dari API/database
  const complianceData = {
    standards: [
      { name: "ISO 9001:2015", compliance: 85, controls: 42, implemented: 36 },
      { name: "ISO 14001:2015", compliance: 78, controls: 38, implemented: 30 },
      { name: "ISO 45001:2018", compliance: 92, controls: 45, implemented: 41 },
      { name: "ISO 27001:2022", compliance: 65, controls: 56, implemented: 36 },
    ],
    gaps: 15,
    totalControls: 181,
    implementedControls: 143,
  }

  const riskData = {
    total: 50,
    high: 8,
    medium: 15,
    low: 27,
    open: 23,
    mitigated: 27,
    byCategory: [
      { category: "Keamanan Informasi", count: 12 },
      { category: "Operasional", count: 15 },
      { category: "Kepatuhan", count: 8 },
      { category: "Teknologi", count: 10 },
      { category: "K3", count: 5 },
    ],
  }

  const auditData = {
    total: 17,
    completed: 12,
    scheduled: 5,
    findings: 8,
    byStandard: [
      { standard: "ISO 9001", count: 5 },
      { standard: "ISO 14001", count: 4 },
      { standard: "ISO 45001", count: 3 },
      { standard: "ISO 27001", count: 5 },
    ],
    findingsBySeverity: [
      { severity: "Critical", count: 1 },
      { severity: "Major", count: 3 },
      { severity: "Minor", count: 4 },
    ],
  }

  const capaData = {
    total: 45,
    open: 8,
    inProgress: 12,
    closed: 25,
    byPriority: [
      { priority: "Critical", count: 2 },
      { priority: "High", count: 12 },
      { priority: "Medium", count: 18 },
      { priority: "Low", count: 13 },
    ],
    bySource: [
      { source: "Audit Internal", count: 15 },
      { source: "Audit Eksternal", count: 8 },
      { source: "Keluhan Pelanggan", count: 7 },
      { source: "Inspeksi", count: 10 },
      { source: "Lainnya", count: 5 },
    ],
  }

  const trainingData = {
    total: 120,
    completed: 95,
    inProgress: 15,
    planned: 10,
    byDepartment: [
      { department: "Produksi", count: 35 },
      { department: "QC", count: 20 },
      { department: "HR", count: 15 },
      { department: "IT", count: 25 },
      { department: "K3", count: 25 },
    ],
    effectiveness: 87,
  }

  // Calculated metrics
  const overallCompliance = useMemo(() => {
    return Math.round(
      complianceData.standards.reduce((acc, std) => acc + std.compliance, 0) / complianceData.standards.length,
    )
  }, [])

  const riskTrend = useMemo(() => {
    // Simulasi trend - dalam implementasi nyata akan dihitung dari data historis
    return {
      direction: "down",
      percentage: 12,
      period: "bulan ini",
    }
  }, [])

  const capaTrend = useMemo(() => {
    const completionRate = Math.round((capaData.closed / capaData.total) * 100)
    return {
      rate: completionRate,
      direction: "up",
      percentage: 8,
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pelaporan & Dasbor</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Ekspor Laporan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
              Kepatuhan Keseluruhan
            </CardTitle>
            <CardDescription>Rata-rata tingkat kepatuhan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallCompliance}%</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-sm text-green-600">+5% dari periode sebelumnya</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Risiko Aktif
            </CardTitle>
            <CardDescription>Total risiko yang belum dimitigasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{riskData.open}</div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-sm text-green-600">
                -{riskTrend.percentage}% {riskTrend.period}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-amber-500" />
              CAPA Terbuka
            </CardTitle>
            <CardDescription>Tindakan korektif yang belum selesai</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{capaData.open + capaData.inProgress}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-amber-500 mr-1" />
              <p className="text-sm text-amber-600">+2 dari periode sebelumnya</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Audit Selesai
            </CardTitle>
            <CardDescription>Total audit yang telah dilaksanakan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{auditData.completed}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-sm text-green-600">+4 dari periode sebelumnya</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
          <TabsTrigger value="compliance">Kepatuhan</TabsTrigger>
          <TabsTrigger value="risk">Risiko</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="capa">CAPA</TabsTrigger>
          <TabsTrigger value="training">Pelatihan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5 text-blue-500" />
                  Tren Kepatuhan per Standar
                </CardTitle>
                <CardDescription>Tingkat kepatuhan untuk setiap standar ISO</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.standards.map((standard, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{standard.name}</span>
                        <span className="text-muted-foreground">{standard.compliance}%</span>
                      </div>
                      <Progress value={standard.compliance} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {standard.implemented}/{standard.controls} kontrol diimplementasi
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-green-500" />
                  Distribusi Risiko
                </CardTitle>
                <CardDescription>Distribusi risiko berdasarkan level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                      <span className="text-sm">Risiko Tinggi</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{riskData.high}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((riskData.high / riskData.total) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
                      <span className="text-sm">Risiko Sedang</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{riskData.medium}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((riskData.medium / riskData.total) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                      <span className="text-sm">Risiko Rendah</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{riskData.low}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((riskData.low / riskData.total) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="mr-2 h-5 w-5 text-purple-500" />
                  Status CAPA
                </CardTitle>
                <CardDescription>Distribusi status CAPA saat ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm">Terbuka</span>
                    </div>
                    <Badge variant="destructive">{capaData.open}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-amber-500 mr-2" />
                      <span className="text-sm">Dalam Proses</span>
                    </div>
                    <Badge variant="secondary">{capaData.inProgress}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Selesai</span>
                    </div>
                    <Badge variant="outline">{capaData.closed}</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">Tingkat Penyelesaian</div>
                    <div className="text-2xl font-bold text-green-600">{capaTrend.rate}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-orange-500" />
                  Ringkasan Audit
                </CardTitle>
                <CardDescription>Status audit dan temuan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{auditData.completed}</div>
                      <div className="text-xs text-muted-foreground">Audit Selesai</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{auditData.scheduled}</div>
                      <div className="text-xs text-muted-foreground">Audit Dijadwalkan</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Temuan berdasarkan Tingkat:</div>
                    {auditData.findingsBySeverity.map((finding, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{finding.severity}</span>
                        <span className="font-medium">{finding.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tingkat Kepatuhan per Standar</CardTitle>
                <CardDescription>Detail implementasi kontrol untuk setiap standar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {complianceData.standards.map((standard, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{standard.name}</h4>
                        <Badge
                          variant={
                            standard.compliance >= 90
                              ? "default"
                              : standard.compliance >= 75
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {standard.compliance}%
                        </Badge>
                      </div>
                      <Progress value={standard.compliance} className="h-3" />
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>Total: {standard.controls}</div>
                        <div>Implemented: {standard.implemented}</div>
                        <div>Gap: {standard.controls - standard.implemented}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analisis Kesenjangan</CardTitle>
                <CardDescription>Ringkasan gap yang perlu ditangani</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{complianceData.gaps}</div>
                    <div className="text-sm text-muted-foreground">Total Kesenjangan</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Tingkat Kepatuhan Keseluruhan</span>
                      <span className="font-medium">{overallCompliance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Kontrol Terimplementasi</span>
                      <span className="font-medium">
                        {complianceData.implementedControls}/{complianceData.totalControls}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Standar dengan Kepatuhan Tertinggi</span>
                      <span className="font-medium">ISO 45001 (92%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Standar yang Perlu Perhatian</span>
                      <span className="font-medium text-red-600">ISO 27001 (65%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Risiko berdasarkan Kategori</CardTitle>
                <CardDescription>Jumlah risiko per kategori bisnis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskData.byCategory.map((category, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{category.category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(category.count / riskData.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-medium w-8 text-right">{category.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Mitigasi Risiko</CardTitle>
                <CardDescription>Progress penanganan risiko</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">{riskData.open}</div>
                      <div className="text-xs text-muted-foreground">Risiko Terbuka</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{riskData.mitigated}</div>
                      <div className="text-xs text-muted-foreground">Risiko Dimitigasi</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Tingkat Mitigasi</div>
                    <Progress value={(riskData.mitigated / riskData.total) * 100} className="h-3" />
                    <div className="text-xs text-muted-foreground text-center">
                      {Math.round((riskData.mitigated / riskData.total) * 100)}% risiko telah dimitigasi
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">Tren Risiko Bulan Ini</div>
                    <div className="flex items-center">
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">Menurun {riskTrend.percentage}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit berdasarkan Standar</CardTitle>
                <CardDescription>Distribusi audit per standar ISO</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditData.byStandard.map((standard, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{standard.standard}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(standard.count / auditData.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-medium w-8 text-right">{standard.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analisis Temuan Audit</CardTitle>
                <CardDescription>Distribusi temuan berdasarkan tingkat keparahan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditData.findingsBySeverity.map((finding, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{finding.severity}</span>
                        <span className="font-medium">{finding.count}</span>
                      </div>
                      <Progress
                        value={(finding.count / auditData.findings) * 100}
                        className={`h-2 ${
                          finding.severity === "Critical"
                            ? "[&>div]:bg-red-500"
                            : finding.severity === "Major"
                              ? "[&>div]:bg-orange-500"
                              : "[&>div]:bg-yellow-500"
                        }`}
                      />
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">Total Temuan: {auditData.findings}</div>
                    <div className="text-sm text-muted-foreground">
                      Rata-rata per Audit: {(auditData.findings / auditData.completed).toFixed(1)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CAPA berdasarkan Prioritas</CardTitle>
                <CardDescription>Distribusi CAPA berdasarkan tingkat prioritas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {capaData.byPriority.map((priority, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            priority.priority === "Critical"
                              ? "bg-red-500"
                              : priority.priority === "High"
                                ? "bg-orange-500"
                                : priority.priority === "Medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                        ></div>
                        <span className="text-sm">{priority.priority}</span>
                      </div>
                      <span className="font-medium">{priority.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CAPA berdasarkan Sumber</CardTitle>
                <CardDescription>Asal temuan yang memicu CAPA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {capaData.bySource.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{source.source}</span>
                        <span className="font-medium">{source.count}</span>
                      </div>
                      <Progress value={(source.count / capaData.total) * 100} className="h-2" />
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Tingkat Penyelesaian: {Math.round((capaData.closed / capaData.total) * 100)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pelatihan berdasarkan Departemen</CardTitle>
                <CardDescription>Distribusi pelatihan per departemen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingData.byDepartment.map((dept, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{dept.department}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(dept.count / trainingData.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-medium w-8 text-right">{dept.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Pelatihan</CardTitle>
                <CardDescription>Progress pelaksanaan pelatihan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xl font-bold text-green-600">{trainingData.completed}</div>
                      <div className="text-xs text-muted-foreground">Selesai</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-600">{trainingData.inProgress}</div>
                      <div className="text-xs text-muted-foreground">Berlangsung</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-600">{trainingData.planned}</div>
                      <div className="text-xs text-muted-foreground">Direncanakan</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Tingkat Penyelesaian</div>
                    <Progress value={(trainingData.completed / trainingData.total) * 100} className="h-3" />
                    <div className="text-xs text-muted-foreground text-center">
                      {Math.round((trainingData.completed / trainingData.total) * 100)}% pelatihan telah selesai
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">Efektivitas Pelatihan</div>
                    <div className="text-2xl font-bold text-green-600">{trainingData.effectiveness}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
