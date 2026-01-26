// app/api/seed/init/route.ts - Simple GET endpoint to initialize entire multi-tenant system
import { NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { Company, SuperAdmin } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

// GET - Initialize everything (can be called from browser directly)
export async function GET() {
    const results: string[] = [];

    try {
        const { db: masterDb } = await connectToMasterDatabase();

        // 1. Create or update super admin
        const superAdminPassword = 'superadmin123';
        const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 10);

        const existingSuperAdmin = await masterDb.collection('super_admins').findOne({ userId: 'superadmin' });

        if (existingSuperAdmin) {
            await masterDb.collection('super_admins').updateOne(
                { userId: 'superadmin' },
                { $set: { password: hashedSuperAdminPassword, status: 'active', updatedAt: new Date() } }
            );
            results.push('✅ Super admin password reset');
        } else {
            const superAdmin: Omit<SuperAdmin, '_id'> = {
                userId: 'superadmin',
                name: 'Super Administrator',
                email: 'superadmin@iso-system.com',
                password: hashedSuperAdminPassword,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await masterDb.collection('super_admins').insertOne(superAdmin);
            results.push('✅ Super admin created');
        }

        // Create index for super_admins
        try {
            await masterDb.collection('super_admins').createIndex({ userId: 1 }, { unique: true });
        } catch (e) {
            // Index might already exist
        }

        // 2. Create PBB company if not exists
        const existingPBB = await masterDb.collection<Company>('companies').findOne({ code: 'PBB' });

        if (existingPBB) {
            results.push('✅ PBB company already exists');
        } else {
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
            await masterDb.collection('companies').insertOne(pbbCompany);
            results.push('✅ PBB company created');
        }

        // Create index for companies
        try {
            await masterDb.collection('companies').createIndex({ code: 1 }, { unique: true });
        } catch (e) {
            // Index might already exist
        }

        // 3. Migrate data from legacy database to PBB
        const legacyDbName = 'isoIntegratedSystemDB';
        const pbbDbName = 'iso_pbb';

        const client = new MongoClient(MONGODB_URI);

        try {
            await client.connect();
            const legacyDb = client.db(legacyDbName);
            const pbbDb = client.db(pbbDbName);

            // Check if legacy database has data
            const legacyUsers = await legacyDb.collection('users').find({}).limit(1).toArray();

            if (legacyUsers.length > 0) {
                // Migrate users
                const allUsers = await legacyDb.collection('users').find({}).toArray();
                if (allUsers.length > 0) {
                    await pbbDb.collection('users').deleteMany({});
                    await pbbDb.collection('users').insertMany(allUsers);
                    results.push(`✅ Migrated ${allUsers.length} users to PBB`);
                }

                // Migrate other collections
                const collections = ['departments', 'documents', 'approvers', 'standards', 'security_settings', 'system_settings'];
                for (const collName of collections) {
                    try {
                        const docs = await legacyDb.collection(collName).find({}).toArray();
                        if (docs.length > 0) {
                            await pbbDb.collection(collName).deleteMany({});
                            await pbbDb.collection(collName).insertMany(docs);
                            results.push(`✅ Migrated ${docs.length} ${collName}`);
                        }
                    } catch (e) {
                        // Collection might not exist
                    }
                }
            } else {
                results.push('⚠️ No legacy data found to migrate');
            }
        } finally {
            await client.close();
        }

        return NextResponse.json({
            success: true,
            message: 'Multi-tenant system initialized!',
            results,
            credentials: {
                superAdmin: {
                    companyCode: 'SUPERADMIN',
                    userId: 'superadmin',
                    password: superAdminPassword
                },
                pbbUser: {
                    companyCode: 'PBB',
                    userId: '(use existing user from legacy database)',
                    password: '(use existing password)'
                }
            }
        });

    } catch (error) {
        console.error('Init error:', error);
        return NextResponse.json({
            success: false,
            message: 'Initialization failed',
            error: (error as Error).message,
            results
        }, { status: 500 });
    }
}
