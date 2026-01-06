import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const COLLECTION_NAME = 'system_settings';
const SETTINGS_KEY = 'main'; // Key to identify the main settings document

// Default settings (without _id, will be added by MongoDB)
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
});

// GET system settings
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        let settings = await db.collection(COLLECTION_NAME).findOne({ settingsKey: SETTINGS_KEY });

        // If no settings exist, create default settings
        if (!settings) {
            const defaultSettings = getDefaultSettings();
            await db.collection(COLLECTION_NAME).insertOne(defaultSettings);
            settings = defaultSettings;
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to fetch system settings:', error);
        return NextResponse.json(
            { message: 'Gagal mengambil pengaturan sistem', error: (error as Error).message },
            { status: 500 }
        );
    }
}

// PUT (update) system settings
export async function PUT(request: Request) {
    try {
        const { db } = await connectToDatabase();
        const body = await request.json();

        // Remove _id and settingsKey from body to avoid issues
        const { _id, settingsKey, ...updateData } = body;

        const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
            { settingsKey: SETTINGS_KEY },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    settingsKey: SETTINGS_KEY,
                },
            },
            { upsert: true, returnDocument: 'after' }
        );

        return NextResponse.json({
            message: 'Pengaturan sistem berhasil disimpan',
            settings: result,
        });
    } catch (error) {
        console.error('Failed to update system settings:', error);
        return NextResponse.json(
            { message: 'Gagal menyimpan pengaturan sistem', error: (error as Error).message },
            { status: 500 }
        );
    }
}

