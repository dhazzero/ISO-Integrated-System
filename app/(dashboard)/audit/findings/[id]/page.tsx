"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

interface Finding {
    _id: string;  auditId: string; auditName: string; findingType: string; severity: string;
    description: string; clause: string; evidence: string; recommendation: string;
    department: string; status: string; dueDate: string; responsiblePerson: string;
}

export default function FindingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const findingId = params.id as string;
    const [finding, setFinding] = useState<Finding | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleCompleteFinding = async () => {
        if (!finding) return;
        if (!confirm("Apakah Anda yakin ingin menyelesaikan finding ini? Status akan diubah menjadi Closed.")) return;
        
        try {
            const res = await fetch(`/api/findings/${findingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Closed' })
            });
            if (!res.ok) throw new Error('Gagal menyelesaikan finding.');
            toast({ title: 'Finding Diselesaikan', description: 'Status finding berhasil diubah menjadi Closed.' });
            
            // Refresh detail finding
            setFinding({ ...finding, status: 'Closed' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        }
    };

    useEffect(() => {
        if (!findingId) return;
        const fetchFindingDetail = async () => {
            try {
                const response = await fetch(`/api/findings/${findingId}`);
                if (!response.ok) throw new Error("Gagal memuat detail temuan.");
                setFinding(await response.json());
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: (error as Error).message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchFindingDetail();
    }, [findingId, toast]);

    if (isLoading) return <div className="container p-6 text-center">Memuat detail temuan...</div>;
    if (!finding) return <div className="container p-6 text-center text-red-500">Temuan tidak ditemukan.</div>;

    const isOFI = finding.findingType === "Opportunity for Improvement";

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Link href={`/audit/${finding.auditId}`}><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <div><h1 className="text-3xl font-bold">Detail Temuan</h1><p className="text-muted-foreground">{finding.description?.substring(0, 50)}...</p></div>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/audit/findings/${finding._id}/edit`}><Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button></Link>
                    {finding.status !== 'Closed' && (
                        <Button onClick={handleCompleteFinding}><CheckCircle className="mr-2 h-4 w-4" /> Selesaikan Finding</Button>
                    )}
                </div>
            </div>
            <Card>
                <CardHeader><CardTitle>{finding.findingType}: {finding.auditName}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div><strong>Deskripsi Temuan:</strong> <p className="mt-1">{finding.description || '-'}</p></div>
                    {!isOFI && (
                        <>
                            <div><strong>Bukti / Evidence:</strong> <p className="mt-1">{finding.evidence || '-'}</p></div>
                            <div><strong>Rekomendasi:</strong> <p className="mt-1">{finding.recommendation || '-'}</p></div>
                        </>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <p><strong>Jenis Temuan:</strong> {finding.findingType || '-'}</p>
                        {!isOFI && <p><strong>Tingkat Severity:</strong> {finding.severity || '-'}</p>}
                        <p><strong>Klausul Standar:</strong> {finding.clause || '-'}</p>
                        {!isOFI && (
                            <>
                                <p><strong>Departemen:</strong> {finding.department || '-'}</p>
                                <p><strong>Penanggung Jawab:</strong> {finding.responsiblePerson || '-'}</p>
                                <p><strong>Target Penyelesaian:</strong> {finding.dueDate ? formatDate(finding.dueDate) : '-'}</p>
                            </>
                        )}
                        <p className="col-span-2"><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${finding.status === 'Closed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{finding.status || '-'}</span></p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}