import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';

const CONTROLS_COLLECTION = 'compliance';

export async function GET() {
    try {
        const { db } = await getTenantDb();
        const controlsRaw = await db.collection(CONTROLS_COLLECTION).find({ category: { $ne: 'Annex A' } }).sort({ name: 1 }).toArray();
        const controls = controlsRaw.map((c: any) => ({ ...c, _id: c._id.toString() }));
        return NextResponse.json(controls, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch controls:", error);
        return NextResponse.json({ message: 'Failed to fetch controls', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db } = await getTenantDb();
        if (!data.name || !data.category || !data.status || !data.effectiveness) {
            return NextResponse.json({ message: 'Missing required fields for control' }, { status: 400 });
        }
        const newControl = {
            name: data.name,
            description: data.description || "",
            category: data.category,
            owner: data.owner || "",
            status: data.status,
            effectiveness: data.effectiveness,
            compliance: data.compliance || "",
            relatedStandards: data.relatedStandards || [],
            documentIds: data.documentIds || [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await db.collection(CONTROLS_COLLECTION).insertOne(newControl);
        const insertedControl = await db.collection(CONTROLS_COLLECTION).findOne({ _id: result.insertedId });
        if (!insertedControl) return NextResponse.json({ message: 'Failed to create control' }, { status: 500 })
        return NextResponse.json({ ...insertedControl, _id: insertedControl._id.toString() }, { status: 201 });
    } catch (error) {
        console.error("Failed to create control:", error);
        return NextResponse.json({ message: 'Failed to create control', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
