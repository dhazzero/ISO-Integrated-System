// app/api/settings/departments/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const DEPARTMENTS_COLLECTION = 'departments';

// GET all departments
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const departments = await db.collection(DEPARTMENTS_COLLECTION).find({}).sort({ name: 1 }).toArray();
        return NextResponse.json(departments, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch departments', error: (error as Error).message }, { status: 500 });
    }
}

// POST a new department
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db } = await connectToDatabase();

        if (!data.name || !data.head) {
            return NextResponse.json({ message: 'Nama departemen dan kepala departemen wajib diisi' }, { status: 400 });
        }

        const newDepartment = {
            name: data.name,
            head: data.head,
            createdAt: new Date(),
        };

        const result = await db.collection(DEPARTMENTS_COLLECTION).insertOne(newDepartment);
        const insertedDepartment = await db.collection(DEPARTMENTS_COLLECTION).findOne({ _id: result.insertedId });

        return NextResponse.json(insertedDepartment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to create department', error: (error as Error).message }, { status: 500 });
    }
}