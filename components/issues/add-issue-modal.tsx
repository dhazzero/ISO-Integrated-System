"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"

interface AddIssueModalProps {
    onIssueAdded: () => void
}

export function AddIssueModal({ onIssueAdded }: AddIssueModalProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [departments, setDepartments] = useState<any[]>([])
    const [standards, setStandards] = useState<any[]>([])
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        issueType: 'Internal',
        category: '',
        title: '',
        description: '',
        source: 'Department Input',
        departmentId: '',
        severity: 'Medium',
        likelihood: 'Possible',
        impact: '',
        affectedAreas: [] as string[],
        relatedStandards: [] as string[],
        assignedTo: '',
        dueDate: '',
    })

    useEffect(() => {
        if (open) {
            fetchDepartments()
            fetchStandards()
        }
    }, [open])

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/settings/departments')
            if (response.ok) {
                const data = await response.json()
                setDepartments(data)
            }
        } catch (error) {
            console.error('Failed to fetch departments:', error)
        }
    }

    const fetchStandards = async () => {
        try {
            const response = await fetch('/api/settings/standards')
            if (response.ok) {
                const data = await response.json()
                setStandards(data)
            }
        } catch (error) {
            console.error('Failed to fetch standards:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.description || !formData.category) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please fill in all required fields"
            })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/issues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to create issue')
            }

            toast({
                title: "Success!",
                description: "Issue has been created successfully"
            })

            setOpen(false)
            resetForm()
            onIssueAdded()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: (error as Error).message
            })
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            issueType: 'Internal',
            category: '',
            title: '',
            description: '',
            source: 'Department Input',
            departmentId: '',
            severity: 'Medium',
            likelihood: 'Possible',
            impact: '',
            affectedAreas: [],
            relatedStandards: [],
            assignedTo: '',
            dueDate: '',
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Add Issue
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Issue</DialogTitle>
                    <DialogDescription>
                        Document internal or external issues affecting your organization
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Issue Type */}
                        <div className="grid gap-2">
                            <Label htmlFor="issueType">Issue Type *</Label>
                            <Select
                                value={formData.issueType}
                                onValueChange={(value) => setFormData({ ...formData, issueType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Internal">Internal</SelectItem>
                                    <SelectItem value="External">External</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category */}
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Strategic">Strategic</SelectItem>
                                    <SelectItem value="Operational">Operational</SelectItem>
                                    <SelectItem value="Compliance">Compliance</SelectItem>
                                    <SelectItem value="Technology">Technology</SelectItem>
                                    <SelectItem value="HR">Human Resources</SelectItem>
                                    <SelectItem value="Financial">Financial</SelectItem>
                                    <SelectItem value="Legal">Legal</SelectItem>
                                    <SelectItem value="Environmental">Environmental</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Brief title describing the issue"
                            />
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed description of the issue"
                                rows={4}
                            />
                        </div>

                        {/* Source */}
                        <div className="grid gap-2">
                            <Label htmlFor="source">Source</Label>
                            <Select
                                value={formData.source}
                                onValueChange={(value) => setFormData({ ...formData, source: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Department Input">Department Input</SelectItem>
                                    <SelectItem value="Audit Finding">Audit Finding</SelectItem>
                                    <SelectItem value="External Report">External Report</SelectItem>
                                    <SelectItem value="Stakeholder Feedback">Stakeholder Feedback</SelectItem>
                                    <SelectItem value="Regulatory Change">Regulatory Change</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Department */}
                        <div className="grid gap-2">
                            <Label htmlFor="departmentId">Department</Label>
                            <Select
                                value={formData.departmentId}
                                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept._id} value={dept._id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Severity */}
                        <div className="grid gap-2">
                            <Label htmlFor="severity">Severity</Label>
                            <Select
                                value={formData.severity}
                                onValueChange={(value) => setFormData({ ...formData, severity: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Likelihood */}
                        <div className="grid gap-2">
                            <Label htmlFor="likelihood">Likelihood</Label>
                            <Select
                                value={formData.likelihood}
                                onValueChange={(value) => setFormData({ ...formData, likelihood: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Very Likely">Very Likely</SelectItem>
                                    <SelectItem value="Likely">Likely</SelectItem>
                                    <SelectItem value="Possible">Possible</SelectItem>
                                    <SelectItem value="Unlikely">Unlikely</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Impact */}
                        <div className="grid gap-2">
                            <Label htmlFor="impact">Impact</Label>
                            <Textarea
                                id="impact"
                                value={formData.impact}
                                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                                placeholder="Describe the potential impact"
                                rows={2}
                            />
                        </div>

                        {/* Assigned To */}
                        <div className="grid gap-2">
                            <Label htmlFor="assignedTo">Assigned To</Label>
                            <Input
                                id="assignedTo"
                                value={formData.assignedTo}
                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                placeholder="Name of person responsible"
                            />
                        </div>

                        {/* Due Date */}
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Issue"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
