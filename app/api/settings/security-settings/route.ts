import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';

const COLLECTION_NAME = 'security_settings';
const SETTINGS_KEY = 'main';

const getDefaultSettings = () => ({
    settingsKey: SETTINGS_KEY,
    minPasswordLength: 8,
    passwordExpiry: 90,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    autoLogout: true,
    rateLimitEnabled: true,
    rateLimit: 100,
    updatedAt: new Date(),
});

export async function GET() {
    try {
        const { db } = await getTenantDb();
        let settings = await db.collection(COLLECTION_NAME).findOne({ settingsKey: SETTINGS_KEY });
        if (!settings) {
            const defaultSettings = getDefaultSettings();
            await db.collection(COLLECTION_NAME).insertOne(defaultSettings);
            settings = defaultSettings;
        }
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to fetch security settings:', error);
        return NextResponse.json({ message: 'Gagal mengambil pengaturan keamanan', error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { db } = await getTenantDb();
        const body = await request.json();
        const { _id, settingsKey, ...updateData } = body;
        const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
            { settingsKey: SETTINGS_KEY },
            { $set: { ...updateData, updatedAt: new Date() }, $setOnInsert: { settingsKey: SETTINGS_KEY } },
            { upsert: true, returnDocument: 'after' }
        );
        return NextResponse.json({ message: 'Pengaturan keamanan berhasil disimpan', settings: result });
    } catch (error) {
        console.error('Failed to update security settings:', error);
        return NextResponse.json({ message: 'Gagal menyimpan pengaturan keamanan', error: (error as Error).message }, { status: 500 });
    }
}
