// app/api/documents/[id]/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId, GridFSBucket } from 'mongodb';

const COLLECTION_NAME = 'documents';

// === FUNGSI PUT YANG DIPERBAIKI (TANPA FORMIDABLE) ===
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase();
    const id = params.id;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid document id' }, { status: 400 });
    }
    const _id = new ObjectId(id);

    // Membaca body request sebagai JSON, sesuai alur asli Anda
    const updateData = await request.json();

    // 1. Temukan dokumen yang ada untuk mendapatkan fileId lama
    const existingDoc = await db.collection(COLLECTION_NAME).findOne({ _id });
    if (!existingDoc) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // 2. Cek jika frontend mengirim fileId baru (artinya ada file baru yang diupload)
    if (updateData.fileId && updateData.fileId !== existingDoc.fileId?.toString()) {
      // Jika ada fileId lama, hapus dari GridFS
      if (existingDoc.fileId) {
        try {
          const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
          await bucket.delete(new ObjectId(String(existingDoc.fileId)));
        } catch (err) {
          // Log error tapi jangan hentikan proses, update metadata tetap lebih penting
          console.error('Failed to delete old file, but proceeding with update:', err);
        }
      }
    }

    // 3. Setel waktu pembaruan
    updateData.updatedAt = new Date();

    // 4. ===== INI ADALAH PERBAIKAN UTAMA =====
    // Hapus field _id dan id dari objek updateData sebelum dikirim ke database.
    // Ini mencegah error "immutable field" dari MongoDB.
    delete updateData._id;
    delete updateData.id;
    // =========================================

    // 5. Lakukan update pada dokumen
    const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
        { _id },
        { $set: updateData },
        { returnDocument: 'after' }
    );

    // Cek jika operasi update berhasil
    if (!result) {
      // Ini akan jarang terjadi jika `existingDoc` ditemukan, tapi ini adalah pengaman
      throw new Error('Document not found during the update operation. It might have been deleted just now.');
    }

    // 6. Log perubahan
    await db.collection('documentLogs').insertOne({
      documentId: id,
      action: 'UPDATE',
      user: updateData.updatedBy || 'admin', // Asumsi ada field updatedBy dari frontend
      timestamp: new Date(),
      before: existingDoc, // Dokumen sebelum diubah
      after: result,      // Dokumen setelah diubah
    });

    // 7. Kembalikan dokumen yang telah diperbarui
    return NextResponse.json(result);

  } catch (error) {
    console.error('PUT_DOCUMENT_ERROR:', error);
    return NextResponse.json({ message: 'Failed to update document', error: (error as Error).message }, { status: 500 });
  }
}

// Fungsi DELETE (biarkan seperti yang sudah ada, atau gunakan versi ini untuk konsistensi)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase();
    const id = params.id;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid document id' }, { status: 400 });
    }
    const _id = new ObjectId(id);

    const document = await db.collection(COLLECTION_NAME).findOne({ _id });
    if (!document) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    await db.collection(COLLECTION_NAME).deleteOne({ _id });

    await db.collection('documentLogs').insertOne({
      documentId: id,
      action: 'DELETE',
      user: 'admin', // Ganti dengan info user yang login
      timestamp: new Date(),
      before: document,
      after: null
    });

    if (document.fileId) {
      try {
        const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
        const fileId = new ObjectId(String(document.fileId));
        await bucket.delete(fileId);
      } catch (err) {
        console.error('Failed to delete associated file during document deletion:', err);
      }
    }

    return NextResponse.json({ message: 'Document and associated file deleted' });
  } catch (error) {
    console.error('DELETE_DOCUMENT_ERROR:', error);
    return NextResponse.json({ message: 'Failed to delete document', error: (error as Error).message }, { status: 500 });
  }
}