// app/api/documents/[id]/route.ts

import { NextResponse } from 'next/server';
import { connectToTenantDatabase } from '@/lib/mongodb-tenant';
import { ObjectId, GridFSBucket } from 'mongodb';
import { logActivityServer, LogAction, LogModule } from '@/lib/server-logger';

const COLLECTION_NAME = 'documents';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Authorization check - get current user first
    const { canEdit, unauthorizedEditResponse, departmentMismatchResponse, getCurrentUser } = await import('@/lib/auth');
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Connect to tenant database using user's company code
    const { db } = await connectToTenantDatabase(currentUser.companyCode);

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid document id' }, { status: 400 });
    }
    const _id = new ObjectId(id);

    // 1. Temukan dokumen yang ada
    const existingDoc = await db.collection(COLLECTION_NAME).findOne({ _id });
    if (!existingDoc) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Check edit permission
    const docDepartmentId = existingDoc.department || existingDoc.departmentId;
    if (!(await canEdit(docDepartmentId))) {
      // MANAGER trying to edit different department
      if (currentUser.userRole === 'manager') {
        return NextResponse.json(departmentMismatchResponse(), { status: 403 });
      }
      return NextResponse.json(unauthorizedEditResponse(), { status: 403 });
    }

    // 2. Parse FormData (karena frontend mengirim FormData untuk support file upload)
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Extract textual fields
    const updateData: any = {};
    const fields = ['name', 'description', 'version', 'status', 'classification', 'owner', 'department', 'scope', 'approver', 'reviewDate', 'effectiveDate', 'documentType', 'category', 'nextReview'];

    fields.forEach(field => {
      const value = formData.get(field);
      if (value !== null && value !== undefined) {
        updateData[field] = value.toString();
      }
    });

    // Sync category with documentType if documentType is provided
    if (updateData.documentType && !updateData.category) {
      updateData.category = updateData.documentType;
    }

    // Sync nextReview with reviewDate if reviewDate is provided
    if (updateData.reviewDate && !updateData.nextReview) {
      updateData.nextReview = updateData.reviewDate;
    }

    // 3. Handle File Upload jika ada file baru
    if (file) {
      const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

      // Upload file baru
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadStream = bucket.openUploadStream(file.name, {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedBy: currentUser.userId,
          department: updateData.department || existingDoc.department
        }
      });

      const newFileId = await new Promise<ObjectId>((resolve, reject) => {
        uploadStream.end(buffer, (error: any) => {
          if (error) reject(error);
          else resolve(uploadStream.id);
        });
      });

      // Update metadata file di dokumen
      updateData.fileId = newFileId;
      updateData.fileName = file.name;
      updateData.fileType = file.type;
      updateData.fileSize = file.size; // in bytes

      // Hapus file lama jika ada
      if (existingDoc.fileId) {
        try {
          await bucket.delete(new ObjectId(existingDoc.fileId.toString()));
        } catch (err) {
          console.warn('Failed to delete old file:', err);
        }
      }
    }

    // 4. Setel waktu pembaruan
    updateData.updatedAt = new Date();
    updateData.updatedBy = currentUser.userName;

    // 5. Lakukan update pada dokumen
    const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Document not found during the update operation.');
    }

    // 6. Log activity
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

    // Connect to tenant database using user's company code
    const { db } = await connectToTenantDatabase(currentUser.companyCode);

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