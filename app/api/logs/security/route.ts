// app/api/logs/security/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

const LOGS_COLLECTION = 'security_logs';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-bytes-long');
const COOKIE_NAME = 'session';

// Helper function to get current user from session
async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;

        if (!token) return null;

        const { payload } = await jwtVerify(token, JWT_SECRET);

        if (!payload.userId) return null;

        const { db } = await connectToDatabase();
        const user = await db.collection('users').findOne({
            _id: new ObjectId(payload.userId as string)
        });

        if (!user) return null;

        return {
            _id: user._id.toString(),
            userId: user.userId,
            name: user.name,
            role: user.role,
        };
    } catch (error) {
        console.error('Error getting current user for logging:', error);
        return null;
    }
}

// GET - Retrieve security logs (with optional filtering)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const action = searchParams.get('action');
        const module = searchParams.get('module');

        const { db } = await connectToDatabase();

        // Build filter query
        const filter: Record<string, string> = {};
        if (action) filter.action = action;
        if (module) filter.module = module;

        const logs = await db.collection(LOGS_COLLECTION)
            .find(filter)
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil log', error: (error as Error).message }, { status: 500 });
    }
}

// POST - Create new security log
export async function POST(request: Request) {
    try {
        const logData = await request.json();
        const { db } = await connectToDatabase();

        // Try to get current user from session
        const currentUser = await getCurrentUser();

        const newLog = {
            action: logData.action,
            module: logData.module,
            description: logData.description,
            details: logData.details || null, // Additional details if provided
            userId: currentUser?._id || logData.userId || null,
            userName: currentUser?.name || logData.userName || 'System',
            userRole: currentUser?.role || logData.userRole || null,
            timestamp: new Date(),
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
        };

        await db.collection(LOGS_COLLECTION).insertOne(newLog);
        return NextResponse.json({ message: 'Log saved', log: newLog }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal menyimpan log', error: (error as Error).message }, { status: 500 });
    }
}
