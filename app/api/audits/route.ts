import { NextResponse, NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

const AUDITS_COLLECTION = 'audits'

// Ambil seluruh daftar audit
export async function GET(_req: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const audits = await db.collection(AUDITS_COLLECTION).find({}).sort({ date: -1 }).toArray()
    return NextResponse.json(audits, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal mengambil data audit', error: (error as Error).message },
      { status: 500 }
    )
  }
}

// Buat audit baru
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { db } = await connectToDatabase()

    if (!data.name || !data.standard || !data.department || !data.date || !data.auditor) {
      return NextResponse.json({ message: 'Data audit tidak lengkap' }, { status: 400 })
    }

    const newAudit = {
      ...data,
      status: data.status || 'Scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: new ObjectId(),
    }

    await db.collection(AUDITS_COLLECTION).insertOne(newAudit)
    return NextResponse.json(newAudit, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal membuat audit', error: (error as Error).message },
      { status: 500 }
    )
  }
}