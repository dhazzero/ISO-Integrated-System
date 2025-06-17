import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const AUDITS_COLLECTION = 'audits';

// GET: Mengambil satu audit berdasarkan ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(params.id)) {
            return NextResponse.json({ message: 'ID Audit tidak valid' }, { status: 400 });
        }
        const audit = await db.collection(AUDITS_COLLECTION).findOne({ _id: new ObjectId(params.id) });
        if (!audit) {
            return NextResponse.json({ message: 'Audit tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json(audit, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data audit', error: (error as Error).message }, { status: 500 });
    }
}

// PUT: Memperbarui satu audit berdasarkan ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(params.id)) {
            return NextResponse.json({ message: 'ID Audit tidak valid' }, { status: 400 });
        }
        const data = await request.json();
        delete data._id; // Hapus field _id untuk menghindari error MongoDB

        const result = await db.collection(AUDITS_COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(params.id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ message: 'Audit tidak ditemukan untuk diperbarui' }, { status: 404 });
        }
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui audit', error: (error as Error).message }, { status: 500 });
    }
}

// DELETE: Menghapus satu audit berdasarkan ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(params.id)) {
            return NextResponse.json({ message: 'ID Audit tidak valid' }, { status: 400 });
        }
        const result = await db.collection(AUDITS_COLLECTION).deleteOne({ _id: new ObjectId(params.id) });
        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Gagal menghapus, audit tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Audit berhasil dihapus' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal menghapus audit', error: (error as Error).message }, { status: 500 });
    }
}