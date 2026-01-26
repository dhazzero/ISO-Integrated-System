// lib/mongodb-tenant.ts - Multi-tenant database connection manager
import { MongoClient, Db, Collection } from 'mongodb';
import { Company, TenantContext } from './types';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MASTER_DB_NAME = "iso_master"; // Master database for companies and super admins

// Cache for database connections
const dbCache: Map<string, { client: MongoClient; db: Db }> = new Map();
let masterClient: MongoClient | null = null;
let masterDb: Db | null = null;

/**
 * Connect to the master database (contains companies and super admins)
 */
export async function connectToMasterDatabase(): Promise<{ client: MongoClient; db: Db }> {
    if (masterClient && masterDb) {
        return { client: masterClient, db: masterDb };
    }

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(MASTER_DB_NAME);
        console.log("✅ Connected to Master Database");
        masterClient = client;
        masterDb = db;
        return { client, db };
    } catch (error) {
        console.error("❌ Failed to connect to Master Database:", error);
        await client.close();
        throw error;
    }
}

/**
 * Get a collection from the master database
 */
export async function getMasterCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
    const { db } = await connectToMasterDatabase();
    return db.collection<T>(collectionName);
}

/**
 * Connect to a tenant's database by company code
 */
export async function connectToTenantDatabase(companyCode: string): Promise<{ client: MongoClient; db: Db }> {
    // Check cache first
    const cached = dbCache.get(companyCode);
    if (cached) {
        return cached;
    }

    // Get company info from master database
    const { db: masterDb } = await connectToMasterDatabase();
    const companiesCollection = masterDb.collection<Company>('companies');
    const company = await companiesCollection.findOne({
        code: companyCode.toUpperCase(),
        status: 'active'
    });

    if (!company) {
        throw new Error(`Company with code "${companyCode}" not found or inactive`);
    }

    // Connect to tenant's database
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(company.databaseName);
        console.log(`✅ Connected to Tenant Database: ${company.databaseName}`);

        // Cache the connection
        dbCache.set(companyCode, { client, db });

        return { client, db };
    } catch (error) {
        console.error(`❌ Failed to connect to Tenant Database (${company.databaseName}):`, error);
        await client.close();
        throw error;
    }
}

/**
 * Get a collection from a tenant's database
 */
export async function getTenantCollection<T extends Document>(
    companyCode: string,
    collectionName: string
): Promise<Collection<T>> {
    const { db } = await connectToTenantDatabase(companyCode);
    return db.collection<T>(collectionName);
}

/**
 * Get company by code from master database
 */
export async function getCompanyByCode(code: string): Promise<Company | null> {
    const { db } = await connectToMasterDatabase();
    const company = await db.collection<Company>('companies').findOne({
        code: code.toUpperCase()
    });
    return company;
}

/**
 * Get all active companies from master database
 */
export async function getAllCompanies(): Promise<Company[]> {
    const { db } = await connectToMasterDatabase();
    const companies = await db.collection<Company>('companies')
        .find({ status: { $ne: 'suspended' } })
        .sort({ name: 1 })
        .toArray();
    return companies;
}

/**
 * Create tenant context from company code
 */
export async function createTenantContext(companyCode: string): Promise<TenantContext | null> {
    const company = await getCompanyByCode(companyCode);
    if (!company) return null;

    return {
        companyCode: company.code,
        companyId: company._id.toString(),
        companyName: company.name,
        databaseName: company.databaseName,
    };
}

// Legacy function for backward compatibility - connects to default database
// This will be deprecated once migration is complete
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    // Try to get tenant from context or use legacy database
    const legacyDbName = "isoIntegratedSystemDB";

    const cached = dbCache.get('__legacy__');
    if (cached) {
        return cached;
    }

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(legacyDbName);
        console.log("✅ Connected to Legacy Database (isoIntegratedSystemDB)");
        dbCache.set('__legacy__', { client, db });
        return { client, db };
    } catch (error) {
        console.error("❌ Failed to connect to Legacy Database:", error);
        await client.close();
        throw error;
    }
}
