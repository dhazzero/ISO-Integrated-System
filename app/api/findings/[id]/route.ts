import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

const FINDINGS_COLLECTION = 'findings';
const AUDITS_COLLECTION = 'audits';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { db } = await getTenantDb();
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID Finding tidak valid atau tidak ada' }, { status: 400 });
        }
        const finding = await db.collection(FINDINGS_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!finding) {
            return NextResponse.json({ message: 'Finding tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json(finding, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data finding', error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { db } = await getTenantDb();
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID Finding tidak valid' }, { status: 400 });
        }
        const data = await request.json();
        delete data._id;

        const updateResult = await db.collection(FINDINGS_COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!updateResult) {
            return NextResponse.json({ message: 'Finding tidak ditemukan untuk diperbarui' }, { status: 404 });
        }

        // Logika otomatisasi penyelesaian audit
        if (updateResult.status === 'Closed' && updateResult.auditId) {
            const openFindingsCount = await db.collection(FINDINGS_COLLECTION).countDocuments({
                auditId: updateResult.auditId,
                status: { $in: ['Open', 'In Progress'] }
            });

            if (openFindingsCount === 0) {
                await db.collection(AUDITS_COLLECTION).updateOne(
                    { _id: new ObjectId(updateResult.auditId) },
                    { $set: { status: 'Completed', completedDate: new Date().toISOString() } }
                );
            }
        }

        return NextResponse.json(updateResult, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui finding', error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        console.log('[DELETE FINDING] Attempting to delete finding:', id);

        // Check permissions - allow administrator role
        const { getCurrentUser } = await import('@/lib/auth');
        const user = await getCurrentUser();
        
        if (!user) {
            console.log('[DELETE FINDING] No user session found');
            return NextResponse.json({ message: 'Unauthorized: Tidak ada sesi pengguna' }, { status: 401 });
        }
        
        const role = user.userRole.toLowerCase();
        console.log('[DELETE FINDING] User role:', role, 'isSuperAdmin:', user.isSuperAdmin);
        
        // Allow superuser, superadmin, admin, administrator
        const allowedRoles = ['superuser', 'superadmin', 'admin', 'administrator'];
        if (!user.isSuperAdmin && !allowedRoles.includes(role)) {
            console.log('[DELETE FINDING] Permission denied for role:', role);
            return NextResponse.json({ 
                message: 'Anda tidak memiliki izin untuk menghapus data. Hanya Administrator yang dapat menghapus.',
                error: 'UNAUTHORIZED_DELETE' 
            }, { status: 403 });
        }

        const { db } = await getTenantDb();
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID Finding tidak valid' }, { status: 400 });
        }
        
        const deleteResult = await db.collection(FINDINGS_COLLECTION).deleteOne({ _id: new ObjectId(id) });
        console.log('[DELETE FINDING] Delete result:', deleteResult);
        
        if (deleteResult.deletedCount === 0) {
            return NextResponse.json({ message: 'Finding tidak ditemukan' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Finding berhasil dihapus' }, { status: 200 });
    } catch (error) {
        console.error('[DELETE FINDING] Error:', error);
        return NextResponse.json({ message: 'Gagal menghapus finding', error: (error as Error).message }, { status: 500 });
    }
}