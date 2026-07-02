import { NextResponse, NextRequest } from 'next/server'
import { getTenantDb } from '@/lib/db-helper'
import { canDelete } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

const COLLECTION = 'user_access_reviews'
const HISTORY_COLLECTION = 'user_access_review_history'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { db } = await getTenantDb()

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 })
        }

        const entry = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })

        if (!entry) {
            return NextResponse.json({ message: 'Data user access review tidak ditemukan' }, { status: 404 })
        }

        return NextResponse.json(entry, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal mengambil data user access review', error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { db, user } = await getTenantDb()

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 })
        }

        const data = await request.json()
        delete data._id

        // Get current entry to track changes
        const currentEntry = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
        if (!currentEntry) {
            return NextResponse.json({ message: 'Data user access review tidak ditemukan' }, { status: 404 })
        }

        const now = new Date()

        // Track changes
        const changes: Record<string, { from: unknown; to: unknown }> = {}
        const trackFields = ['systemId', 'systemName', 'employeeName', 'accountName', 'role', 'accountStatus', 'notes', 'dateOfDataEntry']
        for (const field of trackFields) {
            if (data[field] !== undefined && data[field] !== currentEntry[field]) {
                changes[field] = { from: currentEntry[field], to: data[field] }
            }
        }

        // Determine action type based on changes
        let action = 'UPDATED'
        const updateData: Record<string, unknown> = {
            ...data,
            updatedAt: now,
        }

        if (changes.accountStatus) {
            const newStatus = data.accountStatus
            if (newStatus === 'Inactive') {
                action = 'STATUS_CHANGED'
                updateData.inactiveDate = now
            } else if (newStatus === 'Active') {
                action = 'REACTIVATED'
                updateData.inactiveDate = null
            } else {
                action = 'STATUS_CHANGED'
            }
        }

        const result = await db.collection(COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        )

        if (!result) {
            return NextResponse.json({ message: 'Data user access review tidak ditemukan untuk diperbarui' }, { status: 404 })
        }

        // Create history entry if there are changes
        if (Object.keys(changes).length > 0) {
            const historyEntry = {
                _id: new ObjectId(),
                reviewId: id,
                action,
                performedBy: user.userId,
                performedByName: user.userName,
                performedAt: now,
                changes,
                details: {
                    systemName: result.systemName,
                    employeeName: result.employeeName,
                    accountName: result.accountName,
                },
            }

            await db.collection(HISTORY_COLLECTION).insertOne(historyEntry)
        }

        return NextResponse.json(result, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal memperbarui data user access review', error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        // Check delete permission
        const hasDeletePermission = await canDelete()
        if (!hasDeletePermission) {
            return NextResponse.json(
                { message: 'Anda tidak memiliki izin untuk menghapus data. Hanya Administrator yang dapat menghapus.', error: 'UNAUTHORIZED_DELETE' },
                { status: 403 }
            )
        }

        const { db } = await getTenantDb()

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 })
        }

        const deleteResult = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) })

        if (deleteResult.deletedCount === 0) {
            return NextResponse.json({ message: 'Data user access review tidak ditemukan' }, { status: 404 })
        }

        // Delete all related history entries
        await db.collection(HISTORY_COLLECTION).deleteMany({ reviewId: id })

        return NextResponse.json({ message: 'Data user access review dan riwayat terkait berhasil dihapus' }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal menghapus data user access review', error: (error as Error).message },
            { status: 500 }
        )
    }
}
