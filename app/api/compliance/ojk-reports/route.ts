import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import type { WithId, Document } from 'mongodb';

const COLLECTION = 'OJK_Compliance_Report';

export async function GET(req: Request) {
    try {
        const { db } = await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const order = searchParams.get('order') === 'asc' ? 1 : -1;
        const docs: WithId<Document>[] = await db
            .collection(COLLECTION)
            .find({})
            .sort({ _id: order })
            .toArray();
        const records = docs.map((d) => ({ _id: d._id.toString(), ...d }));
        return NextResponse.json(records, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch OJK reports:', error);
        return NextResponse.json(
            { message: 'Failed to fetch OJK reports', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
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

        if (!Bulan || !Jenis_Laporan || !Periode || !DueDate || !Pengiriman || !Regulasi_acuan) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        let fileUrl: string | undefined;
        if (file) {
            if (Status) doc.Status = Status;
            if (Kepatuhan) doc.Kepatuhan = Kepatuhan;
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ojk-reports');
            await mkdir(uploadsDir, { recursive: true });
            const filePath = path.join(uploadsDir, file.name);
            await writeFile(filePath, buffer);
            fileUrl = `/uploads/ojk-reports/${file.name}`;
        }

        const { db } = await connectToDatabase();
        const doc: Record<string, unknown> = {
            Bulan,
            Jenis_Laporan,
            Periode,
            DueDate,
            Pengiriman,
            Regulasi_acuan,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        if (fileUrl) doc.fileUrl = fileUrl;
        const result = await db.collection(COLLECTION).insertOne(doc);
        return NextResponse.json({ _id: result.insertedId.toString(), ...doc }, { status: 201 });
    } catch (error) {
        console.error('Failed to create OJK report:', error);
        return NextResponse.json(
            { message: 'Failed to create OJK report', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
