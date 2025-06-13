// app/api/settings/standards/[id]/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const STANDARDS_COLLECTION = 'standards';

// PUT (Update) a standard by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const data = await request.json();
        const { db } = await connectToDatabase();

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
        }
        if (!data.name || !data.title) {
            return NextResponse.json({ message: 'Nama dan Judul Standar wajib diisi' }, { status: 400 });
        }

        const result = await db.collection(STANDARDS_COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: {
                    name: data.name,
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    status: data.status
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ message: 'Standar tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui standar', error: (error as Error).message }, { status: 500 });
    }
}

// DELETE a standard by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { db } = await connectToDatabase();

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
        }

        const result = await db.collection(STANDARDS_COLLECTION).deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Standar tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Standar berhasil dihapus' }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Gagal menghapus standar', error: (error as Error).message }, { status: 500 });
    }
}