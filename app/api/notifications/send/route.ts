// app/api/notifications/send/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getTenantDb } from '@/lib/db-helper';

interface NotificationRequest {
    templateId: string;
    recipientEmail?: string;
    recipientName?: string;
    subject?: string;
    customContent?: string;
    data?: Record<string, string>;
}

// POST - Send notification to PIC
export async function POST(request: Request) {
    try {
        const body: NotificationRequest = await request.json();
        const { templateId, recipientEmail, recipientName, subject, customContent, data } = body;

        const { db } = await getTenantDb();

        // Get SMTP settings
        const smtpSettings = await db.collection('notification_settings').findOne({ settingsKey: 'smtp' });

        if (!smtpSettings?.smtpUser || !smtpSettings?.smtpPass) {
            return NextResponse.json({
                success: false,
                message: 'Pengaturan SMTP belum dikonfigurasi. Silakan atur di tab Notifikasi.'
            }, { status: 400 });
        }

        // Get notification template with PIC info
        const notificationSettings = await db.collection('notification_settings').findOne({ settingsKey: 'notifications' });
        const template = notificationSettings?.templates?.find((t: { id: string }) => t.id === templateId);

        // Determine recipient
        const toEmail = recipientEmail || template?.picEmail;
        const toName = recipientName || template?.picName || 'User';

        if (!toEmail) {
            return NextResponse.json({
                success: false,
                message: 'Email penerima tidak ditemukan. Pastikan PIC sudah diatur.'
            }, { status: 400 });
        }

        // Check if template is active
        if (template && template.status === 'Tidak Aktif') {
            return NextResponse.json({
                success: false,
                message: `Template ${template.name} sedang tidak aktif.`
            }, { status: 400 });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: smtpSettings.smtpHost,
            port: smtpSettings.smtpPort,
            secure: smtpSettings.smtpSecure || false,
            auth: {
                user: smtpSettings.smtpUser,
                pass: smtpSettings.smtpPass,
            },
        });

        // Build email content based on template
        const emailSubject = subject || getDefaultSubject(templateId, template?.name);
        const emailContent = customContent || buildEmailContent(templateId, toName, data);

        // Send email
        const info = await transporter.sendMail({
            from: smtpSettings.fromEmail || `"ISO System" <${smtpSettings.smtpUser}>`,
            to: toEmail,
            subject: emailSubject,
            html: emailContent,
        });

        // Log the notification
        await db.collection('notification_logs').insertOne({
            templateId,
            templateName: template?.name || templateId,
            recipientEmail: toEmail,
            recipientName: toName,
            subject: emailSubject,
            status: 'sent',
            messageId: info.messageId,
            sentAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: `Notifikasi berhasil dikirim ke ${toEmail}`,
            messageId: info.messageId,
        });

    } catch (error) {
        console.error('Failed to send notification:', error);
        return NextResponse.json({
            success: false,
            message: 'Gagal mengirim notifikasi: ' + (error as Error).message
        }, { status: 500 });
    }
}

function getDefaultSubject(templateId: string, templateName?: string): string {
    const subjects: Record<string, string> = {
        'audit_reminder': '🔔 Pengingat: Audit Akan Datang',
        'capa_due_date': '⚠️ Peringatan: CAPA Akan Jatuh Tempo',
        'risk_alert': '🚨 Alert: Risiko Tinggi Terdeteksi',
        'document_review': '📄 Pengingat: Review Dokumen Diperlukan',
        'training_reminder': '📚 Pengingat: Pelatihan Akan Datang',
    };
    return subjects[templateId] || `Notifikasi: ${templateName || templateId}`;
}

function buildEmailContent(templateId: string, recipientName: string, data?: Record<string, string>): string {
    const templates: Record<string, string> = {
        'audit_reminder': `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🔔 Pengingat Audit</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Halo <strong>${recipientName}</strong>,</p>
                    <p style="color: #666; line-height: 1.6;">
                        Ini adalah pengingat bahwa terdapat audit yang akan dilaksanakan dalam waktu dekat.
                        ${data?.auditName ? `<br><br><strong>Audit:</strong> ${data.auditName}` : ''}
                        ${data?.auditDate ? `<br><strong>Tanggal:</strong> ${data.auditDate}` : ''}
                    </p>
                    <p style="color: #666;">Mohon siapkan dokumen-dokumen yang diperlukan.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">ISO Integrated System</p>
                </div>
            </div>
        `,
        'capa_due_date': `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">⚠️ CAPA Akan Jatuh Tempo</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Halo <strong>${recipientName}</strong>,</p>
                    <p style="color: #666; line-height: 1.6;">
                        Ini adalah peringatan bahwa terdapat CAPA yang akan jatuh tempo.
                        ${data?.capaId ? `<br><br><strong>ID CAPA:</strong> ${data.capaId}` : ''}
                        ${data?.dueDate ? `<br><strong>Due Date:</strong> ${data.dueDate}` : ''}
                    </p>
                    <p style="color: #666;">Mohon segera selesaikan aksi yang diperlukan.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">ISO Integrated System</p>
                </div>
            </div>
        `,
        'risk_alert': `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🚨 Alert Risiko Tinggi</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Halo <strong>${recipientName}</strong>,</p>
                    <p style="color: #666; line-height: 1.6;">
                        Sistem mendeteksi risiko tinggi yang memerlukan perhatian segera.
                        ${data?.riskName ? `<br><br><strong>Risiko:</strong> ${data.riskName}` : ''}
                        ${data?.severity ? `<br><strong>Severity:</strong> ${data.severity}` : ''}
                    </p>
                    <p style="color: #666;">Mohon segera tinjau dan lakukan mitigasi.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">ISO Integrated System</p>
                </div>
            </div>
        `,
    };

    return templates[templateId] || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">Notifikasi - ISO System</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Halo <strong>${recipientName}</strong>,</p>
                <p style="color: #666; line-height: 1.6;">
                    Anda memiliki notifikasi baru dari sistem ISO Integrated System.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">ISO Integrated System</p>
            </div>
        </div>
    `;
}
