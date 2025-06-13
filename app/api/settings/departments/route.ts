// app/api/settings/departments/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const DEPARTMENTS_COLLECTION = 'departments';

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const departments = await db.collection(DEPARTMENTS_COLLECTION).find({}).sort({ name: 1 }).toArray();
        return NextResponse.json(departments);
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data departemen', error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db } = await connectToDatabase();
        if (!data.name || !data.head) {
            return NextResponse.json({ message: 'Nama dan kepala departemen wajib diisi' }, { status: 400 });
        }
        const result = await db.collection(DEPARTMENTS_COLLECTION).insertOne({ name: data.name, head: data.head, createdAt: new Date() });
        const newDepartment = await db.collection(DEPARTMENTS_COLLECTION).findOne({ _id: result.insertedId });
        return NextResponse.json(newDepartment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal membuat departemen', error: (error as Error).message }, { status: 500 });
    }
}