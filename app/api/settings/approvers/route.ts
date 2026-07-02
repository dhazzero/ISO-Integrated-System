// app/api/settings/approvers/route.ts
import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';

const APPROVERS_COLLECTION = 'approvers';

export async function GET() {
    try {
        const { db } = await getTenantDb();
        const approvers = await db.collection(APPROVERS_COLLECTION).find({}).sort({ title: 1 }).toArray();
        return NextResponse.json(approvers);
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data approver', error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db } = await getTenantDb();
        if (!data.title || !data.name) {
            return NextResponse.json({ message: 'Jabatan dan Nama wajib diisi' }, { status: 400 });
        }
        const newApprover = { title: data.title, name: data.name, createdAt: new Date() };
        const result = await db.collection(APPROVERS_COLLECTION).insertOne(newApprover);
        const insertedApprover = await db.collection(APPROVERS_COLLECTION).findOne({ _id: result.insertedId });
        return NextResponse.json(insertedApprover, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal membuat approver', error: (error as Error).message }, { status: 500 });
    }
}