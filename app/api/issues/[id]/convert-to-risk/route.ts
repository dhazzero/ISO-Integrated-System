import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getTenantDb } from '@/lib/db-helper';
import { logActivity } from '@/lib/logger';

// POST /api/issues/:id/convert-to-risk - Convert issue to risk
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { db, user } = await getTenantDb();

        // Only admin and manager can convert to risk
        if (user.userRole !== 'administrator' && user.userRole !== 'manager' && user.userRole !== 'admin') {
            return NextResponse.json(
                { message: 'Only administrators and managers can convert issues to risks' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const issuesCollection = db.collection('issues');
        const risksCollection = db.collection('risks');

        // Get the issue
        const issue = await issuesCollection.findOne({
            _id: new ObjectId(params.id)
        });

        if (!issue) {
            return NextResponse.json(
                { message: 'Issue not found' },
                { status: 404 }
            );
        }

        // Check if already converted
        if (issue.status === 'Converted to Risk' && issue.relatedRiskId) {
            return NextResponse.json(
                { message: 'This issue has already been converted to a risk', riskId: issue.relatedRiskId },
                { status: 400 }
            );
        }

        // Calculate risk level from severity and likelihood
        const calculateRiskLevel = (severity: string, likelihood: string): string => {
            const severityScore = {
                'Critical': 4,
                'High': 3,
                'Medium': 2,
                'Low': 1
            }[severity] || 2;

            const likelihoodScore = {
                'Very Likely': 4,
                'Likely': 3,
                'Possible': 2,
                'Unlikely': 1
            }[likelihood] || 2;

            const totalScore = severityScore * likelihoodScore;

            if (totalScore >= 12) return 'Sangat Tinggi';
            if (totalScore >= 8) return 'Tinggi';
            if (totalScore >= 4) return 'Sedang';
            return 'Rendah';
        };

        // Create new risk from issue data
        const newRisk = {
            name: body.name || issue.title,
            category: body.category || issue.category,
            level: body.level || calculateRiskLevel(issue.severity, issue.likelihood),
            likelihood: body.likelihood || issue.likelihood,
            impact: body.impact || issue.impact || issue.description,
            status: body.status || 'Open',
            trend: body.trend || 'stable',
            relatedStandards: body.relatedStandards || issue.relatedStandards || [],
            description: body.description || `Converted from issue: ${issue.title}. ${issue.description}`,
            mitigation: body.mitigation || null,
            riskOwner: body.owner || issue.assignedTo || user.userName,
            sourceIssueId: new ObjectId(params.id),
            createdAt: new Date(),
            updatedAt: new Date(),
            deleted: false,
        };

        const riskResult = await risksCollection.insertOne(newRisk);

        // Update issue status and link to risk
        await issuesCollection.updateOne(
            { _id: new ObjectId(params.id) },
            {
                $set: {
                    status: 'Converted to Risk',
                    relatedRiskId: riskResult.insertedId,
                    updatedAt: new Date()
                }
            }
        );

        // Log activity
        await logActivity('CONVERT', 'Issues', `Converted issue "${issue.title}" to risk`, {
            issueId: params.id,
            riskId: riskResult.insertedId.toString()
        });

        return NextResponse.json({
            message: 'Issue successfully converted to risk',
            riskId: riskResult.insertedId
        }, { status: 201 });
    } catch (error) {
        console.error('Error converting issue to risk:', error);
        return NextResponse.json(
            { message: 'Failed to convert issue to risk' },
            { status: 500 }
        );
    }
}
