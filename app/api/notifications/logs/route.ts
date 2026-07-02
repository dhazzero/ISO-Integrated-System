import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';

// GET - Retrieve notification logs
export async function GET() {
    try {
        const { db } = await getTenantDb();
        const logs = await db.collection('notification_logs')
            .find({})
            .sort({ sentAt: -1 })
            .limit(50)
            .toArray();

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Failed to fetch notification logs:', error);
        return NextResponse.json({ message: 'Gagal mengambil log notifikasi' }, { status: 500 });
    }
}
