// lib/auth.ts - Authorization helper functions
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-bytes-long'
);

export interface CurrentUser {
    userId: string;
    userName: string;
    userRole: string;
    departmentId?: string;
    departmentName?: string;
    // Multi-tenant info
    companyCode: string;
    companyId: string;
    companyName: string;
    databaseName: string;
    isSuperAdmin: boolean;
}

// Role hierarchy for permission checks (lowercase to match database values)
// Include all role variations that may exist in database
const EDIT_ROLES = ['superuser', 'admin', 'administrator', 'manager', 'hse_manager', 'superadmin'];
const VIEW_AUDIT_ROLES = ['superuser', 'admin', 'administrator', 'manager', 'hse_manager', 'superadmin'];
const SETTINGS_ROLES = ['superuser', 'admin', 'administrator', 'superadmin'];
const DELETE_ROLES = ['superuser', 'superadmin'];

// Get current user from session
export async function getCurrentUser(): Promise<CurrentUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;

        if (!token) return null;

        const { payload } = await jwtVerify(token, JWT_SECRET);

        return {
            userId: payload.userId as string,
            userName: payload.name as string || payload.userId as string,
            userRole: payload.role as string || 'USER',
            departmentId: payload.departmentId as string | undefined,
            departmentName: payload.departmentName as string | undefined,
            // Multi-tenant info
            companyCode: payload.companyCode as string || 'UNKNOWN',
            companyId: payload.companyId as string || '',
            companyName: payload.companyName as string || '',
            databaseName: payload.databaseName as string || '',
            isSuperAdmin: payload.isSuperAdmin as boolean || false,
        };
    } catch (error) {
        console.error('Failed to get current user:', error);
        return null;
    }
}


// Check if user can delete (superuser, admin, administrator or by company config)
export async function canDelete(): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;

    // Super admins can always delete
    if (user.isSuperAdmin) return true;

    try {
        // Fetch company-specific permissions
        const { connectToMasterDatabase } = await import('@/lib/mongodb-tenant');
        const { db } = await connectToMasterDatabase();
        const companyPerms = await db.collection('company_permissions').findOne({
            companyCode: user.companyCode
        });

        // Default delete roles if no custom config
        const defaultDeleteRoles = ['superuser', 'admin', 'administrator'];
        const deleteRoles = companyPerms?.permissions?.canDelete || defaultDeleteRoles;
        const role = user.userRole.toLowerCase();

        return deleteRoles.includes(role);
    } catch (error) {
        console.error('Error checking delete permission:', error);
        // Fallback to hardcoded check
        return ['superuser', 'superadmin', 'admin', 'administrator'].includes(user.userRole.toLowerCase());
    }
}

// Check if user can edit (uses company-specific permission matrix)
export async function canEdit(documentDepartmentId?: string): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;

    // Super admins can always edit
    if (user.isSuperAdmin) return true;

    try {
        // Fetch company-specific permissions
        const { connectToMasterDatabase } = await import('@/lib/mongodb-tenant');
        const { db } = await connectToMasterDatabase();
        const companyPerms = await db.collection('company_permissions').findOne({
            companyCode: user.companyCode
        });

        // Default edit roles if no custom config
        const defaultEditRoles = ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'];
        const editRoles = companyPerms?.permissions?.canEdit || defaultEditRoles;
        const role = user.userRole.toLowerCase();

        // Check if user's role has edit permission
        if (!editRoles.includes(role)) {
            return false;
        }

        // MANAGER can only edit own department
        if (role === 'manager' && documentDepartmentId) {
            return user.departmentId === documentDepartmentId;
        }

        return true;
    } catch (error) {
        console.error('Error checking edit permission:', error);
        // Fallback to hardcoded check
        if (user.userRole === 'superuser' || user.userRole === 'admin') {
            return true;
        }
        if (user.userRole === 'manager') {
            if (!documentDepartmentId) return true;
            return user.departmentId === documentDepartmentId;
        }
        return false;
    }
}

// Check if user can view Audit tab (STAFF cannot)
export async function canViewAudit(): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;
    return VIEW_AUDIT_ROLES.includes(user.userRole);
}

// Check if user can access Settings (SUPERUSER, ADMIN only)
export async function canAccessSettings(): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;
    return SETTINGS_ROLES.includes(user.userRole);
}

// Check if user has specific role
export async function hasRole(roles: string[]): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;
    return roles.includes(user.userRole);
}

// Authorization error responses
export function unauthorizedDeleteResponse() {
    return {
        message: 'Hanya SUPERUSER yang dapat menghapus data',
        error: 'UNAUTHORIZED_DELETE',
    };
}

export function unauthorizedEditResponse() {
    return {
        message: 'Anda tidak memiliki akses untuk mengedit data ini',
        error: 'UNAUTHORIZED_EDIT',
    };
}

export function departmentMismatchResponse() {
    return {
        message: 'Manager hanya dapat mengedit dokumen dalam departemennya sendiri',
        error: 'DEPARTMENT_MISMATCH',
    };
}
