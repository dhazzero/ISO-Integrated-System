// app/api/settings/approvers/[id]/route.ts
import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { ObjectId } from 'mongodb';

const APPROVERS_COLLECTION = 'approvers';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const data = await request.json();
        const { db } = await getTenantDb();
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
        if (!data.title || !data.name) {
            return NextResponse.json({ message: 'Jabatan dan Nama wajib diisi' }, { status: 400 });
        }
        const result = await db.collection(APPROVERS_COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { title: data.title, name: data.name } },
            { returnDocument: 'after' }
        );
        if (!result) return NextResponse.json({ message: 'Approver tidak ditemukan' }, { status: 404 });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui approver', error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { db } = await getTenantDb();
        if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
        const result = await db.collection(APPROVERS_COLLECTION).deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return NextResponse.json({ message: 'Approver tidak ditemukan' }, { status: 404 });
        return NextResponse.json({ message: 'Approver berhasil dihapus' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal menghapus approver', error: (error as Error).message }, { status: 500 });
    }
}