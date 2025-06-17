import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const FINDINGS_COLLECTION = 'findings';

// GET: Mengambil satu finding berdasarkan ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(params.id)) {
            return NextResponse.json({ message: 'ID Finding tidak valid' }, { status: 400 });
        }
        const finding = await db.collection(FINDINGS_COLLECTION).findOne({ _id: new ObjectId(params.id) });
        if (!finding) {
            return NextResponse.json({ message: 'Finding tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json(finding, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data finding', error: (error as Error).message }, { status: 500 });
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
        delete data._id;

        const result = await db.collection(FINDINGS_COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(params.id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ message: 'Finding tidak ditemukan untuk diperbarui' }, { status: 404 });
        }
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui finding', error: (error as Error).message }, { status: 500 });
    }
}