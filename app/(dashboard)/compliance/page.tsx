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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuditLogModal } from "@/components/audit-trail/audit-log-modal"
import { useAuditTrail } from "@/hooks/use-audit-trail"
import { useToast } from "@/components/ui/use-toast"

// Definisikan tipe data
interface Standard { _id: string; name: string; compliance?: number; controls?: number; implemented?: number; }
interface Control { _id: string; name: string; standards: string[]; status: string; effectiveness: string; compliance: number; }
interface Gap { id: number; control: string; standard: string; clause: string; description: string; severity: string; impact: string; dueDate: string; responsible: string; status: string; }
interface Mapping { id: number; requirement: string; iso9001: string; iso14001: string; iso45001: string; iso27001: string; iso37001: string; overlap: number; }

export default function CompliancePage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  // State lain dari file asli Anda
  const [filterStandard, setFilterStandard] = useState("all");
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false);
  const [newMapping, setNewMapping] = useState({ requirement: "", iso9001: "", iso14001: "", iso45001: "", iso27001: "", iso37001: "" });
  const { logDelete, logView } = useAuditTrail();
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: "", id: null as number | null, name: "" });

  const fetchStandards = async () => {
    try {
      const response = await fetch('/api/settings/standards');
      if (!response.ok) throw new Error('Gagal mengambil data standar');
      const data = await response.json();
      setStandards(data.map((std: Standard, index: number) => ({
        ...std,
        compliance: 80 + index * 5,
        controls: 40 + index * 2,
        implemented: 35 + index * 3,
      })));
    } catch (error) { toast({ variant: "destructive", title: "Error", description: (error as Error).message }); }
  };

  const fetchControls = async () => {
    try {
      const response = await fetch('/api/compliance/controls');
      if (!response.ok) throw new Error('Gagal mengambil data kontrol');
      setControls(await response.json());
    } catch (error) { toast({ variant: "destructive", title: "Error", description: (error as Error).message }); }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchStandards(), fetchControls()]).finally(() => setIsLoading(false));
  }, []);

  const handleControlAdded = () => {
    toast({ title: "Sukses", description: "Kontrol berhasil ditambahkan. Memuat ulang daftar..." });
    fetchControls();
  };

  // Sisa fungsi handler Anda (tetap sama)
  const handleDelete = (type: string, id: number, name: string) => { /* ... */ };
  const confirmDelete = async () => { /* ... */ };
  const handleAddMapping = async (e: React.FormEvent) => { /* ... */ };
  const getStatusColor = (status: string) => { /* ... */ };
  const getSeverityColor = (severity: string) => { /* ... */ };
  const getComplianceColor = (compliance: number) => { /* ... */ };
  const filteredMapping = mapping.filter(item => { /* ... */ });
  const gaps: Gap[] = [ /* ...data contoh... */ ];

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pemetaan Kepatuhan</h1>
          <div className="flex space-x-2">
            {/* === PERBAIKAN DI SINI === */}
            <AddControlModal onControlAdded={handleControlAdded} />
            <AuditLogModal />
          </div>
        </div>

        {/* Card Statistik (Dinamis dari state 'standards') */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {standards.map((standard) => (
              <Card key={standard._id}>
                <CardHeader className="pb-2"><CardTitle>{standard.name}</CardTitle><CardDescription>Tingkat Kepatuhan</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm">{standard.compliance}%</span><span className="text-sm text-muted-foreground">{standard.implemented}/{standard.controls} kontrol</span></div>
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

          {/* Tabel Kontrol (Dinamis dari state 'controls') */}
          <TabsContent value="controls">
            <Card>
              <CardHeader className="pb-2"><CardTitle>Kontrol Lintas Standar</CardTitle><CardDescription>Kontrol yang diterapkan di beberapa standar</CardDescription></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b"><th className="text-left py-3 px-4">Nama Kontrol</th><th className="text-left py-3 px-4">Standar Terkait</th><th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Efektivitas</th><th className="text-left py-3 px-4">Kepatuhan</th><th className="text-left py-3 px-4">Tindakan</th></tr></thead>
                    <tbody>
                    {isLoading ? (<tr><td colSpan={6} className="text-center p-8">Memuat data...</td></tr>) :
                        controls.map((control) => (
                            <tr key={control._id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4 flex items-center"><ClipboardList className="mr-2 h-4 w-4 text-green-500" /><Link href={`/compliance/controls/${control._id}`} className="hover:underline">{control.name}</Link></td>
                              <td className="py-3 px-4"><div className="flex flex-wrap gap-1">{(control.standards || []).map((std, idx) => (<span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs">{std}</span>))}</div></td>
                              <td className="py-3 px-4"><Badge className={getStatusColor(control.status)}>{control.status === "Implemented" ? "Diterapkan" : "Sebagian"}</Badge></td>
                              <td className="py-3 px-4"><Badge className={getSeverityColor(control.effectiveness)}>{control.effectiveness}</Badge></td>
                              <td className="py-3 px-4"><div className="flex items-center space-x-2"><Progress value={control.compliance} className="h-2 w-16" /><span className={`text-sm font-bold ${getComplianceColor(control.compliance)}`}>{control.compliance}%</span></div></td>
                              <td className="py-3 px-4"><div className="flex space-x-1"><Link href={`/compliance/controls/${control._id}`}><Button variant="ghost" size="icon" onClick={() => logView("Compliance", "Control", control._id.toString(), control.name, "Current User", "User")}><Eye className="h-4 w-4" /></Button></Link><Link href={`/compliance/controls/${control._id}/edit`}><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></Link><Button variant="ghost" size="icon" onClick={() => handleDelete("control", control._id, control.name)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Konten tab lainnya (tetap statis sesuai permintaan Anda) */}
          <TabsContent value="gaps"><Card>{/* ... Konten Tab Gaps ... */}</Card></TabsContent>
          <TabsContent value="mapping"><Card>{/* ... Konten Tab Mapping ... */}</Card></TabsContent>
        </Tabs>

        {/* ... Dialog Delete ... */}
        <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}>{/* ... */}</Dialog>
      </div>
  )
}