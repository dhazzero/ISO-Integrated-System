import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { NotificationSetting, NotificationType, User } from '@/lib/types';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

// GET all notification settings (Robust Version)
export async function GET() {
    try {
        const { db } = await getTenantDb();

        // Fetch settings and users separately to avoid complex aggregation issues
        const settingsFromDB = await db.collection('notification_settings').find({}).toArray();
        const allUsers = await db.collection<User>('users').find({}).project({ name: 1, email: 1, _id: 1 }).toArray();

        // Create a map for easy user lookup
        const userMap = new Map(allUsers.map(u => [u._id.toString(), u]));

        const allNotificationTypes = Object.values(NotificationType);

        const result = allNotificationTypes.map(type => {
            const setting = settingsFromDB.find(s => s.notificationType === type);

            if (setting) {
                // Manually populate recipients' details
                const recipients = setting.recipientUserIds
                    .map((id: any) => userMap.get(id.toString()))
                    .filter(Boolean) as User[]; // Filter out any unfound users

                return {
                    ...setting,
                    recipients,
                };
            }

            // If a setting doesn't exist in the DB, create a default empty one for the UI
            return {
                notificationType: type,
                recipientUserIds: [],
                recipients: [],
            };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Failed to fetch notification settings:', error);
        return NextResponse.json({ message: 'Gagal mengambil pengaturan notifikasi' }, { status: 500 });
    }
}

// Schema for updating settings
const updateSettingsSchema = z.object({
    notificationType: z.nativeEnum(NotificationType),
    recipientUserIds: z.array(z.string().refine(val => ObjectId.isValid(val), { message: "Invalid ObjectId" }))
});

// POST (update/upsert) a notification setting
export async function POST(request: Request) {
    try {
        const { db } = await getTenantDb();
        const body = await request.json();

        const validation = updateSettingsSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: "Input tidak valid", errors: validation.error.flatten() }, { status: 400 });
        }

        const { notificationType, recipientUserIds } = validation.data;

        await db.collection<NotificationSetting>('notification_settings').updateOne(
            { notificationType: notificationType },
            {
                $set: {
                    recipientUserIds: recipientUserIds.map(id => new ObjectId(id)),
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    notificationType,
                    createdAt: new Date(),
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ message: 'Pengaturan berhasil diperbarui' }, { status: 200 });

    } catch (error) {
        console.error('Failed to update notification settings:', error);
        return NextResponse.json({ message: 'Gagal memperbarui pengaturan notifikasi' }, { status: 500 });
    }
}