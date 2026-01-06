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
}

// Role hierarchy for permission checks (lowercase to match database values)
// Include all role variations that may exist in database
const EDIT_ROLES = ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'];
const VIEW_AUDIT_ROLES = ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'];
const SETTINGS_ROLES = ['superuser', 'admin', 'administrator'];
const DELETE_ROLES = ['superuser'];

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
        };
    } catch (error) {
        console.error('Failed to get current user:', error);
        return null;
    }
}

// Check if user can delete (SUPERUSER only)
export async function canDelete(): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;
    return DELETE_ROLES.includes(user.userRole);
}

// Check if user can edit (SUPERUSER, ADMIN, MANAGER)
// For MANAGER, can optionally check department match
export async function canEdit(documentDepartmentId?: string): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;

    // SUPERUSER and ADMIN can edit anything
    if (user.userRole === 'superuser' || user.userRole === 'admin') {
        return true;
    }

    // MANAGER can only edit own department
    if (user.userRole === 'manager') {
        // If no department specified, allow (general edit permission)
        if (!documentDepartmentId) return true;
        // Check department match
        return user.departmentId === documentDepartmentId;
    }

    // STAFF and USER cannot edit
    return false;
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
