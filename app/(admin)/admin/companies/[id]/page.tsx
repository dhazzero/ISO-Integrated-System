"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Building2, ArrowLeft, Save, Key, CreditCard, FileText,
    Copy, RotateCcw, XCircle, Check, Plus, RefreshCw,
    Calendar, Users, Database, Settings, Shield, Edit, Trash2
} from "lucide-react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface Company {
    _id: string;
    code: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    status: 'active' | 'inactive' | 'suspended';
    databaseName: string;
    subscription?: {
        plan: string;
        expiresAt: string;
    };
    createdAt: string;
}

interface License {
    _id: string;
    licenseKey: string;
    planName: string;
    status: 'active' | 'pending' | 'expired' | 'revoked';
    expiresAt: string;
    createdAt: string;
}

interface Invoice {
    _id: string;
    invoiceNumber: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    dueDate: string;
    createdAt: string;
}

export default function CompanyDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const companyId = params.id as string

    const [company, setCompany] = useState<Company | null>(null)
    const [licenses, setLicenses] = useState<License[]>([])
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("info")

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        status: 'active' as Company['status'],
    })

    // License dialog
    const [isLicenseDialogOpen, setIsLicenseDialogOpen] = useState(false)
    const [licenseForm, setLicenseForm] = useState({ planName: 'basic', duration: 365 })

    // Permission matrix state
    interface PermissionMatrix {
        canView: string[];
        canEdit: string[];
        canDelete: string[];
        canUpload: string[];
        canViewAudit: string[];
        canAccessSettings: string[];
    }
    interface RoleInfo { id: string; name: string; description: string; }

    const [permissions, setPermissions] = useState<PermissionMatrix>({
        canView: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager', 'staff', 'user'],
        canEdit: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'],
        canDelete: ['superuser'],
        canUpload: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'],
        canViewAudit: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'],
        canAccessSettings: ['superuser', 'admin', 'administrator'],
    })
    const [availableRoles, setAvailableRoles] = useState<RoleInfo[]>([])
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false)
    const [isSavingPermissions, setIsSavingPermissions] = useState(false)
    const [hasCustomConfig, setHasCustomConfig] = useState(false)

    // Role dialog state
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<RoleInfo | null>(null)
    const [roleForm, setRoleForm] = useState({ id: '', name: '', description: '' })

    // Fetch permissions when tab is active
    const fetchPermissions = async () => {
        setIsLoadingPermissions(true)
        try {
            const res = await fetch(`/api/admin/companies/${companyId}/permissions`)
            if (res.ok) {
                const data = await res.json()
                setPermissions(data.permissions)
                setAvailableRoles(data.roles || [])
                setHasCustomConfig(data.hasCustomConfig || false)
            }
        } catch (error) {
            console.error('Failed to fetch permissions:', error)
        } finally {
            setIsLoadingPermissions(false)
        }
    }

    const savePermissions = async () => {
        setIsSavingPermissions(true)
        try {
            const res = await fetch(`/api/admin/companies/${companyId}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions, roles: availableRoles })
            })
            if (res.ok) {
                toast({ title: "Berhasil", description: "Konfigurasi disimpan" })
                setHasCustomConfig(true)
            }
        } catch (error) {
            toast({ title: "Error", description: "Gagal menyimpan", variant: "destructive" })
        } finally {
            setIsSavingPermissions(false)
        }
    }

    const resetPermissions = async () => {
        if (!confirm('Reset ke default permissions dan roles?')) return
        try {
            const res = await fetch(`/api/admin/companies/${companyId}/permissions`, { method: 'POST' })
            if (res.ok) {
                const data = await res.json()
                setPermissions(data.permissions)
                setAvailableRoles(data.roles || [])
                setHasCustomConfig(false)
                toast({ title: "Berhasil", description: "Konfigurasi di-reset ke default" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Gagal reset", variant: "destructive" })
        }
    }

    const togglePermission = (permissionKey: keyof PermissionMatrix, role: string) => {
        setPermissions(prev => {
            const current = prev[permissionKey]
            if (current.includes(role)) {
                return { ...prev, [permissionKey]: current.filter(r => r !== role) }
            } else {
                return { ...prev, [permissionKey]: [...current, role] }
            }
        })
    }

    // Role management functions
    const openAddRoleDialog = () => {
        setEditingRole(null)
        setRoleForm({ id: '', name: '', description: '' })
        setIsRoleDialogOpen(true)
    }

    const openEditRoleDialog = (role: RoleInfo) => {
        setEditingRole(role)
        setRoleForm({ id: role.id, name: role.name, description: role.description })
        setIsRoleDialogOpen(true)
    }

    const handleSaveRole = () => {
        if (!roleForm.id || !roleForm.name) {
            toast({ title: "Error", description: "ID dan Nama role wajib diisi", variant: "destructive" })
            return
        }

        // Convert ID to lowercase and replace spaces with underscores
        const normalizedId = roleForm.id.toLowerCase().replace(/\s+/g, '_')

        if (editingRole) {
            // Editing existing role
            setAvailableRoles(prev => prev.map(r =>
                r.id === editingRole.id ? { ...roleForm, id: normalizedId } : r
            ))
            // Update permissions if role ID changed
            if (editingRole.id !== normalizedId) {
                setPermissions(prev => {
                    const updated = { ...prev }
                    Object.keys(updated).forEach(key => {
                        const k = key as keyof PermissionMatrix
                        if (updated[k].includes(editingRole.id)) {
                            updated[k] = updated[k].map(r => r === editingRole.id ? normalizedId : r)
                        }
                    })
                    return updated
                })
            }
        } else {
            // Adding new role
            if (availableRoles.some(r => r.id === normalizedId)) {
                toast({ title: "Error", description: "Role ID sudah ada", variant: "destructive" })
                return
            }
            setAvailableRoles(prev => [...prev, { ...roleForm, id: normalizedId }])
        }

        setIsRoleDialogOpen(false)
        toast({ title: "Berhasil", description: editingRole ? "Role diperbarui" : "Role ditambahkan" })
    }

    const handleDeleteRole = (roleId: string) => {
        if (!confirm(`Hapus role "${roleId}"? Ini akan menghapus role dari semua permissions.`)) return

        setAvailableRoles(prev => prev.filter(r => r.id !== roleId))
        // Remove role from all permissions
        setPermissions(prev => {
            const updated = { ...prev }
            Object.keys(updated).forEach(key => {
                const k = key as keyof PermissionMatrix
                updated[k] = updated[k].filter(r => r !== roleId)
            })
            return updated
        })
        toast({ title: "Berhasil", description: "Role dihapus" })
    }

    useEffect(() => {
        if (activeTab === 'permissions' && availableRoles.length === 0) {
            fetchPermissions()
        }
    }, [activeTab])

    const fetchCompany = async () => {
        try {
            const res = await fetch(`/api/admin/companies/${companyId}`)
            if (res.ok) {
                const data = await res.json()
                setCompany(data.company)
                setFormData({
                    name: data.company.name || '',
                    address: data.company.address || '',
                    phone: data.company.phone || '',
                    email: data.company.email || '',
                    status: data.company.status || 'active',
                })
                setLicenses(data.licenses || [])
                setInvoices(data.invoices || [])
            }
        } catch (error) {
            console.error('Failed to fetch company:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCompany()
    }, [companyId])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/admin/companies/${companyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                toast({ title: "Berhasil", description: "Data perusahaan disimpan" })
                fetchCompany()
            }
        } catch (error) {
            toast({ title: "Error", description: "Gagal menyimpan", variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    const generateLicenseKey = (code: string) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const segments = []
        for (let i = 0; i < 4; i++) {
            let segment = ''
            for (let j = 0; j < 4; j++) {
                segment += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            segments.push(segment)
        }
        return `ISO-${code}-${new Date().getFullYear()}-${segments.join('-')}`
    }

    const handleGenerateLicense = () => {
        if (!company) return
        const newLicense: License = {
            _id: Date.now().toString(),
            licenseKey: generateLicenseKey(company.code),
            planName: licenseForm.planName,
            status: 'pending',
            expiresAt: new Date(Date.now() + licenseForm.duration * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
        }
        setLicenses([newLicense, ...licenses])
        setIsLicenseDialogOpen(false)
        toast({ title: "Berhasil", description: "License key dibuat" })
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({ title: "Copied", description: "License key disalin" })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!company) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Perusahaan tidak ditemukan</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/companies')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/admin/companies')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{company.name}</h1>
                            <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                                {company.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">Kode: {company.code}</p>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="info" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Informasi
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Permissions
                    </TabsTrigger>
                    <TabsTrigger value="subscription" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Langganan
                    </TabsTrigger>
                    <TabsTrigger value="licenses" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Lisensi
                    </TabsTrigger>
                    <TabsTrigger value="invoices" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Invoice
                    </TabsTrigger>
                </TabsList>

                {/* Company Info Tab */}
                <TabsContent value="info" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Perusahaan</CardTitle>
                            <CardDescription>Edit detail perusahaan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nama Perusahaan</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Company['status'] })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Alamat</Label>
                                <Input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Telepon</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-end">
                                <Button onClick={handleSave} disabled={isSaving}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Technical Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Teknis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Database:</span>
                                    <code className="bg-muted px-2 py-0.5 rounded">{company.databaseName}</code>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Dibuat:</span>
                                    <span>{formatDate(company.createdAt)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium">Permission Matrix & Roles</h3>
                            <p className="text-sm text-muted-foreground">
                                {hasCustomConfig ? 'Custom configuration' : 'Using default configuration'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={openAddRoleDialog}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Role
                            </Button>
                            {hasCustomConfig && (
                                <Button variant="outline" size="sm" onClick={resetPermissions}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset Default
                                </Button>
                            )}
                            <Button onClick={savePermissions} disabled={isSavingPermissions}>
                                <Save className="h-4 w-4 mr-2" />
                                {isSavingPermissions ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            {isLoadingPermissions ? (
                                <div className="p-8 text-center">
                                    <RefreshCw className="h-6 w-6 animate-spin inline mr-2" />
                                    Memuat permissions...
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="text-left p-4 font-medium">Role</th>
                                                <th className="text-center p-4 font-medium">View</th>
                                                <th className="text-center p-4 font-medium">Edit</th>
                                                <th className="text-center p-4 font-medium">Delete</th>
                                                <th className="text-center p-4 font-medium">Upload</th>
                                                <th className="text-center p-4 font-medium">Audit</th>
                                                <th className="text-center p-4 font-medium">Settings</th>
                                                <th className="text-center p-4 font-medium">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {availableRoles.map((role) => (
                                                <tr key={role.id} className="hover:bg-muted/30">
                                                    <td className="p-4">
                                                        <div className="font-medium">{role.name}</div>
                                                        <div className="text-xs text-muted-foreground">{role.description}</div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded"
                                                            checked={permissions.canView.includes(role.id)}
                                                            onChange={() => togglePermission('canView', role.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded"
                                                            checked={permissions.canEdit.includes(role.id)}
                                                            onChange={() => togglePermission('canEdit', role.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded"
                                                            checked={permissions.canDelete.includes(role.id)}
                                                            onChange={() => togglePermission('canDelete', role.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded"
                                                            checked={permissions.canUpload.includes(role.id)}
                                                            onChange={() => togglePermission('canUpload', role.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded"
                                                            checked={permissions.canViewAudit.includes(role.id)}
                                                            onChange={() => togglePermission('canViewAudit', role.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded"
                                                            checked={permissions.canAccessSettings.includes(role.id)}
                                                            onChange={() => togglePermission('canAccessSettings', role.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => openEditRoleDialog(role)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)}>
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Keterangan Permission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div><strong>View:</strong> Lihat dokumen</div>
                                <div><strong>Edit:</strong> Edit dokumen</div>
                                <div><strong>Delete:</strong> Hapus dokumen</div>
                                <div><strong>Upload:</strong> Upload dokumen baru</div>
                                <div><strong>Audit:</strong> Akses tab audit</div>
                                <div><strong>Settings:</strong> Akses pengaturan</div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Subscription Tab */}
                <TabsContent value="subscription" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Langganan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium text-lg">
                                        {company.subscription?.plan || 'Basic'} Plan
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Berlaku hingga: {company.subscription?.expiresAt
                                            ? formatDate(company.subscription.expiresAt)
                                            : 'Lifetime'}
                                    </p>
                                </div>
                                <Badge variant="default">Active</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Upgrade Plan</CardTitle>
                            <CardDescription>Pilih paket langganan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                {['Basic', 'Professional', 'Enterprise'].map((plan) => (
                                    <div key={plan} className={`p-4 border rounded-lg cursor-pointer hover:border-primary ${company.subscription?.plan === plan.toLowerCase() ? 'border-primary bg-primary/5' : ''
                                        }`}>
                                        <h3 className="font-medium">{plan}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {plan === 'Basic' && 'Rp 500.000/bulan'}
                                            {plan === 'Professional' && 'Rp 1.500.000/bulan'}
                                            {plan === 'Enterprise' && 'Rp 5.000.000/bulan'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Licenses Tab */}
                <TabsContent value="licenses" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setIsLicenseDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Generate License
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {licenses.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        Belum ada lisensi
                                    </div>
                                ) : (
                                    licenses.map((license) => (
                                        <div key={license._id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Key className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {license.licenseKey}
                                                    </code>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {license.planName} • Expires: {formatDate(license.expiresAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={license.status === 'active' ? 'default' : 'secondary'}>
                                                    {license.status}
                                                </Badge>
                                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(license.licenseKey)}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Invoices Tab */}
                <TabsContent value="invoices" className="space-y-4">
                    <div className="flex justify-end">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Buat Invoice
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="text-left p-4 font-medium">No. Invoice</th>
                                            <th className="text-right p-4 font-medium">Amount</th>
                                            <th className="text-left p-4 font-medium">Status</th>
                                            <th className="text-left p-4 font-medium">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {invoices.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                                    Belum ada invoice
                                                </td>
                                            </tr>
                                        ) : (
                                            invoices.map((invoice) => (
                                                <tr key={invoice._id} className="hover:bg-muted/30">
                                                    <td className="p-4 font-mono">{invoice.invoiceNumber}</td>
                                                    <td className="p-4 text-right font-medium">{formatCurrency(invoice.amount)}</td>
                                                    <td className="p-4">
                                                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                                            {invoice.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground">{formatDate(invoice.dueDate)}</td>
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

            {/* Generate License Dialog */}
            <Dialog open={isLicenseDialogOpen} onOpenChange={setIsLicenseDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate License Key</DialogTitle>
                        <DialogDescription>Buat license key baru untuk {company.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Plan</Label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={licenseForm.planName}
                                onChange={(e) => setLicenseForm({ ...licenseForm, planName: e.target.value })}
                            >
                                <option value="basic">Basic</option>
                                <option value="professional">Professional</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (days)</Label>
                            <Input
                                type="number"
                                value={licenseForm.duration}
                                onChange={(e) => setLicenseForm({ ...licenseForm, duration: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLicenseDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleGenerateLicense}>
                            <Key className="h-4 w-4 mr-2" />
                            Generate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Role Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Edit Role' : 'Tambah Role Baru'}</DialogTitle>
                        <DialogDescription>
                            {editingRole ? 'Ubah informasi role' : 'Buat role baru untuk perusahaan ini'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Role ID *</Label>
                            <Input
                                placeholder="contoh: hse_manager"
                                value={roleForm.id}
                                onChange={(e) => setRoleForm({ ...roleForm, id: e.target.value })}
                                disabled={!!editingRole}
                                className="lowercase"
                            />
                            <p className="text-xs text-muted-foreground">
                                ID unik untuk role (huruf kecil, underscore untuk spasi)
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Role *</Label>
                            <Input
                                placeholder="contoh: HSE Manager"
                                value={roleForm.name}
                                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Deskripsi</Label>
                            <Input
                                placeholder="Deskripsi singkat tentang role ini"
                                value={roleForm.description}
                                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSaveRole}>
                            <Save className="h-4 w-4 mr-2" />
                            {editingRole ? 'Simpan' : 'Tambah'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
