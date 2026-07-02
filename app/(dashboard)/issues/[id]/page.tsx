"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ArrowLeft, GitBranch, Edit, CalendarDays, User, Building2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Issue {
    _id: string
    issueType: 'Internal' | 'External'
    category: string
    title: string
    description: string
    source: string
    departmentId: string | null
    departmentName?: string
    identifiedBy: string
    identifiedDate: string
    severity: 'Critical' | 'High' | 'Medium' | 'Low'
    likelihood: 'Very Likely' | 'Likely' | 'Possible' | 'Unlikely'
    impact: string
    affectedAreas: string[]
    status: 'New' | 'Under Review' | 'Converted to Risk' | 'Resolved' | 'Closed'
    assignedTo: string | null
    dueDate: string | null
    relatedStandards: string[]
    relatedRiskId: string | null
    relatedComplianceIds: string[]
    actionTaken: string | null
    resolution: string | null
    closedDate: string | null
    createdAt: string
    updatedAt: string
}

export default function IssueDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [issue, setIssue] = useState<Issue | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [convertModalOpen, setConvertModalOpen] = useState(false)
    const [isConverting, setIsConverting] = useState(false)

    const [convertData, setConvertData] = useState({
        name: '',
        category: '',
        level: '',
        likelihood: '',
        impact: '',
        status: 'Open'
    })

    useEffect(() => {
        if (params.id) {
            fetchIssue()
        }
    }, [params.id])

    const fetchIssue = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/issues/${params.id}`)
            if (!response.ok) throw new Error("Failed to fetch issue")
            const data = await response.json()
            setIssue(data)

            // Pre-fill convert form
            setConvertData({
                name: data.title,
                category: data.category,
                level: calculateRiskLevel(data.severity, data.likelihood),
                likelihood: data.likelihood,
                impact: data.impact || data.description,
                status: 'Open'
            })
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        } finally {
            setIsLoading(false)
        }
    }

    const calculateRiskLevel = (severity: string, likelihood: string): string => {
        const severityScore: Record<string, number> = {
            'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1
        }
        const likelihoodScore: Record<string, number> = {
            'Very Likely': 4, 'Likely': 3, 'Possible': 2, 'Unlikely': 1
        }

        const total = (severityScore[severity] || 2) * (likelihoodScore[likelihood] || 2)

        if (total >= 12) return 'Sangat Tinggi'
        if (total >= 8) return 'Tinggi'
        if (total >= 4) return 'Sedang'
        return 'Rendah'
    }

    const handleConvertToRisk = async () => {
        setIsConverting(true)
        try {
            const response = await fetch(`/api/issues/${params.id}/convert-to-risk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(convertData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to convert to risk')
            }

            const result = await response.json()

            toast({
                title: "Success!",
                description: "Issue has been converted to risk successfully"
            })

            setConvertModalOpen(false)

            // Redirect to risk detail page
            router.push(`/risk/${result.riskId}`)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: (error as Error).message
            })
        } finally {
            setIsConverting(false)
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'text-red-600 bg-red-50'
            case 'High': return 'text-orange-600 bg-orange-50'
            case 'Medium': return 'text-yellow-600 bg-yellow-50'
            case 'Low': return 'text-green-600 bg-green-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'New': return <Badge className="bg-blue-100 text-blue-800">New</Badge>
            case 'Under Review': return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
            case 'Converted to Risk': return <Badge className="bg-purple-100 text-purple-800">Converted to Risk</Badge>
            case 'Resolved': return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
            case 'Closed': return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="text-center">Loading issue details...</div>
            </div>
        )
    }

    if (!issue) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="text-center">Issue not found</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Link href="/issues">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{issue.title}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Issue ID: {issue._id}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    {issue.status !== 'Converted to Risk' && (
                        <Button onClick={() => setConvertModalOpen(true)}>
                            <GitBranch className="mr-2 h-4 w-4" />
                            Convert to Risk
                        </Button>
                    )}
                    <Link href={`/issues/${issue._id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column - Main Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Issue Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                                    <div className="mt-1">
                                        <Badge variant={issue.issueType === 'Internal' ? 'default' : 'outline'}>
                                            {issue.issueType}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                                    <p className="mt-1 font-medium">{issue.category}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div className="mt-1">{getStatusBadge(issue.status)}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Source</Label>
                                    <p className="mt-1">{issue.source}</p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                <p className="mt-1 text-sm">{issue.description}</p>
                            </div>

                            {issue.impact && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Impact</Label>
                                    <p className="mt-1 text-sm">{issue.impact}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assessment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Risk Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Severity</Label>
                                    <div className="mt-1">
                                        <Badge className={getSeverityColor(issue.severity)}>
                                            {issue.severity}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Likelihood</Label>
                                    <p className="mt-1 font-medium">{issue.likelihood}</p>
                                </div>
                            </div>
                            {issue.affectedAreas && issue.affectedAreas.length > 0 && (
                                <div className="mt-4">
                                    <Label className="text-sm font-medium text-muted-foreground">Affected Areas</Label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {issue.affectedAreas.map((area, idx) => (
                                            <Badge key={idx} variant="secondary">{area}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Related Information */}
                    {issue.relatedStandards && issue.relatedStandards.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Related Standards</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {issue.relatedStandards.map((std, idx) => (
                                        <Badge key={idx} variant="outline">{std}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {issue.relatedRiskId && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Linked Risk</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/risk/${issue.relatedRiskId}`}>
                                    <Button variant="link" className="p-0">
                                        View Related Risk →
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Metadata */}
                <div className="space-y-6">
                    {/* Assignment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Assignment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start space-x-2">
                                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div className="flex-1">
                                    <Label className="text-sm text-muted-foreground">Identified By</Label>
                                    <p className="text-sm font-medium">{issue.identifiedBy}</p>
                                </div>
                            </div>
                            {issue.departmentName && (
                                <div className="flex items-start space-x-2">
                                    <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div className="flex-1">
                                        <Label className="text-sm text-muted-foreground">Department</Label>
                                        <p className="text-sm font-medium">{issue.departmentName}</p>
                                    </div>
                                </div>
                            )}
                            {issue.assignedTo && (
                                <div className="flex items-start space-x-2">
                                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div className="flex-1">
                                        <Label className="text-sm text-muted-foreground">Assigned To</Label>
                                        <p className="text-sm font-medium">{issue.assignedTo}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start space-x-2">
                                <CalendarDays className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div className="flex-1">
                                    <Label className="text-sm text-muted-foreground">Identified Date</Label>
                                    <p className="text-sm font-medium">{formatDate(issue.identifiedDate)}</p>
                                </div>
                            </div>
                            {issue.dueDate && (
                                <div className="flex items-start space-x-2">
                                    <CalendarDays className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div className="flex-1">
                                        <Label className="text-sm text-muted-foreground">Due Date</Label>
                                        <p className="text-sm font-medium">{formatDate(issue.dueDate)}</p>
                                    </div>
                                </div>
                            )}
                            {issue.closedDate && (
                                <div className="flex items-start space-x-2">
                                    <CalendarDays className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div className="flex-1">
                                        <Label className="text-sm text-muted-foreground">Closed Date</Label>
                                        <p className="text-sm font-medium">{formatDate(issue.closedDate)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Convert to Risk Modal */}
            <Dialog open={convertModalOpen} onOpenChange={setConvertModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Convert Issue to Risk</DialogTitle>
                        <DialogDescription>
                            This will create a new risk entry based on this issue and update the issue status.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Risk Name</Label>
                            <Input
                                value={convertData.name}
                                onChange={(e) => setConvertData({ ...convertData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Risk Level (Calculated)</Label>
                            <Input value={convertData.level} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label>Impact Description</Label>
                            <Textarea
                                value={convertData.impact}
                                onChange={(e) => setConvertData({ ...convertData, impact: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConvertModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConvertToRisk} disabled={isConverting}>
                            {isConverting ? "Converting..." : "Convert to Risk"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
