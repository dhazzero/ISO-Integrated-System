// app/api/admin/stats/route.ts - Get super admin dashboard stats
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

        const totalCompanies = await db.collection('companies').countDocuments();
        const activeCompanies = await db.collection('companies').countDocuments({ status: 'active' });
        const totalSuperAdmins = await db.collection('super_admins').countDocuments();

        return NextResponse.json({
            totalCompanies,
            activeCompanies,
            totalSuperAdmins,
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({
            totalCompanies: 0,
            activeCompanies: 0,
            totalSuperAdmins: 0,
        });
    }
}
