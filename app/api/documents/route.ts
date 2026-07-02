// app/api/documents/route.ts
import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { logActivityServer, LogAction, LogModule } from '@/lib/server-logger';

const COLLECTION_NAME = 'documents';

export async function GET(request: Request) {
    try {
        const { db } = await getTenantDb();

        const docsRaw = await db.collection(COLLECTION_NAME)
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        const documents = docsRaw.map((d: any) => ({
            ...d,
            id: d._id?.toString?.() ?? d.id,
            fileId: d.fileId?.toString?.(),
        }));

        return NextResponse.json(documents);
    } catch (error) {
        console.error("API_DOCUMENTS_GET: Fetch documents error:", error);
        return NextResponse.json({ message: 'Failed to fetch documents', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

// POST handler - Create new document
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db, user } = await getTenantDb();

        if (!data.name || !data.documentType) {
            return NextResponse.json({ message: 'Missing required fields: name, documentType' }, { status: 400 });
        }

        const newDocumentData = {
            ...data,
            category: data.documentType, // Duplikasi untuk kompatibilitas tampilan tabel
            nextReview: data.reviewDate || null, // Mapping reviewDate ke nextReview
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: user.userName || 'System',
        };

        const result = await db.collection(COLLECTION_NAME).insertOne(newDocumentData);
        const insertedDocument = await db.collection(COLLECTION_NAME).findOne({ _id: result.insertedId });

        // Log activity ke security_logs
        await logActivityServer(
            LogAction.CREATE,
            LogModule.DOCUMENT,
            `Membuat dokumen baru: ${data.name}`,
            {
                entityId: result.insertedId.toString(),
                entityName: data.name,
                documentType: data.documentType,
            },
            request.headers.get('x-forwarded-for') || undefined
        );

        return NextResponse.json(insertedDocument, { status: 201 });
    } catch (error) {
        console.error("API_DOCUMENTS_POST: Create document error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create document';
        return NextResponse.json({ message: 'Failed to create document', error: errorMessage }, { status: 500 });
    }
}