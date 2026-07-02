import { NextResponse, NextRequest } from 'next/server'
import { getTenantDb } from '@/lib/db-helper'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

const COLLECTION = 'user_access_reviews'
const HISTORY_COLLECTION = 'user_access_review_history'

export async function GET(request: NextRequest) {
    try {
        const { db } = await getTenantDb()
        const { searchParams } = new URL(request.url)

        const systemId = searchParams.get('systemId')
        const department = searchParams.get('department')
        const accountStatus = searchParams.get('accountStatus')
        const verificationStatus = searchParams.get('verificationStatus')
        const search = searchParams.get('search')

        // Build filter
        const filter: Record<string, unknown> = {}

        if (systemId) {
            filter.systemId = systemId
        }
        if (department) {
            filter.department = department
        }
        if (accountStatus) {
            filter.accountStatus = accountStatus
        }
        if (verificationStatus) {
            filter.verificationStatus = verificationStatus
        }
        if (search) {
            filter.$or = [
                { employeeName: { $regex: search, $options: 'i' } },
                { accountName: { $regex: search, $options: 'i' } },
            ]
        }

        const items = await db
            .collection(COLLECTION)
            .find(filter)
            .sort({ dateOfDataEntry: -1 })
            .toArray()

        return NextResponse.json(items, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal mengambil data user access review', error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const { db, user } = await getTenantDb()

        // Validate required fields
        const requiredFields = ['systemId', 'systemName', 'employeeName', 'accountName', 'role', 'accountStatus', 'dateOfDataEntry']
        for (const field of requiredFields) {
            if (!data[field]) {
                return NextResponse.json(
                    { message: `Field '${field}' wajib diisi` },
                    { status: 400 }
                )
            }
        }

        const now = new Date()

        const newEntry = {
            _id: new ObjectId(),
            systemId: data.systemId,
            systemName: data.systemName,
            employeeName: data.employeeName,
            accountName: data.accountName,
            role: data.role,
            accountStatus: data.accountStatus,
            dateOfDataEntry: data.dateOfDataEntry,
            department: user.departmentName || '',
            departmentId: user.departmentId || '',
            enteredBy: user.userId,
            enteredByName: user.userName,
            verificationStatus: 'Pending',
            verificationFromLog: null,
            dateOfVerification: null,
            verifiedBy: null,
            verifiedByName: null,
            verificationNotes: null,
            inactiveDate: null,
            notes: data.notes || '',
            createdAt: now,
            updatedAt: now,
        }

        await db.collection(COLLECTION).insertOne(newEntry)

        // Create history entry
        const historyEntry = {
            _id: new ObjectId(),
            reviewId: newEntry._id.toString(),
            action: 'CREATED',
            performedBy: user.userId,
            performedByName: user.userName,
            performedAt: now,
            details: {
                systemName: newEntry.systemName,
                employeeName: newEntry.employeeName,
                accountName: newEntry.accountName,
                role: newEntry.role,
                accountStatus: newEntry.accountStatus,
            },
        }

        await db.collection(HISTORY_COLLECTION).insertOne(historyEntry)

        return NextResponse.json(newEntry, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal membuat data user access review', error: (error as Error).message },
            { status: 500 }
        )
    }
}
