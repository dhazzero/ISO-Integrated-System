import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  ClipboardList,
  Shield,
  AlertTriangle,
  FileCheck,
  FileText,
  BarChart,
  GraduationCap,
  Settings,
} from "lucide-react"

export default function Home() {
  const modules = [
    {
      title: "Manajemen Dokumentasi",
      description: "Satu sumber kebenaran dan kontrol dokumen yang efisien",
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      href: "/documents",
    },
    {
      title: "Pemetaan Kepatuhan",
      description: "Identifikasi tumpang tindih dan optimalisasi kontrol",
      icon: <ClipboardList className="h-8 w-8 text-green-500" />,
      href: "/compliance",
    },
    {
      title: "Manajemen Risiko",
      description: "Pendekatan holistik dan proses terpadu",
      icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
      href: "/risk",
    },
    {
      title: "Audit Internal",
      description: "Efisiensi audit dan pelacakan terpusat",
      icon: <FileCheck className="h-8 w-8 text-purple-500" />,
      href: "/audit",
    },
    {
      title: "Manajemen CAPA",
      description: "Siklus CAPA terpadu dan analisis akar masalah",
      icon: <Shield className="h-8 w-8 text-red-500" />,
      href: "/capa",
    },
    {
      title: "Pelaporan & Dasbor",
      description: "Visibilitas menyeluruh dan pelaporan yang disederhanakan",
      icon: <BarChart className="h-8 w-8 text-indigo-500" />,
      href: "/reports",
    },
    {
      title: "Manajemen Pelatihan",
      description: "Program terkoordinasi dan pelacakan kompetensi",
      icon: <GraduationCap className="h-8 w-8 text-teal-500" />,
      href: "/training",
    },
    {
      title: "Pengaturan Sistem",
      description: "Konfigurasi dan fitur pendukung spesifik",
      icon: <Settings className="h-8 w-8 text-gray-500" />,
      href: "/settings",
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Sistem Manajemen Terintegrasi</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Platform Governance, Risk, dan Compliance (GRC) Terpadu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <Link href={module.href} key={index}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="mb-2">{module.icon}</div>
                  <CardTitle>{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{module.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
