import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const emailSchema = z.object({
  smtpHost: z.string().min(1, "SMTP Host diperlukan"),
  smtpPort: z.number().int().positive("SMTP Port harus angka positif"),
  smtpUser: z.string().min(1, "SMTP Username diperlukan"),
  smtpPass: z.string().min(1, "SMTP Password diperlukan"),
  recipientEmail: z.string().email("Email penerima tidak valid").optional(),
  type: z.enum(['verify', 'test']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = emailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid", errors: validation.error.errors }, { status: 400 });
    }

    if (validation.data.type === 'test' && !validation.data.recipientEmail) {
        return NextResponse.json({ message: "Email penerima diperlukan untuk mengirim email tes." }, { status: 400 });
    }

    const { smtpHost, smtpPort, smtpUser, smtpPass, recipientEmail, type } = validation.data;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    if (type === 'verify') {
      await transporter.verify();
      return NextResponse.json({ message: 'Koneksi ke server SMTP berhasil!' });
    }

    if (type === 'test') {
      await transporter.sendMail({
        from: `"${smtpUser}" <${smtpUser}>`,
        to: recipientEmail,
        subject: 'Email Tes dari ISO Integrated System',
        html: `
          <h1>Koneksi Berhasil!</h1>
          <p>Ini adalah email tes yang dikirim dari aplikasi ISO Integrated System Anda.</p>
          <p>Jika Anda menerima ini, konfigurasi SMTP Anda sudah benar.</p>
        `,
      });
      return NextResponse.json({ message: `Email tes berhasil dikirim ke ${recipientEmail}` });
    }

    // Fallback in case type is invalid (though zod should prevent this)
    return NextResponse.json({ message: "Tipe aksi tidak valid." }, { status: 400 });

  } catch (error) {
    console.error('Email test/verify failed:', error);
    return NextResponse.json({ message: 'Gagal terhubung atau mengirim email. Periksa kembali kredensial dan pengaturan Anda.' }, { status: 500 });
  }
}
