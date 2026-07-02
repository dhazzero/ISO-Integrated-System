// scripts/migrate-to-pbb.js
// Run with: node scripts/migrate-to-pbb.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const LEGACY_DB_NAME = "isoIntegratedSystemDB";
const TARGET_DB_NAME = "iso_pbb";

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
    'roles',
];

async function migrate() {
    console.log('🚀 Starting migration from', LEGACY_DB_NAME, 'to', TARGET_DB_NAME);

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const legacyDb = client.db(LEGACY_DB_NAME);
        const targetDb = client.db(TARGET_DB_NAME);

        let totalMigrated = 0;
        let totalSkipped = 0;

        for (const collectionName of COLLECTIONS_TO_MIGRATE) {
            console.log(`\n📦 Migrating collection: ${collectionName}`);

            const sourceCollection = legacyDb.collection(collectionName);
            const targetCollection = targetDb.collection(collectionName);

            const documents = await sourceCollection.find({}).toArray();

            if (documents.length === 0) {
                console.log(`   ⏭️  No documents to migrate`);
                continue;
            }

            let migrated = 0;
            let skipped = 0;

            for (const doc of documents) {
                try {
                    // Check if document exists
                    const existing = await targetCollection.findOne({ _id: doc._id });
                    if (existing) {
                        skipped++;
                        continue;
                    }

                    await targetCollection.insertOne(doc);
                    migrated++;
                } catch (error) {
                    if (error.code === 11000) {
                        skipped++;
                    } else {
                        console.log(`   ❌ Error migrating doc ${doc._id}: ${error.message}`);
                    }
                }
            }

            console.log(`   ✅ Migrated: ${migrated}, Skipped (already exists): ${skipped}`);
            totalMigrated += migrated;
            totalSkipped += skipped;
        }

        // Migrate GridFS files
        console.log('\n📦 Migrating GridFS files (uploads)...');

        // uploads.files
        const filesSource = legacyDb.collection('uploads.files');
        const filesTarget = targetDb.collection('uploads.files');
        const files = await filesSource.find({}).toArray();

        let filesMigrated = 0;
        let filesSkipped = 0;

        for (const file of files) {
            try {
                const existing = await filesTarget.findOne({ _id: file._id });
                if (existing) {
                    filesSkipped++;
                    continue;
                }
                await filesTarget.insertOne(file);
                filesMigrated++;
            } catch (error) {
                if (error.code === 11000) filesSkipped++;
            }
        }
        console.log(`   ✅ Files metadata: Migrated: ${filesMigrated}, Skipped: ${filesSkipped}`);

        // uploads.chunks
        const chunksSource = legacyDb.collection('uploads.chunks');
        const chunksTarget = targetDb.collection('uploads.chunks');
        const chunks = await chunksSource.find({}).toArray();

        let chunksMigrated = 0;
        let chunksSkipped = 0;

        for (const chunk of chunks) {
            try {
                const existing = await chunksTarget.findOne({ _id: chunk._id });
                if (existing) {
                    chunksSkipped++;
                    continue;
                }
                await chunksTarget.insertOne(chunk);
                chunksMigrated++;
            } catch (error) {
                if (error.code === 11000) chunksSkipped++;
            }
        }
        console.log(`   ✅ File chunks: Migrated: ${chunksMigrated}, Skipped: ${chunksSkipped}`);

        totalMigrated += filesMigrated + chunksMigrated;
        totalSkipped += filesSkipped + chunksSkipped;

        console.log('\n========================================');
        console.log('🎉 MIGRATION COMPLETE!');
        console.log(`   Total documents migrated: ${totalMigrated}`);
        console.log(`   Total documents skipped: ${totalSkipped}`);
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

migrate();
