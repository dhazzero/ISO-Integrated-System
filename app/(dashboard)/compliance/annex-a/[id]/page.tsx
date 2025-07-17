"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Edit } from "lucide-react"

interface ControlForm {
    control_id: string
    title: string
    requirement: string
    status: string
    pic: string
    last_review: string
    evidence: string
    effectiveness: string
    compliance: string
}

const statuses = ["Implemented", "Partial", "Not Implemented", "Under Review"]

export default function AnnexAControlView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [formData, setFormData] = useState<ControlForm | null>(null)

    useEffect(() => {
        const load = async () => {
            const res = await fetch(`/api/compliance/annex-a/${id}`)
            if (res.ok) {
                const data = await res.json()
                setFormData({
                    control_id: data.control_id || "",
                    title: data.title || "",
                    requirement: data.requirement || "",
                    status: data.status || "",
                    pic: data.pic || "",
                    last_review: data.last_review || "",
                    evidence: data.evidence || "",
                    effectiveness: data.effectiveness || "",
                    compliance: data.compliance || "",
                })
            }
        }
        void load()
    }, [id])

    if (!formData) {
        return <p className="p-4">Loading...</p>
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/compliance">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{formData.control_id}</h1>
                </div>
                <Link href={`/compliance/annex-a/${id}/edit`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                </Link>
            </div>

            <form className="space-y-4 max-w-xl">
                <div className="space-y-2">
                    <Label htmlFor="title">Keterangan</Label>
                    <Textarea id="title" value={formData.title} disabled rows={3} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="requirement">Requirement</Label>
                    <Textarea id="requirement" value={formData.requirement} disabled rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pic">PIC</Label>
                        <Input id="pic" value={formData.pic} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} disabled>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {statuses.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="effectiveness">Efektivitas</Label>
                        <Input id="effectiveness" value={formData.effectiveness} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="compliance">Kepatuhan</Label>
                        <Input id="compliance" value={formData.compliance} disabled />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_review">Last Review</Label>
                    <Input id="last_review" value={formData.last_review} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="evidence">Evidence</Label>
                    <Textarea id="evidence" value={formData.evidence} disabled rows={3} />
                </div>
            </form>
        </div>
    )
}