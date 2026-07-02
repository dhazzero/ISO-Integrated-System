import { NextResponse, NextRequest } from 'next/server'
import { getTenantDb } from '@/lib/db-helper'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

const COLLECTION = 'user_access_reviews'
const HISTORY_COLLECTION = 'user_access_review_history'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { db, user } = await getTenantDb()

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 })
        }

        const data = await request.json()

        if (!data.verificationFromLog) {
            return NextResponse.json(
                { message: 'Field verificationFromLog wajib diisi' },
                { status: 400 }
            )
        }

        // Check if entry exists
        const currentEntry = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
        if (!currentEntry) {
            return NextResponse.json({ message: 'Data user access review tidak ditemukan' }, { status: 404 })
        }

        const now = new Date()

        const updateData = {
            verificationStatus: 'Verified',
            verificationFromLog: data.verificationFromLog,
            dateOfVerification: now,
            verifiedBy: user.userId,
            verifiedByName: user.userName,
            verificationNotes: data.notes || null,
            updatedAt: now,
        }

        const result = await db.collection(COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        )

        if (!result) {
            return NextResponse.json({ message: 'Data user access review tidak ditemukan untuk diverifikasi' }, { status: 404 })
        }

        // Create history entry
        const historyEntry = {
            _id: new ObjectId(),
            reviewId: id,
            action: 'VERIFIED',
            performedBy: user.userId,
            performedByName: user.userName,
            performedAt: now,
            details: {
                systemName: result.systemName,
                employeeName: result.employeeName,
                accountName: result.accountName,
                verificationFromLog: data.verificationFromLog,
                notes: data.notes || null,
                previousStatus: currentEntry.verificationStatus,
            },
        }

        await db.collection(HISTORY_COLLECTION).insertOne(historyEntry)

        return NextResponse.json(result, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal memverifikasi data user access review', error: (error as Error).message },
            { status: 500 }
        )
    }
}
