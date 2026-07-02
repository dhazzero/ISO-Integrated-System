import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { User } from '@/lib/types';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

const passwordValidation = z.string()
    .min(8, { message: "Password minimal 8 karakter." })
    .refine(value => /[A-Z]/.test(value), { message: "Password harus mengandung setidaknya satu huruf besar." })
    .refine(value => /[a-z]/.test(value), { message: "Password harus mengandung setidaknya satu huruf kecil." })
    .refine(value => /\d/.test(value), { message: "Password harus mengandung setidaknya satu angka." })
    .refine(value => /[@$!%*?&]/.test(value), { message: "Password harus mengandung setidaknya satu karakter spesial (@$!%*?&)." });

// Skema untuk validasi update (using string for dynamic roles)
const updateUserSchema = z.object({
    name: z.string().min(1, "Nama diperlukan"),
    userId: z.string().min(1, "User ID diperlukan"),
    email: z.string().email("Email tidak valid"),
    role: z.string().min(1, "Role diperlukan"),
    departmentId: z.string().optional().nullable(),
    supervisorId: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive', 'pending']),
    // Password bersifat opsional, tapi jika ada, harus valid
    password: z.union([z.literal(''), passwordValidation]).optional(),
});

// --- GET: Mengambil data satu pengguna ---
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await getTenantDb();
        const { id } = params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID pengguna tidak valid' }, { status: 400 });
        }

        const user = await db.collection('users').findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } } // Jangan pernah kembalikan password
        );

        if (!user) {
            return NextResponse.json({ message: 'Pengguna tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Gagal mengambil data pengguna:', error);
        return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

// --- PUT: Memperbarui data pengguna ---
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await getTenantDb();
        const { id } = params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID pengguna tidak valid' }, { status: 400 });
        }

        const body = await request.json();
        const validation = updateUserSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: "Input tidak valid", errors: validation.error.flatten() }, { status: 400 });
        }

        const { password, ...userData } = validation.data;

        const updateData: any = { ...userData };

        // Jika password baru diberikan (dan tidak kosong), hash password tersebut
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Pastikan departmentId dan supervisorId adalah ObjectId atau null
        updateData.departmentId = userData.departmentId ? new ObjectId(userData.departmentId) : null;
        updateData.supervisorId = userData.supervisorId ? new ObjectId(userData.supervisorId) : null;
        updateData.updatedAt = new Date();

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Pengguna tidak ditemukan untuk diperbarui' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Pengguna berhasil diperbarui' }, { status: 200 });

    } catch (error) {
        console.error('Gagal memperbarui pengguna:', error);
        return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
