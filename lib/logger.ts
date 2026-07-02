// lib/logger.ts
// Enhanced activity logging function for security audit trail

interface LogDetails {
    entityId?: string;
    entityName?: string;
    changes?: Record<string, unknown>;
    [key: string]: unknown;
}

export const logActivity = async (
    action: string,
    module: string,
    description: string,
    details?: LogDetails
) => {
    try {
        await fetch('/api/logs/security', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action,
                module,
                description,
                details: details || null,
            }),
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};

// Predefined action types for consistency
export const LogAction = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    VIEW: 'VIEW',
    EXPORT: 'EXPORT',
    IMPORT: 'IMPORT',
    PAGE_VIEW: 'PAGE_VIEW',
    NAVIGATION: 'NAVIGATION',
} as const;

// Predefined module types for consistency
export const LogModule = {
    USER: 'Pengguna',
    DEPARTMENT: 'Departemen',
    APPROVER: 'Approval',
    STANDARD: 'Standar ISO',
    SETTINGS: 'Pengaturan',
    SYSTEM: 'Sistem',
    SECURITY: 'Keamanan',
    ORGANIZATION: 'Organisasi',
    DOCUMENT: 'Dokumen',
    AUDIT: 'Audit',
    CAPA: 'CAPA',
    RISK: 'Risiko',
    NAVIGATION: 'Navigasi',
} as const;

// Helper function to log page views
export const logPageView = async (
    pagePath: string,
    pageLabel: string,
    details?: LogDetails
) => {
    return logActivity(
        LogAction.PAGE_VIEW,
        LogModule.NAVIGATION,
        `Mengunjungi halaman: ${pageLabel} (${pagePath})`,
        { pagePath, pageLabel, ...details }
    );
};
