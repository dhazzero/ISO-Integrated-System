// app/api/risks/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const RISKS_COLLECTION = 'risks';

// GET sebuah risiko berdasarkan ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params; // Untuk GET, urutan ini tidak masalah
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
        }
        const { db } = await connectToDatabase();
        const risk = await db.collection(RISKS_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!risk) {
            return NextResponse.json({ message: 'Risiko tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json(risk);
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data risiko', error: (error as Error).message }, { status: 500 });
    }
}


// --- TAMBAHKAN FUNGSI HELPER BARU INI UNTUK MEMBUAT LOG ---
const generateChangeLog = (before: any, after: any): string[] => {
    const changes: string[] = [];
    const fieldsToCompare = ['name', 'status', 'riskOwner', 'pic', 'category', 'monitoring'];

    fieldsToCompare.forEach(field => {
        if (before[field] !== after[field]) {
            changes.push(`'${field}' diubah dari "${before[field] || 'kosong'}" menjadi "${after[field] || 'kosong'}".`);
        }
    });

    if (new Date(before.targetDate).toISOString().split('T')[0] !== new Date(after.targetDate).toISOString().split('T')[0]) {
        changes.push(`'targetDate' diubah dari "${new Date(before.targetDate).toLocaleDateString('id-ID')}" menjadi "${new Date(after.targetDate).toLocaleDateString('id-ID')}".`);
    }

    // Perbandingan sederhana untuk array (hanya mendeteksi jika ada perubahan)
    if (JSON.stringify(before.controls) !== JSON.stringify(after.controls)) {
        changes.push("Aktivitas Kontrol diperbarui.");
    }
    if (JSON.stringify(before.mitigationActions) !== JSON.stringify(after.mitigationActions)) {
        changes.push("Tindakan Mitigasi diperbarui.");
    }

    return changes;
}

// PUT (Update) sebuah risiko

// --- MULAI PERUBAHAN DI SINI ---
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const data = await request.json();
        const { id } = params;
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });


        // --- LOGIKA BARU: AMBIL DATA LAMA SEBELUM UPDATE ---
        const existingRisk = await db.collection(RISKS_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!existingRisk) {
            return NextResponse.json({ message: 'Risiko untuk diperbarui tidak ditemukan' }, { status: 404 });
        }

        const inherent = getRiskDetails(Number(data.inherentLikelihoodScore), Number(data.inherentImpactScore));
        const residual = getRiskDetails(Number(data.residualLikelihoodScore), Number(data.residualImpactScore));

        const updateData = {
            name: data.name,
            asset: data.asset,
            threat: data.threat,
            vulnerability: data.vulnerability,
            impactDescription: data.impactDescription,
            category: data.category,
            riskOwner: data.riskOwner,
            status: data.status,
            relatedStandards: data.relatedStandards || [],
            inherentRisk: { likelihoodScore: Number(data.inherentLikelihoodScore), impactScore: Number(data.inherentImpactScore), ...inherent },
            residualRisk: { likelihoodScore: Number(data.residualLikelihoodScore), impactScore: Number(data.residualImpactScore), ...residual },
            level: residual.level,
            likelihood: residual.likelihood,
            impact: residual.impact,
            controls: data.controls || [],
            mitigationActions: data.mitigationActions || [],
            opportunities: data.opportunities || [],
            targetDate: data.targetDate,
            monitoring: data.monitoring,
            pic: data.pic,
            updatedAt: new Date(),
        };

        // --- LOGIKA BARU: BUAT LOG PERUBAHAN & TAMBAHKAN KE RIWAYAT ---
        const changeDetails = generateChangeLog(existingRisk, data);
        const currentHistory = existingRisk.history || [];

        if (changeDetails.length > 0) {
            const newHistoryEntry = {
                date: new Date(),
                action: "Risiko Diperbarui",
                user: "Admin System", // Ganti dengan user yang login nanti
                details: changeDetails
            };
            updateData.history = [...currentHistory, newHistoryEntry];
        } else {
            // Jika tidak ada perubahan signifikan, setidaknya perbarui tanggal 'updatedAt'
            updateData.history = currentHistory;
        }


        const result = await db.collection('risks').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) return NextResponse.json({ message: 'Risiko tidak ditemukan saat update' }, { status: 404 });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("PUT Risk Error:", error);
        return NextResponse.json({ message: 'Gagal memperbarui risiko', error: (error as Error).message }, { status: 500 });
    }
}

// DELETE sebuah risiko
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });

        const { db } = await connectToDatabase();
        const result = await db.collection(RISKS_COLLECTION).deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) return NextResponse.json({ message: 'Risiko tidak ditemukan' }, { status: 404 });

        return NextResponse.json({ message: 'Risiko berhasil dihapus' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal menghapus risiko', error: (error as Error).message }, { status: 500 });
    }
}