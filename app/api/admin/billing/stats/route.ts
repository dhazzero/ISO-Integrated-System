// app/api/admin/billing/stats/route.ts - Billing statistics API
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

        // Get active companies count
        const activeSubscriptions = await db.collection('companies').countDocuments({ status: 'active' });

        // Get pending invoices
        const pendingInvoices = await db.collection('invoices').countDocuments({ status: 'pending' });

        // Get companies expiring in 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringSoon = await db.collection('companies').countDocuments({
            'subscription.expiresAt': { $lte: thirtyDaysFromNow, $gte: new Date() }
        });

        // Calculate total revenue (sum of paid invoices)
        const revenueResult = await db.collection('invoices').aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();

        const totalRevenue = revenueResult[0]?.total || 0;

        // Get recent invoices
        const recentInvoices = await db.collection('invoices')
            .find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        return NextResponse.json({
            stats: {
                totalRevenue,
                activeSubscriptions,
                pendingInvoices,
                expiringSoon,
            },
            recentInvoices,
        });
    } catch (error) {
        console.error('Billing stats error:', error);
        return NextResponse.json({
            stats: {
                totalRevenue: 0,
                activeSubscriptions: 0,
                pendingInvoices: 0,
                expiringSoon: 0,
            },
            recentInvoices: [],
        });
    }
}
