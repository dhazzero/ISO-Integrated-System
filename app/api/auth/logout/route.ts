import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'session';

export async function POST() {
    try {
        // Hapus cookie
        cookies().delete(COOKIE_NAME);

        return NextResponse.json({ message: 'Logout berhasil' });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ message: 'Terjadi kesalahan saat logout' }, { status: 500 });
    }
}
