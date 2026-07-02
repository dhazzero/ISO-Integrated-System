// app/api/admin/billing/plans/route.ts - Subscription plans API
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
        const plans = await db.collection('subscription_plans')
            .find({})
            .sort({ price: 1 })
            .toArray();

        return NextResponse.json({ plans });
    } catch (error) {
        console.error('Failed to fetch plans:', error);
        return NextResponse.json({ plans: [] });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.isSuperAdmin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { db } = await connectToMasterDatabase();

        const plan = {
            ...body,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('subscription_plans').insertOne(plan);

        return NextResponse.json({
            message: 'Plan created',
            plan: { ...plan, _id: result.insertedId }
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create plan:', error);
        return NextResponse.json({ message: 'Failed to create plan' }, { status: 500 });
    }
}
