"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface Finding {
    _id: string; auditName: string; findingType: string; severity: string;
    description: string; clause: string; evidence: string; recommendation: string;
    department: string; status: string; dueDate: string; responsiblePerson: string;
}

export default function FindingDetailPage() {
    const params = useParams();
    const { toast } = useToast();
    const findingId = params.id as string;
    const [finding, setFinding] = useState<Finding | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Link href="/audit"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <div><h1 className="text-3xl font-bold">Detail Temuan</h1><p className="text-muted-foreground">{finding.description.substring(0, 50)}...</p></div>
                </div>
                <Link href={`/audit/findings/${finding._id}/edit`}><Button><Edit className="mr-2 h-4 w-4" /> Edit</Button></Link>
            </div>
            <Card>
                <CardHeader><CardTitle>{finding.findingType}: {finding.auditName}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <p><strong>Deskripsi:</strong> {finding.description}</p>
                    <p><strong>Bukti:</strong> {finding.evidence}</p>
                    <p><strong>Rekomendasi:</strong> {finding.recommendation}</p>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <p><strong>Tingkat:</strong> {finding.severity}</p>
                        <p><strong>Klausul:</strong> {finding.clause}</p>
                        <p><strong>Departemen:</strong> {finding.department}</p>
                        <p><strong>Penanggung Jawab:</strong> {finding.responsiblePerson}</p>
                        <p><strong>Status:</strong> {finding.status}</p>
                        <p><strong>Target Selesai:</strong> {finding.dueDate ? new Date(finding.dueDate).toLocaleDateString() : '-'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}