import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';

const COLLECTION = 'OJK_Compliance_Report';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fromYear, toYear } = body;

        if (!fromYear || !toYear || toYear <= fromYear) {
            return NextResponse.json(
                { error: 'fromYear dan toYear wajib diisi, toYear harus lebih besar dari fromYear' },
                { status: 400 }
            );
        }

        const { db } = await getTenantDb();

        // Check if target year already has reports
        const existing = await db.collection(COLLECTION).countDocuments({ Tahun: toYear });
        if (existing > 0) {
            return NextResponse.json(
                { error: `Tahun ${toYear} sudah memiliki ${existing} laporan. Hapus dulu jika ingin generate ulang.` },
                { status: 409 }
            );
        }

        // Get all recurring reports from source year
        const sourceReports = await db.collection(COLLECTION).find({
            Tahun: fromYear,
            Recurring: true
        }).toArray();

        if (sourceReports.length === 0) {
            return NextResponse.json(
                { error: `Tidak ada laporan recurring di tahun ${fromYear}` },
                { status: 404 }
            );
        }

        const yearDiff = toYear - fromYear;
        const newReports = sourceReports.map((report) => {
            // Shift DueDate by yearDiff years
            let newDueDate = report.DueDate;
            if (report.DueDate) {
                const parsed = new Date(report.DueDate);
                if (!isNaN(parsed.getTime())) {
                    parsed.setFullYear(parsed.getFullYear() + yearDiff);
                    newDueDate = parsed.toISOString().split('T')[0]; // YYYY-MM-DD format
                }
            }

            return {
                Bulan: report.Bulan,
                Jenis_Laporan: report.Jenis_Laporan,
                Periode: report.Periode,
                DueDate: newDueDate,
                Pengiriman: report.Pengiriman,
                Regulasi_acuan: report.Regulasi_acuan,
                Status: 'Belum Ditinjau',
                Kepatuhan: '',
                PIC_Name: report.PIC_Name || undefined,
                PIC_Email: report.PIC_Email || undefined,
                Tahun: toYear,
                Recurring: true,
                Recurring_Periode: report.Recurring_Periode || 'Tahunan',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        const result = await db.collection(COLLECTION).insertMany(newReports);

        return NextResponse.json({
            success: true,
            message: `Berhasil generate ${result.insertedCount} laporan recurring dari ${fromYear} ke ${toYear}`,
            count: result.insertedCount,
        });
    } catch (error) {
        console.error('Failed to generate reports:', error);
        return NextResponse.json(
            { error: 'Gagal generate laporan', detail: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
