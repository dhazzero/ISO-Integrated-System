"use client"

// Definisikan tipe data di sini
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Download, FileText, CheckCircle2, AlertTriangle } from "lucide-react"



interface Finding {
  _id: string
  type: string
  severity: string
  clause: string
  description: string
  evidence: string
  recommendation: string
  status: string
}

interface AuditReport {
  _id: string
  name: string
  standard: string
  department: string
  auditDate: string
  completedDate: string
  auditTeam: string[]
  scope: string
  objective: string
  summary: string
  positiveFindings: string[]
  recommendations: string[]
  findings: Finding[]
}


export default function AuditReportPage() {
  const params = useParams()
  const { toast } = useToast()
  const auditId = params.id as string
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auditId) return
    const fetchData = async () => {
      setLoading(true)
      try {

        const [auditRes, findingsRes] = await Promise.all([
          fetch(`/api/audits/${auditId}`),
          fetch(`/api/findings?auditId=${auditId}`)
        ])
        if (!auditRes.ok || !findingsRes.ok) throw new Error("Gagal memuat data laporan audit.")
        const auditData = await auditRes.json()
        const findingsData = await findingsRes.json()
        setAuditReport({
          _id: auditData._id,
          name: auditData.name,
          standard: auditData.standard,
          department: auditData.department,
          auditDate: auditData.date,
          completedDate: auditData.completedDate || "",
          auditTeam: [auditData.auditor],
          scope: auditData.scope || "",
          objective: auditData.objectives || "",
          summary: auditData.conclusion || "",
          positiveFindings: auditData.positiveFindings || [],
          recommendations: auditData.recommendations || [],
          findings: findingsData,
        })

      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: (error as Error).message })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [auditId, toast])

  const getSeverityColor = (severity: string) => {
    if (severity === "Critical") return "bg-red-600 text-white"
    if (severity === "Major") return "bg-orange-500 text-white"
    if (severity === "Minor") return "bg-yellow-400 text-black"
    return "bg-gray-400 text-white"
  }

  const getStatusColor = (status: string) => {
    if (status === "Open") return "bg-red-100 text-red-800"
    if (status === "In Progress") return "bg-yellow-100 text-yellow-800"
    if (status === "Closed") return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    if (status === "Closed") return <CheckCircle2 className="h-3 w-3" />
    if (status === "Open") return <AlertTriangle className="h-3 w-3" />
    return <AlertTriangle className="h-3 w-3" />
  }
  if (loading) return <div className="container p-6 text-center">Memuat laporan...</div>
  if (!auditReport) return <div className="container p-6 text-center text-red-500">Laporan tidak ditemukan.</div>

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/audit">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Audit
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Laporan Audit</h1>
              <p className="text-muted-foreground">{auditReport.name}</p>
          </div>
        </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Standar</label>
                    <p className="font-medium">{auditReport.standard}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Departemen</label>
                    <p className="font-medium">{auditReport.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tanggal Audit</label>
                    <p className="font-medium">{auditReport.auditDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tanggal Selesai</label>
                    <p className="font-medium">{auditReport.completedDate}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tim Auditor</label>
                  <p className="font-medium">{auditReport.auditTeam.join(", ")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ruang Lingkup</label>
                  <p className="font-medium">{auditReport.scope}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tujuan</label>
                  <p className="font-medium">{auditReport.objective}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Eksekutif</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{auditReport.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temuan Audit</CardTitle>
                <CardDescription>Detail temuan dan rekomendasi perbaikan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {auditReport.findings.map((finding, index) => (
                    <div key={finding._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">Temuan #{index + 1}</span>
                          <Badge variant="outline">{finding.type}</Badge>
                          <div className="flex items-center space-x-1">
                            <div className={`w-3 h-3 rounded-full ${getSeverityColor(finding.severity)}`}></div>
                            <span className="text-sm">{finding.severity}</span>
                          </div>
                          <Badge variant="outline">Klausul {finding.clause}</Badge>
                        </div>
                        <Badge className={getStatusColor(finding.status)}>
                          {getStatusIcon(finding.status)}
                          <span className="ml-1">{finding.status}</span>
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                          <p className="text-sm mt-1">{finding.description}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Bukti</label>
                          <p className="text-sm mt-1">{finding.evidence}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Rekomendasi</label>
                          <p className="text-sm mt-1">{finding.recommendation}</p>
                        </div>
                      </div>
                    </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temuan Positif</CardTitle>
                <CardDescription>Aspek yang sudah berjalan dengan baik</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {auditReport.positiveFindings.map((finding, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{finding}</span>
                      </li>
                ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rekomendasi Umum</CardTitle>
                <CardDescription>Saran perbaikan untuk sistem manajemen</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {auditReport.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6"></div>
        </div>
      </div>
  )
}