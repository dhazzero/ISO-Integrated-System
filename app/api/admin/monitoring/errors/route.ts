// app/api/admin/monitoring/errors/route.ts - Error logs API
import { NextRequest, NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || !user.isSuperAdmin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { db } = await connectToMasterDatabase();
        const errors = await db.collection('error_logs')
            .find({})
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();

        return NextResponse.json({ errors });
    } catch (error) {
        console.error('Failed to fetch error logs:', error);
        return NextResponse.json({ errors: [] });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { db } = await connectToMasterDatabase();

        const errorLog = {
            ...body,
            resolved: false,
            timestamp: new Date(),
        };

        await db.collection('error_logs').insertOne(errorLog);

        return NextResponse.json({ message: 'Error logged' }, { status: 201 });
    } catch (error) {
        console.error('Failed to log error:', error);
        return NextResponse.json({ message: 'Failed to log error' }, { status: 500 });
    }
}
