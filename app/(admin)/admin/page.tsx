"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Activity, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface DashboardStats {
    totalCompanies: number;
    activeCompanies: number;
    totalSuperAdmins: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalCompanies: 0,
        activeCompanies: 0,
        totalSuperAdmins: 0,
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats')
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard Super Admin</h1>
                <p className="text-muted-foreground">Kelola sistem multi-tenant ISO Integrated</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Perusahaan</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : stats.totalCompanies}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeCompanies} aktif
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Super Admin Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : stats.totalSuperAdmins}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Administrator sistem
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aktivitas Hari Ini</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">
                            Login & aktivitas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status Sistem</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Online</div>
                        <p className="text-xs text-muted-foreground">
                            Semua layanan aktif
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Aksi Cepat</CardTitle>
                    <CardDescription>
                        Kelola perusahaan dan pengaturan sistem
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <a
                        href="/admin/companies"
                        className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors"
                    >
                        <Building2 className="h-8 w-8 text-primary" />
                        <div>
                            <h3 className="font-medium">Kelola Perusahaan</h3>
                            <p className="text-sm text-muted-foreground">Tambah, edit, hapus perusahaan</p>
                        </div>
                    </a>
                    <a
                        href="/admin/users"
                        className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors"
                    >
                        <Users className="h-8 w-8 text-primary" />
                        <div>
                            <h3 className="font-medium">Super Admin Users</h3>
                            <p className="text-sm text-muted-foreground">Kelola akun super admin</p>
                        </div>
                    </a>
                    <a
                        href="/admin/logs"
                        className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors"
                    >
                        <Activity className="h-8 w-8 text-primary" />
                        <div>
                            <h3 className="font-medium">Activity Logs</h3>
                            <p className="text-sm text-muted-foreground">Lihat log aktivitas sistem</p>
                        </div>
                    </a>
                </CardContent>
            </Card>
        </div>
    )
}
