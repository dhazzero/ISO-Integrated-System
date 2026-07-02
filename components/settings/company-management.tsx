"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Building2, Plus, Edit, Trash2, RefreshCw, Database } from "lucide-react"
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
        plan: 'basic' | 'professional' | 'enterprise';
        expiresAt: string;
    };
    createdAt: string;
}

interface CompanyManagementProps {
    isSuperAdmin: boolean;
}

export function CompanyManagement({ isSuperAdmin }: CompanyManagementProps) {
    const [companies, setCompanies] = useState<Company[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingCompany, setEditingCompany] = useState<Company | null>(null)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        status: 'active' as 'active' | 'inactive' | 'suspended',
    })
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

    const fetchCompanies = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/companies')
            if (res.ok) {
                const data = await res.json()
                setCompanies(data.companies || [])
            } else {
                throw new Error('Failed to fetch')
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Gagal mengambil data perusahaan",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isSuperAdmin) {
            fetchCompanies()
        }
    }, [isSuperAdmin])

    const handleAdd = async () => {
        if (!formData.code || !formData.name) {
            toast({
                title: "Error",
                description: "Kode dan nama perusahaan wajib diisi",
                variant: "destructive"
            })
            return
        }

        setIsSaving(true)
        try {
            const res = await fetch('/api/admin/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast({
                    title: "Berhasil",
                    description: "Perusahaan berhasil ditambahkan"
                })
                setIsAddOpen(false)
                setFormData({ code: '', name: '', address: '', phone: '', email: '', status: 'active' })
                fetchCompanies()
            } else {
                const data = await res.json()
                throw new Error(data.message || 'Failed')
            }
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = async () => {
        if (!editingCompany) return

        setIsSaving(true)
        try {
            const res = await fetch(`/api/admin/companies/${editingCompany._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    address: formData.address,
                    phone: formData.phone,
                    email: formData.email,
                    status: formData.status,
                })
            })

            if (res.ok) {
                toast({
                    title: "Berhasil",
                    description: "Perusahaan berhasil diperbarui"
                })
                setIsEditOpen(false)
                setEditingCompany(null)
                fetchCompanies()
            } else {
                const data = await res.json()
                throw new Error(data.message || 'Failed')
            }
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (company: Company) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus perusahaan "${company.name}"?`)) return

        try {
            const res = await fetch(`/api/admin/companies/${company._id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                toast({
                    title: "Berhasil",
                    description: "Perusahaan berhasil dihapus"
                })
                fetchCompanies()
            } else {
                throw new Error('Failed')
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Gagal menghapus perusahaan",
                variant: "destructive"
            })
        }
    }

    const openEditDialog = (company: Company) => {
        setEditingCompany(company)
        setFormData({
            code: company.code,
            name: company.name,
            address: company.address || '',
            phone: company.phone || '',
            email: company.email || '',
            status: company.status,
        })
        setIsEditOpen(true)
    }

    if (!isSuperAdmin) {
        return null
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Manajemen Perusahaan
                            </CardTitle>
                            <CardDescription>
                                Kelola perusahaan yang terdaftar dalam sistem (Super Admin only)
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={fetchCompanies} disabled={isLoading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button onClick={() => {
                                setFormData({ code: '', name: '', address: '', phone: '', email: '', status: 'active' })
                                setIsAddOpen(true)
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Perusahaan
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left p-3 font-medium">Kode</th>
                                    <th className="text-left p-3 font-medium">Nama Perusahaan</th>
                                    <th className="text-left p-3 font-medium">Database</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-right p-3 font-medium">Aksi</th>
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
                                ) : companies.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            Belum ada perusahaan terdaftar
                                        </td>
                                    </tr>
                                ) : (
                                    companies.map((company) => (
                                        <tr key={company._id} className="hover:bg-muted/30">
                                            <td className="p-3">
                                                <Badge variant="outline" className="font-mono">
                                                    {company.code}
                                                </Badge>
                                            </td>
                                            <td className="p-3 font-medium">{company.name}</td>
                                            <td className="p-3">
                                                <code className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1 w-fit">
                                                    <Database className="h-3 w-3" />
                                                    {company.databaseName}
                                                </code>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={
                                                    company.status === 'active' ? 'default' :
                                                        company.status === 'inactive' ? 'secondary' : 'destructive'
                                                }>
                                                    {company.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(company)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(company)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
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

            {/* Add Company Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Perusahaan Baru</DialogTitle>
                        <DialogDescription>
                            Buat perusahaan baru dengan database terpisah
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode Perusahaan *</Label>
                                <Input
                                    id="code"
                                    placeholder="PBB"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="uppercase"
                                    maxLength={10}
                                />
                                <p className="text-xs text-muted-foreground">2-10 karakter alfanumerik</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Perusahaan *</Label>
                            <Input
                                id="name"
                                placeholder="PT. Contoh Indonesia"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="info@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telepon</Label>
                            <Input
                                id="phone"
                                placeholder="+62 21 1234 5678"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
                        <Button onClick={handleAdd} disabled={isSaving}>
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Company Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Perusahaan: {editingCompany?.code}</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi perusahaan
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Perusahaan</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Telepon</Label>
                            <Input
                                id="edit-phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                        <Button onClick={handleEdit} disabled={isSaving}>
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
