import { NextResponse, NextRequest } from 'next/server'
import { getTenantDb } from '@/lib/db-helper'

export const dynamic = 'force-dynamic'

const HISTORY_COLLECTION = 'user_access_review_history'

export async function GET(request: NextRequest) {
    try {
        const { db } = await getTenantDb()
        const { searchParams } = new URL(request.url)

        const action = searchParams.get('action')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const performedBy = searchParams.get('performedBy')

        // Build filter
        const filter: Record<string, unknown> = {}

        if (action) {
            filter.action = action
        }

        if (performedBy) {
            filter.performedBy = performedBy
        }

        if (startDate || endDate) {
            const dateFilter: Record<string, Date> = {}
            if (startDate) {
                dateFilter.$gte = new Date(startDate)
            }
            if (endDate) {
                dateFilter.$lte = new Date(endDate)
            }
            filter.performedAt = dateFilter
        }

        const history = await db
            .collection(HISTORY_COLLECTION)
            .find(filter)
            .sort({ performedAt: -1 })
            .limit(100)
            .toArray()

        return NextResponse.json(history, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal mengambil riwayat user access review', error: (error as Error).message },
            { status: 500 }
        )
    }
}
