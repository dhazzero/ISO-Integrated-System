// app/api/admin/companies/route.ts - Super Admin Company Management API
import { NextRequest, NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { getCurrentUser } from '@/lib/auth';
import { Company } from '@/lib/types';
import { ObjectId } from 'mongodb';

// GET - List all companies (super admin only)
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.isSuperAdmin) {
            return NextResponse.json(
                { message: 'Akses ditolak. Hanya Super Admin yang dapat mengakses.' },
                { status: 403 }
            );
        }

        const { db } = await connectToMasterDatabase();
        const companies = await db.collection<Company>('companies')
            .find({})
            .sort({ name: 1 })
            .toArray();

        return NextResponse.json({ companies });
    } catch (error) {
        console.error('Failed to fetch companies:', error);
        return NextResponse.json(
            { message: 'Gagal mengambil data perusahaan' },
            { status: 500 }
        );
    }
}

// POST - Create new company (super admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.isSuperAdmin) {
            return NextResponse.json(
                { message: 'Akses ditolak. Hanya Super Admin yang dapat mengakses.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { code, name, address, phone, email, website, taxId, businessLicense, status, subscription } = body;

        if (!code || !name) {
            return NextResponse.json(
                { message: 'Kode dan nama perusahaan wajib diisi' },
                { status: 400 }
            );
        }

        // Validate code format (uppercase, alphanumeric, 2-10 chars)
        const codeUppercase = code.toUpperCase().trim();
        if (!/^[A-Z0-9]{2,10}$/.test(codeUppercase)) {
            return NextResponse.json(
                { message: 'Kode perusahaan harus 2-10 karakter alfanumerik' },
                { status: 400 }
            );
        }

        const { db } = await connectToMasterDatabase();

        // Check if code already exists
        const existingCompany = await db.collection<Company>('companies').findOne({ code: codeUppercase });
        if (existingCompany) {
            return NextResponse.json(
                { message: 'Kode perusahaan sudah digunakan' },
                { status: 409 }
            );
        }

        // Generate database name
        const databaseName = `iso_${codeUppercase.toLowerCase()}`;

        const newCompany: Omit<Company, '_id'> = {
            code: codeUppercase,
            name: name.trim(),
            address: address || '',
            phone: phone || '',
            email: email || '',
            website: website || '',
            taxId: taxId || '',
            businessLicense: businessLicense || '',
            status: status || 'active',
            databaseName,
            subscription: subscription || {
                plan: 'basic',
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('companies').insertOne(newCompany);

        // --- Create default admin user for the new company ---
        const bcrypt = await import('bcryptjs');
        const { connectToTenantDatabase } = await import('@/lib/mongodb-tenant');
        const { db: tenantDb } = await connectToTenantDatabase(codeUppercase);

        const defaultPassword = 'admin123'; // Default password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const defaultUser = {
            userId: 'admin',
            name: 'Administrator',
            email: email || `admin@${codeUppercase.toLowerCase()}.local`,
            password: hashedPassword,
            role: 'admin',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await tenantDb.collection('users').insertOne(defaultUser);
        // --- End default user creation ---

        // Log the action
        await db.collection('super_admin_logs').insertOne({
            action: 'CREATE_COMPANY',
            description: `Created company: ${newCompany.name} (${newCompany.code}) with default admin user`,
            userId: user.userId,
            userName: user.userName,
            timestamp: new Date(),
            details: { companyCode: newCompany.code, companyName: newCompany.name, defaultUser: 'admin' }
        });

        return NextResponse.json({
            message: 'Perusahaan berhasil dibuat dengan user admin default (password: admin123)',
            company: { ...newCompany, _id: result.insertedId }
        }, { status: 201 });

    } catch (error) {
        console.error('Failed to create company:', error);
        return NextResponse.json(
            { message: 'Gagal membuat perusahaan' },
            { status: 500 }
        );
    }
}
