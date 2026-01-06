// app/api/documents/[id]/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId, GridFSBucket } from 'mongodb';
import { logActivityServer, LogAction, LogModule } from '@/lib/server-logger';

const COLLECTION_NAME = 'documents';

// === FUNGSI PUT YANG DIPERBAIKI (TANPA FORMIDABLE) ===
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { db } = await connectToDatabase();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid document id' }, { status: 400 });
    }
    const _id = new ObjectId(id);

    // 1. Temukan dokumen yang ada untuk mendapatkan fileId lama dan departemen
    const existingDoc = await db.collection(COLLECTION_NAME).findOne({ _id });
    if (!existingDoc) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Authorization check - only SUPERUSER, ADMIN, MANAGER (own dept) can edit
    const { canEdit, unauthorizedEditResponse, departmentMismatchResponse, getCurrentUser } = await import('@/lib/auth');
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check edit permission with department validation for MANAGER
    const docDepartmentId = existingDoc.department || existingDoc.departmentId;
    if (!(await canEdit(docDepartmentId))) {
      // MANAGER trying to edit different department
      if (currentUser.userRole === 'manager') {
        return NextResponse.json(departmentMismatchResponse(), { status: 403 });
      }
      return NextResponse.json(unauthorizedEditResponse(), { status: 403 });
    }

    // Membaca body request sebagai JSON, sesuai alur asli Anda
    const updateData = await request.json();

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
    updateData.updatedBy = currentUser.userName;

    // 4. Hapus field _id dan id dari objek updateData sebelum dikirim ke database.
    delete updateData._id;
    delete updateData.id;

    // 5. Lakukan update pada dokumen
    const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    // Cek jika operasi update berhasil
    if (!result) {
      throw new Error('Document not found during the update operation.');
    }

    // 6. Log activity ke security_logs
    const docName = result.name || existingDoc.name || id;
    await logActivityServer(
      LogAction.UPDATE,
      LogModule.DOCUMENT,
      `Memperbarui dokumen: ${docName}`,
      {
        entityId: id,
        entityName: docName,
        documentType: result.type || existingDoc.type,
      },
      request.headers.get('x-forwarded-for') || undefined
    );

    // 7. Kembalikan dokumen yang telah diperbarui
    return NextResponse.json(result);

  } catch (error) {
    console.error('PUT_DOCUMENT_ERROR:', error);
    return NextResponse.json({ message: 'Failed to update document', error: (error as Error).message }, { status: 500 });
  }
}

// Fungsi DELETE
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Authorization check - only SUPERUSER can delete
    const { canDelete, unauthorizedDeleteResponse, getCurrentUser } = await import('@/lib/auth');
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!(await canDelete())) {
      return NextResponse.json(unauthorizedDeleteResponse(), { status: 403 });
    }

    const { id } = params;
    const { db } = await connectToDatabase();
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid document id' }, { status: 400 });
    }
    const _id = new ObjectId(id);

    const document = await db.collection(COLLECTION_NAME).findOne({ _id });
    if (!document) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Delete the document
    await db.collection(COLLECTION_NAME).deleteOne({ _id });

    // Log activity ke security_logs
    const docName = document.name || id;
    await logActivityServer(
      LogAction.DELETE,
      LogModule.DOCUMENT,
      `Menghapus dokumen: ${docName}`,
      {
        entityId: id,
        entityName: docName,
        documentType: document.type,
        fileName: document.fileName,
      },
      request.headers.get('x-forwarded-for') || undefined
    );

    // Delete associated file from GridFS
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