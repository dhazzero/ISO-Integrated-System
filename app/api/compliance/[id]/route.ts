import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'
const COLLECTION_NAME = 'compliance'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { db } = await connectToDatabase()
        const record = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(params.id) })
        if (!record) {
            return NextResponse.json({ message: 'Record not found' }, { status: 404 })
        }
        return NextResponse.json(record, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to fetch compliance record', error: (error as Error).message },
            { status: 500 },
        )
    }
}