// app/api/settings/departments/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const DEPARTMENTS_COLLECTION = 'departments';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const data = await request.json();
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
        if (!data.name || !data.head) return NextResponse.json({ message: 'Nama dan kepala departemen wajib diisi' }, { status: 400 });

        const result = await db.collection(DEPARTMENTS_COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { name: data.name, head: data.head } },
            { returnDocument: 'after' }
        );

        if (!result) return NextResponse.json({ message: 'Departemen tidak ditemukan' }, { status: 404 });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui departemen', error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { db } = await connectToDatabase();
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });

        const result = await db.collection(DEPARTMENTS_COLLECTION).deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return NextResponse.json({ message: 'Departemen tidak ditemukan' }, { status: 404 });

        return NextResponse.json({ message: 'Departemen berhasil dihapus' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal menghapus departemen', error: (error as Error).message }, { status: 500 });
    }
}