"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, User, Building, Shield, Target } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface Audit {
    _id: string;
    name: string;
    standard: string;
    department: string;
    date: string;
    status: string;
    auditor: string;
    auditType: string;
    tujuan?: string;
    scope?: string;
    objectives?: string;
    criteria?: string;
    scheduledTime?: string;
}

export default function AuditDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const auditId = params.id as string;

    const [audit, setAudit] = useState<Audit | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!auditId) return;
        const fetchAuditDetail = async () => {
            try {
                const response = await fetch(`/api/audits/${auditId}`);
                if (!response.ok) throw new Error("Gagal memuat detail audit.");
                const data = await response.json();
                setAudit(data);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: (error as Error).message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchAuditDetail();
    }, [auditId, toast]);

    if (isLoading) {
        return <div className="container mx-auto p-6 text-center">Memuat detail audit...</div>;
    }

    if (!audit) {
        return <div className="container mx-auto p-6 text-center text-red-500">Gagal memuat audit atau audit tidak ditemukan.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Link href="/audit"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <div><h1 className="text-3xl font-bold">{audit.name}</h1><p className="text-muted-foreground">Detail Audit ID: {audit._id}</p></div>
                </div>
                <Link href={`/audit/${audit._id}/edit`}><Button><Edit className="mr-2 h-4 w-4" /> Edit Audit</Button></Link>
            </div>

            <Card>
                <CardHeader><CardTitle>Informasi Detail Audit</CardTitle><CardDescription>Rincian dari jadwal audit yang dipilih.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Nama Audit</p><p>{audit.name}</p></div>
                        <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Standar</p><p>{audit.standard}</p></div>
                        <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Jenis Audit</p><p><Badge variant={audit.auditType === 'Internal' ? 'default' : 'secondary'}>{audit.auditType}</Badge></p></div>
                        <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Tanggal & Waktu</p><p className="flex items-center"><Calendar className="mr-2 h-4 w-4" />{new Date(audit.date).toLocaleDateString()} {audit.scheduledTime && `pukul ${audit.scheduledTime}`}</p></div>
                        <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Status</p><p>{audit.status}</p></div>
                        <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">{audit.auditType === 'Internal' ? 'Departemen' : 'Lembaga'}</p><p className="flex items-center"><Building className="mr-2 h-4 w-4" />{audit.auditType === 'Internal' ? audit.department : audit.auditor}</p></div>
                        <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Auditor</p><p className="flex items-center"><User className="mr-2 h-4 w-4" />{audit.auditor}</p></div>
                        {audit.auditType === 'External' && <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Tujuan</p><p className="flex items-center"><Target className="mr-2 h-4 w-4" />{audit.tujuan || '-'}</p></div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}