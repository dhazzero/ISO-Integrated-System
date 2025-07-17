"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import AddAnnexControlModal from "./add-annex-control-modal";

export interface AnnexAControl {
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

interface AnnexAControlsProps {
    /**
     * Optional list of controls. When provided, the component will display it.
     * Otherwise it will fetch data from `/api/compliance/annex-a` on mount.
     */
    controls?: AnnexAControl[];
}

const AnnexAControls = ({ controls: initialControls }: AnnexAControlsProps) => {
    const [controls, setControls] = useState<AnnexAControl[]>(initialControls ?? []);

    const loadControls = async () => {
        try {
            const res = await fetch("/api/compliance/annex-a", { cache: "no-store" });
            if (!res.ok) throw new Error("Gagal mengambil data Annex A");
            setControls(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!initialControls || initialControls.length === 0) {
            void loadControls();
        }
    }, [initialControls]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>ISO 27001 Annex A Controls</CardTitle>
                    <CardDescription>Daftar kontrol yang terkait dengan ISO 27001</CardDescription>
                </div>
                <AddAnnexControlModal onAdded={loadControls} />
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 px-4">Nama Kontrol</th>
                            <th className="text-left py-3 px-4">Keterangan</th>
                            <th className="text-left py-3 px-4">Standar Terkait</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Efektivitas</th>
                            <th className="text-left py-3 px-4">Kepatuhan</th>
                            <th className="text-left py-3 px-4">Tindakan</th>
                        </tr>
                        </thead>
                        <tbody>
                        {controls.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center p-6 text-sm text-muted-foreground">
                                    Belum ada kontrol
                                </td>
                            </tr>
                        ) : (
                            controls.map((control) => (
                                <tr key={control._id} className="border-b hover:bg-muted/50">
                                    <td className="py-3 px-4 font-medium">
                                        <Link href={`/compliance/annex-a/${control._id}`}>{control.control_id}</Link>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-muted-foreground">
                                        {control.title || "-"}
                                    </td>
                                    <td className="py-3 px-4 text-sm">{control.standardName || '-'}</td>
                                    <td className="py-3 px-4">{control.status ? <Badge>{control.status}</Badge> : <span>-</span>}</td>
                                    <td className="py-3 px-4 text-sm">{control.effectiveness || '-'}</td>
                                    <td className="py-3 px-4 text-sm">
                                        {control.compliance ? <Badge variant="outline">{`${control.compliance}%`}</Badge> : '-'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <Link href={`/compliance/annex-a/${control._id}`}>
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/compliance/annex-a/${control._id}/edit`}>
                                                <Button size="sm" variant="outline">Edit</Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default AnnexAControls;