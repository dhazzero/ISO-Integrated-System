// app/api/admin/logs/route.ts - Super admin activity logs
import { NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || !user.isSuperAdmin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { db } = await connectToMasterDatabase();
        const logs = await db.collection('super_admin_logs')
            .find({})
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        return NextResponse.json({ logs: [] });
    }
}
