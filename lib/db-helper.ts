// lib/db-helper.ts - Helper to get tenant database connection for current user
import { connectToTenantDatabase } from '@/lib/mongodb-tenant';
import { getCurrentUser } from '@/lib/auth';
import { Db } from 'mongodb';

/**
 * Get database connection for the current user's company.
 * This should be used in all tenant-specific API routes.
 * 
 * Throws error if user is not authenticated.
 */
export async function getTenantDb(): Promise<{ db: Db; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> }> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized: No user session found');
    }

    if (!user.companyCode) {
        throw new Error('Unauthorized: No company code in session');
    }

    const { db } = await connectToTenantDatabase(user.companyCode);

    return { db, user };
}

/**
 * Wrapper for API routes that require tenant database access.
 * Handles error responses for authentication failures.
 */
export async function withTenantDb<T>(
    handler: (db: Db, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<T>
): Promise<T> {
    const { db, user } = await getTenantDb();
    return handler(db, user);
}
