import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';

export const dynamic = 'force-dynamic';

// Diagnostic endpoint to check the entire email notification configuration status
export async function GET() {
    try {
        const { db } = await getTenantDb();
        const diagnostics: Record<string, any> = {
            timestamp: new Date().toISOString(),
            checks: [],
        };

        // 1. Check SMTP settings
        const smtpSettings = await db.collection('notification_settings').findOne({ settingsKey: 'smtp' });
        if (!smtpSettings) {
            diagnostics.checks.push({
                name: 'SMTP Settings',
                status: '❌ BELUM DIKONFIGURASI',
                detail: 'Buka Settings → Notifikasi → isi SMTP → klik Simpan Pengaturan SMTP'
            });
        } else {
            diagnostics.checks.push({
                name: 'SMTP Settings',
                status: smtpSettings.smtpUser && smtpSettings.smtpPass ? '✅ OK' : '⚠️ TIDAK LENGKAP',
                detail: {
                    host: smtpSettings.smtpHost || '(kosong)',
                    port: smtpSettings.smtpPort || '(kosong)',
                    user: smtpSettings.smtpUser ? `${smtpSettings.smtpUser.substring(0, 3)}***` : '(kosong)',
                    password: smtpSettings.smtpPass ? '****(tersimpan)' : '(KOSONG - INI MASALAHNYA!)',
                    fromEmail: smtpSettings.fromEmail || '(kosong)',
                    lastUpdated: smtpSettings.updatedAt || 'N/A',
                }
            });
        }

        // 2. Check notification settings
        const notifSettings = await db.collection('notification_settings').findOne({ settingsKey: 'notifications' });
        if (!notifSettings) {
            diagnostics.checks.push({
                name: 'Notification Templates',
                status: '⚠️ Menggunakan default',
                detail: 'Belum ada template custom. Templates default akan digunakan.'
            });
        } else {
            const templates = notifSettings.templates || [];
            diagnostics.checks.push({
                name: 'Notification Templates',
                status: '✅ OK',
                detail: {
                    totalTemplates: templates.length,
                    active: templates.filter((t: any) => t.status === 'Aktif').map((t: any) => ({
                        id: t.id,
                        name: t.name,
                        picEmail: t.picEmail || '(tidak diatur)',
                    })),
                    globalEmailEnabled: notifSettings.globalSettings?.emailNotifications ?? true,
                }
            });
        }

        // 3. Check recent logs
        const recentLogs = await db.collection('notification_logs')
            .find({})
            .sort({ sentAt: -1 })
            .limit(5)
            .toArray();

        diagnostics.checks.push({
            name: 'Recent Notification Logs',
            status: recentLogs.length > 0 ? `✅ ${recentLogs.length} log ditemukan` : '⚠️ Belum ada log',
            detail: recentLogs.map(log => ({
                template: log.templateName,
                recipient: log.recipientEmail,
                status: log.status,
                sentAt: log.sentAt,
                error: log.error || undefined,
            }))
        });

        // 4. Check OJK reports with upcoming deadlines
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const next7days = new Date(today);
        next7days.setDate(today.getDate() + 7);

        const ojkReports = await db.collection('OJK_Compliance_Report').find({
            Status: { $nin: ['Submitted', 'Selesai', 'Terkirim'] }
        }).toArray();

        const upcomingOjk = ojkReports.filter(r => {
            if (!r.DueDate) return false;
            const dueDate = new Date(r.DueDate);
            return !isNaN(dueDate.getTime()) && dueDate >= today && dueDate <= next7days;
        });

        diagnostics.checks.push({
            name: 'OJK Reports Due Soon',
            status: upcomingOjk.length > 0 ? `⚠️ ${upcomingOjk.length} laporan akan jatuh tempo` : '✅ Tidak ada yang mendesak',
            detail: upcomingOjk.map(r => ({
                jenis: r.Jenis_Laporan,
                bulan: r.Bulan,
                dueDate: r.DueDate,
                status: r.Status || 'N/A',
            }))
        });

        return NextResponse.json(diagnostics, { status: 200 });
    } catch (error) {
        console.error('Diagnostics failed:', error);
        return NextResponse.json({
            error: (error as Error).message,
        }, { status: 500 });
    }
}
