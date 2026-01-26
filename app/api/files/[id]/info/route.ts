// app/api/files/[id]/info/route.ts
import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: fileIdString } = params;
        const { db } = await getTenantDb();

        if (!fileIdString || !ObjectId.isValid(fileIdString)) {
            return NextResponse.json({ message: 'Invalid file ID' }, { status: 400 });
        }

        const fileId = new ObjectId(fileIdString);

        // Get file metadata from GridFS
        const fileMetadata = await db.collection('uploads.files').findOne({ _id: fileId });

        if (!fileMetadata) {
            return NextResponse.json({ message: 'File not found' }, { status: 404 });
        }

        // Determine file type from extension and content type
        const filename = fileMetadata.filename || 'unknown';
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const contentType = fileMetadata.contentType || 'application/octet-stream';

        // Determine preview type based on extension and content type
        let previewType = 'fallback';
        if (ext === 'pdf' || contentType === 'application/pdf') {
            previewType = 'pdf';
        } else if (ext === 'docx' || ext === 'doc' || contentType.includes('wordprocessingml') || contentType.includes('msword')) {
            previewType = 'docx';
        } else if (['xlsx', 'xls'].includes(ext) || contentType.includes('spreadsheet') || contentType.includes('excel')) {
            previewType = 'excel';
        } else if (['pptx', 'ppt'].includes(ext) || contentType.includes('presentation') || contentType.includes('powerpoint')) {
            previewType = 'ppt';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext) || contentType.startsWith('image/')) {
            previewType = 'image';
        }

        return NextResponse.json({
            id: fileIdString,
            filename: filename,
            extension: ext,
            contentType: contentType,
            size: fileMetadata.length,
            previewType: previewType,
            uploadDate: fileMetadata.uploadDate
        });

    } catch (error) {
        console.error("File info error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to get file info';
        return NextResponse.json({ message: 'Failed to get file info', error: errorMessage }, { status: 500 });
    }
}
