import { NextResponse, NextRequest } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { ObjectId } from 'mongodb';

const FINDINGS_COLLECTION = 'findings';

export async function GET(request: NextRequest) {
    try {
        const { db } = await getTenantDb();
        const auditId = request.nextUrl.searchParams.get('auditId');
        const query = auditId ? { auditId: auditId } : {};
        const findings = await db.collection(FINDINGS_COLLECTION).find(query).sort({ createdDate: -1 }).toArray();
        return NextResponse.json(findings, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data temuan', error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db } = await getTenantDb();
        if (!data.auditId || !data.description || !data.findingType) {
            return NextResponse.json({ message: 'Data finding tidak lengkap' }, { status: 400 });
        }
        const newFinding = { ...data, _id: new ObjectId(), createdDate: new Date().toISOString() };
        await db.collection(FINDINGS_COLLECTION).insertOne(newFinding);
        return NextResponse.json(newFinding, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal menyimpan temuan', error: (error as Error).message }, { status: 500 });
    }
}