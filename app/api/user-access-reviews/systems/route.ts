import { NextResponse, NextRequest } from 'next/server'
import { getTenantDb } from '@/lib/db-helper'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

const COLLECTION = 'user_access_systems'

export async function GET(request: NextRequest) {
    try {
        const { db } = await getTenantDb()
        const { searchParams } = new URL(request.url)

        const activeOnly = searchParams.get('activeOnly')

        const filter: Record<string, unknown> = {}
        if (activeOnly === 'true') {
            filter.isActive = true
        }

        const systems = await db
            .collection(COLLECTION)
            .find(filter)
            .sort({ name: 1 })
            .toArray()

        return NextResponse.json(systems, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal mengambil data sistem', error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const { db } = await getTenantDb()

        if (!data.name) {
            return NextResponse.json(
                { message: 'Nama sistem wajib diisi' },
                { status: 400 }
            )
        }

        // Check if system name already exists
        const existing = await db.collection(COLLECTION).findOne({
            name: { $regex: `^${data.name.trim()}$`, $options: 'i' },
        })

        if (existing) {
            return NextResponse.json(
                { message: 'Nama sistem sudah ada. Silakan gunakan nama lain.' },
                { status: 409 }
            )
        }

        const now = new Date()

        const newSystem = {
            _id: new ObjectId(),
            name: data.name.trim(),
            description: data.description || '',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }

        await db.collection(COLLECTION).insertOne(newSystem)

        return NextResponse.json(newSystem, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal membuat sistem baru', error: (error as Error).message },
            { status: 500 }
        )
    }
}
