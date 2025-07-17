"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ControlItem {
  _id: string;
  name?: string;
  relatedStandards?: string[];
  status?: string;
  effectiveness?: string;
  compliance?: string;
  documentIds?: string[];
  pic?: string;
  last_review?: string;
}

interface AnnexItem {
  _id: string;
  control_id: string;
  title?: string;
  requirement?: string;
  status?: string;
  pic?: string;
  last_review?: string;
  evidence?: string;
  standardName?: string;
}

export default function EvidenceManagement() {
  const [controls, setControls] = useState<ControlItem[]>([]);
  const [annex, setAnnex] = useState<AnnexItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          fetch("/api/compliance/controls", { cache: "no-store" }),
          fetch("/api/compliance/annex-a", { cache: "no-store" }),
        ]);
        if (cRes.ok) setControls(await cRes.json());
        if (aRes.ok) setAnnex(await aRes.json());
      } catch {
        // ignore
      }
    };
    void load();
  }, []);

  const rows = useMemo(() => {
    const list: any[] = [];
    controls.forEach((c) => {
      list.push({
        id: c._id,
        source: "Checklist",
        item: c.name || "-",
        pic: c.pic || "-",
        lastReview: c.last_review || "-",
        evidenceCount: Array.isArray(c.documentIds) ? c.documentIds.length : 0,
        editHref: `/compliance/controls/${c._id}`,
      });
    });
    annex.forEach((a) => {
      list.push({
        id: a._id,
        source: "Annex A",
        item: `${a.control_id} ${a.title ? `- ${a.title}` : ""}`.trim(),
        pic: a.pic || "-",
        lastReview: a.last_review || "-",
        evidenceCount: a.evidence ? 1 : 0,
        editHref: `/compliance/annex-a/${a._id}`,
      });
    });
    return list;
  }, [controls, annex]);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Evidence Management</CardTitle>
          <CardDescription>Kelola dan telusuri evidence yang terhubung ke kontrol</CardDescription>
        </div>
        <div className="flex gap-2">
          {/* Placeholder action: link to create/upload evidence page if exists; otherwise just a disabled button */}
          <Button variant="outline" disabled>Upload Evidence</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Sumber</th>
                <th className="text-left py-2 px-3">Item</th>
                <th className="text-left py-2 px-3">PIC</th>
                <th className="text-left py-2 px-3">Last Review</th>
                <th className="text-left py-2 px-3">Evidence Terhubung</th>
                <th className="text-left py-2 px-3">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-muted-foreground">Belum ada data evidence</td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={`${r.source}-${r.id}`} className="border-b">
                    <td className="py-2 px-3">{r.source}</td>
                    <td className="py-2 px-3">{r.item}</td>
                    <td className="py-2 px-3">{r.pic}</td>
                    <td className="py-2 px-3">{r.lastReview}</td>
                    <td className="py-2 px-3">{r.evidenceCount}</td>
                    <td className="py-2 px-3">
                      <Link href={r.editHref} className="underline text-primary">Edit</Link>
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
