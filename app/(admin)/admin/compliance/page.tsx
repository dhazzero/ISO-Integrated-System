"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Building2, Settings, CheckCircle2, RefreshCw } from "lucide-react"

interface ComplianceFeatures {
    checklist: boolean
    integrated: boolean
    annexA: boolean
    ojk: boolean
}

interface Company {
    _id: string
    code: string
    name: string
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

    const handleSelectCompany = async (company: Company) => {
        setSelectedCompany(company)
        try {
            const res = await fetch(`/api/settings/system-settings?companyCode=${company.code}`)
            if (res.ok) {
                const data = await res.json()
                if (data.complianceFeatures) {
                    setFeatures(data.complianceFeatures)
                } else {
                    // Default values
                    setFeatures({ checklist: true, integrated: true, annexA: true, ojk: true })
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
                    complianceFeatures: features
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
                                            <Label htmlFor="ojk" className="text-base font-medium">Informasi OJK</Label>
                                            <p className="text-sm text-muted-foreground">Laporan kepatuhan OJK</p>
                                        </div>
                                        <Switch
                                            id="ojk"
                                            checked={features.ojk}
                                            onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, ojk: checked }))}
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleSave} disabled={isSaving} className="w-full">
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
