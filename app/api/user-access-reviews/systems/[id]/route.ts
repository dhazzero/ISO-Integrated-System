import { NextResponse, NextRequest } from 'next/server'
import { getTenantDb } from '@/lib/db-helper'
import { canDelete } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

const COLLECTION = 'user_access_systems'
const REVIEWS_COLLECTION = 'user_access_reviews'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { db } = await getTenantDb()

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID sistem tidak valid' }, { status: 400 })
        }

        const data = await request.json()
        delete data._id

        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        }

        if (data.name !== undefined) {
            updateData.name = data.name.trim()
        }
        if (data.description !== undefined) {
            updateData.description = data.description
        }
        if (data.isActive !== undefined) {
            updateData.isActive = data.isActive
        }

        const result = await db.collection(COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        )

        if (!result) {
            return NextResponse.json({ message: 'Sistem tidak ditemukan untuk diperbarui' }, { status: 404 })
        }

        return NextResponse.json(result, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal memperbarui data sistem', error: (error as Error).message },
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
            return NextResponse.json({ message: 'ID sistem tidak valid' }, { status: 400 })
        }

        // Check if any reviews reference this system
        const referencedReviews = await db.collection(REVIEWS_COLLECTION).countDocuments({ systemId: id })

        if (referencedReviews > 0) {
            return NextResponse.json(
                {
                    message: `Sistem tidak dapat dihapus karena masih digunakan oleh ${referencedReviews} data user access review. Nonaktifkan sistem terlebih dahulu.`,
                    error: 'SYSTEM_IN_USE',
                    referencedCount: referencedReviews,
                },
                { status: 409 }
            )
        }

        const deleteResult = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) })

        if (deleteResult.deletedCount === 0) {
            return NextResponse.json({ message: 'Sistem tidak ditemukan' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Sistem berhasil dihapus' }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal menghapus sistem', error: (error as Error).message },
            { status: 500 }
        )
    }
}
