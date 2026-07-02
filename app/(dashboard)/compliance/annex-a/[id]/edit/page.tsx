"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function AnnexADetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [formData, setFormData] = useState<ControlForm | null>(null)
    const [saving, setSaving] = useState(false)
    const router = useRouter()

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData) return
        setSaving(true)
        try {
            await fetch(`/api/compliance/annex-a/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            router.back()
        } finally {
            setSaving(false)
        }
    }

    if (!formData) {
        return <p className="p-4">Loading...</p>
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                    <Label htmlFor="control_id">Nama Kontrol</Label>
                    <Input id="control_id" value={formData.control_id} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title">Keterangan</Label>
                    <Textarea id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} rows={3} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="requirement">Requirement</Label>
                    <Textarea id="requirement" value={formData.requirement} onChange={(e) => setFormData({ ...formData, requirement: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pic">PIC</Label>
                        <Input id="pic" value={formData.pic} onChange={(e) => setFormData({ ...formData, pic: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
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
                        <Input id="effectiveness" value={formData.effectiveness} onChange={(e) => setFormData({ ...formData, effectiveness: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="compliance">Kepatuhan</Label>
                        <Input id="compliance" value={formData.compliance} onChange={(e) => setFormData({ ...formData, compliance: e.target.value })} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_review">Last Review</Label>
                    <Input id="last_review" value={formData.last_review} onChange={(e) => setFormData({ ...formData, last_review: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="evidence">Evidence</Label>
                    <Textarea id="evidence" value={formData.evidence} onChange={(e) => setFormData({ ...formData, evidence: e.target.value })} rows={3} />
                </div>
                <div className="flex space-x-2">
                    <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                </div>
            </form>
        </div>
    )
}