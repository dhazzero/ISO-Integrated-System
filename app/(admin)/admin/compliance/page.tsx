"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Building2, Settings, CheckCircle2, RefreshCw, Plus, Trash2, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ComplianceFeatures {
    checklist: boolean
    integrated: boolean
    annexA: boolean
    ojk: boolean
    dynamicStandards?: Record<string, boolean>
}

interface Company {
    _id: string
    code: string
    name: string
    status: string
}

interface Standard {
    _id: string
    name: string
    title: string
    description: string
    category: string
    status: string
}

export default function AdminCompliancePage() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
    const [features, setFeatures] = useState<ComplianceFeatures>({
        checklist: true,
        integrated: true,
        annexA: true,
        ojk: true
    })
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [standards, setStandards] = useState<Standard[]>([])
    const [dynamicFeatures, setDynamicFeatures] = useState<Record<string, boolean>>({})
    const [isAddStandardOpen, setIsAddStandardOpen] = useState(false)
    const [newStandard, setNewStandard] = useState({ name: "", title: "", description: "", category: "", status: "Active" })
    const [isSavingStandard, setIsSavingStandard] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        fetchCompanies()
    }, [])

    const fetchCompanies = async () => {
        try {
            const res = await fetch('/api/admin/companies')
            if (res.ok) {
                const data = await res.json()
                setCompanies(data.companies || [])
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengambil daftar perusahaan' })
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCompanyStandards = async (companyCode: string) => {
        try {
            const res = await fetch(`/api/settings/standards?companyCode=${companyCode}`)
            if (res.ok) {
                const data = await res.json()
                setStandards(data)
            }
        } catch (error) {
            console.error('Failed to fetch standards:', error)
        }
    }

    const handleSelectCompany = async (company: Company) => {
        setSelectedCompany(company)
        await fetchCompanyStandards(company.code)
        try {
            const res = await fetch(`/api/settings/system-settings?companyCode=${company.code}`)
            if (res.ok) {
                const data = await res.json()
                if (data.complianceFeatures) {
                    // Merge with defaults to handle any missing properties
                    setFeatures({
                        checklist: true,
                        integrated: true,
                        annexA: true,
                        ojk: true,
                        ...data.complianceFeatures
                    })
                    setDynamicFeatures(data.complianceFeatures.dynamicStandards || {})
                } else {
                    // Default values
                    setFeatures({ checklist: true, integrated: true, annexA: true, ojk: true })
                    setDynamicFeatures({})
                }
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengambil konfigurasi' })
        }
    }

    const handleSave = async () => {
        if (!selectedCompany) return

        setIsSaving(true)
        try {
            const getRes = await fetch(`/api/settings/system-settings?companyCode=${selectedCompany.code}`)
            const currentSettings = await getRes.json()

            const res = await fetch(`/api/settings/system-settings?companyCode=${selectedCompany.code}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...currentSettings,
                    complianceFeatures: {
                        ...features,
                        dynamicStandards: dynamicFeatures
                    }
                })
            })

            if (!res.ok) throw new Error('Failed to save')
            toast({ title: "Berhasil", description: `Konfigurasi untuk ${selectedCompany.name} berhasil disimpan` })
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message })
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddStandard = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCompany || !newStandard.name || !newStandard.title) return
        
        setIsSavingStandard(true)
        try {
            const res = await fetch(`/api/settings/standards?companyCode=${selectedCompany.code}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStandard)
            })
            if (!res.ok) throw new Error('Gagal menambah standar')
            
            const addedStandard = await res.json()
            setStandards(prev => [...prev, addedStandard])
            setDynamicFeatures(prev => ({ ...prev, [addedStandard._id]: true }))
            
            setIsAddStandardOpen(false)
            setNewStandard({ name: "", title: "", description: "", category: "", status: "Active" })
            toast({ title: "Berhasil", description: "Standar baru berhasil ditambahkan ke perusahaan" })
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message })
        } finally {
            setIsSavingStandard(false)
        }
    }

    const handleDeleteStandard = async (id: string) => {
        if (!selectedCompany || !confirm('Yakin ingin menghapus standar ini dari database perusahaan?')) return
        try {
            const res = await fetch(`/api/settings/standards/${id}?companyCode=${selectedCompany.code}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Gagal menghapus standar')
            
            setStandards(prev => prev.filter(s => s._id !== id))
            const newDynamicFeatures = { ...dynamicFeatures }
            delete newDynamicFeatures[id]
            setDynamicFeatures(newDynamicFeatures)
            
            toast({ title: "Berhasil", description: "Standar berhasil dihapus" })
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message })
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Konfigurasi Compliance</h1>
                <p className="text-muted-foreground">Kelola tab compliance yang ditampilkan untuk setiap perusahaan</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Daftar Perusahaan
                        </CardTitle>
                        <CardDescription>Pilih perusahaan untuk mengatur konfigurasi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {companies.map(company => (
                                <button
                                    key={company._id}
                                    onClick={() => handleSelectCompany(company)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedCompany?._id === company._id
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'hover:bg-muted border-border'
                                        }`}
                                >
                                    <p className="font-medium">{company.name}</p>
                                    <p className={`text-sm ${selectedCompany?._id === company._id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {company.code}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Configuration Panel */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Konfigurasi Tab
                        </CardTitle>
                        <CardDescription>
                            {selectedCompany
                                ? `Mengatur tab compliance untuk ${selectedCompany.name}`
                                : 'Pilih perusahaan terlebih dahulu'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedCompany ? (
                            <div className="space-y-6">
                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label htmlFor="checklist" className="text-base font-medium">Compliance Checklist</Label>
                                            <p className="text-sm text-muted-foreground">Daftar checklist kepatuhan standar</p>
                                        </div>
                                        <Switch
                                            id="checklist"
                                            checked={features.checklist}
                                            onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, checklist: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label htmlFor="integrated" className="text-base font-medium">Integrated Standards</Label>
                                            <p className="text-sm text-muted-foreground">Tabel standar terintegrasi</p>
                                        </div>
                                        <Switch
                                            id="integrated"
                                            checked={features.integrated}
                                            onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, integrated: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label htmlFor="annexA" className="text-base font-medium">ISO 27001 Annex A</Label>
                                            <p className="text-sm text-muted-foreground">Kontrol Annex A ISO 27001</p>
                                        </div>
                                        <Switch
                                            id="annexA"
                                            checked={features.annexA}
                                            onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, annexA: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label htmlFor="ojk" className="text-base font-medium">Pelaporan Regulasi</Label>
                                            <p className="text-sm text-muted-foreground">Pelaporan kepatuhan regulasi</p>
                                        </div>
                                        <Switch
                                            id="ojk"
                                            checked={features.ojk}
                                            onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, ojk: checked }))}
                                        />
                                    </div>

                                    <div className="pt-6 border-t mt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-medium">Standar Perusahaan</h3>
                                                    <p className="text-sm text-muted-foreground">Kelola standar khusus (seperti ISO 27001) yang aktif untuk perusahaan ini.</p>
                                                </div>
                                                <Dialog open={isAddStandardOpen} onOpenChange={setIsAddStandardOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm">
                                                            <Plus className="mr-2 h-4 w-4" />Tambah Standar
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Tambah Standar Baru</DialogTitle>
                                                            <DialogDescription>Tambahkan standar baru ke database {selectedCompany.name}.</DialogDescription>
                                                        </DialogHeader>
                                                        <form onSubmit={handleAddStandard} className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="std-name">Nama Standar (e.g., ISO 27001:2022)</Label>
                                                                <Input id="std-name" value={newStandard.name} onChange={(e) => setNewStandard(prev => ({ ...prev, name: e.target.value }))} required />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="std-title">Judul Standar</Label>
                                                                <Input id="std-title" value={newStandard.title} onChange={(e) => setNewStandard(prev => ({ ...prev, title: e.target.value }))} placeholder="Sistem Manajemen Keamanan Informasi" required />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="std-desc">Deskripsi</Label>
                                                                <Textarea id="std-desc" value={newStandard.description} onChange={(e) => setNewStandard(prev => ({ ...prev, description: e.target.value }))} />
                                                            </div>
                                                            <DialogFooter>
                                                                <Button type="button" variant="outline" onClick={() => setIsAddStandardOpen(false)}>Batal</Button>
                                                                <Button type="submit" disabled={isSavingStandard}>{isSavingStandard ? 'Menyimpan...' : 'Simpan'}</Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>

                                            <div className="space-y-3">
                                                {standards.length > 0 ? standards.map(std => (
                                                    <div key={std._id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                                        <div className="flex-1">
                                                            <Label htmlFor={`std-${std._id}`} className="text-base font-medium">{std.name}</Label>
                                                            <p className="text-sm text-muted-foreground">{std.title}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <Switch
                                                                id={`std-${std._id}`}
                                                                checked={dynamicFeatures[std._id] !== false} // default true if added
                                                                onCheckedChange={(checked) => setDynamicFeatures(prev => ({ ...prev, [std._id]: checked }))}
                                                            />
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteStandard(std._id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-4 border rounded-lg border-dashed">
                                                        <p className="text-sm text-muted-foreground">Belum ada standar khusus di perusahaan ini.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button onClick={handleSave} disabled={isSaving} className="w-full mt-6">
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Silakan pilih perusahaan dari daftar di samping</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
