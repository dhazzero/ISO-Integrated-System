import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Plus, Calendar, CheckCircle2, Clock, Users } from "lucide-react"

export default function TrainingPage() {
  const trainingSummary = [
    { status: "Selesai", count: 18, color: "bg-green-500" },
    { status: "Dijadwalkan", count: 7, color: "bg-blue-500" },
    { status: "Dalam Proses", count: 3, color: "bg-amber-500" },
  ]

  const trainings = [
    {
      id: 1,
      name: "Kesadaran ISO 9001:2015",
      category: "Sistem Manajemen Mutu",
      participants: 45,
      date: "2023-05-15",
      status: "Completed",
      completion: 100,
    },
    {
      id: 2,
      name: "Audit Internal",
      category: "Audit",
      participants: 12,
      date: "2023-06-22",
      status: "Completed",
      completion: 100,
    },
    {
      id: 3,
      name: "Manajemen Risiko",
      category: "Risiko",
      participants: 25,
      date: "2023-08-10",
      status: "Scheduled",
      completion: 0,
    },
    {
      id: 4,
      name: "Keamanan Informasi",
      category: "Keamanan",
      participants: 30,
      date: "2023-07-05",
      status: "In Progress",
      completion: 65,
    },
    {
      id: 5,
      name: "Kesadaran Lingkungan",
      category: "Lingkungan",
      participants: 50,
      date: "2023-09-15",

      category: "Lingkungan",
      participants: 50,
      date: "2023-09-15",
      status: "Scheduled",
      completion: 0,
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "Scheduled":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return <Clock className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "Completed":
        return "Selesai"
      case "Scheduled":
        return "Dijadwalkan"
      case "In Progress":
        return "Dalam Proses"
      default:
        return status
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Pelatihan</h1>
        <div className="flex space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pelatihan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {trainingSummary.map((training, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle>Pelatihan {training.status}</CardTitle>
              <CardDescription>Total pelatihan dengan status {training.status.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${training.color} mr-2`}></div>
                <span className="text-3xl font-bold">{training.count}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Semua Pelatihan</TabsTrigger>
          <TabsTrigger value="completed">Selesai</TabsTrigger>
          <TabsTrigger value="scheduled">Dijadwalkan</TabsTrigger>
          <TabsTrigger value="in-progress">Dalam Proses</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Daftar Pelatihan</CardTitle>
              <CardDescription>Daftar semua pelatihan yang direncanakan dan dilaksanakan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nama Pelatihan</th>
                      <th className="text-left py-3 px-4">Kategori</th>
                      <th className="text-left py-3 px-4">Peserta</th>
                      <th className="text-left py-3 px-4">Tanggal</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Penyelesaian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainings.map((training) => (
                      <tr key={training.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 flex items-center">
                          <GraduationCap className="mr-2 h-4 w-4 text-blue-500" />
                          {training.name}
                        </td>
                        <td className="py-3 px-4">{training.category}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                            {training.participants}
                          </div>
                        </td>
                        <td className="py-3 px-4">{training.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getStatusIcon(training.status)}
                            <span className="ml-1">{getStatusText(training.status)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 w-40">
                          <div className="space-y-1">
                            <Progress value={training.completion} className="h-2" />
                            <div className="text-xs text-right">{training.completion}%</div>
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
        {/* Konten tab lainnya akan serupa */}
      </Tabs>
    </div>
  )
}
