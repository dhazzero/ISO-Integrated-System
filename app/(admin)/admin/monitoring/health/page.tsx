"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Heart, Server, Database, HardDrive, Cpu, MemoryStick,
    Activity, RefreshCw, CheckCircle, AlertCircle, XCircle,
    Clock, Wifi, Globe
} from "lucide-react"
import { useEffect, useState } from "react"

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

export default function SystemHealthPage() {
    const [services, setServices] = useState<ServiceStatus[]>([
        { name: 'API Server', status: 'healthy', latency: 45, uptime: '99.9%', lastCheck: new Date().toISOString() },
        { name: 'MongoDB', status: 'healthy', latency: 12, uptime: '99.99%', lastCheck: new Date().toISOString() },
        { name: 'Authentication', status: 'healthy', latency: 23, lastCheck: new Date().toISOString() },
        { name: 'File Storage', status: 'warning', latency: 156, uptime: '98.5%', lastCheck: new Date().toISOString() },
        { name: 'Email Service', status: 'error', lastCheck: new Date().toISOString() },
        { name: 'Background Jobs', status: 'healthy', latency: 5, lastCheck: new Date().toISOString() },
    ])

    const [metrics, setMetrics] = useState<SystemMetrics>({
        cpu: 35,
        memory: 62,
        disk: 48,
        connections: 24,
    })

    const [isRefreshing, setIsRefreshing] = useState(false)

    const refreshHealth = async () => {
        setIsRefreshing(true)
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
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        // Auto-refresh every 30 seconds
        const interval = setInterval(refreshHealth, 30000)
        return () => clearInterval(interval)
    }, [])

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
            healthy: 'default',
            warning: 'secondary',
            error: 'destructive',
            unknown: 'outline',
        }
        return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>
    }

    const overallHealth = services.every(s => s.status === 'healthy')
        ? 'healthy'
        : services.some(s => s.status === 'error')
            ? 'error'
            : 'warning'

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">System Health</h1>
                    <p className="text-muted-foreground">Monitor status dan performa sistem</p>
                </div>
                <Button onClick={refreshHealth} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                                    overallHealth === 'error' ? 'System Issues Detected' :
                                        'Some Services Degraded'}
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
                            <Cpu className="h-4 w-4" />
                            CPU Usage
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
                            <MemoryStick className="h-4 w-4" />
                            Memory Usage
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
                            <HardDrive className="h-4 w-4" />
                            Disk Usage
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
                            <Wifi className="h-4 w-4" />
                            Active Connections
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
                    <CardDescription>Status setiap komponen sistem</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {services.map((service, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(service.status)}
                                    <div>
                                        <p className="font-medium">{service.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Last checked: {new Date(service.lastCheck).toLocaleTimeString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {service.latency && (
                                        <span className="text-sm text-muted-foreground">
                                            {service.latency}ms
                                        </span>
                                    )}
                                    {service.uptime && (
                                        <span className="text-sm text-muted-foreground">
                                            Uptime: {service.uptime}
                                        </span>
                                    )}
                                    {getStatusBadge(service.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
