import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/lib/mongodb'

const COLLECTION = 'compliance'

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { db } = await connectToDatabase()
        const control = await db
            .collection(COLLECTION)
            .findOne({ _id: new ObjectId(params.id) })
        if (!control) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 })
        }
        return NextResponse.json({ ...control, _id: control._id.toString() })
    } catch (error) {
        console.error('Failed to fetch control', error)
        return NextResponse.json({ message: 'Failed to fetch control' }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const data = await req.json()
        const { db } = await connectToDatabase()
        const update = {
            ...data,
            updatedAt: new Date(),
        }
        await db.collection(COLLECTION).updateOne({ _id: new ObjectId(params.id) }, { $set: update })
        const updated = await db
            .collection(COLLECTION)
            .findOne({ _id: new ObjectId(params.id) })
        if (!updated) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 })
        }
        return NextResponse.json({ ...updated, _id: updated._id.toString() })
    } catch (error) {
        console.error('Failed to update control', error)
        return NextResponse.json({ message: 'Failed to update control' }, { status: 500 })
    }
}