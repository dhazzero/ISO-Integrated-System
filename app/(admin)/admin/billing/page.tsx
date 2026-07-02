"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CreditCard, TrendingUp, Users, FileText,
    DollarSign, ArrowUpRight, ArrowDownRight,
    Calendar, Building2
} from "lucide-react"
import { useEffect, useState } from "react"

interface BillingStats {
    totalRevenue: number;
    activeSubscriptions: number;
    pendingInvoices: number;
    expiringSoon: number;
}

export default function BillingOverviewPage() {
    const [stats, setStats] = useState<BillingStats>({
        totalRevenue: 0,
        activeSubscriptions: 0,
        pendingInvoices: 0,
        expiringSoon: 0,
    })
    const [recentInvoices, setRecentInvoices] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/billing/stats')
                if (res.ok) {
                    const data = await res.json()
                    setStats(data.stats || stats)
                    setRecentInvoices(data.recentInvoices || [])
                }
            } catch (error) {
                console.error('Failed to fetch billing stats:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Billing & Lisensi</h1>
                    <p className="text-muted-foreground">Overview pendapatan dan langganan</p>
                </div>
                <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Export Laporan
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : formatCurrency(stats.totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                            +12% dari bulan lalu
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : stats.activeSubscriptions}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Perusahaan aktif
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            {isLoading ? '...' : stats.pendingInvoices}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Menunggu pembayaran
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {isLoading ? '...' : stats.expiringSoon}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Dalam 30 hari
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-4">
                <a href="/admin/billing/plans" className="block">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium">Subscription Plans</p>
                                <p className="text-sm text-muted-foreground">Kelola paket</p>
                            </div>
                        </CardContent>
                    </Card>
                </a>
                <a href="/admin/billing/invoices" className="block">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium">Invoices</p>
                                <p className="text-sm text-muted-foreground">Lihat tagihan</p>
                            </div>
                        </CardContent>
                    </Card>
                </a>
                <a href="/admin/billing/licenses" className="block">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium">Licenses</p>
                                <p className="text-sm text-muted-foreground">Kelola lisensi</p>
                            </div>
                        </CardContent>
                    </Card>
                </a>
                <a href="/admin/billing/payments" className="block">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium">Payments</p>
                                <p className="text-sm text-muted-foreground">Metode bayar</p>
                            </div>
                        </CardContent>
                    </Card>
                </a>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Terbaru</CardTitle>
                    <CardDescription>5 invoice terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentInvoices.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Belum ada invoice
                            </p>
                        ) : (
                            recentInvoices.map((invoice, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{invoice.companyName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {invoice.invoiceNumber}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                            {invoice.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
