import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db-helper';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

const AUDITS_COLLECTION = 'audits';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { db } = await getTenantDb();
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID Audit tidak valid atau tidak ada' }, { status: 400 });
        }
        const audit = await db.collection(AUDITS_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!audit) {
            return NextResponse.json({ message: 'Audit tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json(audit, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data audit', error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { db } = await getTenantDb();
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID Audit tidak valid atau tidak ada' }, { status: 400 });
        }
        const data = await request.json();
        delete data._id;
        const result = await db.collection(AUDITS_COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        if (!result) {
            return NextResponse.json({ message: 'Audit tidak ditemukan untuk diperbarui' }, { status: 404 });
        }
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui audit', error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        console.log('[DELETE AUDIT] Attempting to delete audit:', id);

        // Check permissions - allow administrator role
        const { getCurrentUser } = await import('@/lib/auth');
        const user = await getCurrentUser();
        
        if (!user) {
            console.log('[DELETE AUDIT] No user session found');
            return NextResponse.json({ message: 'Unauthorized: Tidak ada sesi pengguna' }, { status: 401 });
        }
        
        const role = user.userRole.toLowerCase();
        console.log('[DELETE AUDIT] User role:', role, 'isSuperAdmin:', user.isSuperAdmin);
        
        // Allow superuser, superadmin, admin, administrator
        const allowedRoles = ['superuser', 'superadmin', 'admin', 'administrator'];
        if (!user.isSuperAdmin && !allowedRoles.includes(role)) {
            console.log('[DELETE AUDIT] Permission denied for role:', role);
            return NextResponse.json({ 
                message: 'Anda tidak memiliki izin untuk menghapus data. Hanya Administrator yang dapat menghapus.',
                error: 'UNAUTHORIZED_DELETE' 
            }, { status: 403 });
        }

        const { db } = await getTenantDb();
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'ID Audit tidak valid' }, { status: 400 });
        }
        
        // Menghapus audit
        const deleteResult = await db.collection(AUDITS_COLLECTION).deleteOne({ _id: new ObjectId(id) });
        console.log('[DELETE AUDIT] Delete result:', deleteResult);
        
        if (deleteResult.deletedCount === 0) {
            return NextResponse.json({ message: 'Audit tidak ditemukan' }, { status: 404 });
        }
        
        // Hapus juga temuan-temuan (findings) yang terkait dengan audit ini
        const findingsDelete = await db.collection('findings').deleteMany({ auditId: id });
        console.log('[DELETE AUDIT] Findings deleted:', findingsDelete.deletedCount);
        
        return NextResponse.json({ message: 'Audit dan temuan terkait berhasil dihapus' }, { status: 200 });
    } catch (error) {
        console.error('[DELETE AUDIT] Error:', error);
        return NextResponse.json({ message: 'Gagal menghapus audit', error: (error as Error).message }, { status: 500 });
    }
}