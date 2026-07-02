
import nodemailer from 'nodemailer';
import { getTenantDb } from '@/lib/db-helper';

export interface NotificationRequest {
    templateId: string;
    recipientEmail?: string;
    recipientName?: string;
    subject?: string;
    customContent?: string;
    data?: Record<string, string>;
}

export interface NotificationResult {
    success: boolean;
    message: string;
    messageId?: string;
}

export async function sendNotification(request: NotificationRequest): Promise<NotificationResult> {
    try {
        const { templateId, recipientEmail, recipientName, subject, customContent, data } = request;

        const { db } = await getTenantDb();

        // Get SMTP settings
        const smtpSettings = await db.collection('notification_settings').findOne({ settingsKey: 'smtp' });

        if (!smtpSettings?.smtpUser || !smtpSettings?.smtpPass) {
            return {
                success: false,
                message: 'Pengaturan SMTP belum dikonfigurasi.'
            };
        }

        // Get notification template with PIC info
        const notificationSettings = await db.collection('notification_settings').findOne({ settingsKey: 'notifications' });
        const template = notificationSettings?.templates?.find((t: { id: string }) => t.id === templateId);

        // Determine recipient
        // Prioritize explicit recipient, then template PIC, then fallback
        const toEmail = recipientEmail || template?.picEmail;
        const toName = recipientName || template?.picName || 'User';

        if (!toEmail) {
            return {
                success: false,
                message: 'Email penerima tidak ditemukan (PIC belum diatur).'
            };
        }

        // Check if template is active (skipped if custom recipient is provided? No, adherence to settings is better)
        // If it's a direct API call with recipientEmail, maybe we skip status check? 
        // For now, let's respect the template status if it exists.
        if (template && template.status === 'Tidak Aktif') {
            return {
                success: false,
                message: `Template ${template.name} sedang tidak aktif.`
            };
        }

        // Check global email setting
        if (notificationSettings?.globalSettings?.emailNotifications === false) {
            return {
                success: false,
                message: `Notifikasi email dinonaktifkan secara global.`
            };
        }

        // Create transporter
        // Force port to number, auto-detect secure: port 465 = SSL, others = STARTTLS
        const portNum = Number(smtpSettings.smtpPort) || 587;
        const isSecure = portNum === 465;
        console.log(`[Notification] SMTP: ${smtpSettings.smtpHost}:${portNum}, secure=${isSecure}, user=${smtpSettings.smtpUser}`);
        const transporter = nodemailer.createTransport({
            host: smtpSettings.smtpHost,
            port: portNum,
            secure: isSecure,
            auth: {
                user: smtpSettings.smtpUser,
                pass: smtpSettings.smtpPass,
            },
            connectionTimeout: 20000,
            greetingTimeout: 20000,
            socketTimeout: 30000,
            tls: {
                rejectUnauthorized: false,
                minVersion: 'TLSv1.2',
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

        return {
            success: true,
            message: `Notifikasi berhasil dikirim ke ${toEmail}`,
            messageId: info.messageId,
        };

    } catch (error) {
        console.error('Failed to send notification:', error);
        return {
            success: false,
            message: 'Gagal mengirim notifikasi: ' + (error as Error).message
        };
    }
}

function getDefaultSubject(templateId: string, templateName?: string): string {
    const subjects: Record<string, string> = {
        'audit_reminder': '🔔 Pengingat: Audit Akan Datang',
        'capa_due_date': '⚠️ Peringatan: CAPA Akan Jatuh Tempo',
        'risk_alert': '🚨 Alert: Risiko Tinggi Terdeteksi',
        'document_review': '📄 Pengingat: Review Dokumen Diperlukan',
        'training_reminder': '📚 Pengingat: Pelatihan Akan Datang',
        'ojk_compliance': '📋 Pengingat: Batas Waktu Laporan OJK',
        'sop_update': '📝 Pengingat: Pembaruan SOP Diperlukan',
        'risk_register_update': '📊 Pengingat: Pembaruan Risk Register',
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
        'sop_update': `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #34d399 0%, #059669 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">📝 Pengingat Pembaruan SOP</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Halo <strong>${recipientName}</strong>,</p>
                    <p style="color: #666; line-height: 1.6;">
                        Ini adalah pengingat bahwa terdapat SOP yang mendekati waktu pembaruan (kadaluarsa).
                        ${data?.sopName ? `<br><br><strong>SOP:</strong> ${data.sopName}` : ''}
                        ${data?.dueDate ? `<br><strong>Batas Waktu:</strong> ${data.dueDate}` : ''}
                    </p>
                    <p style="color: #666;">Mohon segera tinjau dan perbarui dokumen SOP tersebut.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">ISO Integrated System</p>
                </div>
            </div>
        `,
        'risk_register_update': `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">📊 Pengingat Pembaruan Risk Register</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Halo <strong>${recipientName}</strong>,</p>
                    <p style="color: #666; line-height: 1.6;">
                        Ini adalah pengingat berkala untuk meninjau dan memperbarui Risk Register.
                        ${data?.department ? `<br><br><strong>Departemen:</strong> ${data.department}` : ''}
                        ${data?.dueDate ? `<br><strong>Batas Waktu:</strong> ${data.dueDate}` : ''}
                    </p>
                    <p style="color: #666;">Mohon pastikan semua identifikasi risiko dan mitigasinya sudah mutakhir.</p>
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
