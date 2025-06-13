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

        const updateData = { ...data, updatedAt: new Date() };
        delete updateData._id; // Jangan pernah update _id

        const result = await db.collection(RISKS_COLLECTION).findOneAndUpdate(
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