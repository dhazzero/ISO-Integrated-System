// app/api/notifications/test-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getTenantDb } from '@/lib/db-helper';

function createSmtpTransporter(host: string, port: number, user: string, pass: string, fromEmail?: string) {
    // Port 465 = implicit SSL, other ports = STARTTLS
    const secure = port === 465;

    console.log(`[SMTP] Creating transporter: host=${host}, port=${port}, secure=${secure}, user=${user}`);

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 30000,
        tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2',
        },
        logger: true,   // Enable SMTP protocol logging in console
        debug: true,     // Show debug output
    });
}

// GET - Retrieve SMTP settings
export async function GET() {
    try {
        const { db } = await getTenantDb();
        const settings = await db.collection('notification_settings').findOne({ settingsKey: 'smtp' });

        if (!settings) {
            return NextResponse.json({
                configured: false,
                smtpHost: 'smtp.gmail.com',
                smtpPort: 587,
                smtpUser: '',
                smtpPass: '',
                smtpSecure: false,
                fromEmail: '',
            });
        }

        return NextResponse.json({
            configured: true,
            smtpHost: settings.smtpHost || 'smtp.gmail.com',
            smtpPort: Number(settings.smtpPort) || 587,
            smtpUser: settings.smtpUser || '',
            smtpPass: settings.smtpPass || '',
            smtpSecure: settings.smtpSecure || false,
            fromEmail: settings.fromEmail || '',
        });
    } catch (error) {
        console.error('Failed to fetch SMTP settings:', error);
        return NextResponse.json({ success: false, message: 'Gagal mengambil pengaturan SMTP' }, { status: 500 });
    }
}

// POST - Test email or verify connection
export async function POST(request: Request) {
    const { db } = await getTenantDb();

    try {
        const body = await request.json();
        const { action, recipient } = body;
        let smtpHost = body.smtpHost;
        let smtpPort = Number(body.smtpPort) || 587;  // FORCE to number!
        let smtpUser = body.smtpUser;
        let smtpPass = body.smtpPass;
        let fromEmail = body.fromEmail;

        // If smtpPass is empty, try to load from DB
        if (!smtpPass) {
            const savedSettings = await db.collection('notification_settings').findOne({ settingsKey: 'smtp' });
            if (savedSettings) {
                smtpHost = smtpHost || savedSettings.smtpHost;
                smtpPort = Number(smtpPort || savedSettings.smtpPort) || 587;
                smtpUser = smtpUser || savedSettings.smtpUser;
                smtpPass = savedSettings.smtpPass;
                fromEmail = fromEmail || savedSettings.fromEmail;
            }
        }

        // Validate required fields
        if (!smtpUser || !smtpPass) {
            return NextResponse.json({
                success: false,
                message: 'SMTP username dan password harus diisi. Simpan pengaturan SMTP terlebih dahulu.',
            }, { status: 400 });
        }

        if (!smtpHost) {
            return NextResponse.json({
                success: false,
                message: 'SMTP host harus diisi.',
            }, { status: 400 });
        }

        console.log(`[Email Test] ===== START =====`);
        console.log(`[Email Test] Action: ${action}`);
        console.log(`[Email Test] Host: ${smtpHost}, Port: ${smtpPort} (type: ${typeof smtpPort})`);
        console.log(`[Email Test] User: ${smtpUser}`);
        console.log(`[Email Test] Password: ${'*'.repeat(Math.min(smtpPass.length, 8))} (${smtpPass.length} chars)`);
        console.log(`[Email Test] Secure: ${smtpPort === 465 ? 'YES (port 465)' : 'NO (STARTTLS)'}`);

        // Try primary port first, then fallback
        let transporter = createSmtpTransporter(smtpHost, smtpPort, smtpUser, smtpPass, fromEmail);

        if (action === 'verify') {
            try {
                await transporter.verify();
            } catch (primaryError) {
                const errMsg = (primaryError as Error).message;
                console.log(`[Email Test] Primary port ${smtpPort} failed: ${errMsg}`);

                // If "Greeting never received", try the other port
                if (errMsg.includes('Greeting never received') || errMsg.includes('ESOCKET') || errMsg.includes('ETIMEDOUT')) {
                    const fallbackPort = smtpPort === 465 ? 587 : 465;
                    console.log(`[Email Test] Retrying with fallback port ${fallbackPort}...`);
                    transporter = createSmtpTransporter(smtpHost, fallbackPort, smtpUser, smtpPass, fromEmail);

                    try {
                        await transporter.verify();

                        // Save the working port
                        await db.collection('notification_settings').updateOne(
                            { settingsKey: 'smtp' },
                            { $set: { smtpPort: fallbackPort, updatedAt: new Date() } }
                        );

                        await db.collection('notification_logs').insertOne({
                            templateId: 'smtp_verify', templateName: 'Verifikasi SMTP',
                            recipientEmail: '-', recipientName: '-', subject: '-',
                            status: 'verified', messageId: '-', sentAt: new Date(),
                            details: `Berhasil via port ${fallbackPort} (port ${smtpPort} gagal)`,
                        });

                        return NextResponse.json({
                            success: true,
                            message: `Koneksi SMTP berhasil via port ${fallbackPort}! (Port ${smtpPort} tidak bisa, port diupdate otomatis ke ${fallbackPort})`,
                        });
                    } catch (fallbackError) {
                        throw new Error(`Port ${smtpPort}: ${errMsg}. Port ${fallbackPort}: ${(fallbackError as Error).message}`);
                    }
                } else {
                    throw primaryError;
                }
            }

            await db.collection('notification_logs').insertOne({
                templateId: 'smtp_verify', templateName: 'Verifikasi SMTP',
                recipientEmail: '-', recipientName: '-', subject: '-',
                status: 'verified', messageId: '-', sentAt: new Date(),
                details: `Koneksi ke ${smtpHost}:${smtpPort} berhasil`,
            });

            return NextResponse.json({
                success: true,
                message: `Koneksi SMTP berhasil diverifikasi (${smtpHost}:${smtpPort})`
            });
        }

        if (action === 'test') {
            if (!recipient) {
                return NextResponse.json({
                    success: false,
                    message: 'Email penerima harus diisi'
                }, { status: 400 });
            }

            const senderAddress = fromEmail || `"ISO System" <${smtpUser}>`;

            let info;
            try {
                info = await transporter.sendMail({
                    from: senderAddress,
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
                                    Jika Anda menerima email ini, berarti konfigurasi SMTP berfungsi dengan baik.
                                </p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="color: #999; font-size: 12px;">
                                    Dikirim pada: ${new Date().toLocaleString('id-ID')}<br>
                                    Server: ${smtpHost}:${smtpPort}<br>
                                    From: ${senderAddress}
                                </p>
                            </div>
                        </div>
                    `,
                });
            } catch (primaryError) {
                const errMsg = (primaryError as Error).message;
                console.log(`[Email Test] Send via port ${smtpPort} failed: ${errMsg}`);

                if (errMsg.includes('Greeting never received') || errMsg.includes('ESOCKET') || errMsg.includes('ETIMEDOUT')) {
                    const fallbackPort = smtpPort === 465 ? 587 : 465;
                    console.log(`[Email Test] Retrying send with fallback port ${fallbackPort}...`);
                    transporter = createSmtpTransporter(smtpHost, fallbackPort, smtpUser, smtpPass, fromEmail);

                    info = await transporter.sendMail({
                        from: senderAddress,
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
                                        Email ini berhasil dikirim (via port ${fallbackPort}).
                                    </p>
                                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                    <p style="color: #999; font-size: 12px;">
                                        Dikirim pada: ${new Date().toLocaleString('id-ID')}<br>
                                        Server: ${smtpHost}:${fallbackPort}
                                    </p>
                                </div>
                            </div>
                        `,
                    });

                    // Save the working port
                    await db.collection('notification_settings').updateOne(
                        { settingsKey: 'smtp' },
                        { $set: { smtpPort: fallbackPort, updatedAt: new Date() } }
                    );
                    smtpPort = fallbackPort;
                } else {
                    throw primaryError;
                }
            }

            await db.collection('notification_logs').insertOne({
                templateId: 'test_email', templateName: 'Test Email',
                recipientEmail: recipient, recipientName: 'Test Recipient',
                subject: '🔔 Test Email - ISO Integrated System',
                status: 'sent', messageId: info.messageId, sentAt: new Date(),
                details: `Via ${smtpHost}:${smtpPort}`,
            });

            console.log(`[Email Test] ✅ SUCCESS. MessageId: ${info.messageId}`);

            return NextResponse.json({
                success: true,
                message: `Email test berhasil dikirim ke ${recipient} (via ${smtpHost}:${smtpPort})`,
                messageId: info.messageId,
            });
        }

        return NextResponse.json({ success: false, message: 'Action tidak valid' }, { status: 400 });

    } catch (error) {
        console.error('[Email Test] ❌ FINAL ERROR:', error);
        const errorMessage = (error as Error).message;

        // Log failure
        try {
            await db.collection('notification_logs').insertOne({
                templateId: 'test_email', templateName: 'Test Email',
                recipientEmail: '-', recipientName: '-', subject: '-',
                status: 'failed', messageId: '-', sentAt: new Date(),
                error: errorMessage,
            });
        } catch (logErr) {
            console.error('Failed to log:', logErr);
        }

        let userMessage = `Gagal: ${errorMessage}`;
        if (errorMessage.includes('EAUTH')) {
            userMessage = 'Autentikasi gagal. Periksa username dan password SMTP. Untuk Gmail, gunakan App Password.';
        } else if (errorMessage.includes('ECONNREFUSED')) {
            userMessage = 'Koneksi ditolak. Periksa host dan port SMTP.';
        } else if (errorMessage.includes('Greeting never received')) {
            userMessage = 'Server SMTP tidak merespons. Kemungkinan: (1) Port salah, (2) SSL/TLS mismatch, (3) Firewall memblokir. Sudah dicoba port 465 dan 587.';
        } else if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ESOCKET')) {
            userMessage = 'Koneksi timeout. Periksa koneksi internet dan firewall.';
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
        const smtpHost = body.smtpHost;
        const smtpPort = Number(body.smtpPort) || 587;  // Force number
        const smtpUser = body.smtpUser;
        const smtpPass = body.smtpPass;
        const fromEmail = body.fromEmail;

        if (!smtpHost || !smtpUser || !smtpPass) {
            return NextResponse.json({
                success: false,
                message: 'SMTP Host, Username, dan Password wajib diisi',
            }, { status: 400 });
        }

        const { db } = await getTenantDb();

        const result = await db.collection('notification_settings').updateOne(
            { settingsKey: 'smtp' },
            {
                $set: {
                    settingsKey: 'smtp',
                    smtpHost,
                    smtpPort,
                    smtpUser,
                    smtpPass,
                    smtpSecure: smtpPort === 465,
                    fromEmail: fromEmail || `"ISO System" <${smtpUser}>`,
                    updatedAt: new Date(),
                }
            },
            { upsert: true }
        );

        console.log(`[SMTP Save] OK. Host: ${smtpHost}:${smtpPort}, User: ${smtpUser}`);

        return NextResponse.json({
            success: true,
            message: 'Pengaturan SMTP berhasil disimpan'
        });

    } catch (error) {
        console.error('[SMTP Save] FAILED:', error);
        return NextResponse.json({
            success: false,
            message: 'Gagal menyimpan: ' + (error as Error).message,
        }, { status: 500 });
    }
}
