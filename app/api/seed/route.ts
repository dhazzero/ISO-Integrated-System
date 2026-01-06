import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UserRole } from '@/lib/types';
import bcrypt from 'bcryptjs';

// Default users to seed
const defaultUsers = [
    {
        userId: 'superuser',
        name: 'Super User',
        email: 'superuser@iso-system.local',
        password: 'Super@123',
        role: UserRole.SUPERUSER,
        departmentId: null,
        supervisorId: null,
        status: 'active' as const,
    },
    {
        userId: 'admin',
        name: 'Admin User',
        email: 'admin@iso-system.local',
        password: 'Admin@123',
        role: UserRole.ADMINISTRATOR,
        departmentId: null,
        supervisorId: null,
        status: 'active' as const,
    },
];

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');

        const results = [];

        for (const user of defaultUsers) {
            // Check if user already exists
            const existingUser = await usersCollection.findOne({ userId: user.userId });

            if (existingUser) {
                results.push({ userId: user.userId, status: 'already exists' });
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Create user
            const newUser = {
                ...user,
                password: hashedPassword,
                lastLogin: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await usersCollection.insertOne(newUser);
            results.push({ userId: user.userId, status: 'created' });
        }

        return NextResponse.json({
            message: 'Seed completed',
            results,
        });

    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { message: 'Seed failed', error: (error as Error).message },
            { status: 500 }
        );
    }
}
