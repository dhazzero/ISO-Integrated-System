"use client"

import { useState, useEffect, useMemo } from "react"
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
    RefreshCw, Search, Download, Filter, Calendar,
    FileText, Settings, Shield, Database, User,
    Plus, Edit, Trash2, Eye, LogIn, LogOut, Upload
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AuditLog {
    _id: string;
    action: string;
    module: string;
    description: string;
    details?: any;
    userId: string;
    userName: string;
    userRole: string;
    timestamp: string;
    ip: string;
}

// Action icons and colors
const actionConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
    CREATE: { color: 'text-green-700', bgColor: 'bg-green-100', icon: <Plus className="h-4 w-4" /> },
    UPDATE: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: <Edit className="h-4 w-4" /> },
    DELETE: { color: 'text-red-700', bgColor: 'bg-red-100', icon: <Trash2 className="h-4 w-4" /> },
    LOGIN: { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: <LogIn className="h-4 w-4" /> },
    LOGOUT: { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: <LogOut className="h-4 w-4" /> },
    VIEW: { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: <Eye className="h-4 w-4" /> },
    EXPORT: { color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: <Download className="h-4 w-4" /> },
    IMPORT: { color: 'text-cyan-700', bgColor: 'bg-cyan-100', icon: <Upload className="h-4 w-4" /> },
}

const moduleIcons: Record<string, React.ReactNode> = {
    'Dokumen': <FileText className="h-4 w-4" />,
    'Pengaturan': <Settings className="h-4 w-4" />,
    'Keamanan': <Shield className="h-4 w-4" />,
    'Database': <Database className="h-4 w-4" />,
    'Pengguna': <User className="h-4 w-4" />,
    'User': <User className="h-4 w-4" />,
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [actionFilter, setActionFilter] = useState('all')
    const [moduleFilter, setModuleFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('all')
    const { toast } = useToast()

    const fetchLogs = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/logs/security?limit=500')
            if (res.ok) {
                const data = await res.json()
                setLogs(data)
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error)
            toast({ title: "Error", description: "Gagal mengambil log", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    // Get unique values for filters
    const uniqueActions = useMemo(() => [...new Set(logs.map(l => l.action))], [logs])
    const uniqueModules = useMemo(() => [...new Set(logs.map(l => l.module))], [logs])

    // Filter logs
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchSearch = searchTerm === '' ||
                log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.module.toLowerCase().includes(searchTerm.toLowerCase())

            const matchAction = actionFilter === 'all' || log.action === actionFilter
            const matchModule = moduleFilter === 'all' || log.module === moduleFilter

            let matchDate = true
            if (dateFilter !== 'all') {
                const logDate = new Date(log.timestamp)
                const now = new Date()
                if (dateFilter === 'today') {
                    matchDate = logDate.toDateString() === now.toDateString()
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    matchDate = logDate >= weekAgo
                } else if (dateFilter === 'month') {
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    matchDate = logDate >= monthAgo
                }
            }

            return matchSearch && matchAction && matchModule && matchDate
        })
    }, [logs, searchTerm, actionFilter, moduleFilter, dateFilter])

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        return {
            date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
    }

    const exportLogs = () => {
        const csvContent = [
            ['Tanggal', 'Waktu', 'User', 'Role', 'Aksi', 'Modul', 'Deskripsi', 'IP'].join(','),
            ...filteredLogs.map(log => {
                const ts = formatTimestamp(log.timestamp)
                return [
                    ts.date,
                    ts.time,
                    log.userName,
                    log.userRole,
                    log.action,
                    log.module,
                    `"${log.description.replace(/"/g, '""')}"`,
                    log.ip
                ].join(',')
            })
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
        toast({ title: "Berhasil", description: "Log berhasil di-export" })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Audit Trail</h1>
                    <p className="text-muted-foreground">Rekam jejak semua aktivitas untuk keperluan audit ISO</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={exportLogs}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{logs.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Users Aktif</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Set(logs.filter(l => {
                                const d = new Date(l.timestamp)
                                return d > new Date(Date.now() - 24 * 60 * 60 * 1000)
                            }).map(l => l.userName)).size}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Login Hari Ini</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {logs.filter(l =>
                                l.action === 'LOGIN' &&
                                new Date(l.timestamp).toDateString() === new Date().toDateString()
                            ).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari aktivitas, user, atau modul..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Aksi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Aksi</SelectItem>
                                {uniqueActions.map(action => (
                                    <SelectItem key={action} value={action}>{action}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={moduleFilter} onValueChange={setModuleFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Modul" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Modul</SelectItem>
                                {uniqueModules.map(module => (
                                    <SelectItem key={module} value={module}>{module}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Waktu</SelectItem>
                                <SelectItem value="today">Hari Ini</SelectItem>
                                <SelectItem value="week">7 Hari Terakhir</SelectItem>
                                <SelectItem value="month">30 Hari Terakhir</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>
                        Menampilkan {filteredLogs.length} dari {logs.length} log
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left p-4 font-medium">Waktu</th>
                                    <th className="text-left p-4 font-medium">User</th>
                                    <th className="text-left p-4 font-medium">Aksi</th>
                                    <th className="text-left p-4 font-medium">Modul</th>
                                    <th className="text-left p-4 font-medium">Deskripsi</th>
                                    <th className="text-left p-4 font-medium">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                                            Memuat log...
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            Tidak ada log yang ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.slice(0, 100).map((log) => {
                                        const ts = formatTimestamp(log.timestamp)
                                        const config = actionConfig[log.action] || { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: null }
                                        return (
                                            <tr key={log._id} className="hover:bg-muted/30">
                                                <td className="p-4">
                                                    <div className="text-sm font-medium">{ts.date}</div>
                                                    <div className="text-xs text-muted-foreground">{ts.time}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium">{log.userName}</div>
                                                    <div className="text-xs text-muted-foreground">{log.userRole}</div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={`${config.bgColor} ${config.color} gap-1`}>
                                                        {config.icon}
                                                        {log.action}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {moduleIcons[log.module] || <FileText className="h-4 w-4" />}
                                                        <span>{log.module}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 max-w-xs">
                                                    <div className="truncate" title={log.description}>
                                                        {log.description}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-mono text-muted-foreground">
                                                    {log.ip}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {filteredLogs.length > 100 && (
                        <div className="p-4 text-center text-sm text-muted-foreground border-t">
                            Menampilkan 100 dari {filteredLogs.length} log. Gunakan filter untuk mempersempit hasil.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
