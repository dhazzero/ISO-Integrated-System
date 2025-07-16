"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
// --- PERBAIKAN: Tambahkan Eye dan FileText di sini ---
import { ArrowLeft, Edit, Calendar, User, Building, Shield, Target, CheckCircle2, AlertTriangle, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { AddFindingModal } from "@/components/audit/add-finding-modal";

// Definisikan tipe data
interface Finding { _id: string; findingType: string; severity: string; description: string; clause: string; status: string; }
interface Audit { _id: string; name: string; standard: string; department: string; date: string; status: string; auditor: string; auditType: string; tujuan?: string; scope?: string; objectives?: string; criteria?: string; scheduledTime?: string; }

export default function AuditDetailPage() {
    const params = useParams();
    const router = useRouter(); // Dapatkan router
    const { toast } = useToast();
    const auditId = params.id as string;

    const [audit, setAudit] = useState<Audit | null>(null);
    const [findings, setFindings] = useState<Finding[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    const fetchAuditData = async () => {
        if (!auditId) return;
        setIsLoading(true);
        try {
            const [auditRes, findingsRes] = await Promise.all([
                fetch(`/api/audits/${auditId}`),
                fetch(`/api/findings?auditId=${auditId}`)
            ]);
            if (!auditRes.ok) throw new Error("Gagal memuat detail audit.");
            if (!findingsRes.ok) throw new Error("Gagal memuat temuan audit.");

            setAudit(await auditRes.json());
            setFindings(await findingsRes.json());
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(auditId) {
            fetchAuditData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auditId]);


    if (isLoading) return <div className="container p-6 text-center">Memuat detail audit...</div>;
    if (!audit) return <div className="container p-6 text-center text-red-500">Audit tidak ditemukan.</div>;

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Link href="/audit"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <div><h1 className="text-3xl font-bold">{audit.name}</h1></div>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href={`/audit/${audit._id}/edit`}><Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button></Link>
                </div>
            </div>

            <Tabs defaultValue="detail" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="detail">Detail Audit</TabsTrigger>
                    <TabsTrigger value="findings">Temuan ({findings.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="detail">
                    <Card>
                        <CardHeader><CardTitle>Informasi Detail</CardTitle></CardHeader>
                        <CardContent className="space-y-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Standar</p><p>{audit.standard}</p></div>
                            <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Jenis</p><p><Badge variant={audit.auditType === 'Internal' ? 'default' : 'secondary'}>{audit.auditType}</Badge></p></div>
                            <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Status</p><p>{audit.status}</p></div>
                            <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Departemen</p><p className="flex items-center"><Building className="mr-2 h-4 w-4" />{audit.department}</p></div>
                            <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Auditor</p><p className="flex items-center"><User className="mr-2 h-4 w-4" />{audit.auditor}</p></div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="findings">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Daftar Temuan</CardTitle>
                                <CardDescription>Semua temuan yang tercatat untuk audit ini.</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                                {audit.status === 'Scheduled' && (
                                    <Link href={`/audit/${audit._id}/finish`}>
                                        <Button>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Selesaikan Audit
                                        </Button>
                                    </Link>
                                )}
                                <AddFindingModal onAddFinding={fetchAuditData} audits={[audit]} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full">
                                <thead><tr className="border-b"><th className="p-4 text-left">Deskripsi</th><th className="p-4 text-left">Jenis</th><th className="p-4 text-left">Tingkat</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Aksi</th></tr></thead>
                                <tbody>
                                {findings.length > 0 ? findings.map(finding => (
                                    <tr key={finding._id} className="border-b">
                                        <td className="p-4">{finding.description}</td>
                                        <td className="p-4"><Badge variant="outline">{finding.findingType}</Badge></td>
                                        <td className="p-4"><Badge variant="destructive">{finding.severity}</Badge></td>
                                        <td className="p-4"><Badge>{finding.status}</Badge></td>
                                        <td className="p-4"><div className="flex space-x-1">
                                            <Link href={`/audit/findings/${finding._id}`}><Button variant="ghost" size="icon" title="Lihat"><Eye className="h-4 w-4" /></Button></Link>
                                            <Link href={`/audit/findings/${finding._id}/edit`}><Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button></Link>
                                        </div></td>
                                    </tr>
                                )) : (<tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Belum ada temuan.</td></tr>)}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}