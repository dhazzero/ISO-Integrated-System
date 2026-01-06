// lib/server-logger.ts
// Server-side activity logging function for API routes

import { connectToDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';

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
 */
export async function logActivityServer(
    action: string,
    module: string,
    description: string,
    details?: LogDetails,
    ipAddress?: string
) {
    try {
        const { db } = await connectToDatabase();
        const currentUser = await getCurrentUser();

        const newLog = {
            action,
            module,
            description,
            details: details || null,
            userId: currentUser?.userId || null,
            userName: currentUser?.userName || 'System',
            userRole: currentUser?.userRole || null,
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
