"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Label } from "@/components/ui/label"
import { Key, RefreshCw, Search, Plus, Copy, RotateCcw, XCircle, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface License {
    _id: string;
    licenseKey: string;
    companyCode: string;
    companyName: string;
    planName: string;
    status: 'active' | 'expired' | 'revoked' | 'pending';
    activatedAt?: string;
    expiresAt: string;
    createdAt: string;
}

const sampleLicenses: License[] = [
    {
        _id: '1',
        licenseKey: 'ISO-PBB-2026-XXXX-YYYY-ZZZZ',
        companyCode: 'PBB',
        companyName: 'PT. Pelindo Bersaudara Bahari',
        planName: 'Enterprise',
        status: 'active',
        activatedAt: '2026-01-01',
        expiresAt: '2027-01-01',
        createdAt: '2025-12-15',
    },
]

export default function LicenseManagementPage() {
    const [licenses, setLicenses] = useState<License[]>(sampleLicenses)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [isGenerateOpen, setIsGenerateOpen] = useState(false)
    const [generateForm, setGenerateForm] = useState({
        companyCode: '',
        planName: 'basic',
        duration: 365,
    })
    const { toast } = useToast()

    const fetchLicenses = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/billing/licenses')
            if (res.ok) {
                const data = await res.json()
                if (data.licenses && data.licenses.length > 0) {
                    setLicenses(data.licenses)
                }
            }
        } catch (error) {
            console.error('Failed to fetch licenses:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLicenses()
    }, [])

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            pending: 'secondary',
            expired: 'destructive',
            revoked: 'outline',
        }
        return <Badge variant={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>
    }

    const generateLicenseKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const segments = []
        for (let i = 0; i < 4; i++) {
            let segment = ''
            for (let j = 0; j < 4; j++) {
                segment += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            segments.push(segment)
        }
        return `ISO-${generateForm.companyCode.toUpperCase()}-${new Date().getFullYear()}-${segments.join('-')}`
    }

    const handleGenerate = () => {
        if (!generateForm.companyCode) {
            toast({ title: "Error", description: "Company code wajib diisi", variant: "destructive" })
            return
        }
        const newLicense: License = {
            _id: Date.now().toString(),
            licenseKey: generateLicenseKey(),
            companyCode: generateForm.companyCode.toUpperCase(),
            companyName: `Company ${generateForm.companyCode.toUpperCase()}`,
            planName: generateForm.planName,
            status: 'pending',
            expiresAt: new Date(Date.now() + generateForm.duration * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
        }
        setLicenses([newLicense, ...licenses])
        setIsGenerateOpen(false)
        toast({ title: "Berhasil", description: "License key berhasil dibuat" })
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({ title: "Copied", description: "License key disalin ke clipboard" })
    }

    const handleRenew = (license: License) => {
        setLicenses(licenses.map(l =>
            l._id === license._id
                ? { ...l, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' as const }
                : l
        ))
        toast({ title: "Berhasil", description: "License diperpanjang 1 tahun" })
    }

    const handleRevoke = (license: License) => {
        if (!confirm(`Revoke license ${license.licenseKey}?`)) return
        setLicenses(licenses.map(l =>
            l._id === license._id
                ? { ...l, status: 'revoked' as const }
                : l
        ))
        toast({ title: "Berhasil", description: "License direvoke" })
    }

    const filteredLicenses = licenses.filter(lic =>
        lic.licenseKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lic.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lic.companyCode.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">License Management</h1>
                    <p className="text-muted-foreground">Generate, renew, dan revoke license keys</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchLicenses} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => setIsGenerateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate License
                    </Button>
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari license key atau perusahaan..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Licenses Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left p-4 font-medium">License Key</th>
                                    <th className="text-left p-4 font-medium">Perusahaan</th>
                                    <th className="text-left p-4 font-medium">Plan</th>
                                    <th className="text-left p-4 font-medium">Status</th>
                                    <th className="text-left p-4 font-medium">Expires</th>
                                    <th className="text-right p-4 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                                            Memuat...
                                        </td>
                                    </tr>
                                ) : filteredLicenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            Tidak ada license
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLicenses.map((license) => (
                                        <tr key={license._id} className="hover:bg-muted/30">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Key className="h-4 w-4 text-muted-foreground" />
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {license.licenseKey}
                                                    </code>
                                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(license.licenseKey)}>
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium">{license.companyName}</div>
                                                    <div className="text-sm text-muted-foreground">{license.companyCode}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">{license.planName}</td>
                                            <td className="p-4">{getStatusBadge(license.status)}</td>
                                            <td className="p-4 text-muted-foreground">{formatDate(license.expiresAt)}</td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-1">
                                                    {license.status !== 'revoked' && (
                                                        <>
                                                            <Button variant="ghost" size="sm" title="Renew" onClick={() => handleRenew(license)}>
                                                                <RotateCcw className="h-4 w-4 text-green-600" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" title="Revoke" onClick={() => handleRevoke(license)}>
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </>
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

            {/* Generate Dialog */}
            <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate License Key</DialogTitle>
                        <DialogDescription>Buat license key baru untuk perusahaan</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Company Code</Label>
                            <Input
                                placeholder="PBB"
                                value={generateForm.companyCode}
                                onChange={(e) => setGenerateForm({ ...generateForm, companyCode: e.target.value.toUpperCase() })}
                                className="uppercase"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Plan</Label>
                            <Select value={generateForm.planName} onValueChange={(v) => setGenerateForm({ ...generateForm, planName: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="basic">Basic</SelectItem>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (days)</Label>
                            <Input
                                type="number"
                                value={generateForm.duration}
                                onChange={(e) => setGenerateForm({ ...generateForm, duration: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Batal</Button>
                        <Button onClick={handleGenerate}>
                            <Key className="h-4 w-4 mr-2" />
                            Generate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
