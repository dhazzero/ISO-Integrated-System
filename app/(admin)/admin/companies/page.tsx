"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Building2, Plus, Edit, Trash2, RefreshCw, Database, Eye, KeyRound } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Company {
    _id: string;
    code: string;
    name: string;
    email?: string;
    phone?: string;
    status: 'active' | 'inactive' | 'suspended';
    databaseName: string;
    createdAt: string;
}

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingCompany, setEditingCompany] = useState<Company | null>(null)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        email: '',
        phone: '',
        status: 'active' as 'active' | 'inactive' | 'suspended',
    })
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const fetchCompanies = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/companies')
            if (res.ok) {
                const data = await res.json()
                setCompanies(data.companies || [])
            }
        } catch (error) {
            toast({ title: "Error", description: "Gagal mengambil data", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCompanies()
    }, [])

    const handleAdd = async () => {
        if (!formData.code || !formData.name) {
            toast({ title: "Error", description: "Kode dan nama wajib diisi", variant: "destructive" })
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
                toast({ title: "Berhasil", description: "Perusahaan ditambahkan" })
                setIsAddOpen(false)
                setFormData({ code: '', name: '', email: '', phone: '', status: 'active' })
                fetchCompanies()
            } else {
                const data = await res.json()
                throw new Error(data.message)
            }
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" })
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
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                toast({ title: "Berhasil", description: "Perusahaan diperbarui" })
                setIsEditOpen(false)
                fetchCompanies()
            }
        } catch (error) {
            toast({ title: "Error", description: "Gagal memperbarui", variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (company: Company) => {
        if (!confirm(`Hapus perusahaan "${company.name}"?`)) return
        try {
            const res = await fetch(`/api/admin/companies/${company._id}`, { method: 'DELETE' })
            if (res.ok) {
                toast({ title: "Berhasil", description: "Perusahaan dihapus" })
                fetchCompanies()
            }
        } catch (error) {
            toast({ title: "Error", description: "Gagal menghapus", variant: "destructive" })
        }
    }

    const handleResetAdmin = async (company: Company) => {
        if (!confirm(`Reset password admin untuk "${company.name}"? Password baru: admin123`)) return
        try {
            const res = await fetch(`/api/admin/companies/${company._id}/reset-admin`, { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                toast({ title: "Berhasil", description: data.message })
            } else {
                throw new Error(data.message)
            }
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" })
        }
    }

    const openEditDialog = (company: Company) => {
        setEditingCompany(company)
        setFormData({
            code: company.code,
            name: company.name,
            email: company.email || '',
            phone: company.phone || '',
            status: company.status,
        })
        setIsEditOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen Perusahaan</h1>
                    <p className="text-muted-foreground">Kelola perusahaan yang terdaftar dalam sistem</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchCompanies} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => {
                        setFormData({ code: '', name: '', email: '', phone: '', status: 'active' })
                        setIsAddOpen(true)
                    }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Perusahaan
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left p-4 font-medium">Kode</th>
                                    <th className="text-left p-4 font-medium">Nama</th>
                                    <th className="text-left p-4 font-medium">Database</th>
                                    <th className="text-left p-4 font-medium">Status</th>
                                    <th className="text-left p-4 font-medium">Dibuat</th>
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
                                ) : companies.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            Belum ada perusahaan
                                        </td>
                                    </tr>
                                ) : (
                                    companies.map((company) => (
                                        <tr key={company._id} className="hover:bg-muted/30">
                                            <td className="p-4">
                                                <Badge variant="outline" className="font-mono font-bold">
                                                    {company.code}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium">{company.name}</div>
                                                {company.email && (
                                                    <div className="text-sm text-muted-foreground">{company.email}</div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <code className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1 w-fit">
                                                    <Database className="h-3 w-3" />
                                                    {company.databaseName}
                                                </code>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={
                                                    company.status === 'active' ? 'default' :
                                                        company.status === 'inactive' ? 'secondary' : 'destructive'
                                                }>
                                                    {company.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(company.createdAt).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/companies/${company._id}`)} title="Lihat Detail">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(company)} title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleResetAdmin(company)} title="Reset Admin Password">
                                                        <KeyRound className="h-4 w-4 text-orange-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(company)} title="Hapus">
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

            {/* Add Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Perusahaan Baru</DialogTitle>
                        <DialogDescription>Database baru akan dibuat otomatis</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Kode Perusahaan *</Label>
                                <Input
                                    placeholder="PBB"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="uppercase"
                                    maxLength={10}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Perusahaan *</Label>
                            <Input
                                placeholder="PT. Contoh Indonesia"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="info@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Perusahaan: {editingCompany?.code}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nama Perusahaan</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                        <Button onClick={handleEdit} disabled={isSaving}>
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
