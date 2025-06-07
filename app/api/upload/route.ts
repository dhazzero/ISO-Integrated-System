// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; //
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

export async function POST(request: Request) {
    try {
        const { db } = await connectToDatabase(); //
        const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ message: 'File not provided' }, { status: 400 });
        }

        // Convert File to Buffer then to Readable Stream
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(fileBuffer);

        const uploadStream = bucket.openUploadStream(file.name, {
            contentType: file.type,
            metadata: {
                originalName: file.name,
                uploader: "user_id_placeholder", // Nanti bisa diganti dengan user ID aktual
                // Tambahkan metadata lain jika perlu
            }
        });

        await new Promise<void>((resolve, reject) => {
            stream.pipe(uploadStream)
                .on('error', (error) => reject(error))
                .on('finish', () => resolve());
        });

        return NextResponse.json({
            message: 'File uploaded successfully',
            fileId: uploadStream.id.toHexString(), // Mengembalikan ID file yang diupload
            filename: file.name,
            contentType: file.type,
            length: uploadStream.length,
        }, { status: 201 });

    } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
        return NextResponse.json({ message: 'Failed to upload file', error: errorMessage }, { status: 500 });
    }
}