import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { sendNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic'; // Ensure this route is never cached

export async function GET() {
    try {
        const { db } = await getTenantDb();
        const logs: string[] = [];
        let emailsSent = 0;

        // 1. Get Notification Settings
        const settings = await db.collection('notification_settings').findOne({ settingsKey: 'notifications' });
        const templates = settings?.templates || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // --- Helper to get target date range ---
        const getTargetDateRange = (daysOffset: number) => {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysOffset);

            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            return { start: startOfDay, end: endOfDay, dateStr: targetDate.toLocaleDateString('id-ID') };
        };

        // --- Helper to parse date string (handles various formats) ---
        const parseDate = (dateStr: string): Date | null => {
            if (!dateStr) return null;
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? null : d;
        };

        // ============================================================
        // 2. Check Audit Reminders
        // ============================================================
        const auditTemplate = templates.find((t: any) => t.id === 'audit_reminder');
        if (auditTemplate && auditTemplate.status === 'Aktif') {
            const days = auditTemplate.daysBeforeNotify || 7;
            const { start, end, dateStr } = getTargetDateRange(days);

            const dueAudits = await db.collection('audits').find({
                $or: [
                    { date: { $gte: start, $lte: end } },
                    { date: { $gte: start.toISOString(), $lte: end.toISOString() } },
                    { date: { $regex: `^${start.toISOString().split('T')[0]}` } }
                ],
                status: { $ne: 'Completed' }
            }).toArray();

            logs.push(`[Audit] Checking due on ${dateStr} (${days} days). Found: ${dueAudits.length}`);

            for (const audit of dueAudits) {
                const result = await sendNotification({
                    templateId: 'audit_reminder',
                    data: {
                        auditName: audit.name || 'N/A',
                        auditDate: new Date(audit.date).toLocaleDateString('id-ID'),
                    },
                    recipientName: audit.auditor || 'Auditor',
                });
                if (result.success) emailsSent++;
                logs.push(`  Audit "${audit.name}": ${result.message}`);
            }
        }

        // ============================================================
        // 3. Check CAPA Due Dates
        // ============================================================
        const capaTemplate = templates.find((t: any) => t.id === 'capa_due_date');
        if (capaTemplate && capaTemplate.status === 'Aktif') {
            const days = capaTemplate.daysBeforeNotify || 3;
            const { start, end, dateStr } = getTargetDateRange(days);

            const dueCapas = await db.collection('capas').find({
                $or: [
                    { dueDate: { $gte: start, $lte: end } },
                    { dueDate: { $gte: start.toISOString(), $lte: end.toISOString() } }
                ],
                status: { $nin: ['Closed', 'Resolved'] }
            }).toArray();

            logs.push(`[CAPA] Checking due on ${dateStr} (${days} days). Found: ${dueCapas.length}`);

            for (const capa of dueCapas) {
                const result = await sendNotification({
                    templateId: 'capa_due_date',
                    data: {
                        capaId: capa._id.toString(),
                        dueDate: new Date(capa.dueDate).toLocaleDateString('id-ID'),
                    },
                    recipientName: capa.responsible || 'PIC',
                });
                if (result.success) emailsSent++;
                logs.push(`  CAPA ${capa._id}: ${result.message}`);
            }
        }

        // ============================================================
        // 4. Check OJK Compliance Reporting Deadlines (with PIC support)
        // ============================================================
        const ojkTemplate = templates.find((t: any) => t.id === 'ojk_compliance');
        let ojkDueCount = 0;
        let checkedOjkReports = 0;

        if (ojkTemplate && ojkTemplate.status === 'Aktif') {
            const ojkDaysBeforeNotify = ojkTemplate.daysBeforeNotify || 7;

            // Fetch default PIC list for OJK
            const defaultOjkPics = await db.collection('ojk_pic_defaults').find({ active: true }).toArray();
            logs.push(`[OJK] Default PICs loaded: ${defaultOjkPics.length}`);

            // Find all OJK reports that are not yet submitted and have upcoming due dates
            const allOjkReports = await db.collection('OJK_Compliance_Report').find({
                Status: { $nin: ['Submitted', 'Selesai', 'Terkirim', 'Sudah Dilaporkan'] }
            }).toArray();
            checkedOjkReports = allOjkReports.length;

            for (const report of allOjkReports) {
                const dueDate = parseDate(report.DueDate);
                if (!dueDate) continue;

                // Check if the due date is within the next ojkDaysBeforeNotify days
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                if (daysUntilDue >= 0 && daysUntilDue <= ojkDaysBeforeNotify) {
                    ojkDueCount++;

                    // Determine recipients: per-report PIC > template PIC > default PIC list
                    const recipients: { name: string; email: string }[] = [];

                    if (report.PIC_Email) {
                        // Per-report PIC is set (support multiple emails separated by comma)
                        const emails = report.PIC_Email.split(',').map((e: string) => e.trim()).filter((e: string) => e);
                        for (const email of emails) {
                            recipients.push({ name: report.PIC_Name || 'PIC', email });
                        }
                    } else if (ojkTemplate.picEmail) {
                        // Fallback to Template PIC
                        recipients.push({ name: ojkTemplate.picName || 'PIC OJK', email: ojkTemplate.picEmail });
                    } else if (defaultOjkPics.length > 0) {
                        // Fallback to default PIC list
                        for (const pic of defaultOjkPics) {
                            recipients.push({ name: pic.name, email: pic.email });
                        }
                    } else {
                        logs.push(`  OJK "${report.Jenis_Laporan}" (${report.Bulan}): ⚠️ Tidak ada PIC — email tidak dikirim`);
                        continue;
                    }

                // Send email to each PIC
                for (const pic of recipients) {
                    const emailContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                                <h1 style="color: white; margin: 0;">📋 Pengingat Laporan OJK</h1>
                            </div>
                            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                                <p>Halo <strong>${pic.name}</strong>,</p>
                                <p style="color: #666; line-height: 1.6;">
                                    Berikut adalah pengingat bahwa terdapat laporan OJK yang akan jatuh tempo:
                                </p>
                                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                                    <tr style="background: #e8f4fd;">
                                        <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #d1e9f7;">Jenis Laporan</td>
                                        <td style="padding: 8px 12px; border: 1px solid #d1e9f7;">${report.Jenis_Laporan || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #eee;">Bulan</td>
                                        <td style="padding: 8px 12px; border: 1px solid #eee;">${report.Bulan || 'N/A'}</td>
                                    </tr>
                                    <tr style="background: #f9f9f9;">
                                        <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #eee;">Periode</td>
                                        <td style="padding: 8px 12px; border: 1px solid #eee;">${report.Periode || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #eee;">Batas Waktu</td>
                                        <td style="padding: 8px 12px; border: 1px solid #eee; color: ${daysUntilDue <= 3 ? '#dc2626' : '#ea580c'}; font-weight: bold;">
                                            ${dueDate.toLocaleDateString('id-ID')} (${daysUntilDue} hari lagi)
                                        </td>
                                    </tr>
                                    <tr style="background: #f9f9f9;">
                                        <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #eee;">Regulasi Acuan</td>
                                        <td style="padding: 8px 12px; border: 1px solid #eee;">${report.Regulasi_acuan || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #eee;">Cara Pengiriman</td>
                                        <td style="padding: 8px 12px; border: 1px solid #eee;">${report.Pengiriman || 'N/A'}</td>
                                    </tr>
                                </table>
                                <div style="background: ${daysUntilDue <= 3 ? '#fef2f2' : '#fff7ed'}; border-left: 4px solid ${daysUntilDue <= 3 ? '#dc2626' : '#ea580c'}; padding: 12px; margin: 15px 0; border-radius: 4px;">
                                    <strong style="color: ${daysUntilDue <= 3 ? '#dc2626' : '#ea580c'};">
                                        ${daysUntilDue <= 3 ? '⚠️ URGENT' : '⏰ Pengingat'}:
                                    </strong>
                                    <span style="color: #666;"> Laporan ini harus diserahkan dalam ${daysUntilDue} hari.</span>
                                </div>
                                <p style="color: #666;">Mohon segera siapkan dan kirimkan laporan sebelum batas waktu.</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="color: #999; font-size: 12px;">ISO Integrated System - Modul Pelaporan Regulasi</p>
                            </div>
                        </div>
                    `;

                    const result = await sendNotification({
                        templateId: 'ojk_compliance',
                        subject: `📋 Pengingat: Laporan OJK "${report.Jenis_Laporan}" Jatuh Tempo`,
                        recipientEmail: pic.email,
                        recipientName: pic.name,
                        data: {
                            reportType: report.Jenis_Laporan || 'N/A',
                            reportMonth: report.Bulan || 'N/A',
                            reportPeriod: report.Periode || 'N/A',
                            dueDate: dueDate.toLocaleDateString('id-ID'),
                            regulation: report.Regulasi_acuan || 'N/A',
                            daysLeft: daysUntilDue.toString(),
                        },
                        customContent: emailContent,
                    });
                    if (result.success) emailsSent++;
                    logs.push(`  OJK "${report.Jenis_Laporan}" (${report.Bulan}) → ${pic.name} <${pic.email}>: ${result.message}`);
                }
                }
            }
            logs.push(`[OJK] Checked ${checkedOjkReports} reports. Due within ${ojkTemplate.daysBeforeNotify || 7} days: ${ojkDueCount}`);
        } else {
            logs.push(`[OJK] Template Notifikasi tidak aktif, pengecekan dilewati.`);
        }

        return NextResponse.json({
            success: true,
            checkedAt: new Date().toISOString(),
            emailsSent,
            logs
        });

    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
