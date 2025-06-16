// app/api/risks/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const RISKS_COLLECTION = 'risks';

// GET semua data risiko
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const risks = await db.collection(RISKS_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json(risks);
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data risiko', error: (error as Error).message }, { status: 500 });
    }
}

// POST risiko baru (diperbarui dengan struktur data lengkap)
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db } = await connectToDatabase();

        // Validasi dasar
        if (!data.name || !data.riskOwner || !data.inherentLikelihoodScore || !data.inherentImpactScore) {
            return NextResponse.json({ message: 'Field dasar (Nama, Owner, Penilaian Inheren) wajib diisi' }, { status: 400 });
        }

        // Fungsi helper untuk kalkulasi di backend
        const getRiskDetails = (likelihoodScore: number, impactScore: number) => {
            const levelMap = ["", "Rendah", "Rendah-Sedang", "Sedang", "Tinggi", "Sangat Tinggi"];
            const score = likelihoodScore * impactScore;

            let level = "Rendah";
            if (score >= 15) level = "Sangat Tinggi";
            else if (score >= 9) level = "Tinggi";
            else if (score >= 5) level = "Sedang";
            else if (score >= 2) level = "Rendah-Sedang";

            let treatment = "ACCEPT";
            if (score >= 12) treatment = "AVOID";
            else if (score >= 8) treatment = "TRANSFER - AVOID";
            else if (score >= 4) treatment = "TRANSFER - REDUCED";

            return { level, treatment, score, likelihood: levelMap[likelihoodScore], impact: levelMap[impactScore] };
        };

        const inherent = getRiskDetails(Number(data.inherentLikelihoodScore), Number(data.inherentImpactScore));
        const residual = getRiskDetails(Number(data.residualLikelihoodScore), Number(data.residualImpactScore));

        const newRisk = {
            // Identifikasi Risiko
            name: data.name,
            asset: data.asset || "",
            threat: data.threat || "",
            vulnerability: data.vulnerability || "",
            impactDescription: data.impactDescription || data.description,
            category: data.category,
            riskOwner: data.riskOwner,

            // Penilaian & Level
            inherentRisk: { ...inherent, likelihoodScore: Number(data.inherentLikelihoodScore), impactScore: Number(data.inherentImpactScore) },
            residualRisk: { ...residual, likelihoodScore: Number(data.residualLikelihoodScore), impactScore: Number(data.residualImpactScore) },

            // Level atas untuk kemudahan di tabel register
            level: residual.level,
            likelihood: residual.likelihood,
            impact: residual.impact,

            // Rencana Tindakan & Mitigasi
            controlActivities: data.controlActivities || "",
            mitigationPlan: data.mitigationPlan || "Akan ditentukan",
            proposedAction: data.proposedAction || "",
            opportunity: data.opportunity || "",
            targetDate: data.targetDate || null,
            monitoring: data.monitoring || "",
            pic: data.pic || data.riskOwner,
            status: data.status || 'Open',

            // Timestamps
            createdAt: new Date(),
            updatedAt: new Date(),
            history: [{ date: new Date().toISOString(), action: "Risiko dibuat", user: "Admin System" }],
        };

        const result = await db.collection('risks').insertOne(newRisk);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal membuat risiko', error: (error as Error).message }, { status: 500 });
    }
}