import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { db } = await connectToDatabase();
        const { id } = params;
        await db.collection('integrated-standard-table').updateOne({ _id: new ObjectId(id) }, { $set: body });
        return NextResponse.json({ _id: id, ...body });
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to update integrated standard', error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        // Authorization check - only SUPERUSER can delete
        const { canDelete, unauthorizedDeleteResponse } = await import('@/lib/auth');
        if (!(await canDelete())) {
            return NextResponse.json(unauthorizedDeleteResponse(), { status: 403 });
        }

        const { db } = await connectToDatabase();
        const { id } = params;
        await db.collection('integrated-standard-table').deleteOne({ _id: new ObjectId(id) });
        return NextResponse.json({ _id: id });
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to delete integrated standard', error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await connectToDatabase();
        const { id } = params;
        const record = await db
            .collection('integrated-standard-table')
            .findOne({ _id: new ObjectId(id) });
        if (!record) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ _id: record._id.toString(), ...record });
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to fetch integrated standard', error: (error as Error).message },
            { status: 500 }
        );
    }
}