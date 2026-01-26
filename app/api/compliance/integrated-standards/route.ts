import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';

export async function GET() {
    try {
        const { db } = await getTenantDb();
        const docs = await db.collection('integrated-standard-table').find({}).toArray();
        const records = docs.map((d: any) => ({ _id: d._id.toString(), ...d }));
        return NextResponse.json(records);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch integrated standards', error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { document, documentId, rev, effectiveDate, iso9001, iso27001, iso37001 } = body;
        const { db } = await getTenantDb();
        const result = await db.collection('integrated-standard-table').insertOne({
            document, documentId, rev, effectiveDate, iso9001, iso27001, iso37001,
        });
        return NextResponse.json({ _id: result.insertedId.toString(), document, documentId, rev, effectiveDate, iso9001, iso27001, iso37001 }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to save integrated standard', error: (error as Error).message }, { status: 500 });
    }
}