import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  Building,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import Link from "next/link"

export default function AuditReportPage({ params }: { params: { id: string } }) {
  // Mock data - dalam implementasi nyata, data ini akan diambil dari API berdasarkan params.id
  const auditReport = {
    id: Number.parseInt(params.id),
    name: "Audit Sistem Manajemen Mutu",
    standard: "ISO 9001:2015",
    department: "Produksi",
    auditDate: "2023-05-15",
    completedDate: "2023-05-17",
    auditor: "John Doe",
    auditTeam: ["John Doe", "Jane Smith", "Mike Johnson"],
    scope: "Proses produksi, kontrol kualitas, dan manajemen dokumen",
    objective: "Mengevaluasi efektivitas sistem manajemen mutu sesuai ISO 9001:2015",
    summary:
      "Audit dilaksanakan selama 2 hari dengan fokus pada proses produksi dan kontrol kualitas. Secara keseluruhan, sistem manajemen mutu berjalan dengan baik namun ditemukan beberapa area yang perlu perbaikan.",
    findings: [
      {
        id: 1,
        type: "Non-Conformity",
        severity: "Major",
        clause: "7.1.5",
        description:
          "Prosedur kalibrasi alat ukur tidak diikuti sesuai standar. Ditemukan 3 alat ukur yang melewati jadwal kalibrasi.",
        evidence:
          "Catatan kalibrasi menunjukkan keterlambatan 2 bulan untuk micrometer, caliper, dan timbangan digital.",
        recommendation:
          "Segera lakukan kalibrasi untuk semua alat ukur yang terlambat dan perbaiki sistem reminder kalibrasi.",
        status: "Open",
      },
      {
        id: 2,
        type: "Observation",
        severity: "Minor",
        clause: "7.2",
        description: "Dokumentasi training belum lengkap untuk beberapa operator baru.",
        evidence:
          "File training record menunjukkan 2 dari 5 operator baru belum memiliki dokumentasi training lengkap.",
        recommendation:
          "Lengkapi dokumentasi training untuk semua operator dan pastikan sistem tracking training berfungsi dengan baik.",
        status: "In Progress",
      },
      {
        id: 3,
        type: "Non-Conformity",
        severity: "Minor",
        clause: "8.2.1",
        description: "Beberapa produk tidak memiliki identifikasi yang jelas pada tahap work in process.",
        evidence: "Observasi di lantai produksi menunjukkan 15% produk WIP tidak memiliki label identifikasi.",
        recommendation: "Implementasikan sistem labeling yang konsisten untuk semua tahap produksi.",
        status: "Open",
      },
    ],
    positiveFindings: [
      "Sistem dokumentasi ISO 9001 telah diimplementasikan dengan baik",
      "Komitmen manajemen terhadap kualitas sangat tinggi",
      "Proses customer feedback handling berjalan efektif",
      "Training awareness ISO 9001 untuk karyawan sudah komprehensif",
    ],
    recommendations: [
      "Perbaiki sistem kalibrasi alat ukur dengan implementasi reminder otomatis",
      "Lengkapi dokumentasi training untuk semua karyawan",
      "Implementasikan sistem identifikasi produk yang lebih robust",
      "Lakukan internal audit lebih rutin untuk memastikan konsistensi implementasi",
    ],
    nextAuditDate: "2024-05-15",
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500"
      case "Major":
        return "bg-orange-500"
      case "Minor":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "Closed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <XCircle className="h-4 w-4" />
      case "In Progress":
        return <AlertTriangle className="h-4 w-4" />
      case "Closed":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audit Information */}
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

          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Eksekutif</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{auditReport.summary}</p>
            </CardContent>
          </Card>

          {/* Findings */}
          <Card>
            <CardHeader>
              <CardTitle>Temuan Audit</CardTitle>
              <CardDescription>Detail temuan dan rekomendasi perbaikan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {auditReport.findings.map((finding, index) => (
                <div key={finding.id} className="border rounded-lg p-4">
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

          {/* Positive Findings */}
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

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Rekomendasi Umum</CardTitle>
              <CardDescription>Saran perbaikan untuk sistem manajemen</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {auditReport.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Temuan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Temuan</span>
                <Badge variant="outline">{auditReport.findings.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Non-Conformity</span>
                <Badge variant="destructive">
                  {auditReport.findings.filter((f) => f.type === "Non-Conformity").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Observation</span>
                <Badge variant="secondary">{auditReport.findings.filter((f) => f.type === "Observation").length}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">Critical</span>
                <Badge className="bg-red-500">
                  {auditReport.findings.filter((f) => f.severity === "Critical").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Major</span>
                <Badge className="bg-orange-500">
                  {auditReport.findings.filter((f) => f.severity === "Major").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Minor</span>
                <Badge className="bg-yellow-500">
                  {auditReport.findings.filter((f) => f.severity === "Minor").length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Next Audit */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Berikutnya</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{auditReport.nextAuditDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Buat CAPA
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Assign Follow-up
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building className="mr-2 h-4 w-4" />
                Schedule Re-audit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
