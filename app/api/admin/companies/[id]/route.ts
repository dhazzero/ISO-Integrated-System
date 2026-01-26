// app/api/admin/companies/[id]/route.ts - Single Company Management
import { NextRequest, NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { getCurrentUser } from '@/lib/auth';
import { Company } from '@/lib/types';
import { ObjectId } from 'mongodb';

// GET - Get single company with licenses and invoices
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.isSuperAdmin) {
            return NextResponse.json(
                { message: 'Akses ditolak' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const { db } = await connectToMasterDatabase();

        const company = await db.collection<Company>('companies').findOne({
            _id: new ObjectId(id)
        });

        if (!company) {
            return NextResponse.json(
                { message: 'Perusahaan tidak ditemukan' },
                { status: 404 }
            );
        }

        // Fetch licenses for this company
        const licenses = await db.collection('licenses')
            .find({ companyCode: company.code })
            .sort({ createdAt: -1 })
            .toArray();

        // Fetch invoices for this company
        const invoices = await db.collection('invoices')
            .find({ companyCode: company.code })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ company, licenses, invoices });
    } catch (error) {
        console.error('Failed to fetch company:', error);
        return NextResponse.json(
            { message: 'Gagal mengambil data perusahaan' },
            { status: 500 }
        );
    }
}

// PUT - Update company
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.isSuperAdmin) {
            return NextResponse.json(
                { message: 'Akses ditolak' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { name, address, phone, email, website, taxId, businessLicense, status, subscription } = body;

        const { db } = await connectToMasterDatabase();

        const updateData: Partial<Company> = {
            updatedAt: new Date(),
        };

        if (name) updateData.name = name.trim();
        if (address !== undefined) updateData.address = address;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (website !== undefined) updateData.website = website;
        if (taxId !== undefined) updateData.taxId = taxId;
        if (businessLicense !== undefined) updateData.businessLicense = businessLicense;
        if (status) updateData.status = status;
        if (subscription) updateData.subscription = subscription;

        const result = await db.collection('companies').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { message: 'Perusahaan tidak ditemukan' },
                { status: 404 }
            );
        }

        // Log the action
        await db.collection('super_admin_logs').insertOne({
            action: 'UPDATE_COMPANY',
            description: `Updated company: ${id}`,
            userId: user.userId,
            userName: user.userName,
            timestamp: new Date(),
            details: { companyId: id, updates: updateData }
        });

        return NextResponse.json({ message: 'Perusahaan berhasil diperbarui' });
    } catch (error) {
        console.error('Failed to update company:', error);
        return NextResponse.json(
            { message: 'Gagal memperbarui perusahaan' },
            { status: 500 }
        );
    }
}

// DELETE - Delete company (soft delete by setting status to inactive)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.isSuperAdmin) {
            return NextResponse.json(
                { message: 'Akses ditolak' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const { db } = await connectToMasterDatabase();

        // Soft delete - set status to suspended
        const result = await db.collection('companies').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 'suspended',
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { message: 'Perusahaan tidak ditemukan' },
                { status: 404 }
            );
        }

        // Log the action
        await db.collection('super_admin_logs').insertOne({
            action: 'DELETE_COMPANY',
            description: `Suspended company: ${id}`,
            userId: user.userId,
            userName: user.userName,
            timestamp: new Date(),
            details: { companyId: id }
        });

        return NextResponse.json({ message: 'Perusahaan berhasil dihapus' });
    } catch (error) {
        console.error('Failed to delete company:', error);
        return NextResponse.json(
            { message: 'Gagal menghapus perusahaan' },
            { status: 500 }
        );
    }
}
