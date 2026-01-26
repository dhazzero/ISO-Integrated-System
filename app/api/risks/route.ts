// app/api/risks/route.ts
import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { logActivity } from '@/lib/logger';

const RISKS_COLLECTION = 'risks';

// GET semua data risiko
export async function GET() {
    try {
        const { db } = await getTenantDb();
        const risks = await db.collection(RISKS_COLLECTION).find({ deleted: { $ne: true } }).sort({ createdAt: -1 }).toArray();
        return NextResponse.json(risks);
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data risiko', error: (error as Error).message }, { status: 500 });
    }
}

// POST risiko baru
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db } = await getTenantDb();

        if (!data.name || !data.riskOwner || !data.inherentLikelihoodScore || !data.inherentImpactScore) {
            return NextResponse.json({ message: 'Field dasar (Nama, Owner, Penilaian Inheren) wajib diisi' }, { status: 400 });
        }

        const getRiskDetails = (likelihoodScore: number, impactScore: number) => {
            const RISK_MATRIX = [
                ["Rendah", "Rendah", "Rendah", "Sedang", "Sedang"],
                ["Rendah", "Rendah", "Sedang", "Sedang", "Tinggi"],
                ["Rendah", "Sedang", "Sedang", "Tinggi", "Tinggi"],
                ["Sedang", "Sedang", "Tinggi", "Tinggi", "Ekstrim"],
                ["Sedang", "Tinggi", "Tinggi", "Ekstrim", "Ekstrim"],
            ];
            const likelihoodMap = ["", "Sangat Jarang", "Jarang", "Mungkin", "Sering", "Sangat Sering"];
            const impactMap = ["", "Sangat Rendah", "Rendah", "Sedang", "Tinggi", "Sangat Tinggi"];
            const safeLikelihood = Math.max(1, Math.min(likelihoodScore, 5));
            const safeImpact = Math.max(1, Math.min(impactScore, 5));
            const level = RISK_MATRIX[safeLikelihood - 1][safeImpact - 1];
            const score = likelihoodScore * impactScore;
            return { level, score, likelihood: likelihoodMap[safeLikelihood], impact: impactMap[safeImpact] };
        };

        const inherent = getRiskDetails(Number(data.inherentLikelihoodScore), Number(data.inherentImpactScore));
        const residual = getRiskDetails(Number(data.residualLikelihoodScore), Number(data.residualImpactScore));

        const newRisk = {
            name: data.name,
            asset: data.asset || "",
            threat: data.threat || "",
            vulnerability: data.vulnerability || "",
            impactDescription: data.impactDescription || data.description,
            category: data.category,
            riskOwner: data.riskOwner,
            inherentRisk: { ...inherent, likelihoodScore: Number(data.inherentLikelihoodScore), impactScore: Number(data.inherentImpactScore) },
            residualRisk: { ...residual, likelihoodScore: Number(data.residualLikelihoodScore), impactScore: Number(data.residualImpactScore) },
            level: residual.level,
            likelihood: residual.likelihood,
            impact: residual.impact,
            controls: data.controls || [],
            mitigationActions: data.mitigationActions || [],
            opportunities: data.opportunities || [],
            mitigationPlan: data.mitigationPlan || "Akan ditentukan",
            proposedAction: data.proposedAction || [],
            opportunity: data.opportunity || [],
            targetDate: data.targetDate || null,
            monitoring: data.monitoring || "",
            pic: data.pic || data.riskOwner,
            status: data.status || 'Open',
            relatedStandards: data.relatedStandards || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            history: [{ date: new Date(), action: "Risiko Dibuat", user: "Admin System" }],
            deleted: false,
        };

        const result = await db.collection('risks').insertOne(newRisk);
        const insertedData = await db.collection('risks').findOne({ _id: result.insertedId });

        if (insertedData) {
            await logActivity('CREATE', 'Risiko', `Membuat risiko baru: '${insertedData.name}'`, { documentId: insertedData._id, data });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal membuat risiko', error: (error as Error).message }, { status: 500 });
    }
}