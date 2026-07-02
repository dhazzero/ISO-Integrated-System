// app/api/admin/companies/[id]/permissions/route.ts - Company permissions and roles API
import { NextRequest, NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { getCurrentUser } from '@/lib/auth';

// Default permission matrix
export const DEFAULT_PERMISSIONS = {
    canView: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager', 'staff', 'user'],
    canEdit: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'],
    canDelete: ['superuser', 'admin', 'administrator'],
    canUpload: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'],
    canViewAudit: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'],
    canAccessSettings: ['superuser', 'admin', 'administrator'],
};

// Default available roles
export const DEFAULT_ROLES = [
    { id: 'superuser', name: 'Super User', description: 'Full access to all features' },
    { id: 'admin', name: 'Admin', description: 'Administrative access' },
    { id: 'administrator', name: 'Administrator', description: 'Administrative access' },
    { id: 'manager', name: 'Manager', description: 'Department manager' },
    { id: 'hse_manager', name: 'HSE Manager', description: 'Health Safety Environment manager' },
    { id: 'staff', name: 'Staff', description: 'Regular staff member' },
    { id: 'user', name: 'User', description: 'Basic user access' },
];

// GET - Get permissions and roles for a company
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.isSuperAdmin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const { db } = await connectToMasterDatabase();

        // Get company to find company code
        const { ObjectId } = await import('mongodb');
        const company = await db.collection('companies').findOne({ _id: new ObjectId(id) });

        if (!company) {
            return NextResponse.json({ message: 'Company not found' }, { status: 404 });
        }

        // Get permissions for this company
        const companyConfig = await db.collection('company_permissions').findOne({
            companyCode: company.code
        });

        return NextResponse.json({
            permissions: companyConfig?.permissions || DEFAULT_PERMISSIONS,
            roles: companyConfig?.roles || DEFAULT_ROLES,
            companyCode: company.code,
            hasCustomConfig: !!companyConfig,
        });
    } catch (error) {
        console.error('Failed to fetch permissions:', error);
        return NextResponse.json({ message: 'Failed to fetch permissions' }, { status: 500 });
    }
}

// PUT - Update permissions and/or roles for a company
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.isSuperAdmin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { permissions, roles } = body;
        const { db } = await connectToMasterDatabase();

        // Get company to find company code
        const { ObjectId } = await import('mongodb');
        const company = await db.collection('companies').findOne({ _id: new ObjectId(id) });

        if (!company) {
            return NextResponse.json({ message: 'Company not found' }, { status: 404 });
        }

        // Build update object
        const updateData: any = {
            companyCode: company.code,
            companyName: company.name,
            updatedAt: new Date(),
            updatedBy: user.userId,
        };

        if (permissions) updateData.permissions = permissions;
        if (roles) updateData.roles = roles;

        // Upsert config
        await db.collection('company_permissions').updateOne(
            { companyCode: company.code },
            { $set: updateData },
            { upsert: true }
        );

        // Log the action
        await db.collection('super_admin_logs').insertOne({
            action: 'UPDATE_COMPANY_CONFIG',
            description: `Updated permissions/roles for ${company.name} (${company.code})`,
            userId: user.userId,
            userName: user.userName,
            timestamp: new Date(),
            details: { companyCode: company.code, hasPermissions: !!permissions, hasRoles: !!roles }
        });

        return NextResponse.json({ message: 'Configuration updated successfully' });
    } catch (error) {
        console.error('Failed to update config:', error);
        return NextResponse.json({ message: 'Failed to update configuration' }, { status: 500 });
    }
}

// POST - Reset to default permissions and roles
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.isSuperAdmin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const { db } = await connectToMasterDatabase();

        // Get company to find company code
        const { ObjectId } = await import('mongodb');
        const company = await db.collection('companies').findOne({ _id: new ObjectId(id) });

        if (!company) {
            return NextResponse.json({ message: 'Company not found' }, { status: 404 });
        }

        // Delete custom config (will use defaults)
        await db.collection('company_permissions').deleteOne({ companyCode: company.code });

        return NextResponse.json({
            message: 'Configuration reset to defaults',
            permissions: DEFAULT_PERMISSIONS,
            roles: DEFAULT_ROLES
        });
    } catch (error) {
        console.error('Failed to reset config:', error);
        return NextResponse.json({ message: 'Failed to reset configuration' }, { status: 500 });
    }
}
