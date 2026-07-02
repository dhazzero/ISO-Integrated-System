"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface LogEntry {
    _id: string;
    action: string;
    description: string;
    userName: string;
    timestamp: string;
    ip?: string;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchLogs = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/logs')
            if (res.ok) {
                const data = await res.json()
                setLogs(data.logs || [])
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Activity Logs</h1>
                    <p className="text-muted-foreground">Log aktivitas super admin</p>
                </div>
                <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                                            Memuat...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            Belum ada log
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-muted/30">
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(log.timestamp).toLocaleString('id-ID')}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline">{log.action}</Badge>
                                            </td>
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
        </div>
    )
}
