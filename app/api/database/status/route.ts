import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Db } from 'mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // 1. Cek status koneksi (ping)
    const ping = await db.admin().ping();
    const isConnected = ping && ping.ok === 1;

    // 2. Dapatkan statistik database
    const stats = await db.stats();

    const dbStats = {
      isConnected,
      dbName: stats.db,
      storageSize: stats.storageSize,
      collections: stats.collections,
      objects: stats.objects,
      indexes: stats.indexes,
      avgObjSize: stats.avgObjSize,
    };

    return NextResponse.json(dbStats);
  } catch (error) {
    console.error('Failed to fetch database status:', error);
    return NextResponse.json({
      message: 'Gagal mengambil status database',
      isConnected: false
    }, { status: 500 });
  }
}
