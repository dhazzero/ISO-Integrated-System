// app/api/seed/companies/route.ts - Seed initial companies and migrate data
import { NextRequest, NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { Company, SuperAdmin } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

export async function POST(request: NextRequest) {
    try {
        const { action, password } = await request.json();

        if (action === 'init') {
            return await initializeMultiTenant();
        } else if (action === 'migrate-pbb') {
            return await migrateToPBB();
        } else if (action === 'reset-superadmin') {
            return await resetSuperAdmin(password || 'superadmin123');
        }

        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { message: 'Seed failed', error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Reset or create super admin with new password
async function resetSuperAdmin(newPassword: string) {
    const { db: masterDb } = await connectToMasterDatabase();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Check if super admin exists
    const existingSuperAdmin = await masterDb.collection('super_admins').findOne({ userId: 'superadmin' });

    if (existingSuperAdmin) {
        // Update existing super admin password
        await masterDb.collection('super_admins').updateOne(
            { userId: 'superadmin' },
            {
                $set: {
                    password: hashedPassword,
                    status: 'active',
                    updatedAt: new Date()
                }
            }
        );
        return NextResponse.json({
            success: true,
            message: 'Super admin password reset successfully',
            credentials: {
                companyCode: 'SUPERADMIN',
                userId: 'superadmin',
                password: newPassword
            }
        });
    } else {
        // Create new super admin
        const superAdmin: Omit<SuperAdmin, '_id'> = {
            userId: 'superadmin',
            name: 'Super Administrator',
            email: 'superadmin@iso-system.com',
            password: hashedPassword,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await masterDb.collection('super_admins').insertOne(superAdmin);
        await masterDb.collection('super_admins').createIndex({ userId: 1 }, { unique: true });

        return NextResponse.json({
            success: true,
            message: 'Super admin created successfully',
            credentials: {
                companyCode: 'SUPERADMIN',
                userId: 'superadmin',
                password: newPassword
            }
        });
    }
}

// Initialize master database with PBB company and super admin
async function initializeMultiTenant() {
    const { db: masterDb } = await connectToMasterDatabase();

    // Check if already initialized
    const existingCompany = await masterDb.collection<Company>('companies').findOne({ code: 'PBB' });
    if (existingCompany) {
        return NextResponse.json({
            message: 'Multi-tenant already initialized',
            company: existingCompany
        });
    }

    // Create PBB company
    const pbbCompany: Omit<Company, '_id'> = {
        code: 'PBB',
        name: 'PT. Pelindo Bersaudara Bahari',
        address: 'Jl. Contoh No. 123, Jakarta',
        phone: '+62 21 1234 5678',
        email: 'info@pbb.co.id',
        status: 'active',
        databaseName: 'iso_pbb',
        subscription: {
            plan: 'enterprise',
            expiresAt: new Date('2027-12-31')
        },
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const companyResult = await masterDb.collection('companies').insertOne(pbbCompany);

    // Create default super admin
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin: Omit<SuperAdmin, '_id'> = {
        userId: 'superadmin',
        name: 'Super Administrator',
        email: 'superadmin@iso-system.com',
        password: hashedPassword,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    await masterDb.collection('super_admins').insertOne(superAdmin);

    // Create indexes
    await masterDb.collection('companies').createIndex({ code: 1 }, { unique: true });
    await masterDb.collection('super_admins').createIndex({ userId: 1 }, { unique: true });

    return NextResponse.json({
        success: true,
        message: 'Multi-tenant initialized successfully',
        company: { ...pbbCompany, _id: companyResult.insertedId },
        note: 'Default super admin created: superadmin / superadmin123'
    });
}

// Migrate existing data from legacy database to PBB database
async function migrateToPBB() {
    const legacyDbName = 'isoIntegratedSystemDB';
    const pbbDbName = 'iso_pbb';

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const legacyDb = client.db(legacyDbName);
        const pbbDb = client.db(pbbDbName);

        // Collections to migrate
        const collections = [
            'users',
            'departments',
            'documents',
            'approvers',
            'standards',
            'risks',
            'audits',
            'capas',
            'trainings',
            'controls',
            'integratedstandards',
            'system_settings',
            'organization_settings',
            'security_settings',
            'audit_logs'
        ];

        const migrationResults: Record<string, number> = {};

        for (const collectionName of collections) {
            try {
                const docs = await legacyDb.collection(collectionName).find({}).toArray();
                if (docs.length > 0) {
                    // Clear existing data in PBB database to avoid duplicates
                    await pbbDb.collection(collectionName).deleteMany({});
                    await pbbDb.collection(collectionName).insertMany(docs);
                    migrationResults[collectionName] = docs.length;
                } else {
                    migrationResults[collectionName] = 0;
                }
            } catch (err) {
                migrationResults[collectionName] = -1; // Error
                console.error(`Failed to migrate ${collectionName}:`, err);
            }
        }

        // Migrate files collection if exists
        try {
            const files = await legacyDb.collection('files.files').find({}).toArray();
            const chunks = await legacyDb.collection('files.chunks').find({}).toArray();

            if (files.length > 0) {
                await pbbDb.collection('files.files').deleteMany({});
                await pbbDb.collection('files.files').insertMany(files);
                migrationResults['files.files'] = files.length;
            }

            if (chunks.length > 0) {
                await pbbDb.collection('files.chunks').deleteMany({});
                await pbbDb.collection('files.chunks').insertMany(chunks);
                migrationResults['files.chunks'] = chunks.length;
            }
        } catch (err) {
            console.error('Failed to migrate files:', err);
        }

        return NextResponse.json({
            success: true,
            message: 'Data migrated to PBB database successfully',
            migrationResults
        });

    } finally {
        await client.close();
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Seed API for Multi-Tenant',
        endpoints: {
            'POST /api/seed/companies': {
                actions: [
                    { action: 'init', description: 'Initialize master database with PBB company and super admin' },
                    { action: 'migrate-pbb', description: 'Migrate existing data from legacy database to PBB' }
                ]
            }
        }
    });
}
