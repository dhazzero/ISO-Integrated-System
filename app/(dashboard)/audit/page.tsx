"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  FileCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit,
  FileText,
  AlertTriangle,
  Download,
} from "lucide-react"
import Link from "next/link"
import { AddFindingModal } from "@/components/audit/add-finding-modal"
import { AddAuditModal } from "@/components/audit/add-audit-modal"

export default function AuditPage() {
  const [audits, setAudits] = useState([
    {
      id: 1,
      name: "Audit Sistem Manajemen Mutu",
      standard: "ISO 9001:2015",
      department: "Produksi",
      date: "2023-05-15",
      status: "Completed",
      findings: 3,
      auditor: "John Doe",
      completedDate: "2023-05-17",
      reportFile: "Laporan_Audit_SMM_2023.pdf",
      evidenceFiles: ["Evidence_1.pdf", "Evidence_2.jpg"],
      auditType: "Internal",
    },
    {
      id: 2,
      name: "Audit Sistem Manajemen Lingkungan",
      standard: "ISO 14001:2015",
      department: "Operasional",
      date: "2023-06-22",
      status: "Completed",
      findings: 2,
      auditor: "Jane Smith",
      completedDate: "2023-06-24",
      reportFile: "Laporan_Audit_SML_2023.pdf",
      auditType: "Internal",
    },
    {
      id: 3,
      name: "Audit Sistem Manajemen K3",
      standard: "ISO 45001:2018",
      department: "Semua Departemen",
      date: "2023-08-10",
      status: "Scheduled",
      findings: 0,
      auditor: "Mike Johnson",
      scheduledTime: "09:00 - 17:00",
      checklistFile: "Checklist_K3_Audit.xlsx",
      auditType: "Internal",
    },
    {
      id: 4,
      name: "Audit Keamanan Informasi",
      standard: "ISO 27001:2022",
      department: "IT",
      date: "2023-07-05",
      status: "Completed",
      findings: 5,
      auditor: "Sarah Wilson",
      completedDate: "2023-07-07",
      reportFile: "Laporan_Audit_Keamanan_2023.pdf",
      auditType: "Internal",
    },
    {
      id: 5,
      name: "Audit Gabungan Sistem Manajemen",
      standard: "Multiple",
      department: "Semua Departemen",
      date: "2023-09-15",
      status: "Scheduled",
      findings: 0,
      auditor: "David Brown",
      scheduledTime: "08:00 - 16:00",
      checklistFile: "Checklist_Gabungan.pdf",
      auditType: "Internal",
    },
    {
      id: 6,
      name: "Audit External ISO 27001",
      standard: "ISO 27001:2022",
      department: "IT",
      date: "2023-10-15",
      status: "Completed",
      findings: 2,
      auditor: "PT. Certification Body",
      auditType: "External",
      completedDate: "2023-10-17",
      reportFile: "External_Audit_ISO27001_2023.pdf",
      evidenceFiles: ["Certificate_ISO27001.pdf", "Surveillance_Report.pdf"],
    },
    {
      id: 7,
      name: "Audit External ISO 9001",
      standard: "ISO 9001:2015",
      department: "Semua Departemen",
      date: "2023-11-20",
      status: "Scheduled",
      findings: 0,
      auditor: "PT. Quality Assurance",
      auditType: "External",
      scheduledTime: "08:00 - 16:00",
      checklistFile: "External_Checklist_ISO9001.pdf",
    },
    {
      id: 8,
      name: "Audit External ISO 37001",
      standard: "ISO 37001:2016",
      department: "Semua Departemen",
      date: "2023-09-05",
      status: "Completed",
      findings: 1,
      auditor: "PT. Anti-Bribery Consultant",
      auditType: "External",
      completedDate: "2023-09-07",
      reportFile: "External_Audit_ISO37001_2023.pdf",
    },
  ])

  const [findings, setFindings] = useState([
    {
      id: 1,
      auditId: 1,
      auditName: "Audit Sistem Manajemen Mutu",
      findingType: "Non-Conformity",
      severity: "Major",
      description: "Prosedur kalibrasi alat ukur tidak diikuti sesuai standar",
      clause: "7.1.5",
      evidence: "Catatan kalibrasi menunjukkan keterlambatan 2 bulan untuk micrometer, caliper, dan timbangan digital",
      recommendation:
        "Segera lakukan kalibrasi untuk semua alat ukur yang terlambat dan perbaiki sistem reminder kalibrasi",
      department: "Produksi",
      status: "Open",
      dueDate: "2023-06-15",
      responsiblePerson: "Ahmad Suryadi",
      createdDate: "2023-05-17",
    },
    {
      id: 2,
      auditId: 1,
      auditName: "Audit Sistem Manajemen Mutu",
      findingType: "Observation",
      severity: "Minor",
      description: "Dokumentasi training belum lengkap untuk beberapa operator",
      clause: "7.2",
      evidence: "File training record menunjukkan 2 dari 5 operator baru belum memiliki dokumentasi training lengkap",
      recommendation:
        "Lengkapi dokumentasi training untuk semua operator dan pastikan sistem tracking training berfungsi dengan baik",
      department: "Produksi",
      status: "In Progress",
      dueDate: "2023-06-10",
      responsiblePerson: "Siti Nurhaliza",
      createdDate: "2023-05-17",
    },
    {
      id: 3,
      auditId: 2,
      auditName: "Audit Sistem Manajemen Lingkungan",
      findingType: "Non-Conformity",
      severity: "Major",
      description: "Pemantauan limbah cair tidak dilakukan sesuai jadwal",
      clause: "8.1",
      evidence: "Log pemantauan menunjukkan 3 kali terlewat dalam bulan terakhir",
      recommendation: "Perbaiki sistem monitoring dan buat checklist harian untuk pemantauan limbah",
      department: "Operasional",
      status: "Open",
      dueDate: "2023-07-22",
      responsiblePerson: "Budi Santoso",
      createdDate: "2023-06-24",
    },
    {
      id: 4,
      auditId: 4,
      auditName: "Audit Keamanan Informasi",
      findingType: "Non-Conformity",
      severity: "Critical",
      description: "Password policy tidak diterapkan dengan konsisten",
      clause: "A.9.4.3",
      evidence: "Audit sistem menunjukkan 40% user menggunakan password lemah",
      recommendation: "Implementasikan password policy yang ketat dan lakukan training security awareness",
      department: "IT",
      status: "Closed",
      dueDate: "2023-08-05",
      responsiblePerson: "Andi Wijaya",
      createdDate: "2023-07-07",
    },
  ])

  const auditSummary = [
    { status: "Internal", count: audits.filter((a) => a.auditType === "Internal").length, color: "bg-blue-500" },
    { status: "External", count: audits.filter((a) => a.auditType === "External").length, color: "bg-green-500" },
    { status: "Selesai", count: audits.filter((a) => a.status === "Completed").length, color: "bg-gray-500" },
    { status: "Finding", count: findings.length, color: "bg-amber-500" },
  ]

  const addAudit = (newAudit: any) => {
    setAudits((prev) => [...prev, newAudit])
  }

  const addFinding = (newFinding: any) => {
    setFindings((prev) => [...prev, newFinding])
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "Scheduled":
        return <Calendar className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "Completed":
        return "Selesai"
      case "Scheduled":
        return "Dijadwalkan"
      default:
        return status
    }
  }

  const getSeverityColor = (severity) => {
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

  const getStatusColor = (status) => {
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

  const completedAudits = audits.filter((audit) => audit.status === "Completed")
  const scheduledAudits = audits.filter((audit) => audit.status === "Scheduled")

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audit</h1>
        <div className="flex space-x-2">
          <AddAuditModal onAddAudit={addAudit} type="scheduled" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {auditSummary.map((audit, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle>{audit.status === "Finding" ? "Total Finding" : `Audit ${audit.status}`}</CardTitle>
              <CardDescription>
                {audit.status === "Finding"
                  ? "Total temuan dari semua audit"
                  : `Total audit dengan status ${audit.status.toLowerCase()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${audit.color} mr-2`}></div>
                <span className="text-3xl font-bold">{audit.count}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Semua Audit</TabsTrigger>
          <TabsTrigger value="completed">Selesai</TabsTrigger>
          <TabsTrigger value="scheduled">Dijadwalkan</TabsTrigger>
          <TabsTrigger value="internal">Audit Internal</TabsTrigger>
          <TabsTrigger value="external">Audit External</TabsTrigger>
          <TabsTrigger value="findings">Finding Result</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Jadwal Audit</CardTitle>
              <CardDescription>Daftar semua audit yang direncanakan dan dilaksanakan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nama Audit</th>
                      <th className="text-left py-3 px-4">Standar</th>
                      <th className="text-left py-3 px-4">Departemen</th>
                      <th className="text-left py-3 px-4">Jenis Audit</th>
                      <th className="text-left py-3 px-4">Tanggal</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Temuan</th>
                      <th className="text-left py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audits.map((audit) => (
                      <tr key={audit.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 flex items-center">
                          <FileCheck className="mr-2 h-4 w-4 text-blue-500" />
                          {audit.name}
                        </td>
                        <td className="py-3 px-4">{audit.standard}</td>
                        <td className="py-3 px-4">{audit.department}</td>
                        <td className="py-3 px-4">
                          <Badge variant={audit.auditType === "Internal" ? "default" : "secondary"}>
                            {audit.auditType === "Internal" ? "Internal" : "External"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{audit.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getStatusIcon(audit.status)}
                            <span className="ml-1">{getStatusText(audit.status)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {audit.findings > 0 ? (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded text-xs">
                              {audit.findings} temuan
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs">
                              Tidak ada
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Link href={`/audit/${audit.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/audit/${audit.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Audit Selesai</CardTitle>
                <CardDescription>Daftar audit yang telah selesai dilaksanakan</CardDescription>
              </div>
              <AddAuditModal onAddAudit={addAudit} type="completed" />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nama Audit</th>
                      <th className="text-left py-3 px-4">Standar</th>
                      <th className="text-left py-3 px-4">Auditor</th>
                      <th className="text-left py-3 px-4">Tanggal Selesai</th>
                      <th className="text-left py-3 px-4">Temuan</th>
                      <th className="text-left py-3 px-4">Files</th>
                      <th className="text-left py-3 px-4">Laporan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedAudits.map((audit) => (
                      <tr key={audit.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 flex items-center">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          {audit.name}
                        </td>
                        <td className="py-3 px-4">{audit.standard}</td>
                        <td className="py-3 px-4">{audit.auditor}</td>
                        <td className="py-3 px-4">{audit.completedDate}</td>
                        <td className="py-3 px-4">
                          {audit.findings > 0 ? (
                            <Badge variant="destructive">{audit.findings} temuan</Badge>
                          ) : (
                            <Badge variant="secondary">Tidak ada</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col space-y-1">
                            {audit.reportFile && (
                              <Button variant="ghost" size="sm" className="justify-start p-0 h-auto">
                                <Download className="mr-1 h-3 w-3" />
                                <span className="text-xs">{audit.reportFile}</span>
                              </Button>
                            )}
                            {audit.evidenceFiles?.map((file, index) => (
                              <Button key={index} variant="ghost" size="sm" className="justify-start p-0 h-auto">
                                <Download className="mr-1 h-3 w-3" />
                                <span className="text-xs">{file}</span>
                              </Button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/audit/${audit.id}/report`}>
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              Lihat Laporan
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Audit Dijadwalkan</CardTitle>
                <CardDescription>Daftar audit yang akan dilaksanakan</CardDescription>
              </div>
              <AddAuditModal onAddAudit={addAudit} type="scheduled" />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nama Audit</th>
                      <th className="text-left py-3 px-4">Standar</th>
                      <th className="text-left py-3 px-4">Auditor</th>
                      <th className="text-left py-3 px-4">Tanggal</th>
                      <th className="text-left py-3 px-4">Waktu</th>
                      <th className="text-left py-3 px-4">Checklist</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduledAudits.map((audit) => (
                      <tr key={audit.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                          {audit.name}
                        </td>
                        <td className="py-3 px-4">{audit.standard}</td>
                        <td className="py-3 px-4">{audit.auditor}</td>
                        <td className="py-3 px-4">{audit.date}</td>
                        <td className="py-3 px-4">{audit.scheduledTime}</td>
                        <td className="py-3 px-4">
                          {audit.checklistFile && (
                            <Button variant="ghost" size="sm" className="justify-start p-0 h-auto">
                              <Download className="mr-1 h-3 w-3" />
                              <span className="text-xs">{audit.checklistFile}</span>
                            </Button>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">Dijadwalkan</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internal">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Audit Internal</CardTitle>
              <CardDescription>Daftar audit internal yang dilakukan oleh tim internal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nama Audit</th>
                      <th className="text-left py-3 px-4">Standar</th>
                      <th className="text-left py-3 px-4">Departemen</th>
                      <th className="text-left py-3 px-4">Tanggal</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Temuan</th>
                      <th className="text-left py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audits
                      .filter((audit) => audit.auditType === "Internal")
                      .map((audit) => (
                        <tr key={audit.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 flex items-center">
                            <FileCheck className="mr-2 h-4 w-4 text-blue-500" />
                            {audit.name}
                          </td>
                          <td className="py-3 px-4">{audit.standard}</td>
                          <td className="py-3 px-4">{audit.department}</td>
                          <td className="py-3 px-4">{audit.date}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {getStatusIcon(audit.status)}
                              <span className="ml-1">{getStatusText(audit.status)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {audit.findings > 0 ? (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded text-xs">
                                {audit.findings} temuan
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs">
                                Tidak ada
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Link href={`/audit/${audit.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/audit/${audit.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="external">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Audit External</CardTitle>
              <CardDescription>Daftar audit external yang dilakukan oleh pihak ketiga</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nama Audit</th>
                      <th className="text-left py-3 px-4">Standar</th>
                      <th className="text-left py-3 px-4">Auditor External</th>
                      <th className="text-left py-3 px-4">Tanggal</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Temuan</th>
                      <th className="text-left py-3 px-4">Sertifikat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audits
                      .filter((audit) => audit.auditType === "External")
                      .map((audit) => (
                        <tr key={audit.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 flex items-center">
                            <FileCheck className="mr-2 h-4 w-4 text-green-500" />
                            {audit.name}
                          </td>
                          <td className="py-3 px-4">{audit.standard}</td>
                          <td className="py-3 px-4">{audit.auditor}</td>
                          <td className="py-3 px-4">{audit.date}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {getStatusIcon(audit.status)}
                              <span className="ml-1">{getStatusText(audit.status)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {audit.findings > 0 ? (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded text-xs">
                                {audit.findings} temuan
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs">
                                Tidak ada
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {audit.status === "Completed" && audit.findings <= 2 ? (
                              <Badge variant="default" className="bg-green-500">
                                Tersertifikasi
                              </Badge>
                            ) : audit.status === "Scheduled" ? (
                              <Badge variant="outline">Pending</Badge>
                            ) : (
                              <Badge variant="destructive">Perlu Perbaikan</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Finding Result</CardTitle>
                <CardDescription>Daftar temuan dari semua audit yang telah dilaksanakan</CardDescription>
              </div>
              <AddFindingModal onAddFinding={addFinding} audits={audits} />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Audit</th>
                      <th className="text-left py-3 px-4">Jenis Temuan</th>
                      <th className="text-left py-3 px-4">Tingkat</th>
                      <th className="text-left py-3 px-4">Deskripsi</th>
                      <th className="text-left py-3 px-4">Klausul</th>
                      <th className="text-left py-3 px-4">Penanggung Jawab</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Due Date</th>
                      <th className="text-left py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {findings.map((finding) => (
                      <tr key={finding.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                            <div>
                              <div className="font-medium text-sm">{finding.auditName}</div>
                              <div className="text-xs text-muted-foreground">{finding.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {finding.findingType}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${getSeverityColor(finding.severity)} mr-2`}></div>
                            <span className="text-sm">{finding.severity}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="truncate text-sm" title={finding.description}>
                            {finding.description}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {finding.clause}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{finding.responsiblePerson}</td>
                        <td className="py-3 px-4">
                          <Badge className={`text-xs ${getStatusColor(finding.status)}`}>{finding.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{finding.dueDate}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
