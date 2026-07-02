// Script untuk test pengiriman email via Tencent Exmail SMTP
// Jalankan dengan: node scripts/test-email.mjs
//
// Untuk smtp.exmail.qq.com:
// - Port 465 (SSL) → secure: true
// - Port 587 (TLS) → secure: false
// - Gunakan password email atau Client Authorization Code
//
// EDIT 3 BARIS DI BAWAH INI:

const SMTP_USER = 'kevinn.ernest@danarupiah.com';       // Email Exmail Anda
const SMTP_PASS = 'ISI_PASSWORD_ANDA_DISINI';            // <-- GANTI INI dengan password Exmail Anda
const RECIPIENT = 'kevinn.ernest@danarupiah.com';        // Email tujuan test (bisa ke diri sendiri)

// ================================
// Konfigurasi SMTP
// ================================
const SMTP_HOST = 'smtp.exmail.qq.com';
const SMTP_PORT = 465;       // 465 (SSL) atau 587 (TLS)
const SMTP_SECURE = true;    // true untuk port 465, false untuk port 587

// ================================
// Jangan edit di bawah ini
// ================================

import nodemailer from 'nodemailer';

async function testEmail() {
    console.log('========================================');
    console.log('🔧 Test Email via Tencent Exmail SMTP');
    console.log('========================================');
    console.log(`SMTP Host: ${SMTP_HOST}:${SMTP_PORT} (secure: ${SMTP_SECURE})`);
    console.log(`SMTP User: ${SMTP_USER}`);
    console.log(`Recipient: ${RECIPIENT}`);
    console.log(`Password:  ${'*'.repeat(Math.min(SMTP_PASS.length, 16))} (${SMTP_PASS.length} chars)`);
    console.log('');

    if (SMTP_USER.includes('EMAIL_ANDA') || SMTP_PASS.includes('PASSWORD_ANDA')) {
        console.error('❌ ERROR: Anda belum mengisi email dan password!');
        console.error('   Edit file ini dan isi SMTP_USER, SMTP_PASS, dan RECIPIENT');
        process.exit(1);
    }

    // Step 1: Create transporter
    console.log('Step 1: Membuat koneksi ke ' + SMTP_HOST + ':' + SMTP_PORT + '...');
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        tls: {
            // Exmail kadang butuh ini
            rejectUnauthorized: false,
        },
    });

    // Step 2: Verify connection
    console.log('Step 2: Verifikasi koneksi SMTP...');
    try {
        await transporter.verify();
        console.log('   ✅ Koneksi SMTP berhasil!');
    } catch (error) {
        console.error('   ❌ Koneksi SMTP gagal:', error.message);
        if (error.message.includes('EAUTH') || error.message.includes('auth')) {
            console.error('   💡 Solusi untuk Exmail:');
            console.error('      1. Pastikan password benar');
            console.error('      2. Jika pakai Client Authorization Code, aktifkan di Exmail Settings');
            console.error('      3. Cek apakah SMTP access diizinkan di account settings Exmail');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.error('   💡 Solusi: Port mungkin diblokir oleh firewall');
            console.error('      Coba ganti port: 465 → 587 atau sebaliknya');
        } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ESOCKET')) {
            console.error('   💡 Solusi: Timeout - coba:');
            console.error('      1. Ganti port 465 → 587 (atau sebaliknya)');
            console.error('      2. Set SMTP_SECURE = false jika pakai port 587');
            console.error('      3. Periksa koneksi internet dan firewall');
        } else if (error.message.includes('certificate')) {
            console.error('   💡 Solusi: SSL certificate issue - sudah ditangani dengan tls.rejectUnauthorized: false');
        }
        process.exit(1);
    }

    // Step 3: Send email
    console.log('Step 3: Mengirim email test...');
    try {
        const info = await transporter.sendMail({
            from: `"ISO System" <${SMTP_USER}>`,
            to: RECIPIENT,
            subject: '🔔 Test Email - ISO Integrated System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">ISO Integrated System</h1>
                    </div>
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333;">✅ Test Email Berhasil!</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Email ini berhasil dikirim melalui ${SMTP_HOST}.<br>
                            Konfigurasi SMTP Anda berfungsi dengan baik.
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">
                            Dikirim pada: ${new Date().toLocaleString('id-ID')}<br>
                            From: ${SMTP_USER}<br>
                            Server: ${SMTP_HOST}:${SMTP_PORT}
                        </p>
                    </div>
                </div>
            `,
        });

        console.log('');
        console.log('   ✅ EMAIL BERHASIL DIKIRIM!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Cek inbox: ${RECIPIENT}`);
        console.log('');
        console.log('========================================');
        console.log('Gunakan setting ini di Settings → Notifikasi:');
        console.log(`  Host:   ${SMTP_HOST}`);
        console.log(`  Port:   ${SMTP_PORT}`);
        console.log(`  User:   ${SMTP_USER}`);
        console.log(`  Pass:   (password yang sama)`);
        console.log(`  From:   "ISO System" <${SMTP_USER}>`);
        console.log('========================================');

    } catch (error) {
        console.error('   ❌ Gagal mengirim email:', error.message);
        process.exit(1);
    }
}

testEmail();
