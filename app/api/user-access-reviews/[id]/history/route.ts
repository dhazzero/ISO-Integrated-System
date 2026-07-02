import { NextResponse, NextRequest } from 'next/server'
import { getTenantDb } from '@/lib/db-helper'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

const HISTORY_COLLECTION = 'user_access_review_history'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { db } = await getTenantDb()

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 })
        }

        const history = await db
            .collection(HISTORY_COLLECTION)
            .find({ reviewId: id })
            .sort({ performedAt: -1 })
            .toArray()

        return NextResponse.json(history, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal mengambil riwayat user access review', error: (error as Error).message },
            { status: 500 }
        )
    }
}
