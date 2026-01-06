import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const COLLECTION_NAME = 'organization_settings';
const SETTINGS_KEY = 'main';

const getDefaultSettings = () => ({
    settingsKey: SETTINGS_KEY,
    companyName: 'PT. Contoh Indonesia',
    companyCode: 'PCI001',
    taxId: '01.234.567.8-901.000',
    businessLicense: 'NIB-1234567890123',
    address: 'Jl. Contoh No. 123, Jakarta Selatan 12345',
    phone: '+62 21 1234 5678',
    email: 'info@contoh.co.id',
    website: 'https://www.contoh.co.id',
    updatedAt: new Date(),
});

// GET organization settings
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        let settings = await db.collection(COLLECTION_NAME).findOne({ settingsKey: SETTINGS_KEY });

        if (!settings) {
            const defaultSettings = getDefaultSettings();
            await db.collection(COLLECTION_NAME).insertOne(defaultSettings);
            settings = defaultSettings;
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to fetch organization settings:', error);
        return NextResponse.json(
            { message: 'Gagal mengambil pengaturan organisasi', error: (error as Error).message },
            { status: 500 }
        );
    }
}

// PUT (update) organization settings
export async function PUT(request: Request) {
    try {
        const { db } = await connectToDatabase();
        const body = await request.json();

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
            message: 'Pengaturan organisasi berhasil disimpan',
            settings: result,
        });
    } catch (error) {
        console.error('Failed to update organization settings:', error);
        return NextResponse.json(
            { message: 'Gagal menyimpan pengaturan organisasi', error: (error as Error).message },
            { status: 500 }
        );
    }
}
