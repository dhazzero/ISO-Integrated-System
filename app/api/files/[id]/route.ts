// app/api/files/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; //
import { GridFSBucket, ObjectId } from 'mongodb';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id: fileIdString } = params;
        const { db } = await connectToDatabase(); //
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

        const downloadStream = bucket.openDownloadStream(fileId);

        const url = new URL(req.url);
        const inline = url.searchParams.get('inline') === '1' || url.searchParams.get('inline') === 'true';

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
        headers.set('Content-Type', fileMetadata.contentType || 'application/octet-stream');
        headers.set('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(fileMetadata.filename || 'download')}"`);
        headers.set('Content-Length', String(fileMetadata.length));


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