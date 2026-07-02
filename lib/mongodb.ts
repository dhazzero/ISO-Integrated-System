import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = "mongodb://localhost:27017";
const DATABASE_NAME = "isoIntegratedSystemDB";

if (!MONGODB_URI) {
    throw new Error('Pastikan variabel MONGODB_URI sudah terisi dengan benar');
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
        const db = client.db(DATABASE_NAME);
        console.log("✅ Berhasil terhubung ke MongoDB.");
        cachedClient = client;
        cachedDb = db;
        return { client, db };
    } catch (error) {
        console.error("❌ GAGAL TERHUBUNG KE DATABASE:", error);
        await client.close();
        throw new Error("Tidak dapat terhubung ke server MongoDB. Pastikan server MongoDB Anda sedang berjalan.");
    }
}