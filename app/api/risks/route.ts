// app/api/risks/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { logActivity } from '@/lib/logger'; // <-- Import logger

const RISKS_COLLECTION = 'risks';

// GET semua data risiko
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const risks = await db.collection(RISKS_COLLECTION).find({ deleted: { $ne: true } }).sort({ createdAt: -1 }).toArray();
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
        /*
        // Fungsi helper untuk kalkulasi di backend rumus lama
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
*/
        // Fungsi helper untuk kalkulasi di backend rumus sesuai Risk SOP IT
        const getRiskDetails = (likelihoodScore: number, impactScore: number) => {
            // Matriks Risiko sesuai gambar [baris: kemungkinan, kolom: dampak]
            // Indeks 0 = Skor 1, Indeks 4 = Skor 5
            const RISK_MATRIX = [
                // Dampak:     1       2        3         4         5
                /* L: 1 */ ["Rendah", "Rendah", "Rendah", "Sedang", "Sedang"],
                /* L: 2 */ ["Rendah", "Rendah", "Sedang", "Sedang", "Tinggi"],
                /* L: 3 */ ["Rendah", "Sedang", "Sedang", "Tinggi", "Tinggi"],
                /* L: 4 */ ["Sedang", "Sedang", "Tinggi", "Tinggi", "Ekstrim"],
                /* L: 5 */ ["Sedang", "Tinggi", "Tinggi", "Ekstrim", "Ekstrim"],
            ];

            const likelihoodMap = ["", "Sangat Jarang", "Jarang", "Mungkin", "Sering", "Sangat Sering"];
            const impactMap = ["", "Sangat Rendah", "Rendah", "Sedang", "Tinggi", "Sangat Tinggi"];

            // Pastikan skor berada dalam rentang yang valid (1-5)
            const safeLikelihood = Math.max(1, Math.min(likelihoodScore, 5));
            const safeImpact = Math.max(1, Math.min(impactScore, 5));

            const level = RISK_MATRIX[safeLikelihood - 1][safeImpact - 1];

            // Skor numerik tetap dihitung untuk referensi, jika diperlukan
            const score = likelihoodScore * impactScore;

            return {
                level, // "Rendah", "Sedang", "Tinggi", "Ekstrim"
                score,
                likelihood: likelihoodMap[safeLikelihood],
                impact: impactMap[safeImpact],
            };
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
            controls: data.controls || [],
            mitigationActions: data.mitigationActions || [],
            opportunities: data.opportunities || [],
            mitigationPlan: data.mitigationPlan || "Akan ditentukan",
            proposedAction: data.proposedAction || [], // <-- Diubah menjadi array kosong jika tidak ada
            opportunity: data.opportunity || [],       // <-- Diubah menjadi array kosong jika tidak ada
            targetDate: data.targetDate || null,
            monitoring: data.monitoring || "",
            pic: data.pic || data.riskOwner,
            status: data.status || 'Open',
            relatedStandards: data.relatedStandards || [], // Pastikan field ini diproses
            // Timestamps
            createdAt: new Date(),
            updatedAt: new Date(),
            history: [{ date: new Date(), action: "Risiko Dibuat", user: "Admin System" }], // Riwayat awal
            deleted: false, // Tambahkan field untuk soft delete

        };

        const result = await db.collection('risks').insertOne(newRisk);
        const insertedData = await db.collection('risks').findOne({_id: result.insertedId});

        // --- LOGGING BARU: Catat ke log terpusat ---
        if (insertedData) {
            await logActivity('CREATE', 'Risiko', `Membuat risiko baru: '${insertedData.name}'`, { documentId: insertedData._id, data });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal membuat risiko', error: (error as Error).message }, { status: 500 });
    }
}