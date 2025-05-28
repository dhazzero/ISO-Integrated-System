// lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = "mongodb://localhost:27017";
const DATABASE_NAME = "isoIntegratedSystemDB";

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local or your environment variables');
}

if (!DATABASE_NAME) {
    throw new Error('Please define the DATABASE_NAME environment variable inside .env.local or your environment variables');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient, db: Db }> {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log("Successfully connected to MongoDB.");
        const db = client.db(DATABASE_NAME);

        cachedClient = client;
        cachedDb = db;

        return { client, db };
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        await client.close(); // Pastikan client ditutup jika koneksi gagal
        throw error;
    }
}
connectToDatabase()
