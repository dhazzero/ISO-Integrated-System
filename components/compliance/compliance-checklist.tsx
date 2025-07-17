"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddControlModal } from "@/components/compliance/add-control-modal";
import { EditControlModal } from "@/components/compliance/edit-control-modal";
import ViewControlModal from "@/components/compliance/view-control-modal";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Control {
    _id: string
    name: string
    description?: string
    relatedStandards?: string[]
    status?: string
    effectiveness?: string
    compliance?: string
    documentIds?: string[]
}

export default function ComplianceChecklist() {
    const [items, setItems] = useState<Control[]>([])


    const loadControls = async () => {
        try {
            const res = await fetch("/api/compliance/controls", { cache: "no-store" })
            if (res.ok) {
                const data = await res.json()
                setItems(data)
            }
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        loadControls()
    }, [])

    const handleAdd = (_control: Control) => {
        // Reload full list to ensure table reflects latest saved values
        loadControls()
    }

    const handleUpdate = (_updated: Control) => {
        // Fetch fresh data after edits so main tab shows current information
        loadControls()
    }

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/compliance/controls/${id}`, { method: 'DELETE' });
            loadControls();
        } catch {
            // ignore
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Compliance Checklist</CardTitle>
                    <CardDescription>
                        Kontrol yang diterapkan di beberapa standar
                    </CardDescription>
                </div>
                <AddControlModal onControlAdded={handleAdd} />
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No controls defined yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-3">Nama Kontrol</th>
                                <th className="text-left py-2 px-3">Standar Terkait</th>
                                <th className="text-left py-2 px-3">Status</th>
                                <th className="text-left py-2 px-3">Efektivitas</th>
                                <th className="text-left py-2 px-3">Kepatuhan</th>
                                <th className="text-left py-2 px-3">Tindakan</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((clause) => (
                                <tr key={clause._id} className="border-b">
                                    <td className="py-2 px-3 font-medium">{clause.name}</td>
                                    <td className="py-2 px-3">{clause.relatedStandards?.join(", ") || "-"}</td>
                                    <td className="py-2 px-3">
                                        {clause.status && <Badge variant="outline">{clause.status}</Badge>}
                                    </td>
                                    <td className="py-2 px-3">{clause.effectiveness || "-"}</td>
                                    <td className="py-2 px-3">
                                        {clause.compliance ? <Badge variant="outline">{`${clause.compliance}%`}</Badge> : "-"}
                                    </td>
                                    <td className="py-2 px-3 flex space-x-2">
                                        <ViewControlModal control={clause} />
                                        <EditControlModal control={clause} onUpdated={handleUpdate} />
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(clause._id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
