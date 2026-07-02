// app/api/admin/companies/[id]/reset-admin/route.ts
// Reset or create default admin user for a company
import { NextRequest, NextResponse } from 'next/server';
import { connectToMasterDatabase, connectToTenantDatabase } from '@/lib/mongodb-tenant';
import { getCurrentUser } from '@/lib/auth';
import { Company } from '@/lib/types';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.isSuperAdmin) {
            return NextResponse.json(
                { message: 'Akses ditolak. Hanya Super Admin yang dapat mengakses.' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const { db: masterDb } = await connectToMasterDatabase();

        // Find the company
        const company = await masterDb.collection<Company>('companies').findOne({
            _id: new ObjectId(id)
        });

        if (!company) {
            return NextResponse.json(
                { message: 'Perusahaan tidak ditemukan' },
                { status: 404 }
            );
        }

        // Connect to tenant database
        const { db: tenantDb } = await connectToTenantDatabase(company.code);

        // Check if admin user exists
        const existingAdmin = await tenantDb.collection('users').findOne({ userId: 'admin' });

        const defaultPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        if (existingAdmin) {
            // Update existing admin password
            await tenantDb.collection('users').updateOne(
                { userId: 'admin' },
                {
                    $set: {
                        password: hashedPassword,
                        updatedAt: new Date()
                    }
                }
            );
        } else {
            // Create new admin user
            await tenantDb.collection('users').insertOne({
                userId: 'admin',
                name: 'Administrator',
                email: company.email || `admin@${company.code.toLowerCase()}.local`,
                password: hashedPassword,
                role: 'admin',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // Log the action
        await masterDb.collection('super_admin_logs').insertOne({
            action: 'RESET_ADMIN_USER',
            description: `Reset admin user for company: ${company.name} (${company.code})`,
            userId: user.userId,
            userName: user.userName,
            timestamp: new Date(),
            details: { companyCode: company.code, companyName: company.name }
        });

        return NextResponse.json({
            message: `User admin untuk ${company.name} berhasil di-reset. Password: admin123`,
            success: true
        });

    } catch (error) {
        console.error('Failed to reset admin user:', error);
        return NextResponse.json(
            { message: 'Gagal reset user admin', error: (error as Error).message },
            { status: 500 }
        );
    }
}
