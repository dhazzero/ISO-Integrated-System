// app/api/notifications/settings/route.ts
import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';

// Default notification templates with PIC
const defaultNotificationSettings = {
    templates: [
        {
            id: 'audit_reminder',
            name: 'Audit Reminder',
            description: 'Pengingat audit yang akan datang',
            status: 'Aktif',
            daysBeforeNotify: 7,
            picEmail: '',
            picName: '',
        },
        {
            id: 'capa_due_date',
            name: 'CAPA Due Date',
            description: 'Notifikasi CAPA yang akan jatuh tempo',
            status: 'Aktif',
            daysBeforeNotify: 3,
            picEmail: '',
            picName: '',
        },
        {
            id: 'risk_alert',
            name: 'Risk Alert',
            description: 'Peringatan risiko tinggi',
            status: 'Aktif',
            daysBeforeNotify: 1,
            picEmail: '',
            picName: '',
        },
        {
            id: 'document_review',
            name: 'Document Review',
            description: 'Pengingat review dokumen',
            status: 'Tidak Aktif',
            daysBeforeNotify: 14,
            picEmail: '',
            picName: '',
        },
        {
            id: 'training_reminder',
            name: 'Training Reminder',
            description: 'Pengingat pelatihan',
            status: 'Aktif',
            daysBeforeNotify: 5,
            picEmail: '',
            picName: '',
        },
    ],
    globalSettings: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
    },
};

// GET - Retrieve notification settings
export async function GET() {
    try {
        const { db } = await getTenantDb();
        const settings = await db.collection('notification_settings').findOne({ settingsKey: 'notifications' });

        if (!settings) {
            return NextResponse.json(defaultNotificationSettings);
        }

        return NextResponse.json({
            templates: settings.templates || defaultNotificationSettings.templates,
            globalSettings: settings.globalSettings || defaultNotificationSettings.globalSettings,
        });
    } catch (error) {
        console.error('Failed to fetch notification settings:', error);
        return NextResponse.json(defaultNotificationSettings);
    }
}

// PUT - Update notification settings
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { templates, globalSettings } = body;

        const { db } = await getTenantDb();

        await db.collection('notification_settings').updateOne(
            { settingsKey: 'notifications' },
            {
                $set: {
                    settingsKey: 'notifications',
                    templates,
                    globalSettings,
                    updatedAt: new Date(),
                }
            },
            { upsert: true }
        );

        return NextResponse.json({
            success: true,
            message: 'Pengaturan notifikasi berhasil disimpan'
        });

    } catch (error) {
        console.error('Failed to save notification settings:', error);
        return NextResponse.json({
            message: 'Gagal menyimpan pengaturan notifikasi'
        }, { status: 500 });
    }
}
