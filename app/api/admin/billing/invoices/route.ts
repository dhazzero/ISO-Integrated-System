// app/api/admin/billing/invoices/route.ts - Invoices API
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
        const invoices = await db.collection('invoices')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ invoices });
    } catch (error) {
        console.error('Failed to fetch invoices:', error);
        return NextResponse.json({ invoices: [] });
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

        // Generate invoice number
        const count = await db.collection('invoices').countDocuments();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        const invoice = {
            invoiceNumber,
            ...body,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('invoices').insertOne(invoice);

        return NextResponse.json({
            message: 'Invoice created',
            invoice: { ...invoice, _id: result.insertedId }
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create invoice:', error);
        return NextResponse.json({ message: 'Failed to create invoice' }, { status: 500 });
    }
}
