// app/api/settings/migrate-legacy/route.ts
// Migration endpoint with selective collection support

import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { getTenantDb } from '@/lib/db-helper';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const LEGACY_DB_NAME = "isoIntegratedSystemDB";

// All available collections
const ALL_COLLECTIONS = [
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
    'roles',
];

export async function POST(request: Request) {
    try {
        // Get current user's tenant info
        const { db: targetDb, user } = await getTenantDb();

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has admin permissions
        const adminRoles = ['superuser', 'administrator', 'admin', 'superadmin'];
        if (!adminRoles.includes(user.userRole.toLowerCase())) {
            return NextResponse.json({
                message: 'Hanya Administrator yang dapat menjalankan migrasi'
            }, { status: 403 });
        }

        const body = await request.json();
        const { collections: selectedCollections, skipExisting = true } = body;

        // Use selected collections or all if not specified
        const collectionsToMigrate = selectedCollections && selectedCollections.length > 0
            ? selectedCollections
            : ALL_COLLECTIONS;

        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        const legacyDb = client.db(LEGACY_DB_NAME);

        const results: { collection: string; migrated: number; skipped: number; errors: string[] }[] = [];

        // Check if GridFS files are selected
        const includeGridFS = collectionsToMigrate.includes('uploads.files (GridFS)');
        const regularCollections = collectionsToMigrate.filter((c: string) => c !== 'uploads.files (GridFS)');

        // Migrate regular collections
        for (const collectionName of regularCollections) {
            const result = { collection: collectionName, migrated: 0, skipped: 0, errors: [] as string[] };

            try {
                const sourceCollection = legacyDb.collection(collectionName);
                const targetCollection = targetDb.collection(collectionName);

                const documents = await sourceCollection.find({}).toArray();

                if (documents.length === 0) {
                    results.push(result);
                    continue;
                }

                for (const doc of documents) {
                    try {
                        if (skipExisting) {
                            const existing = await targetCollection.findOne({ _id: doc._id });
                            if (existing) {
                                result.skipped++;
                                continue;
                            }
                        }

                        await targetCollection.insertOne(doc);
                        result.migrated++;
                    } catch (docError) {
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

        // Migrate GridFS files if selected
        if (includeGridFS) {
            const gridFsResult = { collection: 'uploads.files (GridFS)', migrated: 0, skipped: 0, errors: [] as string[] };
            try {
                // Migrate uploads.files
                const filesSource = legacyDb.collection('uploads.files');
                const filesTarget = targetDb.collection('uploads.files');
                const files = await filesSource.find({}).toArray();

                for (const file of files) {
                    try {
                        if (skipExisting) {
                            const existing = await filesTarget.findOne({ _id: file._id });
                            if (existing) {
                                gridFsResult.skipped++;
                                continue;
                            }
                        }
                        await filesTarget.insertOne(file);
                        gridFsResult.migrated++;
                    } catch (e) {
                        if ((e as any).code === 11000) gridFsResult.skipped++;
                    }
                }

                // Migrate uploads.chunks (always migrate chunks for selected files)
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
        }

        await client.close();

        const totalMigrated = results.reduce((sum, r) => sum + r.migrated, 0);
        const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

        return NextResponse.json({
            success: true,
            message: `Migrasi ${results.length} collection dari ${LEGACY_DB_NAME} selesai`,
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

// GET - Preview data in legacy database
export async function GET() {
    try {
        const { user } = await getTenantDb();

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        const legacyDb = client.db(LEGACY_DB_NAME);
        const preview: { collection: string; count: number }[] = [];

        for (const collectionName of ALL_COLLECTIONS) {
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
