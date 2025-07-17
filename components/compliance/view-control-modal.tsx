"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye } from "lucide-react";

interface ControlForm {
    _id: string;
    name: string;
    description: string;
    relatedStandards: string[];
    status: string;
    effectiveness: string;
    compliance: string;
    documentIds: string[];
}

interface DocumentOption {
    id: string;
    name: string;
}

export function ViewControlModal({ control }: { control: ControlForm }) {
    const [open, setOpen] = useState(false);
    const [documents, setDocuments] = useState<DocumentOption[]>([]);
    const statuses = ["Belum Diterapkan", "Dalam Tinjauan", "Sebagian", "Diterapkan"];
    const effectivenessOptions = ["Tinggi", "Sedang", "Rendah"];

    useEffect(() => {
        if (!open || !control.documentIds?.length) return;
        const load = async () => {
            try {
                const res = await fetch("/api/documents", { cache: "no-store" });
                if (res.ok) {
                    const docs: DocumentOption[] = await res.json();
                    setDocuments(docs.filter((d) => control.documentIds.includes(d.id)));
                }
            } catch {
                // ignore errors
            }
        };
        void load();
    }, [open, control.documentIds]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Detail Control</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-2">
                        <Label htmlFor="id">Control ID</Label>
                        <Input id="id" value={control._id} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Control Name</Label>
                        <Input id="name" value={control.name} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Standar Terkait</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                            {control.relatedStandards && control.relatedStandards.length > 0 ? (
                                control.relatedStandards.map((std) => (
                                    <div key={std} className="flex items-center space-x-2">
                                        <Checkbox checked disabled />
                                        <Label>{std}</Label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">Tidak ada standar</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" rows={3} value={control.description} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={control.status} disabled>
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
                        <Select value={control.effectiveness} disabled>
                            <SelectTrigger id="effectiveness"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {effectivenessOptions.map((e) => (
                                    <SelectItem key={e} value={e}>{e}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="compliance">Kepatuhan (%)</Label>
                        <Input id="compliance" type="number" value={control.compliance} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Dokumen Terkait</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                            {documents.length > 0 ? (
                                documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center space-x-2">
                                        <Checkbox checked disabled />
                                        <Label>{doc.name}</Label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">Tidak ada dokumen</p>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ViewControlModal;