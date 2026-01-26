// app/api/files/[id]/route.ts
import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { GridFSBucket, ObjectId } from 'mongodb';
import { canEdit } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: fileIdString } = params;
        const { db } = await getTenantDb();
        const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

        if (!fileIdString || !ObjectId.isValid(fileIdString)) {
            return NextResponse.json({ message: 'Invalid file ID' }, { status: 400 });
        }

        const fileId = new ObjectId(fileIdString);

        // Cek metadata file dulu
        const fileMetadata = await db.collection('uploads.files').findOne({ _id: fileId });

        if (!fileMetadata) {
            return NextResponse.json({ message: 'File not found' }, { status: 404 });
        }

        const url = new URL(request.url);
        const inlineParam = url.searchParams.get('inline') === '1' || url.searchParams.get('inline') === 'true';

        // Check user permission - staff can only view inline, not download
        const userCanEdit = await canEdit();

        // For staff users (canEdit = false), force inline mode and block attachment downloads
        if (!userCanEdit && !inlineParam) {
            return NextResponse.json({
                message: 'Anda tidak memiliki akses untuk mendownload file ini',
                error: 'DOWNLOAD_NOT_ALLOWED'
            }, { status: 403 });
        }

        const forceInline = !userCanEdit || inlineParam;
        const downloadStream = bucket.openDownloadStream(fileId);

        const readableStream = new ReadableStream({
            start(controller) {
                downloadStream.on('data', (chunk) => { controller.enqueue(chunk); });
                downloadStream.on('end', () => { controller.close(); });
                downloadStream.on('error', (err) => { console.error("Stream error:", err); controller.error(err); });
            }
        });

        const headers = new Headers();
        let contentType = fileMetadata.contentType || 'application/octet-stream';
        if (fileMetadata.filename?.toLowerCase().endsWith('.pdf')) {
            contentType = 'application/pdf';
        }

        headers.set('Content-Type', contentType);
        headers.set('Content-Disposition', `${forceInline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(fileMetadata.filename || 'download')}"`);
        headers.set('Content-Length', String(fileMetadata.length));
        headers.set('Accept-Ranges', 'bytes');
        headers.set('X-Content-Type-Options', 'nosniff');

        if (!userCanEdit) {
            headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            headers.set('Pragma', 'no-cache');
            headers.set('Expires', '0');
        }

        return new NextResponse(readableStream, { status: 200, headers: headers });

    } catch (error) {
        console.error("Download error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to download file';
        return NextResponse.json({ message: 'Failed to download file', error: errorMessage }, { status: 500 });
    }
}
