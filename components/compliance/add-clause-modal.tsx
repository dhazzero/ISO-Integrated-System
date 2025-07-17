"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface ControlForm {
    id: string
    title: string
    description: string
    relatedStandard: string
    status: string
    effectiveness: string
    compliance: string
}

interface AddClauseModalProps {
    onAdded: (clause: ControlForm) => void
}

export default function AddClauseModal({ onAdded }: AddClauseModalProps) {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<ControlForm>({
        id: "",
        title: "",
        description: "",
        relatedStandard: "",
        status: "not_started",
        effectiveness: "effective",
        compliance: "compliant",
    })
    const statuses = ["not_started", "in_progress", "implemented"]
    const effectivenessOptions = ["effective", "ineffective"]
    const complianceOptions = ["compliant", "partially_compliant", "non_compliant"]
    const [availableStandards, setAvailableStandards] = useState<{ _id: string; name?: string; title?: string }[]>([])

    useEffect(() => {
        const fetchStandards = async () => {
            if (!open) return
            try {
                const res = await fetch("/api/settings/standards")
                if (res.ok) {
                    const data = await res.json()
                    setAvailableStandards(data)
                }
            } catch {
                // ignore errors
            }
        }
        fetchStandards()
    }, [open])
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onAdded(form)
        setForm({
            id: "",
            title: "",
            description: "",
            relatedStandard: "",
            status: "not_started",
            effectiveness: "effective",
            compliance: "compliant",
        })
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Control
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>New Control</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="id">Control ID</Label>
                        <Input id="id" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Control Name</Label>
                        <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="relatedStandard">Standar Terkait</Label>
                        <Select
                            value={form.relatedStandard}
                            onValueChange={(v) => setForm({ ...form, relatedStandard: v })}
                        >
                            <SelectTrigger id="relatedStandard">
                                <SelectValue placeholder="Pilih standar" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableStandards.map((std) => {
                                    const name = std.name || std.title || ""
                                    return name ? (
                                        <SelectItem key={std._id} value={name}>
                                            {name}
                                        </SelectItem>
                                    ) : null
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {statuses.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="effectiveness">Efektivitas</Label>
                        <Select value={form.effectiveness} onValueChange={(v) => setForm({ ...form, effectiveness: v })}>
                            <SelectTrigger id="effectiveness"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {effectivenessOptions.map((e) => (
                                    <SelectItem key={e} value={e}>{e}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="compliance">Kepatuhan</Label>
                        <Select value={form.compliance} onValueChange={(v) => setForm({ ...form, compliance: v })}>
                            <SelectTrigger id="compliance"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {complianceOptions.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
