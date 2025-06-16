// app/api/risks/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const RISKS_COLLECTION = 'risks';

// GET sebuah risiko berdasarkan ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(params.id)) {
            return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
        }
        const risk = await db.collection(RISKS_COLLECTION).findOne({ _id: new ObjectId(params.id) });
        if (!risk) {
            return NextResponse.json({ message: 'Risiko tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json(risk);
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data risiko', error: (error as Error).message }, { status: 500 });
    }
}

// PUT (Update) sebuah risiko

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const data = await request.json();
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });

        // Fungsi helper untuk kalkulasi
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

        const inherent = getRiskDetails(data.inherentRisk.likelihoodScore, data.inherentRisk.impactScore);
        const residual = getRiskDetails(data.residualRisk.likelihoodScore, data.residualRisk.impactScore);

        // Data lengkap untuk diupdate
        const updateData = {
            name: data.name,
            description: data.description,
            category: data.category,
            owner: data.owner,
            status: data.status,
            relatedStandards: data.relatedStandards,
            asset: data.asset,
            threat: data.threat,
            vulnerability: data.vulnerability,
            impactDescription: data.impactDescription,
            inherentRisk: { ...data.inherentRisk, ...inherent },
            residualRisk: { ...data.residualRisk, ...residual },
            level: residual.level,
            likelihood: residual.likelihood,
            impact: residual.impact,
            // Menyimpan data array yang baru
            controls: data.controls || [],
            mitigationActions: data.mitigationActions || [],
            proposedAction: data.proposedAction,
            opportunity: data.opportunity,
            targetDate: data.targetDate,
            monitoring: data.monitoring,
            pic: data.pic,
            updatedAt: new Date(),
        };

        const result = await db.collection('risks').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) return NextResponse.json({ message: 'Risiko tidak ditemukan' }, { status: 404 });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui risiko', error: (error as Error).message }, { status: 500 });
    }
}

// DELETE sebuah risiko
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });

        const result = await db.collection(RISKS_COLLECTION).deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return NextResponse.json({ message: 'Risiko tidak ditemukan' }, { status: 404 });

        return NextResponse.json({ message: 'Risiko berhasil dihapus' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal menghapus risiko', error: (error as Error).message }, { status: 500 });
    }
}