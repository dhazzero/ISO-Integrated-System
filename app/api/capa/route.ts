import { NextRequest, NextResponse } from 'next/server'
import { getTenantDb } from '@/lib/db-helper'
import { ObjectId } from 'mongodb'

const CAPA_COLLECTION = 'capas'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
    try {
        const { db } = await getTenantDb()
        const capas = await db.collection(CAPA_COLLECTION).find({}).sort({ createdAt: -1 }).toArray()
        return NextResponse.json(capas, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data CAPA', error: (error as Error).message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const { db } = await getTenantDb()

        if (!data.issue || !data.department || !data.responsible) {
            return NextResponse.json({ message: 'Data CAPA tidak lengkap' }, { status: 400 })
        }

        const newCapa = {
            ...data,
            status: data.status || 'Open',
            createdAt: new Date(),
            updatedAt: new Date(),
            _id: new ObjectId(),
        }

        await db.collection(CAPA_COLLECTION).insertOne(newCapa)
        return NextResponse.json(newCapa, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: 'Gagal membuat CAPA', error: (error as Error).message }, { status: 500 })
    }
}