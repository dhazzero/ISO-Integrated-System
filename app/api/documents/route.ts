// app/api/documents/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; // Sesuaikan path jika perlu
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'documents';

// GET handler
export async function GET(request: Request) {
    try {
        const { db } = await connectToDatabase();
        // Logika untuk mengambil data
        // ...
        const documents = await db.collection(COLLECTION_NAME).find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json(documents);
    } catch (error) {
        // ... error handling
        return NextResponse.json({ message: 'Failed to fetch documents' }, { status: 500 });
    }
}

// POST handler
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db } = await connectToDatabase();
        // Validasi data
        // Logika untuk menyimpan data baru
        const newDocumentData = { ...data, createdAt: new Date(), updatedAt: new Date() };
        const result = await db.collection(COLLECTION_NAME).insertOne(newDocumentData);
        const insertedDocument = await db.collection(COLLECTION_NAME).findOne({ _id: result.insertedId });
        return NextResponse.json(insertedDocument, { status: 201 });
    } catch (error) {
        // ... error handling
        return NextResponse.json({ message: 'Failed to create document' }, { status: 500 });
    }
}

// Implementasikan PUT dan DELETE serupa