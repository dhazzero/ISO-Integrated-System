// app/api/notifications/test-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectToDatabase } from '@/lib/mongodb';

// GET - Retrieve SMTP settings
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const settings = await db.collection('notification_settings').findOne({ settingsKey: 'smtp' });

        if (!settings) {
            return NextResponse.json({
                smtpHost: 'smtp.gmail.com',
                smtpPort: 587,
                smtpUser: '',
                smtpPass: '',
                smtpSecure: false,
                fromEmail: 'ISO System <noreply@example.com>',
            });
        }

        return NextResponse.json({
            smtpHost: settings.smtpHost,
            smtpPort: settings.smtpPort,
            smtpUser: settings.smtpUser,
            smtpSecure: settings.smtpSecure,
            fromEmail: settings.fromEmail,
            // Don't return password for security
        });
    } catch (error) {
        console.error('Failed to fetch SMTP settings:', error);
        return NextResponse.json({ message: 'Gagal mengambil pengaturan SMTP' }, { status: 500 });
    }
}

// POST - Test email or verify connection
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, recipient, smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure, fromEmail } = body;

        // Create transporter with provided settings
        const transporter = nodemailer.createTransport({
            host: smtpHost || 'smtp.gmail.com',
            port: smtpPort || 587,
            secure: smtpSecure || false, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        if (action === 'verify') {
            // Verify SMTP connection
            await transporter.verify();
            return NextResponse.json({
                success: true,
                message: 'Koneksi SMTP berhasil diverifikasi'
            });
        }

        if (action === 'test') {
            // Send test email
            if (!recipient) {
                return NextResponse.json({
                    message: 'Email penerima harus diisi'
                }, { status: 400 });
            }

            const info = await transporter.sendMail({
                from: fromEmail || `"ISO System" <${smtpUser}>`,
                to: recipient,
                subject: '🔔 Test Email - ISO Integrated System',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">ISO Integrated System</h1>
                        </div>
                        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #333;">✅ Test Email Berhasil!</h2>
                            <p style="color: #666; line-height: 1.6;">
                                Ini adalah email test dari sistem ISO Integrated System. 
                                Jika Anda menerima email ini, berarti konfigurasi SMTP Anda berfungsi dengan baik.
                            </p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #999; font-size: 12px;">
                                Email ini dikirim pada: ${new Date().toLocaleString('id-ID')}<br>
                                Server: ${smtpHost}:${smtpPort}
                            </p>
                        </div>
                    </div>
                `,
            });

            return NextResponse.json({
                success: true,
                message: 'Email test berhasil dikirim',
                messageId: info.messageId,
            });
        }

        return NextResponse.json({ message: 'Action tidak valid' }, { status: 400 });

    } catch (error) {
        console.error('Email operation failed:', error);
        const errorMessage = (error as Error).message;

        // Provide helpful error messages
        let userMessage = 'Gagal mengirim email';
        if (errorMessage.includes('EAUTH')) {
            userMessage = 'Autentikasi gagal. Periksa username dan password SMTP Anda. Untuk Gmail, gunakan App Password.';
        } else if (errorMessage.includes('ECONNREFUSED')) {
            userMessage = 'Koneksi ke server SMTP ditolak. Periksa host dan port.';
        } else if (errorMessage.includes('ETIMEDOUT')) {
            userMessage = 'Koneksi timeout. Periksa firewall atau jaringan Anda.';
        }

        return NextResponse.json({
            success: false,
            message: userMessage,
            error: errorMessage,
        }, { status: 500 });
    }
}

// PUT - Save SMTP settings
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure, fromEmail } = body;

        const { db } = await connectToDatabase();

        await db.collection('notification_settings').updateOne(
            { settingsKey: 'smtp' },
            {
                $set: {
                    settingsKey: 'smtp',
                    smtpHost,
                    smtpPort,
                    smtpUser,
                    smtpPass, // In production, encrypt this!
                    smtpSecure,
                    fromEmail,
                    updatedAt: new Date(),
                }
            },
            { upsert: true }
        );

        return NextResponse.json({
            success: true,
            message: 'Pengaturan SMTP berhasil disimpan'
        });

    } catch (error) {
        console.error('Failed to save SMTP settings:', error);
        return NextResponse.json({
            message: 'Gagal menyimpan pengaturan SMTP'
        }, { status: 500 });
    }
}
