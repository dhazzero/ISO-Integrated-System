// app/api/settings/standards/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const STANDARDS_COLLECTION = 'iso_standards';

// GET all standards
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const standards = await db.collection(STANDARDS_COLLECTION).find({}).sort({ name: 1 }).toArray();
        return NextResponse.json(standards, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch standards:", error);
        return NextResponse.json({ message: 'Failed to fetch standards', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

// POST a new standard
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { db } = await connectToDatabase();

        if (!data.name || !data.title) {
            return NextResponse.json({ message: 'Name and title are required' }, { status: 400 });
        }

        const newStandard = {
            name: data.name,
            title: data.title,
            description: data.description || "",
            category: data.category || "",
            status: data.status || "Active",
            usageCount: 0, // Default usageCount
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

// PUT update a standard by id
export async function PUT(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const data = await request.json();

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid or missing id' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };
        delete (updateData as any)._id;

        const result = await db.collection(STANDARDS_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Standard not found' }, { status: 404 });
        }

        const updatedStandard = await db.collection(STANDARDS_COLLECTION).findOne({ _id: new ObjectId(id) });
        return NextResponse.json(updatedStandard, { status: 200 });
    } catch (error) {
        console.error('Failed to update standard:', error);
        return NextResponse.json({ message: 'Failed to update standard', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

// DELETE a standard by id
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid or missing id' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        const result = await db.collection(STANDARDS_COLLECTION).deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Standard not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Standard deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Failed to delete standard:', error);
        return NextResponse.json({ message: 'Failed to delete standard', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}