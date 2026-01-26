// app/api/logs/security/route.ts
import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { getCurrentUser } from '@/lib/auth';

const LOGS_COLLECTION = 'security_logs';

// GET - Retrieve security logs (with optional filtering)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const action = searchParams.get('action');
        const module = searchParams.get('module');

        const { db } = await getTenantDb();

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
        const { db, user } = await getTenantDb();

        const newLog = {
            action: logData.action,
            module: logData.module,
            description: logData.description,
            details: logData.details || null,
            userId: user?.userId || logData.userId || null,
            userName: user?.userName || logData.userName || 'System',
            userRole: user?.userRole || logData.userRole || null,
            timestamp: new Date(),
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
        };

        await db.collection(LOGS_COLLECTION).insertOne(newLog);
        return NextResponse.json({ message: 'Log saved', log: newLog }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal menyimpan log', error: (error as Error).message }, { status: 500 });
    }
}
