import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import type { WithId, Document } from 'mongodb';

const COLLECTION = 'OJK_Compliance_Report';

export async function GET(req: Request) {
    try {
        const { db } = await getTenantDb();
        const { searchParams } = new URL(req.url);
        const order = searchParams.get('order') === 'asc' ? 1 : -1;
        const year = searchParams.get('year');

        // Build filter — also match legacy docs without Tahun field via DueDate
        const filter: Record<string, unknown> = {};
        if (year) {
            filter.$or = [
                { Tahun: parseInt(year) },
                { Tahun: { $exists: false }, DueDate: { $regex: year } },
            ];
        }

        const docs: WithId<Document>[] = await db
            .collection(COLLECTION)
            .find(filter)
            .sort({ _id: order })
            .toArray();
        const records = docs.map((d) => ({ _id: d._id.toString(), ...d }));

        // Get distinct years for dropdown
        const allYears = await db.collection(COLLECTION).distinct('Tahun');
        const currentYear = new Date().getFullYear();
        const years = [...new Set([...allYears.filter((y: unknown) => typeof y === 'number'), currentYear])].sort((a: number, b: number) => b - a);

        return NextResponse.json({ records, years }, { status: 200 });
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
        const PIC_Name = formData.get('PIC_Name')?.toString();
        const PIC_Email = formData.get('PIC_Email')?.toString();
        const Recurring = formData.get('Recurring')?.toString() === 'true';
        const Recurring_Periode = formData.get('Recurring_Periode')?.toString();
        const TahunInput = formData.get('Tahun')?.toString();
        const file = formData.get('file') as File | null;

        if (!Bulan || !Jenis_Laporan || !Periode || !DueDate || !Pengiriman || !Regulasi_acuan) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Auto-extract year from DueDate or use explicit input
        let Tahun = TahunInput ? parseInt(TahunInput) : new Date().getFullYear();
        if (DueDate) {
            const parsed = new Date(DueDate);
            if (!isNaN(parsed.getTime())) {
                Tahun = parsed.getFullYear();
            }
        }

        let fileUrl: string | undefined;
        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ojk-reports');
            await mkdir(uploadsDir, { recursive: true });
            const filePath = path.join(uploadsDir, file.name);
            await writeFile(filePath, buffer);
            fileUrl = `/uploads/ojk-reports/${file.name}`;
        }

        const { db } = await getTenantDb();
        const doc: Record<string, unknown> = {
            Bulan,
            Jenis_Laporan,
            Periode,
            DueDate,
            Pengiriman,
            Regulasi_acuan,
            Status: Status || undefined,
            Kepatuhan: Kepatuhan || undefined,
            PIC_Name: PIC_Name || undefined,
            PIC_Email: PIC_Email || undefined,
            Tahun,
            Recurring: Recurring || false,
            Recurring_Periode: Recurring ? (Recurring_Periode || 'Tahunan') : undefined,
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
