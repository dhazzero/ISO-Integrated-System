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
