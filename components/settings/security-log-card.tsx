"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    LogIn, XCircle, Ban, Plus, Edit, Trash2, FlaskConical,
    RefreshCw, Eye, Clock, User, Globe, Activity,
    FileText, Settings, Shield, Database, AlertTriangle
} from "lucide-react"
import { SecurityLog } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SecurityLogCardProps {
    logs: SecurityLog[]
    isLoading: boolean
    onRefresh: () => void
}

// Action configuration for badge colors and icons
const actionConfig: Record<string, { color: string, bgColor: string, icon: React.ComponentType<{ className?: string }> }> = {
    'LOGIN': { color: 'text-green-700', bgColor: 'bg-green-100 border-green-200', icon: LogIn },
    'LOGIN_FAILED': { color: 'text-red-700', bgColor: 'bg-red-100 border-red-200', icon: XCircle },
    'USER_BLOCKED': { color: 'text-red-900', bgColor: 'bg-red-200 border-red-300', icon: Ban },
    'CREATE': { color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200', icon: Plus },
    'UPDATE': { color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200', icon: Edit },
    'DELETE': { color: 'text-red-600', bgColor: 'bg-red-100 border-red-200', icon: Trash2 },
    'TEST': { color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-200', icon: FlaskConical },
    'VIEW': { color: 'text-slate-700', bgColor: 'bg-slate-100 border-slate-200', icon: Eye },
    'LOGOUT': { color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-200', icon: LogIn },
}

// Module configuration for icons
const moduleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'Keamanan': Shield,
    'Dokumen': FileText,
    'Pengaturan': Settings,
    'Database': Database,
    'Backup': Database,
    'User': User,
    'Pengguna': User,
}

function getActionConfig(action: string) {
    return actionConfig[action] || { color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-200', icon: Activity }
}

function getModuleIcon(module: string) {
    return moduleIcons[module] || Activity
}

function formatTimestamp(timestamp: string | Date) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    let relative = ''
    if (minutes < 1) relative = 'Baru saja'
    else if (minutes < 60) relative = `${minutes} menit lalu`
    else if (hours < 24) relative = `${hours} jam lalu`
    else if (days < 7) relative = `${days} hari lalu`
    else relative = date.toLocaleDateString('id-ID')

    return {
        date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        relative
    }
}

export function SecurityLogCard({ logs, isLoading, onRefresh }: SecurityLogCardProps) {
    const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null)
    const [actionFilter, setActionFilter] = useState<string>("all")
    const [moduleFilter, setModuleFilter] = useState<string>("all")

    // Get unique actions and modules for filters
    const { uniqueActions, uniqueModules } = useMemo(() => {
        const actions = [...new Set(logs.map(log => log.action))]
        const modules = [...new Set(logs.map(log => log.module))]
        return { uniqueActions: actions, uniqueModules: modules }
    }, [logs])

    // Filter logs
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            if (actionFilter !== "all" && log.action !== actionFilter) return false
            if (moduleFilter !== "all" && log.module !== moduleFilter) return false
            return true
        })
    }, [logs, actionFilter, moduleFilter])

    return (
        <>
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Log Keamanan
                            </CardTitle>
                            <CardDescription>
                                Monitor aktivitas dan perubahan pada sistem
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue placeholder="Semua Aksi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Aksi</SelectItem>
                                    {uniqueActions.map(action => (
                                        <SelectItem key={action} value={action}>{action}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={moduleFilter} onValueChange={setModuleFilter}>
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue placeholder="Semua Modul" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Modul</SelectItem>
                                    {uniqueModules.map(module => (
                                        <SelectItem key={module} value={module}>{module}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Aksi</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Modul</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground min-w-[200px]">Deskripsi</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Pengguna</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">IP Address</th>
                                        <th className="text-right p-3 font-medium text-muted-foreground">Waktu</th>
                                        <th className="text-center p-3 font-medium text-muted-foreground w-[60px]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {isLoading && !logs.length ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center">
                                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                    Memuat data log...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                                {logs.length === 0 ? 'Belum ada aktivitas tercatat.' : 'Tidak ada log yang sesuai filter.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log) => {
                                            const config = getActionConfig(log.action)
                                            const ActionIcon = config.icon
                                            const ModuleIcon = getModuleIcon(log.module)
                                            const time = formatTimestamp(log.timestamp)

                                            return (
                                                <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-3">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "font-medium border",
                                                                config.bgColor,
                                                                config.color
                                                            )}
                                                        >
                                                            <ActionIcon className="h-3 w-3 mr-1" />
                                                            {log.action}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <ModuleIcon className="h-4 w-4" />
                                                            <span>{log.module}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="max-w-[300px] truncate" title={log.description}>
                                                            {log.description}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <User className="h-3.5 w-3.5 text-primary" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-sm">{log.userName || 'System'}</span>
                                                                {log.userRole && (
                                                                    <span className="text-xs text-muted-foreground">{log.userRole}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <Globe className="h-3.5 w-3.5" />
                                                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.ip || 'N/A'}</code>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs text-muted-foreground">{time.relative}</span>
                                                            <span className="text-xs text-muted-foreground/70">{time.time}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => setSelectedLog(log)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filteredLogs.length > 0 && (
                            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
                                Menampilkan {filteredLogs.length} dari {logs.length} log
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Detail Log Keamanan
                        </DialogTitle>
                        <DialogDescription>
                            Informasi lengkap aktivitas yang tercatat
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4 py-2">
                            {/* Action Badge */}
                            <div className="flex items-center justify-between">
                                {(() => {
                                    const config = getActionConfig(selectedLog.action)
                                    const ActionIcon = config.icon
                                    return (
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "font-medium border text-sm px-3 py-1",
                                                config.bgColor,
                                                config.color
                                            )}
                                        >
                                            <ActionIcon className="h-3.5 w-3.5 mr-1.5" />
                                            {selectedLog.action}
                                        </Badge>
                                    )
                                })()}
                                <span className="text-sm text-muted-foreground">{selectedLog.module}</span>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deskripsi</label>
                                <p className="text-sm bg-muted/50 p-3 rounded-md">{selectedLog.description}</p>
                            </div>

                            {/* User Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                        <User className="h-3 w-3" /> Pengguna
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{selectedLog.userName || 'System'}</p>
                                            {selectedLog.userRole && (
                                                <Badge variant="secondary" className="text-xs mt-0.5">{selectedLog.userRole}</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                        <Globe className="h-3 w-3" /> IP Address
                                    </label>
                                    <code className="text-sm bg-muted px-2 py-1 rounded block">{selectedLog.ip || 'N/A'}</code>
                                </div>
                            </div>

                            {/* Timestamp */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Waktu
                                </label>
                                {(() => {
                                    const time = formatTimestamp(selectedLog.timestamp)
                                    return (
                                        <p className="text-sm">
                                            {time.date} pukul {time.time}
                                            <span className="text-muted-foreground ml-2">({time.relative})</span>
                                        </p>
                                    )
                                })()}
                            </div>

                            {/* Additional Details */}
                            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Detail Tambahan
                                    </label>
                                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
