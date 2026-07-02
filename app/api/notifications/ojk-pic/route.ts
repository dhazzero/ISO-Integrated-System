import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { ObjectId } from 'mongodb';

const COLLECTION = 'ojk_pic_defaults';

// GET - Fetch all default PIC
export async function GET() {
    try {
        const { db } = await getTenantDb();
        const pics = await db.collection(COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
        const result = pics.map(p => ({ ...p, _id: p._id.toString() }));
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to fetch OJK PICs:', error);
        return NextResponse.json({ error: 'Failed to fetch PICs' }, { status: 500 });
    }
}

// POST - Add new default PIC
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, jabatan } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Nama dan email wajib diisi' }, { status: 400 });
        }

        const { db } = await getTenantDb();

        // Check duplicate email
        const existing = await db.collection(COLLECTION).findOne({ email });
        if (existing) {
            return NextResponse.json({ error: 'Email sudah terdaftar sebagai PIC' }, { status: 400 });
        }

        const doc = {
            name,
            email,
            jabatan: jabatan || '',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection(COLLECTION).insertOne(doc);
        return NextResponse.json({
            success: true,
            message: `PIC ${name} berhasil ditambahkan`,
            _id: result.insertedId.toString(),
            ...doc,
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to add OJK PIC:', error);
        return NextResponse.json({ error: 'Failed to add PIC' }, { status: 500 });
    }
}

// DELETE - Remove a PIC by ID (passed in body)
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });
        }

        const { db } = await getTenantDb();
        const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'PIC tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'PIC berhasil dihapus' });
    } catch (error) {
        console.error('Failed to delete OJK PIC:', error);
        return NextResponse.json({ error: 'Failed to delete PIC' }, { status: 500 });
    }
}
