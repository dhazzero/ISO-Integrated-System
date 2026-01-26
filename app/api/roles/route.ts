// app/api/roles/route.ts - Get available roles for current company
import { NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { getCurrentUser } from '@/lib/auth';

// Default roles if no custom config exists
const DEFAULT_ROLES = [
    { id: 'superuser', name: 'Superuser', description: 'Full access to all features' },
    { id: 'administrator', name: 'Administrator', description: 'Administrative access' },
    { id: 'manager', name: 'Manager', description: 'Department manager' },
    { id: 'staff', name: 'Staff', description: 'Regular staff member' },
    { id: 'auditor', name: 'Auditor', description: 'Audit access only' },
];

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Super admin doesn't have company-specific roles
        if (user.isSuperAdmin) {
            return NextResponse.json({ roles: DEFAULT_ROLES });
        }

        // Get company-specific roles from master database
        const { db } = await connectToMasterDatabase();
        const companyConfig = await db.collection('company_permissions').findOne({
            companyCode: user.companyCode
        });

        // Return custom roles or defaults
        const roles = companyConfig?.roles || DEFAULT_ROLES;

        return NextResponse.json({ roles });
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        // Fallback to default roles on error
        return NextResponse.json({ roles: DEFAULT_ROLES });
    }
}
