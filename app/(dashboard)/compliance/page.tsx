"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Eye, Edit, Filter, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { AddControlModal } from "@/components/compliance/add-control-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuditLogModal } from "@/components/audit-trail/audit-log-modal"
import { useAuditTrail } from "@/hooks/use-audit-trail"

// --- Tipe Data untuk data dinamis dari API ---
interface Standard {
  _id: string;
  name: string;
  title: string;
  // tambahkan properti lain jika ada dari API
  compliance?: number;
  controls?: number;
  implemented?: number;
}

// --- Tipe Data untuk data contoh (bisa juga dari API nanti) ---
interface Control { id: number; name: string; standards: string[]; status: string; effectiveness: string; compliance: number; }
interface Gap { id: number; control: string; standard: string; clause: string; description: string; severity: string; impact: string; dueDate: string; responsible: string; status: string; }
interface Mapping { id: number; requirement: string; iso9001: string; iso27001: string; iso37001: string; overlap: number; }

export default function CompliancePage() {
  // --- State untuk menampung data dinamis dan UI ---
  const [standards, setStandards] = useState<Standard[]>([]); // <-- Akan diisi dari API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State lain dari file asli Anda
  const [filterStandard, setFilterStandard] = useState("all")
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false)
  const [isApiLoading, setIsApiLoading] = useState(false) // Mengganti nama isLoading agar tidak konflik
  const [newMapping, setNewMapping] = useState({
    requirement: "", iso9001: "", iso14001: "", iso45001: "", iso27001: "", iso37001: "",
  })
  const { logDelete, logView } = useAuditTrail()
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: "", id: null as number | null, name: "" })

  // --- Mengambil data standar dari API saat komponen dimuat ---
  useEffect(() => {
    const fetchStandards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/settings/standards');
        if (!response.ok) {
          throw new Error('Gagal mengambil data standar dari Pengaturan.');
        }
        const data: Standard[] = await response.json();
        // Menambahkan data statis (compliance, dll) untuk keperluan tampilan, bisa disesuaikan
        const standardsWithData = data.map((std, index) => ({
          ...std,
          compliance: 80 + index * 5,
          controls: 40 + index * 2,
          implemented: 35 + index * 3,
        }));
        setStandards(standardsWithData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStandards();
  }, []);

  // --- Data contoh dari file Anda ---
  const controls: Control[] = [ { id: 1, name: "Kontrol Dokumen", standards: ["ISO 9001", "ISO 27001", "ISO 37001"], status: "Implemented", effectiveness: "High", compliance: 95, }, { id: 2, name: "Manajemen Risiko", standards: ["ISO 9001", "ISO 27001", "ISO 37001"], status: "Implemented", effectiveness: "High", compliance: 92, }, { id: 3, name: "Audit Internal", standards: ["ISO 9001", "ISO 27001", "ISO 37001"], status: "Implemented", effectiveness: "Medium", compliance: 88, }, { id: 4, name: "Tinjauan Manajemen", standards: ["ISO 9001", "ISO 27001", "ISO 37001"], status: "Implemented", effectiveness: "High", compliance: 90, }, { id: 5, name: "Keamanan Informasi", standards: ["ISO 27001"], status: "Partial", effectiveness: "Medium", compliance: 65, }, { id: 6, name: "Anti-Penyuapan", standards: ["ISO 37001"], status: "Implemented", effectiveness: "High", compliance: 88, }, ];
  const gaps: Gap[] = [ { id: 1, control: "Keamanan Informasi", standard: "ISO 27001:2022", clause: "A.8.1.1", description: "Inventarisasi aset informasi belum lengkap", severity: "High", impact: "Significant", dueDate: "2023-09-30", responsible: "IT Manager", status: "Open", }, { id: 2, control: "Kontrol Dokumen", standard: "ISO 27001:2022", clause: "7.5.3.2", description: "Kontrol akses digital untuk dokumen elektronik belum sepenuhnya diterapkan", severity: "Medium", impact: "Moderate", dueDate: "2023-08-15", responsible: "Document Controller", status: "In Progress", }, { id: 3, control: "Anti-Penyuapan", standard: "ISO 37001:2016", clause: "8.2", description: "Prosedur due diligence untuk mitra bisnis perlu diperkuat", severity: "Medium", impact: "Moderate", dueDate: "2023-10-15", responsible: "Compliance Officer", status: "Open", }, { id: 4, control: "Pelatihan Kesadaran", standard: "ISO 37001:2016", clause: "7.3", description: "Program pelatihan anti-penyuapan untuk semua karyawan belum lengkap", severity: "Low", impact: "Minor", dueDate: "2023-11-30", responsible: "HR Manager", status: "Planned", }, ];
  const mapping: Mapping[] = [ { id: 1, requirement: "Kontrol Dokumen", iso9001: "7.5.3", iso27001: "7.5.3", iso37001: "7.5.3", overlap: 3, }, { id: 2, requirement: "Manajemen Risiko", iso9001: "6.1", iso27001: "6.1.1", iso37001: "6.1", overlap: 3, }, { id: 3, requirement: "Audit Internal", iso9001: "9.2", iso27001: "9.2", iso37001: "9.2", overlap: 3, }, { id: 4, requirement: "Tinjauan Manajemen", iso9001: "9.3", iso27001: "9.3", iso37001: "9.3", overlap: 3, }, { id: 5, requirement: "Kompetensi", iso9001: "7.2", iso27001: "7.2", iso37001: "7.2", overlap: 3, }, { id: 6, requirement: "Anti-Penyuapan", iso9001: "", iso27001: "", iso37001: "8.2", overlap: 1, }, ];

  // --- Fungsi-fungsi lainnya dari file asli Anda ---
  const handleDelete = (type: string, id: number, name: string) => { setDeleteConfirm({ open: true, type, id, name }) };
  const confirmDelete = async () => { /* ... */ };
  const handleAddMapping = async (e: React.FormEvent) => { /* ... */ };
  const filteredMapping = mapping.filter(item => { /* ... */ });
  const getStatusColor = (status: string) => { /* ... */ };
  const getSeverityColor = (severity: string) => { /* ... */ };
  const getComplianceColor = (compliance: number) => { /* ... */ };


  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pemetaan Kepatuhan</h1>
          <div className="flex space-x-2">
            <AddControlModal />
            <AuditLogModal />
          </div>
        </div>

        {/* --- BAGIAN INI SEKARANG DINAMIS --- */}
        {isLoading ? (
            <div className="text-center">Memuat data standar...</div>
        ) : error ? (
            <div className="text-center text-red-500">{error}</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {standards.map((standard) => (
                  <Card key={standard._id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{standard.name}</CardTitle>
                      <CardDescription>Tingkat Kepatuhan</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">{standard.compliance}%</span>
                          <span className="text-sm text-muted-foreground">
                        {standard.implemented}/{standard.controls} kontrol
                      </span>
                        </div>
                        <Progress value={standard.compliance} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}
        {/* --- AKHIR BAGIAN DINAMIS --- */}


        <Tabs defaultValue="controls" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="controls">Kontrol Terintegrasi</TabsTrigger>
            <TabsTrigger value="gaps">Kesenjangan</TabsTrigger>
            <TabsTrigger value="mapping">Pemetaan Standar</TabsTrigger>
          </TabsList>

          {/* ... Sisa konten TabsContent Anda tidak diubah dan tetap menggunakan data contoh statis ... */}
          <TabsContent value="controls"><Card>{/* ... */}</Card></TabsContent>
          <TabsContent value="gaps"><Card>{/* ... */}</Card></TabsContent>
          <TabsContent value="mapping"><Card>{/* ... */}</Card></TabsContent>
        </Tabs>

        {/* ... Dialog Delete Anda tidak diubah ... */}
      </div>
  )
}