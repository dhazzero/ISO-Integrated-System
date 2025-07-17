import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const COLLECTION = 'OJK_Compliance_Report';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await connectToDatabase();
        const doc = await db.collection(COLLECTION).findOne({ _id: new ObjectId(params.id) });
        if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json({ ...doc, _id: doc._id.toString() });
    } catch (error) {
        console.error('Failed to fetch OJK report:', error);
        return NextResponse.json(
            { message: 'Failed to fetch OJK report', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const formData = await req.formData();
        const Bulan = formData.get('Bulan')?.toString();
        const Jenis_Laporan = formData.get('Jenis_Laporan')?.toString();
        const Periode = formData.get('Periode')?.toString();
        const DueDate = formData.get('DueDate')?.toString();
        const Pengiriman = formData.get('Pengiriman')?.toString();
        const Regulasi_acuan = formData.get('Regulasi_acuan')?.toString();
        const Status = formData.get('Status')?.toString();
        const Kepatuhan = formData.get('Kepatuhan')?.toString();
        const file = formData.get('file') as File | null;

        const update: Record<string, unknown> = { updatedAt: new Date() };
        if (Bulan !== undefined) update.Bulan = Bulan;
        if (Jenis_Laporan !== undefined) update.Jenis_Laporan = Jenis_Laporan;
        if (Periode !== undefined) update.Periode = Periode;
        if (DueDate !== undefined) update.DueDate = DueDate;
        if (Pengiriman !== undefined) update.Pengiriman = Pengiriman;
        if (Regulasi_acuan !== undefined) update.Regulasi_acuan = Regulasi_acuan;
        if (Status !== undefined) update.Status = Status;
        if (Kepatuhan !== undefined) update.Kepatuhan = Kepatuhan;

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ojk-reports');
            await mkdir(uploadsDir, { recursive: true });
            const filePath = path.join(uploadsDir, file.name);
            await writeFile(filePath, buffer);
            update.fileUrl = `/uploads/ojk-reports/${file.name}`;
        }

        const { db } = await connectToDatabase();
        await db.collection(COLLECTION).updateOne({ _id: new ObjectId(params.id) }, { $set: update });
        const updated = await db.collection(COLLECTION).findOne({ _id: new ObjectId(params.id) });
        if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json({ ...updated, _id: updated._id.toString() });
    } catch (error) {
        console.error('Failed to update OJK report:', error);
        return NextResponse.json(
            { message: 'Failed to update OJK report', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
