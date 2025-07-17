"use client";

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
}

interface AnnexItem {
  _id: string;
  control_id: string;
  title?: string;
  standardName?: string;
  status?: string;
  effectiveness?: string;
  compliance?: string;
  evidence?: string;
}

const implementedStatuses = ["Diterapkan", "Diterapkan / Implemented", "Implemented"];

function toCsv(rows: any[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  return lines.join("\n");
}

function downloadCsv(filename: string, rows: any[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ComplianceReports() {
  const [standards, setStandards] = useState<string[]>([]);
  const [controls, setControls] = useState<ControlItem[]>([]);
  const [annex, setAnnex] = useState<AnnexItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, cRes, aRes] = await Promise.all([
          fetch("/api/settings/standards"),
          fetch("/api/compliance/controls", { cache: "no-store" }),
          fetch("/api/compliance/annex-a", { cache: "no-store" }),
        ]);
        if (sRes.ok) {
          const s = await sRes.json();
          setStandards(s.map((x: any) => x.name || x.title).filter(Boolean));
        }
        if (cRes.ok) setControls(await cRes.json());
        if (aRes.ok) setAnnex(await aRes.json());
      } catch {
        // ignore
      }
    };
    void load();
  }, []);

  const summary = useMemo(() => {
    return standards.map((std) => {
      const relatedControls = controls.filter((c) => (c.relatedStandards || []).includes(std));
      const relatedAnnex = annex.filter((a) => a.standardName === std);
      const total = relatedControls.length + relatedAnnex.length;
      const implemented = [...relatedControls, ...relatedAnnex].filter((x: any) => implementedStatuses.includes(x.status || "")).length;
      const docsLinked = relatedControls.filter((c) => Array.isArray(c.documentIds) && c.documentIds.length > 0).length;
      const compliance = total ? Math.round((implemented / total) * 100) : 0;
      const evidenceCoverage = relatedControls.length ? Math.round((docsLinked / relatedControls.length) * 100) : 0;
      return { standard: std, total, implemented, compliance, evidenceCoverage };
    });
  }, [standards, controls, annex]);

  const gapRows = useMemo(() => {
    const rows: any[] = [];
    standards.forEach((std) => {
      const relControls = controls.filter((c) => (c.relatedStandards || []).includes(std));
      const relAnnex = annex.filter((a) => a.standardName === std);
      const all = [
        ...relControls.map((c) => ({ source: "Checklist", item: c.name, status: c.status || "-", standard: std })),
        ...relAnnex.map((a) => ({ source: "Annex A", item: `${a.control_id} - ${a.title || ""}`.trim(), status: a.status || "-", standard: std })),
      ];
      all.filter((x) => !implementedStatuses.includes(x.status)).forEach((x) => rows.push(x));
    });
    return rows;
  }, [standards, controls, annex]);

  const evidenceRows = useMemo(() => {
    const rows: any[] = [];
    controls.forEach((c) => rows.push({ source: "Checklist", item: c.name, evidenceCount: Array.isArray(c.documentIds) ? c.documentIds.length : 0 }));
    annex.forEach((a) => rows.push({ source: "Annex A", item: `${a.control_id} - ${a.title || ""}`.trim(), evidenceCount: a.evidence ? 1 : 0 }));
    return rows;
  }, [controls, annex]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Reports</CardTitle>
        <CardDescription>Unduh ringkasan kepatuhan, gap analysis, dan cakupan evidence</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => downloadCsv("compliance_summary.csv", summary)}>Export Compliance Summary (CSV)</Button>
          <Button variant="outline" onClick={() => downloadCsv("gap_analysis.csv", gapRows)}>Export Gap Analysis (CSV)</Button>
          <Button variant="secondary" onClick={() => downloadCsv("evidence_coverage.csv", evidenceRows)}>Export Evidence Coverage (CSV)</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Standar</th>
                <th className="text-left py-2 px-3">Total Item</th>
                <th className="text-left py-2 px-3">Diterapkan</th>
                <th className="text-left py-2 px-3">Kepatuhan</th>
                <th className="text-left py-2 px-3">Cakupan Evidence</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-6 text-muted-foreground">Belum ada data</td></tr>
              ) : (
                summary.map((s) => (
                  <tr key={s.standard} className="border-b">
                    <td className="py-2 px-3">{s.standard}</td>
                    <td className="py-2 px-3">{s.total}</td>
                    <td className="py-2 px-3">{s.implemented}</td>
                    <td className="py-2 px-3">{s.compliance}%</td>
                    <td className="py-2 px-3">{s.evidenceCoverage}%</td>
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
