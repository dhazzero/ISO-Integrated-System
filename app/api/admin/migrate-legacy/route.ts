// app/api/admin/migrate-legacy/route.ts
// Migration endpoint to copy legacy data to a specific tenant database

import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const LEGACY_DB_NAME = "isoIntegratedSystemDB";

// Collections to migrate
const COLLECTIONS_TO_MIGRATE = [
    'documents',
    'audits',
    'findings',
    'risks',
    'capas',
    'trainings',
    'compliance',
    'departments',
    'approvers',
    'standards',
    'users',
    'security_logs',
    'notification_settings',
    'system_settings',
    'organization_settings',
    'security_settings',
    'integrated-standard-table',
    'OJK_Compliance_Report',
    'database_backups',
    'documentLogs',
];

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { targetCompanyCode, targetDatabaseName, skipExisting = true } = body;

        if (!targetCompanyCode || !targetDatabaseName) {
            return NextResponse.json({
                message: 'targetCompanyCode dan targetDatabaseName harus diisi'
            }, { status: 400 });
        }

        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        const legacyDb = client.db(LEGACY_DB_NAME);
        const targetDb = client.db(targetDatabaseName);

        const results: { collection: string; migrated: number; skipped: number; errors: string[] }[] = [];

        for (const collectionName of COLLECTIONS_TO_MIGRATE) {
            const result = { collection: collectionName, migrated: 0, skipped: 0, errors: [] as string[] };

            try {
                const sourceCollection = legacyDb.collection(collectionName);
                const targetCollection = targetDb.collection(collectionName);

                // Get all documents from legacy
                const documents = await sourceCollection.find({}).toArray();

                if (documents.length === 0) {
                    result.skipped = 0;
                    results.push(result);
                    continue;
                }

                for (const doc of documents) {
                    try {
                        if (skipExisting) {
                            // Check if document with same _id exists
                            const existing = await targetCollection.findOne({ _id: doc._id });
                            if (existing) {
                                result.skipped++;
                                continue;
                            }
                        }

                        // Insert document to target
                        await targetCollection.insertOne(doc);
                        result.migrated++;
                    } catch (docError) {
                        // Handle duplicate key error gracefully
                        if ((docError as any).code === 11000) {
                            result.skipped++;
                        } else {
                            result.errors.push(`Doc ${doc._id}: ${(docError as Error).message}`);
                        }
                    }
                }
            } catch (collError) {
                result.errors.push((collError as Error).message);
            }

            results.push(result);
        }

        // Also migrate GridFS files (uploads.files and uploads.chunks)
        const gridFsResult = { collection: 'uploads (GridFS)', migrated: 0, skipped: 0, errors: [] as string[] };
        try {
            // Migrate uploads.files
            const filesSource = legacyDb.collection('uploads.files');
            const filesTarget = targetDb.collection('uploads.files');
            const files = await filesSource.find({}).toArray();

            for (const file of files) {
                try {
                    const existing = await filesTarget.findOne({ _id: file._id });
                    if (existing) {
                        gridFsResult.skipped++;
                        continue;
                    }
                    await filesTarget.insertOne(file);
                    gridFsResult.migrated++;
                } catch (e) {
                    if ((e as any).code === 11000) {
                        gridFsResult.skipped++;
                    }
                }
            }

            // Migrate uploads.chunks
            const chunksSource = legacyDb.collection('uploads.chunks');
            const chunksTarget = targetDb.collection('uploads.chunks');
            const chunks = await chunksSource.find({}).toArray();

            for (const chunk of chunks) {
                try {
                    const existing = await chunksTarget.findOne({ _id: chunk._id });
                    if (existing) continue;
                    await chunksTarget.insertOne(chunk);
                } catch (e) {
                    // Ignore duplicate errors for chunks
                }
            }
        } catch (gridError) {
            gridFsResult.errors.push((gridError as Error).message);
        }
        results.push(gridFsResult);

        await client.close();

        const totalMigrated = results.reduce((sum, r) => sum + r.migrated, 0);
        const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

        return NextResponse.json({
            success: true,
            message: `Migrasi dari ${LEGACY_DB_NAME} ke ${targetDatabaseName} selesai`,
            summary: {
                totalMigrated,
                totalSkipped,
                collectionsProcessed: results.length
            },
            details: results
        });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({
            success: false,
            message: 'Migrasi gagal',
            error: (error as Error).message
        }, { status: 500 });
    }
}

// GET - Get migration status / preview
export async function GET() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        const legacyDb = client.db(LEGACY_DB_NAME);
        const preview: { collection: string; count: number }[] = [];

        for (const collectionName of COLLECTIONS_TO_MIGRATE) {
            const count = await legacyDb.collection(collectionName).countDocuments();
            preview.push({ collection: collectionName, count });
        }

        // GridFS files
        const filesCount = await legacyDb.collection('uploads.files').countDocuments();
        preview.push({ collection: 'uploads.files (GridFS)', count: filesCount });

        await client.close();

        return NextResponse.json({
            legacyDatabase: LEGACY_DB_NAME,
            collections: preview,
            totalDocuments: preview.reduce((sum, p) => sum + p.count, 0)
        });

    } catch (error) {
        console.error('Preview error:', error);
        return NextResponse.json({
            message: 'Gagal mengambil preview data legacy',
            error: (error as Error).message
        }, { status: 500 });
    }
}
