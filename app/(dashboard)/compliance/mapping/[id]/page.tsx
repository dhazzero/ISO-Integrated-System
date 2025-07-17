"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"

interface MappingDetail {
    _id: string
    control_id?: string
    category?: string
    title?: string
    requirement?: string
    status?: string
    pic?: string
    last_review?: string
    evidence?: string
    capa_id?: string | null
    standard?: string
    standardId?: string
    standardName?: string
    clause?: string
    version?: string
    framework?: string
}

export default function MappingDetailPage() {
    const params = useParams()
    const [record, setRecord] = useState<MappingDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/compliance/${params.id}`)
                if (res.ok) {
                    setRecord(await res.json())
                }
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [params.id])

    if (loading) {
        return <div className="p-8 text-center">Memuat data...</div>
    }

    if (!record) {
        return <div className="p-8 text-center">Data tidak ditemukan</div>
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-4">
            <div className="flex items-center space-x-2">
                <Link href="/compliance">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Detail Compliance</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{record.title || record.requirement}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {record.status && (
                        <div>
                            <span className="font-medium mr-2">Status:</span>
                            <Badge>{record.status}</Badge>
                        </div>
                    )}
                    {record.category && (
                        <div>
                            <span className="font-medium mr-2">Kategori:</span>
                            {record.category}
                        </div>
                    )}
                    {record.pic && (
                        <div>
                            <span className="font-medium mr-2">PIC:</span>
                            {record.pic}
                        </div>
                    )}
                    {record.last_review && (
                        <div>
                            <span className="font-medium mr-2">Terakhir Ditinjau:</span>
                            {record.last_review}
                        </div>
                    )}
                    {record.evidence && (
                        <div>
                            <span className="font-medium mr-2">Evidence:</span>
                            {record.evidence}
                        </div>
                    )}
                    {record.capa_id && (
                        <div>
                            <span className="font-medium mr-2">CAPA ID:</span>
                            {record.capa_id}
                        </div>
                    )}
                    {record.standardName && (
                        <div>
                            <span className="font-medium mr-2">Standard:</span>
                            {record.standardName}
                        </div>
                    )}
                    {record.clause && (
                        <div>
                            <span className="font-medium mr-2">Klausul:</span>
                            {record.clause}
                        </div>
                    )}
                    {record.version && (
                        <div>
                            <span className="font-medium mr-2">Versi:</span>
                            {record.version}
                        </div>
                    )}
                    {record.framework && (
                        <div>
                            <span className="font-medium mr-2">Framework:</span>
                            {record.framework}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}