// app/api/documents/route.ts
import { NextResponse } from 'next/server'; // <--- TAMBAHKAN IMPORT INI
import { connectToDatabase } from '@/lib/mongodb'; // <--- PASTIKAN IMPORT INI ADA DAN PATH-NYA BENAR
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'documents';

export async function GET(request: Request) {
    console.log("API_DOCUMENTS_GET: Request received");
    try {
        console.log("API_DOCUMENTS_GET: Attempting to connect to database...");
        const { db } = await connectToDatabase(); // Pastikan fungsi ini diimpor
        console.log("API_DOCUMENTS_GET: Successfully connected to database. Fetching documents...");

        const documents = await db.collection(COLLECTION_NAME).find({}).sort({ createdAt: -1 }).toArray();
        console.log(`API_DOCUMENTS_GET: Found ${documents.length} documents.`);

        if (documents.length > 0) {
            console.log("API_DOCUMENTS_GET: First document sample:", JSON.stringify(documents[0], null, 2));
        }

        return NextResponse.json(documents); // Pastikan NextResponse diimpor
    } catch (error) {
        console.error("API_DOCUMENTS_GET: Fetch documents error:", error);
        // console.error("API_DOCUMENTS_GET: Error stack:", error instanceof Error ? error.stack : "No stack available");
        return NextResponse.json({ message: 'Failed to fetch documents', error: error instanceof Error ? error.message : String(error) }, { status: 500 }); // Pastikan NextResponse diimpor
    }
}

// POST handler
export async function POST(request: Request) {
    console.log("API_DOCUMENTS_POST: Request received");
    try {
        const data = await request.json();
        console.log("API_DOCUMENTS_POST: Attempting to connect to database...");
        const { db } = await connectToDatabase(); // Pastikan fungsi ini diimpor
        console.log("API_DOCUMENTS_POST: Successfully connected to database.");

        if (!data.name || !data.documentType) {
            console.warn("API_DOCUMENTS_POST: Missing required fields: name, documentType. Data:", data);
            return NextResponse.json({ message: 'Missing required fields: name, documentType' }, { status: 400 });
        }

        const newDocumentData = {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        console.log("API_DOCUMENTS_POST: Preparing to insert document:", newDocumentData);

        const result = await db.collection(COLLECTION_NAME).insertOne(newDocumentData);
        console.log("API_DOCUMENTS_POST: Document inserted with ID:", result.insertedId);
        const insertedDocument = await db.collection(COLLECTION_NAME).findOne({ _id: result.insertedId });

        return NextResponse.json(insertedDocument, { status: 201 }); // Pastikan NextResponse diimpor
    } catch (error) {
        console.error("API_DOCUMENTS_POST: Create document error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create document';
        return NextResponse.json({ message: 'Failed to create document', error: errorMessage }, { status: 500 }); // Pastikan NextResponse diimpor
    }
}

// Implementasikan PUT dan DELETE serupa, pastikan juga mengimpor connectToDatabase dan NextResponse jika belum