import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, password } = await request.json();

    // TODO: Ganti dengan validasi database sesungguhnya
    // Cek apakah userId dan password ada
    if (!userId || !password) {
      return NextResponse.json({ message: 'User ID dan password diperlukan' }, { status: 400 });
    }

    // Simulasi pengecekan ke database
    console.log(`Mencoba login dengan User ID: ${userId}`);

    // Simulasi pengguna yang ditemukan di database
    // Di dunia nyata, Anda akan mengambil ini dari DB dan tidak pernah mengirim password kembali
    const user = {
      id: '123',
      userId: userId,
      name: 'Pengguna Demo',
      level: 'administrator', // Ini akan menjadi dinamis nanti
    };

    // Untuk sekarang, kita anggap login selalu berhasil jika input ada
    return NextResponse.json({ message: 'Login berhasil', user }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
