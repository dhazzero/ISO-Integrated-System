import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { getCurrentUser } from '@/lib/auth';
import { connectToTenantDatabase } from '@/lib/mongodb-tenant';

const COLLECTION_NAME = 'system_settings';
const SETTINGS_KEY = 'main';

const getDefaultSettings = () => ({
    settingsKey: SETTINGS_KEY,
    systemName: 'ISO Integrated System',
    companyName: 'PT. Contoh Indonesia',
    darkMode: false,
    compactView: false,
    sidebarCollapsed: false,
    language: 'id',
    timezone: 'Asia/Jakarta',
    dateFormat: 'dd/mm/yyyy',
    currency: 'IDR',
    updatedAt: new Date(),
    complianceFeatures: {
        checklist: true,
        integrated: true,
        annexA: true,
        ojk: true
    }
});

async function getDb(request: Request) {
    const user = await getCurrentUser();

    // Check for superadmin override
    const url = new URL(request.url);
    const companyCode = url.searchParams.get('companyCode');

    if (user?.isSuperAdmin && companyCode && companyCode !== 'ALL') {
        const { db } = await connectToTenantDatabase(companyCode);
        return db;
    }

    // Normal user flow
    const { db } = await getTenantDb();
    return db;
}

export async function GET(request: Request) {
    try {
        const db = await getDb(request);
        let settings = await db.collection(COLLECTION_NAME).findOne({ settingsKey: SETTINGS_KEY });
        if (!settings) {
            const defaultSettings = getDefaultSettings();
            const result = await db.collection(COLLECTION_NAME).insertOne(defaultSettings);
            settings = { ...defaultSettings, _id: result.insertedId };
        }
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to fetch system settings:', error);
        return NextResponse.json({ message: 'Gagal mengambil pengaturan sistem', error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const db = await getDb(request);
        const body = await request.json();
        const { _id, settingsKey, ...updateData } = body;
        const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
            { settingsKey: SETTINGS_KEY },
            { $set: { ...updateData, updatedAt: new Date() }, $setOnInsert: { settingsKey: SETTINGS_KEY } },
            { upsert: true, returnDocument: 'after' }
        );
        return NextResponse.json({ message: 'Pengaturan sistem berhasil disimpan', settings: result });
    } catch (error) {
        console.error('Failed to update system settings:', error);
        return NextResponse.json({ message: 'Gagal menyimpan pengaturan sistem', error: (error as Error).message }, { status: 500 });
    }
}
