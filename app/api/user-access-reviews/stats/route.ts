import { NextResponse } from 'next/server'
import { getTenantDb } from '@/lib/db-helper'

export const dynamic = 'force-dynamic'

const COLLECTION = 'user_access_reviews'

export async function GET() {
    try {
        const { db } = await getTenantDb()

        // Run all aggregations in parallel
        const [
            totalEntries,
            activeAccounts,
            inactiveAccounts,
            pendingVerification,
            verified,
            systemStats,
            departmentStats,
        ] = await Promise.all([
            db.collection(COLLECTION).countDocuments({}),
            db.collection(COLLECTION).countDocuments({ accountStatus: 'Active' }),
            db.collection(COLLECTION).countDocuments({ accountStatus: 'Inactive' }),
            db.collection(COLLECTION).countDocuments({ verificationStatus: 'Pending' }),
            db.collection(COLLECTION).countDocuments({ verificationStatus: 'Verified' }),
            db.collection(COLLECTION).aggregate([
                {
                    $group: {
                        _id: '$systemName',
                        total: { $sum: 1 },
                        active: {
                            $sum: { $cond: [{ $eq: ['$accountStatus', 'Active'] }, 1, 0] },
                        },
                        inactive: {
                            $sum: { $cond: [{ $eq: ['$accountStatus', 'Inactive'] }, 1, 0] },
                        },
                        pending: {
                            $sum: { $cond: [{ $eq: ['$verificationStatus', 'Pending'] }, 1, 0] },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        systemName: '$_id',
                        total: 1,
                        active: 1,
                        inactive: 1,
                        pending: 1,
                    },
                },
                { $sort: { systemName: 1 } },
            ]).toArray(),
            db.collection(COLLECTION).aggregate([
                {
                    $group: {
                        _id: '$department',
                        total: { $sum: 1 },
                        active: {
                            $sum: { $cond: [{ $eq: ['$accountStatus', 'Active'] }, 1, 0] },
                        },
                        inactive: {
                            $sum: { $cond: [{ $eq: ['$accountStatus', 'Inactive'] }, 1, 0] },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        department: '$_id',
                        total: 1,
                        active: 1,
                        inactive: 1,
                    },
                },
                { $sort: { department: 1 } },
            ]).toArray(),
        ])

        const stats = {
            totalEntries,
            activeAccounts,
            inactiveAccounts,
            pendingVerification,
            verified,
            systemStats,
            departmentStats,
        }

        return NextResponse.json(stats, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal mengambil statistik user access review', error: (error as Error).message },
            { status: 500 }
        )
    }
}
