// app/api/seed/companies/reset/route.ts - Simple GET endpoint to reset super admin
import { NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { SuperAdmin } from '@/lib/types';
import bcrypt from 'bcryptjs';

// GET - Reset super admin (can be called from browser directly)
export async function GET() {
    try {
        const { db: masterDb } = await connectToMasterDatabase();

        const newPassword = 'superadmin123';
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

            // Create index
            try {
                await masterDb.collection('super_admins').createIndex({ userId: 1 }, { unique: true });
            } catch (e) {
                // Index might already exist
            }
        }

        return NextResponse.json({
            success: true,
            message: existingSuperAdmin ? 'Super admin password reset!' : 'Super admin created!',
            credentials: {
                companyCode: 'SUPERADMIN',
                userId: 'superadmin',
                password: newPassword
            },
            note: 'Silakan login dengan kredensial di atas'
        });

    } catch (error) {
        console.error('Reset super admin error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Gagal reset super admin',
                error: (error as Error).message
            },
            { status: 500 }
        );
    }
}
