import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId, GridFSBucket } from 'mongodb';

const COLLECTION_NAME = 'documents';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const id = params.id;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid document id' }, { status: 400 });
    }
    const _id = new ObjectId(id);

    // Temukan dokumen terlebih dahulu untuk mengambil fileId jika ada
    const document = await db.collection(COLLECTION_NAME).findOne({ _id });
    if (!document) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    await db.collection(COLLECTION_NAME).deleteOne({ _id });

    if (document.fileId) {
      try {
        const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
        const fileId = new ObjectId(String(document.fileId));
        await bucket.delete(fileId);
      } catch (err) {
        console.error('Failed to delete associated file:', err);
      }
    }

    return NextResponse.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('DELETE_DOCUMENT_ERROR:', error);
    return NextResponse.json({ message: 'Failed to delete document' }, { status: 500 });
  }
}
