import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const AUDITS_COLLECTION = 'audits';

/**
 * Handles GET requests to fetch all audit schedules.
 */
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const audits = await db.collection(AUDITS_COLLECTION).find({}).sort({ date: -1 }).toArray();
        return NextResponse.json(audits, { status: 200 });
    } catch (error) {
        console.error("API GET /api/audits FAILED:", error);
        return NextResponse.json({ message: 'Gagal mengambil data audit.', error: (error as Error).message }, { status: 500 });
    }
}

/**
 * Handles POST requests to create a new audit schedule.
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validasi data dasar
        if (!data.name || !data.standard || !data.date || !data.auditType) {
            return NextResponse.json({ message: 'Data tidak lengkap. Field wajib: Nama, Standar, Tanggal, Jenis Audit.' }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        const newAudit = {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection(AUDITS_COLLECTION).insertOne(newAudit);

        // Langsung kembalikan dokumen yang baru dibuat
        return NextResponse.json({ ...newAudit, _id: result.insertedId }, { status: 201 });

    } catch (error) {
        console.error("API POST /api/audits FAILED:", error);
        // Pastikan respons error selalu dalam format JSON
        return NextResponse.json({ message: 'Gagal membuat jadwal audit.', error: (error as Error).message }, { status: 500 });
    }
}