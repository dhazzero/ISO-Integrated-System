import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getTenantDb } from '@/lib/db-helper';
import { logActivity } from '@/lib/logger';

// GET /api/issues/:id - Get single issue detail
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { db, user } = await getTenantDb();
        const issuesCollection = db.collection('issues');

        const issue = await issuesCollection.findOne({
            _id: new ObjectId(params.id)
        });

        if (!issue) {
            return NextResponse.json(
                { message: 'Issue not found' },
                { status: 404 }
            );
        }

        // Check access: Staff can only see their department's issues
        if (user.userRole === 'staff' && user.departmentId) {
            if (issue.departmentId?.toString() !== user.departmentId) {
                return NextResponse.json(
                    { message: 'Forbidden' },
                    { status: 403 }
                );
            }
        }

        return NextResponse.json(issue);
    } catch (error) {
        console.error('Error fetching issue:', error);
        return NextResponse.json(
            { message: 'Failed to fetch issue' },
            { status: 500 }
        );
    }
}

// PUT /api/issues/:id - Update issue
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { db, user } = await getTenantDb();
        const body = await request.json();
        const issuesCollection = db.collection('issues');

        // Check if issue exists
        const existingIssue = await issuesCollection.findOne({
            _id: new ObjectId(params.id)
        });

        if (!existingIssue) {
            return NextResponse.json(
                { message: 'Issue not found' },
                { status: 404 }
            );
        }

        // Check access
        if (user.userRole === 'staff' && user.departmentId) {
            if (existingIssue.departmentId?.toString() !== user.departmentId) {
                return NextResponse.json(
                    { message: 'Forbidden' },
                    { status: 403 }
                );
            }
        }

        // Get department name if departmentId changed
        let departmentName = existingIssue.departmentName;
        if (body.departmentId && body.departmentId !== existingIssue.departmentId?.toString()) {
            const departmentsCollection = db.collection('departments');
            const dept = await departmentsCollection.findOne({
                _id: new ObjectId(body.departmentId)
            });
            departmentName = dept?.name || null;
        }

        // Build update object
        const updateData: any = {
            updatedAt: new Date(),
        };

        // Only update fields that are provided
        if (body.issueType) updateData.issueType = body.issueType;
        if (body.category) updateData.category = body.category;
        if (body.title) updateData.title = body.title;
        if (body.description) updateData.description = body.description;
        if (body.source) updateData.source = body.source;
        if (body.departmentId) {
            updateData.departmentId = new ObjectId(body.departmentId);
            updateData.departmentName = departmentName;
        }
        if (body.severity) updateData.severity = body.severity;
        if (body.likelihood) updateData.likelihood = body.likelihood;
        if (body.impact !== undefined) updateData.impact = body.impact;
        if (body.affectedAreas) updateData.affectedAreas = body.affectedAreas;
        if (body.status) updateData.status = body.status;
        if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
        if (body.dueDate !== undefined) {
            updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
        }
        if (body.relatedStandards) updateData.relatedStandards = body.relatedStandards;
        if (body.actionTaken !== undefined) updateData.actionTaken = body.actionTaken;
        if (body.resolution !== undefined) updateData.resolution = body.resolution;

        // If status is Closed or Resolved, set closedDate
        if (body.status === 'Closed' || body.status === 'Resolved') {
            updateData.closedDate = new Date();
        }

        await issuesCollection.updateOne(
            { _id: new ObjectId(params.id) },
            { $set: updateData }
        );

        // Log activity
        await logActivity('UPDATE', 'Issues', `Updated issue: ${body.title || existingIssue.title}`, { issueId: params.id });

        return NextResponse.json({ message: 'Issue updated successfully' });
    } catch (error) {
        console.error('Error updating issue:', error);
        return NextResponse.json(
            { message: 'Failed to update issue' },
            { status: 500 }
        );
    }
}

// DELETE /api/issues/:id - Delete issue
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { db, user } = await getTenantDb();

        // Only admin and manager can delete
        if (user.userRole !== 'administrator' && user.userRole !== 'manager' && user.userRole !== 'admin') {
            return NextResponse.json(
                { message: 'Only administrators and managers can delete issues' },
                { status: 403 }
            );
        }

        const issuesCollection = db.collection('issues');

        const issue = await issuesCollection.findOne({
            _id: new ObjectId(params.id)
        });

        if (!issue) {
            return NextResponse.json(
                { message: 'Issue not found' },
                { status: 404 }
            );
        }

        await issuesCollection.deleteOne({
            _id: new ObjectId(params.id)
        });

        // Log activity
        await logActivity('DELETE', 'Issues', `Deleted issue: ${issue.title}`, { issueId: params.id });

        return NextResponse.json({ message: 'Issue deleted successfully' });
    } catch (error) {
        console.error('Error deleting issue:', error);
        return NextResponse.json(
            { message: 'Failed to delete issue' },
            { status: 500 }
        );
    }
}
