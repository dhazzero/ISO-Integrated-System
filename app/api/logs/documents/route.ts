import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const logsRaw = await db.collection('documentLogs').find({}).sort({ timestamp: -1 }).toArray()
    const logs = logsRaw.map((l: any) => ({ ...l, id: l._id.toString() }))
    return NextResponse.json(logs)
  } catch (error) {
    console.error('GET_DOCUMENT_LOGS_ERROR:', error)
    return NextResponse.json({ message: 'Failed to fetch logs' }, { status: 500 })
  }
}
