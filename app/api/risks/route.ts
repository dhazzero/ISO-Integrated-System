// app/api/risks/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const RISKS_COLLECTION = 'risks';


// --- TAMBAHKAN ATAU PASTIKAN FUNGSI GET INI ADA ---

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

// POST risiko baru (diperbarui dengan penilaian inheren & residual)
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db } = await connectToDatabase();

        if (!data.name || !data.category || !data.owner || !data.inherentLikelihood || !data.inherentImpact || !data.residualLikelihood || !data.residualImpact) {
            return NextResponse.json({ message: 'Field yang dibutuhkan tidak lengkap' }, { status: 400 });
        }

        // --- PERUBAHAN DI SINI ---

        // Fungsi helper untuk kalkulasi, bisa diletakkan di sini
        const calculateRiskLevel = (likelihood: string, impact: string): string => {
            const scoreMap: { [key: string]: number } = { "Sangat Rendah": 1, "Rendah": 2, "Sedang": 3, "Tinggi": 4, "Sangat Tinggi": 5 };
            const likeScore = scoreMap[likelihood] || 0;
            const impactScore = scoreMap[impact] || 0;
            const totalScore = likeScore * impactScore;

            if (totalScore >= 15) return "Sangat Tinggi";
            if (totalScore >= 9) return "Tinggi";
            if (totalScore >= 5) return "Sedang";
            if (totalScore >= 2) return "Rendah";
            return "Sangat Rendah";
        };

        const residualLevel = calculateRiskLevel(data.residualLikelihood, data.residualImpact);

        const newRisk = {
            name: data.name,
            description: data.description || "",
            category: data.category,
            owner: data.owner || "N/A",
            status: data.status || 'Open',
            trend: 'stable',

            // Menambahkan field level atas untuk kemudahan tampilan di tabel utama
            level: residualLevel,
            likelihood: data.residualLikelihood, // Mengambil dari penilaian residual
            impact: data.residualImpact,       // Mengambil dari penilaian residual

            // Menyimpan data penilaian yang detail
            inherentRisk: {
                likelihood: data.inherentLikelihood,
                impact: data.inherentImpact,
                level: calculateRiskLevel(data.inherentLikelihood, data.inherentImpact),
            },
            residualRisk: {
                likelihood: data.residualLikelihood,
                impact: data.residualImpact,
                level: residualLevel,
            },

            controls: [],
            mitigationActions: [],
            history: [{ date: new Date().toISOString(), action: "Risiko dibuat", user: "Admin System" }],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // --- AKHIR PERUBAHAN ---

        const result = await db.collection('risks').insertOne(newRisk);
        const insertedRisk = await db.collection('risks').findOne({ _id: result.insertedId });

        return NextResponse.json(insertedRisk, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal membuat risiko', error: (error as Error).message }, { status: 500 });
    }
}