import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';

const BACKUP_COLLECTION = 'database_backups';

// GET - Retrieve backup history
export async function GET() {
    try {
        const { db } = await getTenantDb();
        const backups = await db.collection(BACKUP_COLLECTION)
            .find({})
            .sort({ date: -1 })
            .limit(20)
            .toArray();

        return NextResponse.json(backups);
    } catch (error) {
        console.error('Failed to fetch backup history:', error);
        return NextResponse.json(
            { message: 'Gagal mengambil riwayat backup', error: (error as Error).message },
            { status: 500 }
        );
    }
}

// POST - Create backup and return as download
export async function POST() {
    try {
        const { db } = await getTenantDb();

        const collectionsToBackup = [
            'users',
            'departments',
            'approvers',
            'standards',
            'security_logs',
            'system_settings',
            'organization_settings',
            'security_settings',
        ];

        const backupData: { [key: string]: unknown[] } = {};
        let totalDocuments = 0;

        for (const collectionName of collectionsToBackup) {
            const collection = db.collection(collectionName);
            const projection = collectionName === 'users' ? { projection: { password: 0 } } : {};
            const docs = await collection.find({}, projection).toArray();
            backupData[collectionName] = docs;
            totalDocuments += docs.length;
        }

        const jsonString = JSON.stringify(backupData, null, 2);
        const now = new Date();
        const filename = `iso-backup-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.json`;
        const sizeInBytes = new Blob([jsonString]).size;
        const sizeFormatted = sizeInBytes > 1024 * 1024
            ? `${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`
            : `${(sizeInBytes / 1024).toFixed(2)} KB`;

        // Store backup record in database
        await db.collection(BACKUP_COLLECTION).insertOne({
            name: filename,
            size: sizeFormatted,
            date: now,
            status: 'Berhasil',
            type: 'manual',
            collections: collectionsToBackup.length,
            documents: totalDocuments,
        });

        // Return file as download
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);

        return new NextResponse(jsonString, { status: 200, headers });

    } catch (error) {
        console.error('Database backup failed:', error);

        // Store failed backup record
        try {
            const { db } = await getTenantDb();
            await db.collection(BACKUP_COLLECTION).insertOne({
                name: `backup-failed-${new Date().toISOString()}`,
                size: '0 KB',
                date: new Date(),
                status: 'Gagal',
                type: 'manual',
                error: (error as Error).message,
            });
        } catch (e) {
            console.error('Failed to log backup failure:', e);
        }

        return NextResponse.json({ message: 'Gagal membuat backup database' }, { status: 500 });
    }
}
