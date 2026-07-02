import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getTenantDb } from '@/lib/db-helper';
import { logActivity } from '@/lib/logger';

// GET /api/issues - List all issues with filtering
export async function GET(request: NextRequest) {
    try {
        const { db, user } = await getTenantDb();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // Internal or External
        const status = searchParams.get('status');
        const severity = searchParams.get('severity');
        const departmentId = searchParams.get('departmentId');

        const issuesCollection = db.collection('issues');

        // Build filter
        const filter: any = {};
        if (type) filter.issueType = type;
        if (status) filter.status = status;
        if (severity) filter.severity = severity;
        if (departmentId) filter.departmentId = new ObjectId(departmentId);

        // Role-based filtering: Staff can only see their department's issues
        if (user.userRole === 'staff' && user.departmentId) {
            filter.departmentId = new ObjectId(user.departmentId);
        }

        const issues = await issuesCollection
            .find(filter)
            .sort({ identifiedDate: -1 })
            .toArray();

        return NextResponse.json(issues);
    } catch (error) {
        console.error('Error fetching issues:', error);
        return NextResponse.json(
            { message: 'Failed to fetch issues' },
            { status: 500 }
        );
    }
}

// POST /api/issues - Create new issue
export async function POST(request: NextRequest) {
    try {
        const { db, user } = await getTenantDb();
        const body = await request.json();

        // Validate required fields
        if (!body.issueType || !body.title || !body.description || !body.category) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const issuesCollection = db.collection('issues');

        // Get department name if departmentId is provided
        let departmentName = null;
        if (body.departmentId) {
            const departmentsCollection = db.collection('departments');
            const dept = await departmentsCollection.findOne({
                _id: new ObjectId(body.departmentId)
            });
            departmentName = dept?.name || null;
        }

        const newIssue = {
            issueType: body.issueType,
            category: body.category,
            title: body.title,
            description: body.description,
            source: body.source || 'Department Input',
            departmentId: body.departmentId ? new ObjectId(body.departmentId) : null,
            departmentName,
            identifiedBy: user.userName || 'Unknown',
            identifiedDate: body.identifiedDate ? new Date(body.identifiedDate) : new Date(),

            // Assessment
            severity: body.severity || 'Medium',
            likelihood: body.likelihood || 'Possible',
            impact: body.impact || '',
            affectedAreas: body.affectedAreas || [],

            // Status
            status: 'New',
            assignedTo: body.assignedTo || null,
            dueDate: body.dueDate ? new Date(body.dueDate) : null,

            // Integration
            relatedStandards: body.relatedStandards || [],
            relatedRiskId: null,
            relatedComplianceIds: [],

            // Resolution
            actionTaken: null,
            resolution: null,
            closedDate: null,

            // Metadata
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await issuesCollection.insertOne(newIssue);

        // Log activity
        await logActivity('CREATE', 'Issues', `Created issue: ${body.title}`, { issueId: result.insertedId.toString() });

        return NextResponse.json(
            { message: 'Issue created successfully', id: result.insertedId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating issue:', error);
        return NextResponse.json(
            { message: 'Failed to create issue' },
            { status: 500 }
        );
    }
}
