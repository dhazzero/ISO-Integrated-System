import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { ObjectId } from 'mongodb';

const AUDITS_COLLECTION = 'audits';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { db } = await getTenantDb();
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID Audit tidak valid atau tidak ada' }, { status: 400 });
        }
        const audit = await db.collection(AUDITS_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!audit) {
            return NextResponse.json({ message: 'Audit tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json(audit, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data audit', error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { db } = await getTenantDb();
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID Audit tidak valid atau tidak ada' }, { status: 400 });
        }
        const data = await request.json();
        delete data._id;
        const result = await db.collection(AUDITS_COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
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