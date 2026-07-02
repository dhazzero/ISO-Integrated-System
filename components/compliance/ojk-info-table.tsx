"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface OjkInfoItem {
    _id: string;
    title?: string;
    status?: string;
    effectiveness?: string;
    compliance?: string;
}

export default function OjkInfoTable() {
    const [items, setItems] = useState<OjkInfoItem[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/compliance/ojk", { cache: "no-store" });
                if (res.ok) setItems(await res.json());
            } catch {
                // ignore errors
            }
        };
        void load();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pelaporan Regulasi</CardTitle>
                <CardDescription>Daftar pelaporan kepatuhan regulasi</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-3">Nama</th>
                                <th className="text-left py-2 px-3">Status</th>
                                <th className="text-left py-2 px-3">Efektivitas</th>
                                <th className="text-left py-2 px-3">Kepatuhan</th>
                                <th className="text-left py-2 px-3">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-6 text-muted-foreground">
                                        Belum ada data
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item._id} className="border-b">
                                        <td className="py-2 px-3 font-medium">{item.title || "-"}</td>
                                        <td className="py-2 px-3">{item.status ? <Badge>{item.status}</Badge> : "-"}</td>
                                        <td className="py-2 px-3">{item.effectiveness || "-"}</td>
                                        <td className="py-2 px-3">
                                            {item.compliance ? (
                                                <Badge variant="outline">{`${item.compliance}%`}</Badge>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="py-2 px-3">
                                            <Link href={`/compliance/ojk/${item._id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
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
}
