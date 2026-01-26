"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, RefreshCw, Search, Eye, Trash2, Download, AlertTriangle, XCircle, Info } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface ErrorLog {
    _id: string;
    level: 'error' | 'warning' | 'info';
    message: string;
    stack?: string;
    source: string;
    companyCode?: string;
    userId?: string;
    url?: string;
    timestamp: string;
    resolved: boolean;
}

const sampleErrors: ErrorLog[] = [
    {
        _id: '1',
        level: 'error',
        message: 'Database connection timeout',
        stack: 'MongoError: connection timed out\n    at Connection.connect (/app/node_modules/mongodb/lib/cmap/connection.js:241:14)\n    at connectHandler (/app/node_modules/mongodb/lib/cmap/connect.js:268:17)',
        source: 'mongodb',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        resolved: false,
    },
    {
        _id: '2',
        level: 'warning',
        message: 'Rate limit exceeded for user',
        source: 'api',
        companyCode: 'PBB',
        userId: 'admin',
        url: '/api/documents',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        resolved: true,
    },
    {
        _id: '3',
        level: 'error',
        message: 'Failed to send email notification',
        stack: 'Error: SMTP connection refused\n    at SMTPConnection.connect (nodemailer/lib/smtp-connection/index.js:144:13)',
        source: 'email',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        resolved: false,
    },
    {
        _id: '4',
        level: 'info',
        message: 'User session expired',
        source: 'auth',
        companyCode: 'ACME',
        userId: 'john.doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        resolved: true,
    },
]

export default function ErrorLogsPage() {
    const [errors, setErrors] = useState<ErrorLog[]>(sampleErrors)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [levelFilter, setLevelFilter] = useState('all')
    const [selectedError, setSelectedError] = useState<ErrorLog | null>(null)
    const { toast } = useToast()

    const fetchErrors = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/monitoring/errors')
            if (res.ok) {
                const data = await res.json()
                if (data.errors && data.errors.length > 0) {
                    setErrors(data.errors)
                }
            }
        } catch (error) {
            console.error('Failed to fetch errors:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchErrors()
    }, [])

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 60) return `${diffMins} menit lalu`
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} jam lalu`
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    }

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error': return <XCircle className="h-5 w-5 text-red-500" />
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
            case 'info': return <Info className="h-5 w-5 text-blue-500" />
            default: return <AlertCircle className="h-5 w-5" />
        }
    }

    const getLevelBadge = (level: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            error: 'destructive',
            warning: 'secondary',
            info: 'outline',
        }
        return <Badge variant={variants[level] || 'outline'}>{level.toUpperCase()}</Badge>
    }

    const toggleResolved = (id: string) => {
        setErrors(errors.map(e =>
            e._id === id ? { ...e, resolved: !e.resolved } : e
        ))
        toast({ title: "Status diperbarui" })
    }

    const handleClearResolved = () => {
        if (!confirm('Hapus semua error yang sudah resolved?')) return
        setErrors(errors.filter(e => !e.resolved))
        toast({ title: "Berhasil", description: "Resolved errors dihapus" })
    }

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(errors, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        toast({ title: "Berhasil", description: "Logs diekspor" })
    }

    const filteredErrors = errors.filter(err => {
        const matchSearch =
            err.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            err.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (err.companyCode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        const matchLevel = levelFilter === 'all' || err.level === levelFilter
        return matchSearch && matchLevel
    })

    const errorCount = errors.filter(e => e.level === 'error' && !e.resolved).length
    const warningCount = errors.filter(e => e.level === 'warning' && !e.resolved).length

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Error Logs</h1>
                    <p className="text-muted-foreground">
                        {errorCount} errors, {warningCount} warnings aktif
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={handleClearResolved}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Resolved
                    </Button>
                    <Button onClick={fetchErrors} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <XCircle className="h-8 w-8 text-red-500" />
                            <div>
                                <p className="text-2xl font-bold">{errors.filter(e => e.level === 'error').length}</p>
                                <p className="text-sm text-muted-foreground">Total Errors</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-8 w-8 text-amber-500" />
                            <div>
                                <p className="text-2xl font-bold">{errors.filter(e => e.level === 'warning').length}</p>
                                <p className="text-sm text-muted-foreground">Total Warnings</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                            <div>
                                <p className="text-2xl font-bold">{errors.filter(e => !e.resolved).length}</p>
                                <p className="text-sm text-muted-foreground">Unresolved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Info className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">{errors.filter(e => e.resolved).length}</p>
                                <p className="text-sm text-muted-foreground">Resolved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari error message, source, atau company..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={levelFilter} onValueChange={setLevelFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Level</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Error List */}
            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                                Memuat...
                            </div>
                        ) : filteredErrors.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                Tidak ada log
                            </div>
                        ) : (
                            filteredErrors.map((error) => (
                                <div key={error._id} className={`p-4 hover:bg-muted/30 ${error.resolved ? 'opacity-60' : ''}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            {getLevelIcon(error.level)}
                                            <div className="space-y-1">
                                                <p className="font-medium">{error.message}</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>Source: {error.source}</span>
                                                    {error.companyCode && <span>• Company: {error.companyCode}</span>}
                                                    {error.userId && <span>• User: {error.userId}</span>}
                                                    <span>• {formatDate(error.timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getLevelBadge(error.level)}
                                            {error.resolved && <Badge variant="outline">Resolved</Badge>}
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedError(error)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleResolved(error._id)}
                                                title={error.resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                                            >
                                                {error.resolved ? <XCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4 text-green-500" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Error Detail Dialog */}
            <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedError && getLevelIcon(selectedError.level)}
                            Error Details
                        </DialogTitle>
                        <DialogDescription>
                            {selectedError?.timestamp && formatDate(selectedError.timestamp)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedError && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Message</label>
                                <p className="font-medium">{selectedError.message}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Source</label>
                                    <p>{selectedError.source}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Level</label>
                                    <p>{selectedError.level}</p>
                                </div>
                                {selectedError.companyCode && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Company</label>
                                        <p>{selectedError.companyCode}</p>
                                    </div>
                                )}
                                {selectedError.userId && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">User</label>
                                        <p>{selectedError.userId}</p>
                                    </div>
                                )}
                            </div>
                            {selectedError.url && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">URL</label>
                                    <p className="font-mono text-sm">{selectedError.url}</p>
                                </div>
                            )}
                            {selectedError.stack && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Stack Trace</label>
                                    <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                                        {selectedError.stack}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
