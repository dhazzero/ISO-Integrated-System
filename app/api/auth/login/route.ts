import { NextResponse } from 'next/server';
import { connectToTenantDatabase, getCompanyByCode, connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { User, SuperAdmin } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

// PENTING: Di aplikasi produksi, ini HARUS menjadi variabel lingkungan (environment variable)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-bytes-long');
const COOKIE_NAME = 'session';
const LOGS_COLLECTION = 'security_logs';
const SECURITY_SETTINGS_COLLECTION = 'security_settings';

export async function POST(request: Request) {
    try {
        const { companyCode, userId, password } = await request.json();

        if (!companyCode || !userId || !password) {
            return NextResponse.json({ message: 'Kode perusahaan, User ID dan password diperlukan' }, { status: 400 });
        }

        // Get client IP address
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';

        // Check if this is a super admin login (special case)
        if (companyCode.toUpperCase() === 'SUPERADMIN' || companyCode.toUpperCase() === 'MASTER') {
            return await handleSuperAdminLogin(userId, password, ipAddress);
        }

        // Validate company exists
        const company = await getCompanyByCode(companyCode);
        if (!company) {
            return NextResponse.json({ message: 'Kode perusahaan tidak ditemukan' }, { status: 404 });
        }

        if (company.status !== 'active') {
            return NextResponse.json({ message: 'Perusahaan tidak aktif. Hubungi administrator.' }, { status: 403 });
        }

        // Connect to tenant database
        const { db } = await connectToTenantDatabase(companyCode);

        // Get security settings for maxLoginAttempts
        const securitySettings = await db.collection(SECURITY_SETTINGS_COLLECTION).findOne({ settingsKey: 'main' });
        const maxLoginAttempts = securitySettings?.maxLoginAttempts || 5;

        const user = await db.collection<User>('users').findOne({ userId });

        if (!user) {
            return NextResponse.json({ message: 'User ID atau password salah.' }, { status: 401 });
        }

        // Check if user account is blocked/inactive
        if (user.status === 'inactive') {
            return NextResponse.json({
                message: 'Akun Anda telah diblokir. Silakan hubungi administrator untuk mengaktifkan kembali.'
            }, { status: 403 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password!);

        if (!isPasswordValid) {
            // Increment failed login attempts
            const currentAttempts = (user.failedLoginAttempts || 0) + 1;
            const isNowBlocked = currentAttempts >= maxLoginAttempts;

            // Update user with failed attempt count
            await db.collection('users').updateOne(
                { _id: user._id },
                {
                    $set: {
                        failedLoginAttempts: currentAttempts,
                        ...(isNowBlocked && {
                            status: 'inactive',
                            lockedAt: new Date()
                        })
                    }
                }
            );

            // Log failed login attempt
            await db.collection(LOGS_COLLECTION).insertOne({
                action: 'LOGIN_FAILED',
                module: 'Keamanan',
                description: `User ${user.name} (${user.userId}) gagal login - percobaan ke-${currentAttempts}`,
                details: {
                    userId: user.userId,
                    attemptNumber: currentAttempts,
                    maxAttempts: maxLoginAttempts,
                    blocked: isNowBlocked,
                    companyCode: company.code,
                },
                userId: user._id.toString(),
                userName: user.name,
                userRole: user.role,
                timestamp: new Date(),
                ip: ipAddress,
            });

            // If user is now blocked, log the blocking event
            if (isNowBlocked) {
                await db.collection(LOGS_COLLECTION).insertOne({
                    action: 'USER_BLOCKED',
                    module: 'Keamanan',
                    description: `Akun ${user.name} (${user.userId}) diblokir karena melebihi batas percobaan login (${maxLoginAttempts}x)`,
                    details: {
                        userId: user.userId,
                        reason: 'Exceeded max login attempts',
                        maxAttempts: maxLoginAttempts,
                        companyCode: company.code,
                    },
                    userId: user._id.toString(),
                    userName: user.name,
                    userRole: user.role,
                    timestamp: new Date(),
                    ip: ipAddress,
                });

                return NextResponse.json({
                    message: `Akun Anda telah diblokir karena ${maxLoginAttempts}x percobaan login gagal. Silakan hubungi administrator.`
                }, { status: 403 });
            }

            const remainingAttempts = maxLoginAttempts - currentAttempts;
            return NextResponse.json({
                message: `User ID atau password salah. Sisa percobaan: ${remainingAttempts}`
            }, { status: 401 });
        }

        // Password is valid - reset failed attempts and log successful login
        await db.collection(LOGS_COLLECTION).insertOne({
            action: 'LOGIN',
            module: 'Keamanan',
            description: `User ${user.name} (${user.userId}) berhasil login ke sistem`,
            details: {
                userId: user.userId,
                userRole: user.role,
                companyCode: company.code,
            },
            userId: user._id.toString(),
            userName: user.name,
            userRole: user.role,
            timestamp: new Date(),
            ip: ipAddress,
        });

        // Update lastLogin timestamp and reset failed attempts
        await db.collection('users').updateOne(
            { _id: user._id },
            {
                $set: {
                    lastLogin: new Date(),
                    failedLoginAttempts: 0,
                    lockedAt: null
                }
            }
        );

        // Buat JWT with company info
        const token = await new SignJWT({
            userId: user._id.toString(),
            role: user.role,
            username: user.userId,
            name: user.name,
            departmentId: user.departmentId?.toString() || null,
            // Multi-tenant info
            companyCode: company.code,
            companyId: company._id.toString(),
            companyName: company.name,
            databaseName: company.databaseName,
            isSuperAdmin: false,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('8h') // Token berlaku selama 8 jam
            .sign(JWT_SECRET);

        // Buat respons dan atur cookie menggunakan NextResponse.cookies
        const response = NextResponse.json({
            message: 'Login berhasil',
            user: {
                name: user.name,
                role: user.role,
                company: {
                    code: company.code,
                    name: company.name
                }
            }
        });

        // Set cookie using NextResponse cookies API (compatible with App Router)
        response.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 8, // 8 jam
            path: '/',
            sameSite: 'lax',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

// Handle super admin login
async function handleSuperAdminLogin(userId: string, password: string, ipAddress: string) {
    const { db } = await connectToMasterDatabase();

    const superAdmin = await db.collection<SuperAdmin>('super_admins').findOne({ userId });

    if (!superAdmin) {
        return NextResponse.json({ message: 'User ID atau password salah.' }, { status: 401 });
    }

    if (superAdmin.status !== 'active') {
        return NextResponse.json({ message: 'Akun tidak aktif.' }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, superAdmin.password);

    if (!isPasswordValid) {
        return NextResponse.json({ message: 'User ID atau password salah.' }, { status: 401 });
    }

    // Log super admin login
    await db.collection('super_admin_logs').insertOne({
        action: 'SUPERADMIN_LOGIN',
        description: `Super Admin ${superAdmin.name} logged in`,
        userId: superAdmin._id.toString(),
        userName: superAdmin.name,
        timestamp: new Date(),
        ip: ipAddress,
    });

    // Create JWT for super admin
    const token = await new SignJWT({
        userId: superAdmin._id.toString(),
        role: 'superadmin',
        username: superAdmin.userId,
        name: superAdmin.name,
        // Super admin can access all companies
        companyCode: 'ALL',
        companyId: 'MASTER',
        companyName: 'Master Admin',
        databaseName: 'iso_master',
        isSuperAdmin: true,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('4h')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-bytes-long'));

    const response = NextResponse.json({
        message: 'Login berhasil sebagai Super Admin',
        user: {
            name: superAdmin.name,
            role: 'superadmin',
            isSuperAdmin: true
        }
    });

    response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 4, // 4 jam
        path: '/',
        sameSite: 'lax',
    });

    return response;
}
