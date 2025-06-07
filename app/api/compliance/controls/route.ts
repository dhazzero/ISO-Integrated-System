// app/api/compliance/controls/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const CONTROLS_COLLECTION = 'compliance_controls';

// GET all controls
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const controls = await db.collection(CONTROLS_COLLECTION).find({}).sort({ name: 1 }).toArray();
        return NextResponse.json(controls, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch controls:", error);
        return NextResponse.json({ message: 'Failed to fetch controls', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

// POST a new control
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db } = await connectToDatabase();

        if (!data.name || !data.category || !data.owner || !data.status || !data.effectiveness) {
            return NextResponse.json({ message: 'Missing required fields for control' }, { status: 400 });
        }

        const newControl = {
            name: data.name,
            description: data.description || "",
            category: data.category,
            owner: data.owner,
            status: data.status,
            effectiveness: data.effectiveness,
            relatedStandards: data.relatedStandards || [], // Array of standard names or IDs
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection(CONTROLS_COLLECTION).insertOne(newControl);
        const insertedControl = await db.collection(CONTROLS_COLLECTION).findOne({ _id: result.insertedId });
        return NextResponse.json(insertedControl, { status: 201 });
    } catch (error) {
        console.error("Failed to create control:", error);
        return NextResponse.json({ message: 'Failed to create control', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}