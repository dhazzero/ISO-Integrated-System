import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const FINDINGS_COLLECTION = 'findings';
const AUDITS_COLLECTION = 'audits';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { db } = await connectToDatabase();
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID Finding tidak valid atau tidak ada' }, { status: 400 });
        }

        const finding = await db.collection(FINDINGS_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!finding) {
            return NextResponse.json({ message: 'Finding tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json(finding, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data finding', error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { db } = await connectToDatabase();
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID Finding tidak valid' }, { status: 400 });
        }

        const data = await req.json();
        delete data._id;

        const updateResult = await db.collection(FINDINGS_COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!updateResult) {
            return NextResponse.json({ message: 'Finding tidak ditemukan untuk diperbarui' }, { status: 404 });
        }

        // Logika otomatisasi penyelesaian audit
        if (updateResult.status === 'Closed' && updateResult.auditId) {
            const openFindingsCount = await db.collection(FINDINGS_COLLECTION).countDocuments({
                auditId: updateResult.auditId,
                status: { $in: ['Open', 'In Progress'] }
            });

            if (openFindingsCount === 0) {
                await db.collection(AUDITS_COLLECTION).updateOne(
                    { _id: new ObjectId(updateResult.auditId) },
                    { $set: { status: 'Completed', completedDate: new Date().toISOString() } }
                );
            }
        }

        return NextResponse.json(updateResult, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui finding', error: (error as Error).message }, { status: 500 });
    }
}