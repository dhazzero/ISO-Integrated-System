import { NextResponse } from "next/server"
import { getTenantDb } from "@/lib/db-helper"
import { NextRequest } from "next/server"

const TRAININGS_COLLECTION = 'trainings'

export async function GET() {
    try {
        const { db } = await getTenantDb()
        const trainings = await db.collection(TRAININGS_COLLECTION).find({}).toArray()
        return NextResponse.json(trainings)
    } catch (error) {
        return NextResponse.json({ message: "Error fetching trainings", error }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { db } = await getTenantDb()
        const body = await request.json()

        if (!body.name || !body.category || !body.participants || !body.date || !body.status) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
        }

        const result = await db.collection(TRAININGS_COLLECTION).insertOne({
            ...body,
            createdAt: new Date(),
        })

        const newTraining = await db.collection(TRAININGS_COLLECTION).findOne({ _id: result.insertedId })

        return NextResponse.json(newTraining, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Error creating training", error }, { status: 500 })
    }
}
