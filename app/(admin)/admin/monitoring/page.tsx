"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
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
import {
    Heart, Server, Database, HardDrive, Cpu, MemoryStick,
    Activity, RefreshCw, CheckCircle, AlertCircle, XCircle,
    Clock, Wifi, Search, Download, Eye, AlertTriangle, Info,
    Trash2
} from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

// Types
interface ServiceStatus {
    name: string;
    status: 'healthy' | 'warning' | 'error' | 'unknown';
    latency?: number;
    uptime?: string;
    lastCheck: string;
}

interface SystemMetrics {
    cpu: number;
    memory: number;
    disk: number;
    connections: number;
}

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

interface ActivityLog {
    _id: string;
    action: string;
    description: string;
    userName: string;
    timestamp: string;
    ip?: string;
}

export default function MonitoringPage() {
    const [activeTab, setActiveTab] = useState("health")
    const { toast } = useToast()

    // Health State
    const [services, setServices] = useState<ServiceStatus[]>([
        { name: 'API Server', status: 'healthy', latency: 45, uptime: '99.9%', lastCheck: new Date().toISOString() },
        { name: 'MongoDB', status: 'healthy', latency: 12, uptime: '99.99%', lastCheck: new Date().toISOString() },
        { name: 'Authentication', status: 'healthy', latency: 23, lastCheck: new Date().toISOString() },
        { name: 'File Storage', status: 'warning', latency: 156, uptime: '98.5%', lastCheck: new Date().toISOString() },
        { name: 'Email Service', status: 'error', lastCheck: new Date().toISOString() },
        { name: 'Background Jobs', status: 'healthy', latency: 5, lastCheck: new Date().toISOString() },
    ])
    const [metrics, setMetrics] = useState<SystemMetrics>({ cpu: 35, memory: 62, disk: 48, connections: 24 })
    const [isRefreshingHealth, setIsRefreshingHealth] = useState(false)

    // Error Logs State
    const [errors, setErrors] = useState<ErrorLog[]>([
        { _id: '1', level: 'error', message: 'Database connection timeout', stack: 'MongoError: connection timed out...', source: 'mongodb', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), resolved: false },
        { _id: '2', level: 'warning', message: 'Rate limit exceeded for user', source: 'api', companyCode: 'PBB', userId: 'admin', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), resolved: true },
        { _id: '3', level: 'error', message: 'Failed to send email notification', source: 'email', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), resolved: false },
    ])
    const [errorSearchTerm, setErrorSearchTerm] = useState('')
    const [errorLevelFilter, setErrorLevelFilter] = useState('all')
    const [selectedError, setSelectedError] = useState<ErrorLog | null>(null)

    // Activity Logs State
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
    const [isLoadingLogs, setIsLoadingLogs] = useState(false)

    // Fetch functions
    const refreshHealth = async () => {
        setIsRefreshingHealth(true)
        try {
            const res = await fetch('/api/admin/monitoring/health')
            if (res.ok) {
                const data = await res.json()
                if (data.services) setServices(data.services)
                if (data.metrics) setMetrics(data.metrics)
            }
        } catch (error) {
            console.error('Failed to fetch health:', error)
        } finally {
            setIsRefreshingHealth(false)
        }
    }

    const fetchActivityLogs = async () => {
        setIsLoadingLogs(true)
        try {
            const res = await fetch('/api/admin/logs')
            if (res.ok) {
                const data = await res.json()
                setActivityLogs(data.logs || [])
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setIsLoadingLogs(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'activity') {
            fetchActivityLogs()
        }
    }, [activeTab])

    // Helper functions
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'warning': return <AlertCircle className="h-5 w-5 text-amber-500" />
            case 'error': return <XCircle className="h-5 w-5 text-red-500" />
            default: return <Clock className="h-5 w-5 text-gray-500" />
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            healthy: 'default', warning: 'secondary', error: 'destructive', unknown: 'outline',
        }
        return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>
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
            error: 'destructive', warning: 'secondary', info: 'outline',
        }
        return <Badge variant={variants[level] || 'outline'}>{level.toUpperCase()}</Badge>
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        if (diffMins < 60) return `${diffMins} menit lalu`
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} jam lalu`
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    }

    const toggleResolved = (id: string) => {
        setErrors(errors.map(e => e._id === id ? { ...e, resolved: !e.resolved } : e))
        toast({ title: "Status diperbarui" })
    }

    const overallHealth = services.every(s => s.status === 'healthy')
        ? 'healthy' : services.some(s => s.status === 'error') ? 'error' : 'warning'

    const filteredErrors = errors.filter(err => {
        const matchSearch = err.message.toLowerCase().includes(errorSearchTerm.toLowerCase()) ||
            err.source.toLowerCase().includes(errorSearchTerm.toLowerCase())
        const matchLevel = errorLevelFilter === 'all' || err.level === errorLevelFilter
        return matchSearch && matchLevel
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Monitoring</h1>
                <p className="text-muted-foreground">Monitor status sistem, error logs, dan aktivitas</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="health" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        System Health
                    </TabsTrigger>
                    <TabsTrigger value="errors" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Error Logs
                        {errors.filter(e => !e.resolved).length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
                                {errors.filter(e => !e.resolved).length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Activity Logs
                    </TabsTrigger>
                </TabsList>

                {/* System Health Tab */}
                <TabsContent value="health" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={refreshHealth} disabled={isRefreshingHealth}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingHealth ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    {/* Overall Status */}
                    <Card className={`border-2 ${overallHealth === 'healthy' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
                            overallHealth === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
                                'border-amber-500 bg-amber-50 dark:bg-amber-950'
                        }`}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${overallHealth === 'healthy' ? 'bg-green-500' :
                                        overallHealth === 'error' ? 'bg-red-500' : 'bg-amber-500'
                                    }`}>
                                    <Heart className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {overallHealth === 'healthy' ? 'All Systems Operational' :
                                            overallHealth === 'error' ? 'System Issues Detected' : 'Some Services Degraded'}
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {services.filter(s => s.status === 'healthy').length} of {services.length} services healthy
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Metrics */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Cpu className="h-4 w-4" /> CPU Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.cpu}%</div>
                                <Progress value={metrics.cpu} className="mt-2" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <MemoryStick className="h-4 w-4" /> Memory Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.memory}%</div>
                                <Progress value={metrics.memory} className="mt-2" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <HardDrive className="h-4 w-4" /> Disk Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.disk}%</div>
                                <Progress value={metrics.disk} className="mt-2" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Wifi className="h-4 w-4" /> Connections
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.connections}</div>
                                <p className="text-xs text-muted-foreground mt-2">Database connections</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Services Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {services.map((service, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(service.status)}
                                            <div>
                                                <p className="font-medium">{service.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Last checked: {new Date(service.lastCheck).toLocaleTimeString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {service.latency && <span className="text-sm text-muted-foreground">{service.latency}ms</span>}
                                            {service.uptime && <span className="text-sm text-muted-foreground">Uptime: {service.uptime}</span>}
                                            {getStatusBadge(service.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Error Logs Tab */}
                <TabsContent value="errors" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari error..."
                                        className="pl-10"
                                        value={errorSearchTerm}
                                        onChange={(e) => setErrorSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={errorLevelFilter} onValueChange={setErrorLevelFilter}>
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
                                {filteredErrors.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">Tidak ada log</div>
                                ) : (
                                    filteredErrors.map((error) => (
                                        <div key={error._id} className={`p-4 hover:bg-muted/30 ${error.resolved ? 'opacity-60' : ''}`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    {getLevelIcon(error.level)}
                                                    <div>
                                                        <p className="font-medium">{error.message}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Source: {error.source} • {formatDate(error.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getLevelBadge(error.level)}
                                                    {error.resolved && <Badge variant="outline">Resolved</Badge>}
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedError(error)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => toggleResolved(error._id)}>
                                                        <CheckCircle className={`h-4 w-4 ${error.resolved ? 'text-gray-400' : 'text-green-500'}`} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Logs Tab */}
                <TabsContent value="activity" className="space-y-4">
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={fetchActivityLogs} disabled={isLoadingLogs}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="text-left p-4 font-medium">Waktu</th>
                                            <th className="text-left p-4 font-medium">Aksi</th>
                                            <th className="text-left p-4 font-medium">Deskripsi</th>
                                            <th className="text-left p-4 font-medium">User</th>
                                            <th className="text-left p-4 font-medium">IP</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {isLoadingLogs ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                    <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                                                    Memuat...
                                                </td>
                                            </tr>
                                        ) : activityLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                    Belum ada log aktivitas
                                                </td>
                                            </tr>
                                        ) : (
                                            activityLogs.map((log) => (
                                                <tr key={log._id} className="hover:bg-muted/30">
                                                    <td className="p-4 text-sm text-muted-foreground">
                                                        {new Date(log.timestamp).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="p-4"><Badge variant="outline">{log.action}</Badge></td>
                                                    <td className="p-4">{log.description}</td>
                                                    <td className="p-4 font-medium">{log.userName}</td>
                                                    <td className="p-4 text-sm text-muted-foreground font-mono">{log.ip || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

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
                            </div>
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
