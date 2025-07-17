import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

const COLLECTION = 'compliance'

// GET Annex A controls from 'compliance' collection
export async function GET() {
    try {
        const { db } = await connectToDatabase()
        const controls = await db
            .collection(COLLECTION)
            .find({ category: 'Annex A' })
            .sort({ control_id: 1 })
            .toArray()

        // Convert MongoDB ObjectIds to strings so the client can use them as keys
        const formatted = controls.map((c) => ({ ...c, _id: c._id.toString() }))
        return NextResponse.json(formatted, { status: 200 })
    } catch (error) {
        console.error('Failed to fetch Annex A controls:', error)
        return NextResponse.json({ message: 'Failed to fetch Annex A controls' }, { status: 500 })
    }
}

// POST a new Annex A control into the same collection
export async function POST(request: Request) {
    try {
        const data = await request.json()
        const { db } = await connectToDatabase()
        const newControl = {
            control_id: data.control_id,
            title: data.title || '',
            requirement: data.requirement || '',
            owner: data.owner || '',
            status: data.status || '',
            pic: data.pic || '',
            last_review: data.last_review || '',
            evidence: data.evidence || '',
            effectiveness: data.effectiveness || '',
            compliance: data.compliance || '',
            category: 'Annex A',
            Standard: data.Standard || 'ISO27001',
            standardName: data.standardName || 'ISO 27001',
            clause: data.clause || '',
            version: data.version || '2022',
            framework: data.framework || 'ISO',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const result = await db.collection(COLLECTION).insertOne(newControl)
        const inserted = await db.collection(COLLECTION).findOne({ _id: result.insertedId })
        const formatted = inserted ? { ...inserted, _id: inserted._id.toString() } : null
        return NextResponse.json(formatted, { status: 201 })
    } catch (error) {
        console.error('Failed to add Annex A control:', error)
        return NextResponse.json({ message: 'Failed to add Annex A control' }, { status: 500 })
    }
}
