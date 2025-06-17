import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const FINDINGS_COLLECTION = 'findings';
const AUDITS_COLLECTION = 'audits';

// GET: Mengambil satu finding berdasarkan ID
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const audits = await db.collection(AUDITS_COLLECTION).find({}).sort({ date: -1 }).toArray();
        if (!audits) {
            console.warn(`Peringatan: Tidak ada data ditemukan di koleksi '${AUDITS_COLLECTION}'.`);
            return NextResponse.json([]); // Kembalikan array kosong jika tidak ada data
        }
        return NextResponse.json(audits, { status: 200 });
    } catch (error) {
        console.error("API GET /api/audits FAILED:", error);
        return NextResponse.json({ message: 'Gagal mengambil data audit.', error: (error as Error).message }, { status: 500 });
    }
}


// PUT: Memperbarui satu finding berdasarkan ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(params.id)) {
            return NextResponse.json({ message: 'ID Finding tidak valid' }, { status: 400 });
        }
        const data = await request.json();
        const findingId = new ObjectId(params.id);

        // Update finding yang diubah
        const updateResult = await db.collection(FINDINGS_COLLECTION).findOneAndUpdate(
            { _id: findingId },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!updateResult) {
            return NextResponse.json({ message: 'Finding tidak ditemukan untuk diperbarui' }, { status: 404 });
        }

        const updatedFinding = updateResult;

        // Logika Otomatisasi Penyelesaian Audit
        if (updatedFinding.status === 'Closed' && updatedFinding.auditId) {
            const openFindingsCount = await db.collection(FINDINGS_COLLECTION).countDocuments({
                auditId: updatedFinding.auditId,
                status: { $in: ['Open', 'In Progress'] }
            });

            if (openFindingsCount === 0) {
                await db.collection(AUDITS_COLLECTION).updateOne(
                    { _id: new ObjectId(updatedFinding.auditId) },
                    { $set: { status: 'Completed', completedDate: new Date().toISOString() } }
                );
            }
        }

        return NextResponse.json(updatedFinding, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui finding', error: (error as Error).message }, { status: 500 });
    }
}