import { NextResponse } from "next/server"
import { getTenantDb } from "@/lib/db-helper"
import { NextRequest } from "next/server"
import { ObjectId } from "mongodb"

const TRAININGS_COLLECTION = 'trainings'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { db } = await getTenantDb()
        if (!ObjectId.isValid(params.id)) {
            return NextResponse.json({ message: "Invalid ID format" }, { status: 400 })
        }
        const training = await db.collection(TRAININGS_COLLECTION).findOne({ _id: new ObjectId(params.id) })
        if (!training) {
            return NextResponse.json({ message: "Training not found" }, { status: 404 })
        }
        return NextResponse.json(training)
    } catch (error) {
        return NextResponse.json({ message: "Error fetching training", error }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { db } = await getTenantDb()
        if (!ObjectId.isValid(params.id)) {
            return NextResponse.json({ message: "Invalid ID format" }, { status: 400 })
        }
        const body = await request.json()
        delete body._id

        const result = await db.collection(TRAININGS_COLLECTION).updateOne(
            { _id: new ObjectId(params.id) },
            { $set: { ...body, updatedAt: new Date() } }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Training not found" }, { status: 404 })
        }

        const updatedTraining = await db.collection(TRAININGS_COLLECTION).findOne({ _id: new ObjectId(params.id) })
        return NextResponse.json(updatedTraining)
    } catch (error) {
        return NextResponse.json({ message: "Error updating training", error }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { canDelete, unauthorizedDeleteResponse } = await import('@/lib/auth');
        if (!(await canDelete())) {
            return NextResponse.json(unauthorizedDeleteResponse(), { status: 403 });
        }

        const { db } = await getTenantDb()
        if (!ObjectId.isValid(params.id)) {
            return NextResponse.json({ message: "Invalid ID format" }, { status: 400 })
        }
        const result = await db.collection(TRAININGS_COLLECTION).deleteOne({ _id: new ObjectId(params.id) })
        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Training not found" }, { status: 404 })
        }
        return NextResponse.json({ message: "Training deleted successfully" })
    } catch (error) {
        return NextResponse.json({ message: "Error deleting training", error }, { status: 500 })
    }
}
