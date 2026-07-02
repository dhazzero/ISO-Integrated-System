"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface StandardAssessmentProps {
    standard: string
    onStandardChange?: (value: string) => void
    standards?: { value: string; label: string }[]
}

interface ControlItem {
    _id: string
    name?: string
    relatedStandards?: string[]
    status?: string
    effectiveness?: string
    compliance?: string
    documentIds?: string[]
    pic?: string
    last_review?: string
}

interface AnnexItem {
    _id: string
    control_id: string
    title?: string
    requirement?: string
    status?: string
    pic?: string
    last_review?: string
    evidence?: string
    standardName?: string
    effectiveness?: string
    compliance?: string
}

const StandardAssessment = ({ standard, onStandardChange, standards }: StandardAssessmentProps) => {
    const [stdOptions, setStdOptions] = useState<{ value: string; label: string }[]>(standards ?? [])
    const [selected, setSelected] = useState<string>(standard)
    const [controls, setControls] = useState<ControlItem[]>([])
    const [annex, setAnnex] = useState<AnnexItem[]>([])

    useEffect(() => {
        // Load standards list if not provided
        const loadStandards = async () => {
            if (stdOptions.length > 0) return
            try {
                const res = await fetch("/api/settings/standards")
                if (res.ok) {
                    const data = await res.json()
                    const opts = data.map((s: any) => ({ value: s.name || s.title, label: s.name || s.title }))
                    setStdOptions(opts)
                    if (!selected && opts.length) setSelected(opts[0].value)
                }
            } catch {
                // ignore
            }
        }
        void loadStandards()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const load = async () => {
            try {
                const [cRes, aRes] = await Promise.all([
                    fetch("/api/compliance/controls", { cache: "no-store" }),
                    fetch("/api/compliance/annex-a", { cache: "no-store" }),
                ])
                if (cRes.ok) setControls(await cRes.json())
                if (aRes.ok) setAnnex(await aRes.json())
            } catch {
                // ignore
            }
        }
        void load()
    }, [])

    const items = useMemo(() => {
        const sel = selected
        const relatedControls = controls.filter((c) => (c.relatedStandards || []).includes(sel))
        const relatedAnnex = annex.filter((a) => a.standardName === sel)
        return { relatedControls, relatedAnnex }
    }, [controls, annex, selected])

    const total = items.relatedControls.length + items.relatedAnnex.length
    const implementedStatuses = ["Diterapkan", "Diterapkan / Implemented", "Implemented"]
    const implemented = [...items.relatedControls, ...items.relatedAnnex].filter((x: any) => implementedStatuses.includes(x.status || "")).length
    const compliancePct = total ? Math.round((implemented / total) * 100) : 0

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle>Assessment</CardTitle>
                        <CardDescription>Pilih standar untuk melihat kontrol terkait dan status penerapannya</CardDescription>
                    </div>
                    <div className="w-[260px]">
                        <Select value={selected} onValueChange={(v) => { setSelected(v); onStandardChange?.(v) }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Standar" />
                            </SelectTrigger>
                            <SelectContent>
                                {stdOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                    Kepatuhan: <span className="font-medium text-foreground">{compliancePct}%</span> ({implemented}/{total} diterapkan)
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 px-3">Item</th>
                            <th className="text-left py-2 px-3">Sumber</th>
                            <th className="text-left py-2 px-3">Status</th>
                            <th className="text-left py-2 px-3">Efektivitas</th>
                            <th className="text-left py-2 px-3">Kepatuhan</th>
                            <th className="text-left py-2 px-3">PIC</th>
                            <th className="text-left py-2 px-3">Last Review</th>
                            <th className="text-left py-2 px-3">Evidence</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.relatedControls.map((c) => (
                            <tr key={c._id} className="border-b">
                                <td className="py-2 px-3">{c.name || '-'}</td>
                                <td className="py-2 px-3">Checklist</td>
                                <td className="py-2 px-3">{c.status ? <Badge variant="outline">{c.status}</Badge> : '-'}</td>
                                <td className="py-2 px-3">{c.effectiveness || '-'}</td>
                                <td className="py-2 px-3">{c.compliance ? `${c.compliance}%` : '-'}</td>
                                <td className="py-2 px-3">{c.pic || '-'}</td>
                                <td className="py-2 px-3">{c.last_review || '-'}</td>
                                <td className="py-2 px-3">{Array.isArray(c.documentIds) ? c.documentIds.length : 0}</td>
                            </tr>
                        ))}
                        {items.relatedAnnex.map((a) => (
                            <tr key={a._id} className="border-b">
                                <td className="py-2 px-3">{a.control_id} {a.title ? `- ${a.title}` : ''}</td>
                                <td className="py-2 px-3">Annex A</td>
                                <td className="py-2 px-3">{a.status ? <Badge variant="outline">{a.status}</Badge> : '-'}</td>
                                <td className="py-2 px-3">{a.effectiveness || '-'}</td>
                                <td className="py-2 px-3">{a.compliance || '-'}</td>
                                <td className="py-2 px-3">{a.pic || '-'}</td>
                                <td className="py-2 px-3">{a.last_review || '-'}</td>
                                <td className="py-2 px-3">{a.evidence ? 1 : 0}</td>
                            </tr>
                        ))}
                        {total === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center p-6 text-muted-foreground">Tidak ada item untuk standar ini.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

export default StandardAssessment