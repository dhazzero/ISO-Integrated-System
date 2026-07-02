import { NextResponse, NextRequest } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { getCurrentUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// Debug endpoint to test delete functionality
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { auditId, action } = body;
        
        // Get user info
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ 
                error: 'No user session',
                step: 'auth'
            }, { status: 401 });
        }
        
        const result: Record<string, unknown> = {
            step: 'auth_ok',
            userId: user.userId,
            userName: user.userName,
            userRole: user.userRole,
            isSuperAdmin: user.isSuperAdmin,
            companyCode: user.companyCode,
        };
        
        if (action === 'check-role') {
            const role = user.userRole.toLowerCase();
            const allowedRoles = ['superuser', 'superadmin', 'admin', 'administrator'];
            result.roleCheck = {
                role,
                allowed: allowedRoles.includes(role),
                allowedRoles,
            };
            return NextResponse.json(result, { status: 200 });
        }
        
        if (action === 'test-delete' && auditId) {
            if (!ObjectId.isValid(auditId)) {
                result.error = 'Invalid ObjectId';
                return NextResponse.json(result, { status: 400 });
            }
            
            const { db } = await getTenantDb();
            
            // First check if audit exists
            const audit = await db.collection('audits').findOne({ _id: new ObjectId(auditId) });
            result.auditFound = !!audit;
            result.auditName = audit?.name;
            
            if (!audit) {
                result.error = 'Audit not found in database';
                return NextResponse.json(result, { status: 404 });
            }
            
            // Actually delete
            const deleteResult = await db.collection('audits').deleteOne({ _id: new ObjectId(auditId) });
            result.deleteResult = {
                acknowledged: deleteResult.acknowledged,
                deletedCount: deleteResult.deletedCount,
            };
            
            // Delete related findings
            const findingsResult = await db.collection('findings').deleteMany({ auditId: auditId });
            result.findingsDeleteResult = {
                acknowledged: findingsResult.acknowledged,
                deletedCount: findingsResult.deletedCount,
            };
            
            return NextResponse.json(result, { status: 200 });
        }
        
        return NextResponse.json({ error: 'Invalid action. Use "check-role" or "test-delete"' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ 
            error: (error as Error).message,
            stack: (error as Error).stack?.split('\n').slice(0, 5),
        }, { status: 500 });
    }
}
