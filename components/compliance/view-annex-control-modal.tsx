"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Control {
    _id: string;
    name: string;
    description?: string;
    relatedStandards?: string[];
    status?: string;
    effectiveness?: string;
    compliance?: string;
    documentIds?: string[];
}

export function ViewControlModal({ control }: { control: Control }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Detail Kontrol</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 text-sm">
                    <div>
                        <strong>Nama:</strong> {control.name}
                    </div>
                    {control.description && (
                        <div>
                            <strong>Deskripsi:</strong> {control.description}
                        </div>
                    )}
                    <div>
                        <strong>Standar Terkait:</strong> {control.relatedStandards?.join(", ") || "-"}
                    </div>
                    {control.status && (
                        <div>
                            <strong>Status:</strong> {control.status}
                        </div>
                    )}
                    {control.effectiveness && (
                        <div>
                            <strong>Efektivitas:</strong> {control.effectiveness}
                        </div>
                    )}
                    {control.compliance && (
                        <div>
                            <strong>Kepatuhan:</strong> {control.compliance}%
                        </div>
                    )}
                    {control.documentIds && control.documentIds.length > 0 && (
                        <div>
                            <strong>Dokumen:</strong> {control.documentIds.join(", ")}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ViewControlModal;