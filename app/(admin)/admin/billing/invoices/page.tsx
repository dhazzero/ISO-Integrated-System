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
import { FileText, RefreshCw, Search, Download, Eye, Send } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface Invoice {
    _id: string;
    invoiceNumber: string;
    companyCode: string;
    companyName: string;
    planName: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    dueDate: string;
    paidAt?: string;
    createdAt: string;
}

const sampleInvoices: Invoice[] = [
    {
        _id: '1',
        invoiceNumber: 'INV-2026-001',
        companyCode: 'PBB',
        companyName: 'PT. Pelindo Bersaudara Bahari',
        planName: 'Enterprise',
        amount: 60000000,
        status: 'paid',
        dueDate: '2026-01-15',
        paidAt: '2026-01-10',
        createdAt: '2026-01-01',
    },
    {
        _id: '2',
        invoiceNumber: 'INV-2026-002',
        companyCode: 'ACME',
        companyName: 'PT. ACME Indonesia',
        planName: 'Professional',
        amount: 18000000,
        status: 'pending',
        dueDate: '2026-01-31',
        createdAt: '2026-01-15',
    },
]

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>(sampleInvoices)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const { toast } = useToast()

    const fetchInvoices = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/billing/invoices')
            if (res.ok) {
                const data = await res.json()
                if (data.invoices && data.invoices.length > 0) {
                    setInvoices(data.invoices)
                }
            }
        } catch (error) {
            console.error('Failed to fetch invoices:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchInvoices()
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            paid: 'default',
            pending: 'secondary',
            overdue: 'destructive',
            cancelled: 'outline',
        }
        return <Badge variant={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>
    }

    const filteredInvoices = invoices.filter(inv => {
        const matchSearch =
            inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.companyName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchStatus = statusFilter === 'all' || inv.status === statusFilter
        return matchSearch && matchStatus
    })

    const handleSendReminder = (invoice: Invoice) => {
        toast({ title: "Reminder Sent", description: `Email reminder terkirim ke ${invoice.companyName}` })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Invoices</h1>
                    <p className="text-muted-foreground">Kelola tagihan dan pembayaran</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchInvoices} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button>
                        <FileText className="h-4 w-4 mr-2" />
                        Buat Invoice
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari invoice atau perusahaan..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left p-4 font-medium">Invoice</th>
                                    <th className="text-left p-4 font-medium">Perusahaan</th>
                                    <th className="text-left p-4 font-medium">Plan</th>
                                    <th className="text-right p-4 font-medium">Amount</th>
                                    <th className="text-left p-4 font-medium">Status</th>
                                    <th className="text-left p-4 font-medium">Due Date</th>
                                    <th className="text-right p-4 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                                            Memuat...
                                        </td>
                                    </tr>
                                ) : filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            Tidak ada invoice
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map((invoice) => (
                                        <tr key={invoice._id} className="hover:bg-muted/30">
                                            <td className="p-4">
                                                <span className="font-mono font-medium">{invoice.invoiceNumber}</span>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium">{invoice.companyName}</div>
                                                    <div className="text-sm text-muted-foreground">{invoice.companyCode}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">{invoice.planName}</td>
                                            <td className="p-4 text-right font-medium">{formatCurrency(invoice.amount)}</td>
                                            <td className="p-4">{getStatusBadge(invoice.status)}</td>
                                            <td className="p-4 text-muted-foreground">{formatDate(invoice.dueDate)}</td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" title="View">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" title="Download">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    {invoice.status === 'pending' && (
                                                        <Button variant="ghost" size="sm" title="Send Reminder" onClick={() => handleSendReminder(invoice)}>
                                                            <Send className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
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
