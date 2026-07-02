// app/api/admin/superadmins/route.ts - Super admin user management
import { NextRequest, NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { getCurrentUser } from '@/lib/auth';
import { SuperAdmin } from '@/lib/types';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || !user.isSuperAdmin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { db } = await connectToMasterDatabase();
        const superAdmins = await db.collection<SuperAdmin>('super_admins')
            .find({})
            .project({ password: 0 }) // Exclude password
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ superAdmins });
    } catch (error) {
        console.error('Failed to fetch super admins:', error);
        return NextResponse.json({ superAdmins: [] });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.isSuperAdmin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { userId, name, email, password } = await request.json();

        if (!userId || !name || !password) {
            return NextResponse.json({ message: 'User ID, nama, dan password wajib diisi' }, { status: 400 });
        }

        const { db } = await connectToMasterDatabase();

        // Check if userId exists
        const existing = await db.collection('super_admins').findOne({ userId });
        if (existing) {
            return NextResponse.json({ message: 'User ID sudah digunakan' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newSuperAdmin: Omit<SuperAdmin, '_id'> = {
            userId,
            name,
            email: email || '',
            password: hashedPassword,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection('super_admins').insertOne(newSuperAdmin);

        return NextResponse.json({ message: 'Super admin berhasil ditambahkan' }, { status: 201 });
    } catch (error) {
        console.error('Failed to create super admin:', error);
        return NextResponse.json({ message: 'Gagal membuat super admin' }, { status: 500 });
    }
}
