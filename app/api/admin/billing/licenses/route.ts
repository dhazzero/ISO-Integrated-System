// app/api/admin/billing/licenses/route.ts - License management API
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
        const licenses = await db.collection('licenses')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ licenses });
    } catch (error) {
        console.error('Failed to fetch licenses:', error);
        return NextResponse.json({ licenses: [] });
    }
}

function generateLicenseKey(companyCode: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = [];
    for (let i = 0; i < 4; i++) {
        let segment = '';
        for (let j = 0; j < 4; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(segment);
    }
    return `ISO-${companyCode.toUpperCase()}-${new Date().getFullYear()}-${segments.join('-')}`;
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.isSuperAdmin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { companyCode, planName, duration = 365 } = await request.json();

        if (!companyCode) {
            return NextResponse.json({ message: 'Company code required' }, { status: 400 });
        }

        const { db } = await connectToMasterDatabase();

        // Get company info
        const company = await db.collection('companies').findOne({ code: companyCode.toUpperCase() });

        const license = {
            licenseKey: generateLicenseKey(companyCode),
            companyCode: companyCode.toUpperCase(),
            companyName: company?.name || `Company ${companyCode}`,
            planName: planName || 'basic',
            status: 'pending',
            expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('licenses').insertOne(license);

        return NextResponse.json({
            message: 'License created',
            license: { ...license, _id: result.insertedId }
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create license:', error);
        return NextResponse.json({ message: 'Failed to create license' }, { status: 500 });
    }
}
