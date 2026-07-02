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
import { Checkbox } from "@/components/ui/checkbox"
import { Edit } from "lucide-react"

interface ControlForm {
    _id: string
    name: string
    description: string
    relatedStandards: string[]
    status: string
    effectiveness: string
    compliance: string
    documentIds: string[]
}

interface EditControlModalProps {
    control: ControlForm
    onUpdated: (control: ControlForm) => void
}

interface DocumentOption {
    id: string
    name: string
}

const normalizeControl = (c: ControlForm): ControlForm => ({
    _id: c._id || "",
    name: c.name || "",
    description: c.description || "",
    relatedStandards: c.relatedStandards || [],
    status: c.status || "",
    effectiveness: c.effectiveness || "",
    compliance: c.compliance !== undefined ? String(c.compliance) : "",
    documentIds: c.documentIds || [],
})

export function EditControlModal({ control, onUpdated }: EditControlModalProps) {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<ControlForm>(normalizeControl(control))
    const statuses = ["Belum Diterapkan", "Dalam Tinjauan", "Sebagian", "Diterapkan"]
    const effectivenessOptions = ["Tinggi", "Sedang", "Rendah"]
    const [availableStandards, setAvailableStandards] = useState<{ _id: string; name?: string; title?: string }[]>([])
    const [availableDocuments, setAvailableDocuments] = useState<DocumentOption[]>([])
    const [selectedDocsMap, setSelectedDocsMap] = useState<Record<string, boolean>>({})
    const [selectedStandardsMap, setSelectedStandardsMap] = useState<Record<string, boolean>>({})

    useEffect(() => {
        const fetchOptions = async () => {
            if (!open) return
            try {
                const [stdRes, docRes] = await Promise.all([
                    fetch('/api/settings/standards', { cache: 'no-store' }),
                    fetch('/api/documents', { cache: 'no-store' }),
                ])
                if (!stdRes.ok || !docRes.ok) return
                const stdData: { _id: string; name?: string; title?: string }[] = await stdRes.json()
                const docData: DocumentOption[] = await docRes.json()
                setAvailableStandards(stdData)
                setAvailableDocuments(docData)
                const docMap: Record<string, boolean> = {}
                docData.forEach((d: DocumentOption) => {
                    docMap[d.id] = control.documentIds?.includes(d.id) ?? false
                })
                setSelectedDocsMap(docMap)
                const stdMap: Record<string, boolean> = {}
                stdData.forEach((s: { name?: string; title?: string }) => {
                    const name = s.name || s.title || ""
                    if (name) {
                        stdMap[name] = control.relatedStandards?.includes(name) ?? false
                    }
                })
                setSelectedStandardsMap(stdMap)
            } catch {
                // ignore
            }
        }
        fetchOptions()
    }, [open, control.documentIds, control.relatedStandards])

    useEffect(() => {
        setForm(normalizeControl(control))
    }, [control])

    const handleDocChange = (id: string, checked: boolean | 'indeterminate') => {
        const val = typeof checked === 'boolean' ? checked : false
        setSelectedDocsMap(prev => ({ ...prev, [id]: val }))
    }

    const handleStandardChange = (name: string, checked: boolean | 'indeterminate') => {
        const val = typeof checked === 'boolean' ? checked : false
        setSelectedStandardsMap(prev => ({ ...prev, [name]: val }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const finalDocs = Object.entries(selectedDocsMap)
            .filter(([, sel]) => sel)
            .map(([id]) => id)
        const finalStandards = Object.entries(selectedStandardsMap)
            .filter(([, sel]) => sel)
            .map(([name]) => name)
        const payload = { ...form, documentIds: finalDocs, relatedStandards: finalStandards }
        try {
            const res = await fetch(`/api/compliance/controls/${form._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (res.ok) {
                const updated = await res.json()
                setForm(updated)
                onUpdated(updated)
            }
        } catch {
            // ignore
        } finally {
            setOpen(false)
            setSelectedDocsMap({})
            setSelectedStandardsMap({})
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Control</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="id">Control ID</Label>
                        <Input id="id" value={form._id} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Control Name</Label>
                        <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Standar Terkait</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                            {availableStandards.map((std) => {
                                const name = std.name || std.title || ""
                                return name ? (
                                    <div key={std._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`std-${std._id}`}
                                            checked={selectedStandardsMap[name] || false}
                                            onCheckedChange={(checked) => handleStandardChange(name, checked)}
                                        />
                                        <Label htmlFor={`std-${std._id}`}>{name}</Label>
                                    </div>
                                ) : null
                            })}
                        </div>
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
                            <SelectTrigger id="status"><SelectValue placeholder="Pilih status" /></SelectTrigger>
                            <SelectContent>
                                {statuses.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="effectiveness">Efektivitas</Label>
                        <Select value={form.effectiveness} onValueChange={(v) => setForm({ ...form, effectiveness: v })}>
                            <SelectTrigger id="effectiveness"><SelectValue placeholder="Pilih efektivitas" /></SelectTrigger>
                            <SelectContent>
                                {effectivenessOptions.map((e) => (
                                    <SelectItem key={e} value={e}>
                                        {e}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="compliance">Kepatuhan (%)</Label>
                        <Input
                            id="compliance"
                            type="number"
                            value={form.compliance}
                            onChange={(e) => setForm({ ...form, compliance: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Dokumen Terkait</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                            {availableDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`doc-${doc.id}`}
                                        checked={selectedDocsMap[doc.id] || false}
                                        onCheckedChange={(checked) => handleDocChange(doc.id, checked)}
                                    />
                                    <Label htmlFor={`doc-${doc.id}`}>{doc.name}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
