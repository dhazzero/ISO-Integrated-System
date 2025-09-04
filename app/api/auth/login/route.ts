import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { getCookies, setCookie } from 'cookies-next';

// PENTING: Di aplikasi produksi, ini HARUS menjadi variabel lingkungan (environment variable)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-bytes-long');
const COOKIE_NAME = 'session';

export async function POST(request: Request) {
    try {
        const { userId, password } = await request.json();

        if (!userId || !password) {
            return NextResponse.json({ message: 'User ID dan password diperlukan' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        const user = await db.collection<User>('users').findOne({ userId });

        if (!user) {
            return NextResponse.json({ message: 'User ID atau password salah.' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password!);
        if (!isPasswordValid) {
            return NextResponse.json({ message: 'User ID atau password salah.' }, { status: 401 });
        }

        // Buat JWT
        const token = await new SignJWT({
            userId: user._id,
            role: user.role,
            username: user.userId
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h') // Token berlaku selama 1 jam
            .sign(JWT_SECRET);

        // Buat respons untuk bisa mengatur cookie
        const response = NextResponse.json({ message: 'Login berhasil', user: { name: user.name, role: user.role } });

        // Atur cookie di respons
        setCookie(COOKIE_NAME, token, {
            req: request,
            res: response,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60, // 1 jam
            path: '/',
            sameSite: 'lax',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
