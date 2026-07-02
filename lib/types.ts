import { ObjectId } from 'mongodb';

// Enum untuk Role Pengguna untuk konsistensi
// Hierarchy: SUPERUSER > ADMINISTRATOR > MANAGER > STAFF/AUDITOR
export enum UserRole {
    SUPERUSER = 'superuser',
    ADMINISTRATOR = 'administrator',
    MANAGER = 'manager',
    STAFF = 'staff',
    AUDITOR = 'auditor',
}

export interface User {
    _id: ObjectId;
    userId: string; // ID untuk login, harus unik
    name: string;
    email: string;
    password?: string; // Password harus di-hash, tidak pernah dikirim ke client
    role: UserRole;
    departmentId: ObjectId | null; // Referensi ke Department
    supervisorId: ObjectId | null; // Referensi ke atasan (User lain)
    status: 'active' | 'inactive' | 'pending';
    lastLogin: Date | null;
    failedLoginAttempts: number; // Track failed login attempts
    lockedAt: Date | null; // Timestamp when account was locked due to failed attempts
    createdAt: Date;
    updatedAt: Date;
}

export interface Department {
    _id: ObjectId;
    name: string;
    head: string; // Untuk saat ini string, bisa diubah ke ObjectId User nanti
    createdAt: Date;
    updatedAt: Date;
}

// Interface dari file settings, dipindahkan ke sini untuk sentralisasi
export interface Approver {
    _id: string; // Bisa ObjectId jika dari MongoDB
    title: string;
    name: string;
}

export interface Standard {
    _id: string; // Bisa ObjectId jika dari MongoDB
    name: string;
    title: string;
    description: string;
    category: string;
    status: string;
}

export interface SecurityLog {
    _id: string;
    timestamp: string | Date;
    action: string;
    module: string;
    description: string;
    userId?: string | null;
    userName: string;
    userRole?: string | null;
    ip: string;
    details?: Record<string, unknown> | null;
}

// ============ Multi-Tenant Types ============

export interface Company {
    _id: ObjectId;
    code: string;           // Unique code for login, e.g., "PBB", "ACME"
    name: string;           // Full company name
    logo?: string;          // URL to company logo
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxId?: string;         // NPWP
    businessLicense?: string; // NIB
    status: 'active' | 'inactive' | 'suspended';
    databaseName: string;   // Database name for this company, e.g., "iso_pbb", "iso_acme"
    subscription?: {
        plan: 'basic' | 'professional' | 'enterprise';
        expiresAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Super Admin - stored in master database
export interface SuperAdmin {
    _id: ObjectId;
    userId: string;
    name: string;
    email: string;
    password: string;       // hashed
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

// Tenant context for current request
export interface TenantContext {
    companyCode: string;
    companyId: string;
    companyName: string;
    databaseName: string;
}

// ============ Issue Management Types ============

export interface Issue {
    _id: ObjectId;
    issueType: 'Internal' | 'External';
    category: string; // e.g., "Strategic", "Operational", "Compliance", "Technology"
    title: string;
    description: string;
    source: string; // e.g., "Department Input", "Audit Finding", "External Report"
    departmentId: ObjectId | null;
    departmentName?: string; // Denormalized for easier display
    identifiedBy: string; // User name
    identifiedDate: Date;

    // Assessment fields
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    likelihood: 'Very Likely' | 'Likely' | 'Possible' | 'Unlikely';
    impact: string;
    affectedAreas: string[]; // e.g., ["Information Security", "Operations"]

    // Status tracking
    status: 'New' | 'Under Review' | 'Converted to Risk' | 'Resolved' | 'Closed';
    assignedTo: string | null;
    dueDate: Date | null;

    // Integration links
    relatedStandards: string[]; // Link to compliance standards
    relatedRiskId: ObjectId | null; // If converted to risk
    relatedComplianceIds: ObjectId[]; // Related compliance controls

    // Resolution
    actionTaken: string | null;
    resolution: string | null;
    closedDate: Date | null;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

// ============ Notification Types ============

export enum NotificationType {
    AUDIT_SCHEDULED = 'AUDIT_SCHEDULED',
    CAPA_ASSIGNED = 'CAPA_ASSIGNED',
    CAPA_DUE_DATE = 'CAPA_DUE_DATE',
    RISK_HIGH = 'RISK_HIGH',
    DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
    TRAINING_REMINDER = 'TRAINING_REMINDER',
    FINDING_CREATED = 'FINDING_CREATED',
    ISSUE_CREATED = 'ISSUE_CREATED',
}

export interface NotificationSetting {
    _id?: ObjectId;
    notificationType: NotificationType;
    recipientUserIds: ObjectId[];
    recipients?: User[]; // Populated field, not stored in DB
    createdAt?: Date;
    updatedAt?: Date;
}

// ============ User Access Review Types ============

export interface UserAccessReview {
    _id: ObjectId;
    systemId: ObjectId;          // Referensi ke user_access_systems
    systemName: string;          // Nama sistem (denormalized)
    employeeName: string;        // Nama karyawan
    accountName: string;         // Nama akun di sistem
    role: string;                // Role di sistem tersebut
    accountStatus: 'Active' | 'Inactive'; // Status akun
    dateOfDataEntry: Date;       // Tanggal input data
    department: string;          // Nama departemen
    departmentId: ObjectId | null; // Referensi ke departemen
    enteredBy: string;           // User ID yang menginput
    enteredByName: string;       // Nama user yang menginput

    // Fields diisi oleh Admin Pengelola User
    verificationStatus: 'Pending' | 'Verified' | 'Rejected';
    verificationFromLog: string | null;  // Status verifikasi dari log
    dateOfVerification: Date | null;     // Tanggal verifikasi
    verifiedBy: string | null;          // User ID admin yang memverifikasi
    verifiedByName: string | null;      // Nama admin yang memverifikasi
    inactiveDate: Date | null;          // Tanggal nonaktif akun

    createdAt: Date;
    updatedAt: Date;
}

export interface UserAccessReviewHistory {
    _id: ObjectId;
    reviewId: ObjectId;          // Referensi ke user_access_reviews
    action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'VERIFIED' | 'DEACTIVATED' | 'REACTIVATED';
    changes: Record<string, { oldValue: unknown; newValue: unknown }>;
    performedBy: string;         // User ID
    performedByName: string;     // Nama user
    performedAt: Date;           // Timestamp
    notes: string | null;        // Catatan opsional
}

export interface UserAccessSystem {
    _id: ObjectId;
    name: string;                // Nama sistem
    description: string;         // Deskripsi
    isActive: boolean;           // Status aktif
    createdAt: Date;
    updatedAt: Date;
}
