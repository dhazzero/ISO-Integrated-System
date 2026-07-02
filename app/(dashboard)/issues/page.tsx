"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, TrendingUp, Eye, Edit, Trash2, GitBranch } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddIssueModal } from "@/components/issues/add-issue-modal"

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

export default function IssuesPage() {
    const [issues, setIssues] = useState<Issue[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [userCanEdit, setUserCanEdit] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null as string | null, title: "" })
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
    const { toast } = useToast()

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortIssues = (data: Issue[]) => {
        if (!sortConfig) return data;
        return [...data].sort((a, b) => {
            let aValue = (a as any)[sortConfig.key];
            let bValue = (b as any)[sortConfig.key];
            
            if (sortConfig.key === 'identifiedDate') {
                const dateA = new Date(aValue).getTime();
                const dateB = new Date(bValue).getTime();
                if (!isNaN(dateA) && !isNaN(dateB)) {
                     if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
                     if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
                     return 0;
                }
            }

            if (aValue === bValue) return 0;
            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;
            
            const aString = String(aValue).toLowerCase();
            const bString = String(bValue).toLowerCase();

            if (aString < bString) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aString > bString) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const renderSortIcon = (columnKey: string) => {
        if (sortConfig?.key !== columnKey) return null;
        return <span className="ml-1 inline-block">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    const fetchIssues = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/issues')
            if (!response.ok) throw new Error("Failed to fetch issues")
            const data = await response.json()
            setIssues(data)
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchIssues()
        // Check user permission
        fetch('/api/auth/me').then(res => res.json()).then(data => {
            setUserCanEdit(data?.user?.permissions?.canEdit || false)
        }).catch(() => setUserCanEdit(false))
    }, [])

    const handleIssueAdded = () => {
        toast({ title: "Success", description: "Issue list is being updated..." })
        fetchIssues()
    }

    const handleDeleteClick = (issue: Issue) => {
        setDeleteConfirm({ open: true, id: issue._id, title: issue.title })
    }

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return
        try {
            const response = await fetch(`/api/issues/${deleteConfirm.id}`, { method: 'DELETE' })
            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.message)
            }
            toast({ title: "Success!", description: `Issue "${deleteConfirm.title}" has been deleted.` })
            fetchIssues()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        } finally {
            setDeleteConfirm({ open: false, id: null, title: "" })
        }
    }

    // Calculate statistics
    const stats = useMemo(() => {
        const total = issues.length
        const bySeverity = {
            Critical: issues.filter(i => i.severity === 'Critical').length,
            High: issues.filter(i => i.severity === 'High').length,
            Medium: issues.filter(i => i.severity === 'Medium').length,
            Low: issues.filter(i => i.severity === 'Low').length,
        }
        const byStatus = {
            New: issues.filter(i => i.status === 'New').length,
            UnderReview: issues.filter(i => i.status === 'Under Review').length,
            ConvertedToRisk: issues.filter(i => i.status === 'Converted to Risk').length,
            Resolved: issues.filter(i => i.status === 'Resolved').length,
            Closed: issues.filter(i => i.status === 'Closed').length,
        }
        return { total, bySeverity, byStatus }
    }, [issues])

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'bg-red-500'
            case 'High': return 'bg-orange-500'
            case 'Medium': return 'bg-yellow-500'
            case 'Low': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'text-red-600'
            case 'High': return 'text-orange-600'
            case 'Medium': return 'text-yellow-600'
            case 'Low': return 'text-green-600'
            default: return 'text-gray-600'
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
            month: 'short',
            year: 'numeric'
        })
    }

    const filterIssuesByType = (type: 'all' | 'Internal' | 'External') => {
        if (type === 'all') return issues
        return issues.filter(i => i.issueType === type)
    }

    const IssueTable = ({ issueList }: { issueList: Issue[] }) => {
        const sortedList = sortIssues(issueList);
        
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('title')}>Title{renderSortIcon('title')}</th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('issueType')}>Type{renderSortIcon('issueType')}</th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('category')}>Category{renderSortIcon('category')}</th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('departmentName')}>Department{renderSortIcon('departmentName')}</th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('severity')}>Severity{renderSortIcon('severity')}</th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('status')}>Status{renderSortIcon('status')}</th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('identifiedDate')}>Identified Date{renderSortIcon('identifiedDate')}</th>
                            <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="text-center p-8">Loading issues...</td>
                            </tr>
                        ) : sortedList.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center p-8 text-muted-foreground">No issues found.</td>
                            </tr>
                        ) : (
                            sortedList.map((issue) => (
                                <tr key={issue._id} className="border-b hover:bg-muted/50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <AlertCircle className={`mr-2 h-4 w-4 ${getSeverityTextColor(issue.severity)}`} />
                                            <Link href={`/issues/${issue._id}`} className="hover:underline font-medium">
                                                {issue.title}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge variant={issue.issueType === 'Internal' ? 'default' : 'outline'}>
                                            {issue.issueType}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4">{issue.category}</td>
                                    <td className="py-3 px-4">{issue.departmentName || '-'}</td>
                                    <td className="py-3 px-4">
                                        <span className={`font-semibold ${getSeverityTextColor(issue.severity)}`}>
                                            {issue.severity}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">{getStatusBadge(issue.status)}</td>
                                    <td className="py-3 px-4 text-sm text-muted-foreground">
                                        {formatDate(issue.identifiedDate)}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex space-x-1">
                                            <Link href={`/issues/${issue._id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {userCanEdit && (
                                                <>
                                                    <Link href={`/issues/${issue._id}/edit`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteClick(issue)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Issue Management</h1>
                {userCanEdit && (
                    <div className="flex space-x-2">
                        <AddIssueModal onIssueAdded={handleIssueAdded} />
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Total Issues</CardTitle>
                        <AlertCircle className="h-8 w-8 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-2">All tracked issues</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Critical & High</CardTitle>
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">
                            {stats.bySeverity.Critical + stats.bySeverity.High}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Require immediate attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Converted to Risk</CardTitle>
                        <GitBranch className="h-8 w-8 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            {stats.byStatus.ConvertedToRisk}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Now in risk register</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Resolved & Closed</CardTitle>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {stats.byStatus.Resolved + stats.byStatus.Closed}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Successfully addressed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Internal/External/All */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All Issues ({stats.total})</TabsTrigger>
                    <TabsTrigger value="internal">
                        Internal ({issues.filter(i => i.issueType === 'Internal').length})
                    </TabsTrigger>
                    <TabsTrigger value="external">
                        External ({issues.filter(i => i.issueType === 'External').length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold">All Issues</CardTitle>
                            <CardDescription>Complete list of internal and external issues</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IssueTable issueList={filterIssuesByType('all')} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="internal">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Internal Issues</CardTitle>
                            <CardDescription>
                                Issues from internal operations, processes, and organizational context
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IssueTable issueList={filterIssuesByType('Internal')} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="external">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold">External Issues</CardTitle>
                            <CardDescription>
                                Issues from external factors, regulations, and environmental context
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IssueTable issueList={filterIssuesByType('External')} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Confirmation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete issue <b>{deleteConfirm.title}</b>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirm({ open: false, id: null, title: "" })}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
