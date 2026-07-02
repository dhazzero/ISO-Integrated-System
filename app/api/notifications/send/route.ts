
// app/api/notifications/send/route.ts
import { NextResponse } from 'next/server';
import { sendNotification, NotificationRequest } from '@/lib/notifications';

// POST - Send notification to PIC
export async function POST(request: Request) {
    try {
        const body: NotificationRequest = await request.json();

        const result = await sendNotification(body);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Failed to send notification:', error);
        return NextResponse.json({
            success: false,
            message: 'Gagal mengirim notifikasi: ' + (error as Error).message
        }, { status: 500 });
    }
}
