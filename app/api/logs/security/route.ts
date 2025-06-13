// app/api/logs/security/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const LOGS_COLLECTION = 'security_logs';

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const logs = await db.collection(LOGS_COLLECTION).find({}).sort({ timestamp: -1 }).limit(10).toArray(); // Ambil 10 log terbaru
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil log', error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const logData = await request.json();
        const { db } = await connectToDatabase();
        const newLog = {
            ...logData,
            timestamp: new Date(),
            user: "Admin System", // Ganti dengan user yang sedang login
            ip: request.headers.get('x-forwarded-for') ?? '127.0.0.1',
        };
        await db.collection(LOGS_COLLECTION).insertOne(newLog);
        return NextResponse.json({ message: 'Log saved' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal menyimpan log', error: (error as Error).message }, { status: 500 });
    }
}