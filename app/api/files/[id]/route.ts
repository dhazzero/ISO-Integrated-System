// app/api/files/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { GridFSBucket, ObjectId } from 'mongodb';
import { canEdit } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: fileIdString } = params;
        const { db } = await connectToDatabase();
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
            // Staff trying to download directly - block it
            return NextResponse.json({
                message: 'Anda tidak memiliki akses untuk mendownload file ini',
                error: 'DOWNLOAD_NOT_ALLOWED'
            }, { status: 403 });
        }

        // Force inline for staff users regardless of parameter
        const forceInline = !userCanEdit || inlineParam;

        const downloadStream = bucket.openDownloadStream(fileId);

        // Menggunakan ReadableStream untuk respons Next.js
        const readableStream = new ReadableStream({
            start(controller) {
                downloadStream.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });
                downloadStream.on('end', () => {
                    controller.close();
                });
                downloadStream.on('error', (err) => {
                    console.error("Stream error:", err);
                    controller.error(err);
                });
            }
        });

        const headers = new Headers();

        // Ensure correct Content-Type for PDFs
        let contentType = fileMetadata.contentType || 'application/octet-stream';
        if (fileMetadata.filename?.toLowerCase().endsWith('.pdf')) {
            contentType = 'application/pdf';
        }

        headers.set('Content-Type', contentType);
        headers.set('Content-Disposition', `${forceInline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(fileMetadata.filename || 'download')}"`);
        headers.set('Content-Length', String(fileMetadata.length));

        // Add headers to support inline PDF viewing
        headers.set('Accept-Ranges', 'bytes');
        headers.set('X-Content-Type-Options', 'nosniff');

        // Add cache control for staff to prevent caching/saving
        if (!userCanEdit) {
            headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            headers.set('Pragma', 'no-cache');
            headers.set('Expires', '0');
        }

        return new NextResponse(readableStream, {
            status: 200,
            headers: headers,
        });

    } catch (error) {
        console.error("Download error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to download file';
        return NextResponse.json({ message: 'Failed to download file', error: errorMessage }, { status: 500 });
    }
}
