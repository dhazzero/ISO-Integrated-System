// app/api/settings/standards/route.ts
import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { getCurrentUser } from '@/lib/auth';
import { connectToTenantDatabase } from '@/lib/mongodb-tenant';

export const dynamic = 'force-dynamic';
const STANDARDS_COLLECTION = 'iso_standards';

async function getDb(request: Request) {
    const user = await getCurrentUser();
    const url = new URL(request.url);
    const companyCode = url.searchParams.get('companyCode');

    if (user?.isSuperAdmin && companyCode && companyCode !== 'ALL') {
        const { db } = await connectToTenantDatabase(companyCode);
        return db;
    }

    const { db } = await getTenantDb();
    return db;
}

export async function GET(request: Request) {
    try {
        const db = await getDb(request);
        const standards = await db.collection(STANDARDS_COLLECTION).find({}).sort({ name: 1 }).toArray();
        return NextResponse.json(standards, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch standards:", error);
        return NextResponse.json({ message: 'Failed to fetch standards', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const db = await getDb(request);
        if (!data.name || !data.title) {
            return NextResponse.json({ message: 'Name and title are required' }, { status: 400 });
        }
        const newStandard = {
            name: data.name,
            title: data.title,
            description: data.description || "",
            category: data.category || "",
            status: data.status || "Active",
            usageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await db.collection(STANDARDS_COLLECTION).insertOne(newStandard);
        const insertedStandard = await db.collection(STANDARDS_COLLECTION).findOne({ _id: result.insertedId });
        return NextResponse.json(insertedStandard, { status: 201 });
    } catch (error) {
        console.error("Failed to create standard:", error);
        return NextResponse.json({ message: 'Failed to create standard', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}