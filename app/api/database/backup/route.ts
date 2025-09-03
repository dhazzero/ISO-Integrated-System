import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST() {
  try {
    const { db } = await connectToDatabase();

    const collectionsToBackup = [
      'users',
      'departments',
      'approvers',
      'standards',
      'security_logs'
      // Tambahkan koleksi lain jika perlu
    ];

    const backupData: { [key: string]: any[] } = {};

    for (const collectionName of collectionsToBackup) {
      const collection = db.collection(collectionName);
      // Mengecualikan password dari backup pengguna
      const projection = collectionName === 'users' ? { projection: { password: 0 } } : {};
      backupData[collectionName] = await collection.find({}, projection).toArray();
    }

    const jsonString = JSON.stringify(backupData, null, 2);
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `iso-system-backup-${timestamp}.json`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(jsonString, { status: 200, headers });

  } catch (error) {
    console.error('Database backup failed:', error);
    return NextResponse.json({ message: 'Gagal membuat backup database' }, { status: 500 });
  }
}
