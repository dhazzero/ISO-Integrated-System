// app/api/risks/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { logActivity } from '@/lib/logger';

const RISKS_COLLECTION = 'risks';

// Fungsi GET tetap sama, tidak ada perubahan
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
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

const generateChangeLog = (before: any, after: any): string[] => {
    const changes: string[] = [];
    const fieldsToCompare = ['name', 'status', 'riskOwner', 'pic', 'category', 'monitoring', 'threat', 'vulnerability', 'impactDescription'];

    fieldsToCompare.forEach(field => {
        if (before[field] !== after[field]) {
            changes.push(`'${field}' diubah dari "${before[field] || 'kosong'}" menjadi "${after[field] || 'kosong'}".`);
        }
    });

    // Perbaikan untuk perbandingan tanggal
    const beforeDate = before.targetDate ? new Date(before.targetDate).toISOString().split('T')[0] : null;
    const afterDate = after.targetDate ? new Date(after.targetDate).toISOString().split('T')[0] : null;
    if (beforeDate !== afterDate) {
        changes.push(`'targetDate' diubah dari "${beforeDate || 'kosong'}" menjadi "${afterDate || 'kosong'}".`);
    }

    if (JSON.stringify(before.controls) !== JSON.stringify(after.controls)) { changes.push("Aktivitas Kontrol diperbarui."); }
    if (JSON.stringify(before.mitigationActions) !== JSON.stringify(after.mitigationActions)) { changes.push("Tindakan Mitigasi diperbarui."); }
    if (JSON.stringify(before.opportunities) !== JSON.stringify(after.opportunities)) { changes.push("Peluang (Opportunity) diperbarui."); }
    if (JSON.stringify(before.relatedStandards) !== JSON.stringify(after.relatedStandards)) { changes.push("Standar Terkait diperbarui."); }

    if(before.inherentRisk?.level !== after.inherentRisk.level) { changes.push(`Level Risiko Inheren berubah menjadi ${after.inherentRisk.level}.`); }
    if(before.residualRisk?.level !== after.residualRisk.level) { changes.push(`Level Risiko Residual berubah menjadi ${after.residualRisk.level}.`); }

    return changes;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const data = await request.json();
        const { id } = params;
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });

        const existingRisk = await db.collection(RISKS_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!existingRisk) {
            return NextResponse.json({ message: 'Risiko untuk diperbarui tidak ditemukan' }, { status: 404 });
        }

        const inherent = getRiskDetails(Number(data.inherentLikelihoodScore), Number(data.inherentImpactScore));
        const residual = getRiskDetails(Number(data.residualLikelihoodScore), Number(data.residualImpactScore));

        // Gabungkan data baru dengan hasil kalkulasi untuk perbandingan log
        const dataForLog = { ...data, inherentRisk: inherent, residualRisk: residual };
        const changeDetails = generateChangeLog(existingRisk, dataForLog);

        const currentHistory = existingRisk.history || [];
        let newHistory = currentHistory;

        // Hanya tambahkan entri riwayat baru jika ada perubahan
        if (changeDetails.length > 0) {
            const newHistoryEntry = {
                date: new Date(),
                action: "Risiko Diperbarui",
                user: "Admin System", // Ganti dengan user yang login nanti
                details: changeDetails
            };
            newHistory = [...currentHistory, newHistoryEntry];
        }

        // Siapkan data final untuk di-set ke database
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
            history: newHistory, // <-- Gunakan riwayat yang sudah diproses
        };

        const result = await db.collection('risks').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) return NextResponse.json({ message: 'Risiko tidak ditemukan saat update' }, { status: 404 });

        // Kirim ke log terpusat jika ada perubahan
        if (changeDetails.length > 0) {
            await logActivity('UPDATE', 'Risiko', `Memperbarui risiko: '${result.name}'`, { documentId: result._id, changes: changeDetails });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("PUT Risk Error:", error);
        return NextResponse.json({ message: 'Gagal memperbarui risiko', error: (error as Error).message }, { status: 500 });
    }
}

// Fungsi DELETE tetap sama, tidak ada perubahan
export async function DELETE(request: Request, { params }: { params: { id:string } }) {
    try {
        const { id } = params;
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });

        const riskToDelete = await db.collection(RISKS_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!riskToDelete) {
            return NextResponse.json({ message: 'Risiko tidak ditemukan' }, { status: 404 });
        }

        const result = await db.collection(RISKS_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $set: {
                    deleted: true,
                    deletedAt: new Date(),
                    status: 'Archived'
                }}
        );

        if (result.modifiedCount === 0) {
            throw new Error('Gagal mengarsipkan risiko.');
        }

        await logActivity('DELETE', 'Risiko', `Mengarsipkan risiko: '${riskToDelete.name}'`, { documentId: riskToDelete._id });

        return NextResponse.json({ message: 'Risiko berhasil diarsipkan' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal menghapus risiko', error: (error as Error).message }, { status: 500 });
    }
}