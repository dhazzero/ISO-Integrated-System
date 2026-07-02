// lib/server-logger.ts
// Server-side activity logging function for API routes

import { getTenantDb } from '@/lib/db-helper';

const LOGS_COLLECTION = 'security_logs';

interface LogDetails {
    entityId?: string;
    entityName?: string;
    changes?: Record<string, unknown>;
    before?: unknown;
    after?: unknown;
    [key: string]: unknown;
}

/**
 * Server-side activity logger for API routes
 * This is used in server components and API routes where fetch() to internal API is not ideal
 * Now uses tenant database for multi-tenant support
 */
export async function logActivityServer(
    action: string,
    module: string,
    description: string,
    details?: LogDetails,
    ipAddress?: string
) {
    try {
        const { db, user } = await getTenantDb();

        const newLog = {
            action,
            module,
            description,
            details: details || null,
            userId: user?.userId || null,
            userName: user?.userName || 'System',
            userRole: user?.userRole || null,
            timestamp: new Date(),
            ip: ipAddress || '127.0.0.1',
        };

        await db.collection(LOGS_COLLECTION).insertOne(newLog);
        return true;
    } catch (error) {
        console.error("Failed to log activity (server):", error);
        return false;
    }
}

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
    TRAINING: 'Pelatihan',
} as const;
