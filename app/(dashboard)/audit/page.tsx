"use client"

import { useState, useEffect } from "react"
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
  Building,
  Target,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { AddFindingModal } from "@/components/audit/add-finding-modal"
import { AddAuditModal } from "@/components/audit/add-audit-modal"
import { useToast } from "@/components/ui/use-toast"

// --- INTERFACES ---
interface Audit {
  _id: string;
  name: string;
  standard: string;
  department: string;
  date: string;
  status: 'Completed' | 'Scheduled';
  findings: number;
  auditor: string;
  auditType: 'Internal' | 'External';
  tujuan?: string;
}

interface Finding {
  _id: string;
  auditName: string;
  findingType: string;
  severity: string;
  description: string;
  clause: string;
  responsiblePerson: string;
  status: string;
  dueDate: string;
  department?: string;
}

export default function AuditPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [auditsRes, findingsRes] = await Promise.all([
        fetch('/api/audits'),
        fetch('/api/findings')
      ]);
      if (!auditsRes.ok) throw new Error('Gagal mengambil data audit.');
      if (!findingsRes.ok) throw new Error('Gagal mengambil data temuan.');

      setAudits(await auditsRes.json());
      setFindings(await findingsRes.json());
    } catch (error) {
      toast({ variant: "destructive", title: "Error Saat Memuat Data", description: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const normalizedStatus = (s: string) => s?.toLowerCase().trim();
  const isCompletedStatus = (s: string) => {
    const val = normalizedStatus(s);
    return val === 'completed' || val === 'selesai';
  };
  const isScheduledStatus = (s: string) => {
    const val = normalizedStatus(s);
    return val === 'scheduled' || val === 'dijadwalkan';
  };

  const auditSummary = [
    { title: "Audit Internal", count: audits.filter(a => a.auditType === 'Internal').length },
    { title: "Audit Eksternal", count: audits.filter(a => a.auditType === 'External').length },
    { title: "Selesai", count: audits.filter(a => isCompletedStatus(a.status)).length },
    { title: "Total Finding", count: findings.length },
  ];

  const handleDataAdded = () => {
    toast({ title: "Sukses!", description: "Data berhasil ditambahkan. Memuat ulang daftar..." });
    fetchData();
  };


  const getStatusIcon = (status: string) => {
    if (isCompletedStatus(status))
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <Calendar className="h-4 w-4 text-blue-500" />;
  };

  const getStatusText = (status: string) =>
    isCompletedStatus(status) ? "Selesai" : "Dijadwalkan";

  const getSeverityColor = (severity: string) => {
    if (severity === "Critical") return "bg-red-600 text-white";
    if (severity === "Major") return "bg-orange-500 text-white";
    if (severity === "Minor") return "bg-yellow-400 text-black";
    return "bg-gray-400 text-white";
  };

  const getFindingStatusColor = (status: string) => {
    if (status === "Open") return "bg-red-100 text-red-800";
    if (status === "In Progress") return "bg-yellow-100 text-yellow-800";
    if (status === "Closed") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  // --- FUNGSI UNTUK MERENDER TABEL UTAMA ---
  const AuditTable = ({ auditList }: { auditList: Audit[] }) => (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
          <tr className="border-b">
            <th className="p-4 text-left font-medium">Nama Audit</th>
            <th className="p-4 text-left font-medium">Jenis</th>
            <th className="p-4 text-left font-medium">Standar</th>
            <th className="p-4 text-left font-medium">Tanggal</th>
            <th className="p-4 text-left font-medium">Status</th>
            <th className="p-4 text-left font-medium">Aksi</th>
          </tr>
          </thead>
          <tbody>
          {auditList.length > 0 ? auditList.map((audit) => (
              <tr key={audit._id} className="border-b">
                <td className="p-4 flex items-center"><FileCheck className="mr-2 h-4 w-4 text-blue-500" />{audit.name}</td>
                <td className="p-4"><Badge variant={audit.auditType === 'Internal' ? 'default' : 'secondary'}>{audit.auditType}</Badge></td>
                <td className="p-4">{audit.standard}</td>
                <td className="p-4">{new Date(audit.date).toLocaleDateString()}</td>
                <td className="p-4"><div className="flex items-center">{getStatusIcon(audit.status)}<span className="ml-2">{getStatusText(audit.status)}</span></div></td>
                <td className="p-4">
                  <div className="flex space-x-1">
                    <Link href={`/audit/${audit._id}`}><Button title="Lihat Detail" variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link>
                    <Link href={`/audit/${audit._id}/edit`}><Button title="Edit Audit" variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></Link>
                  </div>
                </td>
              </tr>
          )) : (<tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Tidak ada data untuk ditampilkan.</td></tr>)}
          </tbody>
        </table>
      </div>
  );

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Audit</h1>
          <div className="flex space-x-2"><AddAuditModal onAddAudit={handleDataAdded} type="scheduled" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {auditSummary.map(item => <Card key={item.title}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{item.title}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{item.count}</p></CardContent></Card>)}
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Semua Audit</TabsTrigger>
            <TabsTrigger value="internal">Audit Internal</TabsTrigger>
            <TabsTrigger value="external">Audit Eksternal</TabsTrigger>
            <TabsTrigger value="scheduled">Dijadwalkan</TabsTrigger>
            <TabsTrigger value="completed">Selesai</TabsTrigger>
            <TabsTrigger value="findings">Finding Result</TabsTrigger>
          </TabsList>
          <TabsContent value="all"><Card><CardHeader><CardTitle>Semua Jadwal Audit</CardTitle></CardHeader><CardContent>{isLoading ? <p className="text-center p-4">Memuat...</p> : <AuditTable auditList={audits} />}</CardContent></Card></TabsContent>
          <TabsContent value="internal"><Card><CardHeader><CardTitle>Audit Internal</CardTitle></CardHeader><CardContent>{isLoading ? <p className="text-center p-4">Memuat...</p> : <AuditTable auditList={audits.filter(a => a.auditType === 'Internal')} />}</CardContent></Card></TabsContent>
          <TabsContent value="external"><Card><CardHeader><CardTitle>Audit Eksternal</CardTitle></CardHeader><CardContent>{isLoading ? <p className="text-center p-4">Memuat...</p> : <AuditTable auditList={audits.filter(a => a.auditType === 'External')} />}</CardContent></Card></TabsContent>
          <TabsContent value="scheduled"><Card><CardHeader><CardTitle>Audit Dijadwalkan</CardTitle></CardHeader><CardContent>{isLoading ? <p className="text-center p-4">Memuat...</p> : <AuditTable auditList={audits.filter(a => isScheduledStatus(a.status))} />}</CardContent></Card></TabsContent>
          <TabsContent value="completed"><Card><CardHeader><CardTitle>Audit Selesai</CardTitle></CardHeader><CardContent>{isLoading ? <p className="text-center p-4">Memuat...</p> : <AuditTable auditList={audits.filter(a => isCompletedStatus(a.status))} />}</CardContent></Card></TabsContent>
          <TabsContent value="findings">
            <Card>
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <div><CardTitle>Finding Result</CardTitle><CardDescription>Daftar temuan dari semua audit.</CardDescription></div>
                <AddFindingModal onAddFinding={handleDataAdded} audits={audits} />
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b">
                      <th className="p-4 text-left">Audit</th>
                      <th className="p-4 text-left">Jenis Temuan</th>
                      <th className="p-4 text-left">Tingkat</th>
                      <th className="p-4 text-left">Deskripsi</th>
                      <th className="p-4 text-left">Klausul</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Aksi</th>
                    </tr></thead>
                    <tbody>
                    {isLoading ? (<tr><td colSpan={7} className="text-center p-8">Memuat...</td></tr>) : findings.length > 0 ? findings.map((finding) => (
                        <tr key={finding._id} className="border-b hover:bg-muted/50">
                          <td className="p-4"><div className="font-medium">{finding.auditName}</div></td>
                          <td className="p-4"><Badge variant="outline">{finding.findingType}</Badge></td>
                          <td className="p-4"><Badge className={getSeverityColor(finding.severity)}>{finding.severity}</Badge></td>
                          <td className="p-4 max-w-xs truncate" title={finding.description}>{finding.description}</td>
                          <td className="p-4"><Badge variant="outline">{finding.clause}</Badge></td>
                          <td className="p-4"><Badge className={getFindingStatusColor(finding.status)}>{finding.status}</Badge></td>
                          <td className="p-4">
                            <div className="flex space-x-1">
                              <Link href={`/audit/findings/${finding._id}`}><Button title="Lihat Detail Finding" variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link>
                              <Link href={`/audit/findings/${finding._id}/edit`}><Button title="Edit Finding" variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></Link>
                            </div>
                          </td>
                        </tr>
                    )) : (<tr><td colSpan={7} className="text-center p-8 text-muted-foreground">Belum ada temuan.</td></tr>)}
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
