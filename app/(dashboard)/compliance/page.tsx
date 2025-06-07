// app/(dashboard)/compliance/page.tsx
"use client"

import { useState, useEffect } from "react" // Tambah useEffect
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Eye, Edit, Filter, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { AddControlModal } from "@/components/compliance/add-control-modal" //
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
import { AuditLogModal } from "@/components/audit-trail/audit-log-modal" //
import { useAuditTrail } from "@/hooks/use-audit-trail" //
import { useToast } from "@/components/ui/use-toast" //

// Definisikan tipe untuk Control dan Gap
interface Control {
  _id: string;
  name: string;
  relatedStandards: string[]; // Sebelumnya 'standards'
  status: string;
  effectiveness: string;
  compliance: number; // Ini mungkin perlu dihitung atau disimpan
}

interface Gap {
  _id: string; // Ganti id ke _id jika dari MongoDB
  control: string; // Bisa jadi ID kontrol atau nama kontrol
  standard: string;
  clause: string;
  description: string;
  severity: string;
  impact: string;
  dueDate: string;
  responsible: string;
  status: string;
}

interface StandardMapping {
  _id: string; // Ganti id ke _id jika dari MongoDB
  requirement: string;
  iso9001?: string;
  iso14001?: string;
  iso45001?: string;
  iso27001?: string;
  iso37001?: string;
  overlap: number;
}


export default function CompliancePage() {
  const [filterStandard, setFilterStandard] = useState("all");
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Untuk loading umum
  const [areControlsLoading, setAreControlsLoading] = useState(true); // Loading spesifik kontrol
  const [newMapping, setNewMapping] = useState({ /* ... */ }); //

  const { logDelete, logView } = useAuditTrail(); //
  const { toast } = useToast(); //

  const [standardsSummary, setStandardsSummary] = useState([ // Mungkin perlu diambil dari API juga
    { id: 1, name: "ISO 27001:2022", compliance: 0, controls: 0, implemented: 0 },
    { id: 2, name: "ISO 9001:2015", compliance: 0, controls: 0, implemented: 0 },
    { id: 3, name: "ISO 37001:2016", compliance: 0, controls: 0, implemented: 0 },
  ]);

  const [controls, setControls] = useState<Control[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]); // Data Gaps juga sebaiknya dari API
  const [mapping, setMapping] = useState<StandardMapping[]>([]); // Data Mapping juga sebaiknya dari API


  // Fungsi untuk fetch Controls
  const fetchControls = async () => {
    setAreControlsLoading(true);
    try {
      const response = await fetch('/api/compliance/controls');
      if(!response.ok) throw new Error("Gagal mengambil data kontrol");
      const data = await response.json();
      setControls(data.map((c:any) => ({...c, id: c._id}))); // Map _id ke id jika perlu
    } catch (error) {
      toast({variant: "destructive", title: "Error", description: "Tidak dapat memuat kontrol."});
      console.error("Error fetching controls:", error);
    } finally {
      setAreControlsLoading(false);
    }
  };

  // TODO: Buat fungsi fetchGaps dan fetchMapping serupa jika data tersebut dari API

  useEffect(() => {
    fetchControls();
    // fetchGaps();
    // fetchMapping();
    // Ambil data Gaps dan Mapping juga di sini jika dari API
    // Untuk contoh, data Gaps dan Mapping tetap hardcoded untuk saat ini
    setGaps([ // Placeholder, ganti dengan fetch dari API
      {_id: "1", control: "Keamanan Informasi", standard: "ISO 27001:2022", clause: "A.8.1.1", description: "Inventarisasi aset informasi belum lengkap", severity: "High", impact: "Significant", dueDate: "2023-09-30", responsible: "IT Manager", status: "Open"},
      // ... data gaps lainnya
    ]);
    setMapping([ // Placeholder, ganti dengan fetch dari API
      {_id: "1", requirement: "Kontrol Dokumen", iso9001: "7.5.3", iso27001: "7.5.3", iso37001: "7.5.3", overlap: 3},
      // ... data mapping lainnya
    ]);
  }, []);

  const handleControlAdded = (newControl: Control) => {
    // Cara 1: Optimistic update
    // setControls(prev => [...prev, newControl]);
    // Cara 2: Re-fetch (lebih aman untuk konsistensi data)
    fetchControls();
    toast({ title: "Informasi", description: "Daftar kontrol diperbarui." });
  };


  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: "", id: null as string | null, name: "" });

  const handleDelete = (type: "control" | "gap" | "mapping", id: string, name: string) => { //
    setDeleteConfirm({ open: true, type, id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    setIsLoading(true);
    const { type, id, name } = deleteConfirm;

    try {
      // Simulasi API delete
      // await fetch(`/api/compliance/${type}s/${id}`, { method: 'DELETE' });
      await new Promise(resolve => setTimeout(resolve, 500));

      if (type === "control") {
        setControls(prev => prev.filter(c => c._id !== id));
        logDelete("Compliance", "Control", id.toString(), name, controls.find(c=>c._id === id), "Admin User", "System Administrator"); //
      } else if (type === "gap") {
        setGaps(prev => prev.filter(g => g._id !== id));
        // logDelete Gaps
      } else if (type === "mapping") {
        setMapping(prev => prev.filter(m => m._id !== id));
        // logDelete Mapping
      }
      toast({ title: "Sukses", description: `${type === "control" ? "Kontrol" : type === "gap" ? "Kesenjangan" : "Pemetaan"} "${name}" berhasil dihapus.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: `Gagal menghapus ${type}.` });
    } finally {
      setIsLoading(false);
      setDeleteConfirm({ open: false, type: "", id: null, name: "" });
    }
  };

  const handleAddMapping = async (e: React.FormEvent) => { /* ... */ }; //

  const filteredMapping = mapping.filter(item => { /* ... */ }); //

  const getStatusColor = (status: string) => { /* ... */ }; //
  const getSeverityColor = (severity: string) => { /* ... */ }; //
  const getComplianceColor = (compliance: number) => { /* ... */ }; //

  // ... (sisa UI dari CompliancePage)
  // Pastikan memanggil AddControlModal dengan prop onControlAdded
  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pemetaan Kepatuhan</h1>
          <div className="flex space-x-2">
            <AddControlModal onControlAdded={handleControlAdded} /> {/* Tambahkan prop ini */}
            <AuditLogModal />
          </div>
        </div>

        {/* ... Card Statistik ... */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {standardsSummary.map((standard) => (
              <Card key={standard.id}>
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


        <Tabs defaultValue="controls" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="controls">Kontrol Terintegrasi</TabsTrigger>
            <TabsTrigger value="gaps">Kesenjangan</TabsTrigger>
            <TabsTrigger value="mapping">Pemetaan Standar</TabsTrigger>
          </TabsList>

          <TabsContent value="controls">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Kontrol Lintas Standar</CardTitle>
                <CardDescription>Kontrol yang diterapkan di beberapa standar</CardDescription>
              </CardHeader>
              <CardContent>
                {areControlsLoading ? (
                    <div className="flex justify-center items-center p-8"><Progress value={50} className="w-1/2" /> <p className="ml-2">Memuat kontrol...</p></div>
                ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Nama Kontrol</th>
                          <th className="text-left py-3 px-4">Standar Terkait</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Efektivitas</th>
                          <th className="text-left py-3 px-4">Kepatuhan</th>
                          <th className="text-left py-3 px-4">Tindakan</th>
                        </tr>
                        </thead>
                        <tbody>
                        {controls.map((control) => (
                            <tr key={control._id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4 flex items-center">
                                <ClipboardList className="mr-2 h-4 w-4 text-green-500" />
                                <Link href={`/compliance/controls/${control._id}`} className="hover:underline">
                                  {control.name}
                                </Link>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {(control.relatedStandards || []).map((std, idx) => ( // Ganti control.standards ke control.relatedStandards
                                      <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs">
                                  {std}
                                </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4"><Badge className={getStatusColor(control.status)}>{control.status === "Implemented" ? "Diterapkan" : control.status === "Partial" ? "Sebagian" : control.status}</Badge></td>
                              <td className="py-3 px-4"><Badge className={getSeverityColor(control.effectiveness)}>{control.effectiveness === "High" ? "Tinggi" : control.effectiveness === "Medium" ? "Sedang" : "Rendah"}</Badge></td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <Progress value={control.compliance || 0} className="h-2 w-16" />
                                  <span className={`text-sm font-bold ${getComplianceColor(control.compliance || 0)}`}>
                                {control.compliance || 0}%
                              </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-1">
                                  <Link href={`/compliance/controls/${control._id}`}>
                                    <Button variant="ghost" size="icon" onClick={() => logView("Compliance", "Control", control._id.toString(), control.name, "Current User", "User")}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Link href={`/compliance/controls/${control._id}/edit`}>
                                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                  </Link>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete("control", control._id, control.name)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* ... TabsContent lainnya ... */}
        </Tabs>
        {/* ... Dialog Delete ... */}
        <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus{" "}
                {deleteConfirm.type === "control" ? "kontrol" : deleteConfirm.type === "gap" ? "kesenjangan" : "pemetaan"}{" "}
                "{deleteConfirm.name}"?
                <br />
                <span className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, type: "", id: null, name: "" })}>
                Batal
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
                {isLoading ? "Menghapus..." : "Hapus"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}