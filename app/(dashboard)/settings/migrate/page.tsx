// app/(dashboard)/settings/migrate/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle2, Database, Loader2, ArrowRight, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MigrationResult {
    collection: string
    migrated: number
    skipped: number
    errors: string[]
}

interface MigrationResponse {
    success: boolean
    message: string
    summary?: {
        totalMigrated: number
        totalSkipped: number
        collectionsProcessed: number
    }
    details?: MigrationResult[]
    error?: string
}

interface CollectionInfo {
    collection: string
    count: number
}

interface PreviewResponse {
    legacyDatabase: string
    collections: CollectionInfo[]
    totalDocuments: number
}

// Collection descriptions for user understanding
const COLLECTION_DESCRIPTIONS: Record<string, string> = {
    'documents': 'Dokumen ISO (Kebijakan, Prosedur, Instruksi Kerja)',
    'audits': 'Jadwal dan hasil audit internal/eksternal',
    'findings': 'Temuan audit (NC, OFI) terkait audits',
    'risks': 'Risk register - daftar risiko dan mitigasi',
    'capas': 'Corrective & Preventive Action',
    'trainings': 'Jadwal dan record pelatihan',
    'compliance': 'Data kepatuhan termasuk Annex A controls',
    'departments': 'Daftar departemen organisasi',
    'approvers': 'Daftar approver dokumen',
    'standards': 'Daftar standar ISO yang dikelola',
    'users': 'Data user aplikasi (login, role)',
    'security_logs': 'Log aktivitas keamanan sistem',
    'notification_settings': 'Pengaturan notifikasi email/SMTP',
    'system_settings': 'Pengaturan sistem aplikasi',
    'organization_settings': 'Informasi organisasi',
    'security_settings': 'Pengaturan keamanan (password policy)',
    'integrated-standard-table': 'Tabel integrasi antar standar',
    'OJK_Compliance_Report': 'Laporan kepatuhan OJK',
    'database_backups': 'Riwayat backup database',
    'documentLogs': 'Log perubahan dokumen',
    'roles': 'Definisi role dan permission',
    'uploads.files (GridFS)': 'File yang diupload (PDF, DOC, dll)',
}

// Categories for grouping collections
const CATEGORIES = {
    'Data Utama': ['documents', 'audits', 'findings', 'risks', 'capas', 'trainings', 'compliance'],
    'Master Data': ['departments', 'approvers', 'standards', 'users', 'roles'],
    'Pengaturan': ['notification_settings', 'system_settings', 'organization_settings', 'security_settings'],
    'Logs & Lainnya': ['security_logs', 'documentLogs', 'database_backups', 'integrated-standard-table', 'OJK_Compliance_Report'],
    'File Upload': ['uploads.files (GridFS)'],
}

export default function MigratePage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isPreviewing, setIsPreviewing] = useState(false)
    const [preview, setPreview] = useState<PreviewResponse | null>(null)
    const [result, setResult] = useState<MigrationResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set())

    const fetchPreview = async () => {
        setIsPreviewing(true)
        setError(null)
        try {
            const res = await fetch('/api/settings/migrate-legacy')
            const data = await res.json()
            if (res.ok) {
                setPreview(data)
                // Select all by default
                const allCollections = new Set(data.collections.map((c: CollectionInfo) => c.collection))
                setSelectedCollections(allCollections)
            } else {
                setError(data.message || 'Gagal mengambil preview')
            }
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsPreviewing(false)
        }
    }

    const toggleCollection = (collection: string) => {
        const newSet = new Set(selectedCollections)
        if (newSet.has(collection)) {
            newSet.delete(collection)
        } else {
            newSet.add(collection)
        }
        setSelectedCollections(newSet)
    }

    const selectAll = () => {
        if (preview) {
            setSelectedCollections(new Set(preview.collections.map(c => c.collection)))
        }
    }

    const deselectAll = () => {
        setSelectedCollections(new Set())
    }

    const selectCategory = (category: string) => {
        const collectionsInCategory = CATEGORIES[category as keyof typeof CATEGORIES] || []
        const newSet = new Set(selectedCollections)
        collectionsInCategory.forEach(c => {
            if (preview?.collections.find(col => col.collection === c)) {
                newSet.add(c)
            }
        })
        setSelectedCollections(newSet)
    }

    const runMigration = async () => {
        if (selectedCollections.size === 0) {
            alert('Pilih minimal satu collection untuk dimigrasikan')
            return
        }

        if (!confirm(`Apakah Anda yakin ingin memigrasikan ${selectedCollections.size} collection? Data dari database lama akan disalin.`)) {
            return
        }

        setIsLoading(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch('/api/settings/migrate-legacy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collections: Array.from(selectedCollections),
                    skipExisting: true
                })
            })

            const data = await res.json()
            setResult(data)

            if (!res.ok) {
                setError(data.message || 'Migrasi gagal')
            }
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    const getSelectedCount = () => {
        if (!preview) return 0
        return preview.collections
            .filter(c => selectedCollections.has(c.collection))
            .reduce((sum, c) => sum + c.count, 0)
    }

    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Migrasi Database</h1>
                <p className="text-muted-foreground mt-2">
                    Salin data dari database lama (isoIntegratedSystemDB) ke database tenant aktif
                </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Database Sumber
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold">isoIntegratedSystemDB</p>
                        <p className="text-sm text-muted-foreground">Database lama (tetap utuh)</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Database Target
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold">Tenant Aktif (PBB)</p>
                        <p className="text-sm text-muted-foreground">Database multi-tenant</p>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Section */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>1. Preview & Pilih Data</CardTitle>
                    <CardDescription>
                        Lihat data yang tersedia dan pilih collection mana yang ingin dimigrasikan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!preview ? (
                        <Button onClick={fetchPreview} disabled={isPreviewing} variant="outline">
                            {isPreviewing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Memuat...
                                </>
                            ) : (
                                'Lihat Data yang Tersedia'
                            )}
                        </Button>
                    ) : (
                        <div>
                            {/* Summary */}
                            <div className="flex gap-4 mb-4 flex-wrap">
                                <Badge variant="secondary" className="text-base px-3 py-1">
                                    Total: {preview.totalDocuments} dokumen
                                </Badge>
                                <Badge variant="default" className="text-base px-3 py-1">
                                    Dipilih: {selectedCollections.size} collection ({getSelectedCount()} dokumen)
                                </Badge>
                            </div>

                            {/* Quick Select Buttons */}
                            <div className="flex gap-2 mb-4 flex-wrap">
                                <Button variant="outline" size="sm" onClick={selectAll}>
                                    Pilih Semua
                                </Button>
                                <Button variant="outline" size="sm" onClick={deselectAll}>
                                    Batalkan Semua
                                </Button>
                                {Object.keys(CATEGORIES).map(category => (
                                    <Button
                                        key={category}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => selectCategory(category)}
                                    >
                                        + {category}
                                    </Button>
                                ))}
                            </div>

                            {/* Collection List */}
                            <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                                {Object.entries(CATEGORIES).map(([category, collections]) => {
                                    const availableInCategory = preview.collections.filter(c =>
                                        collections.includes(c.collection)
                                    )
                                    if (availableInCategory.length === 0) return null

                                    return (
                                        <div key={category} className="mb-4">
                                            <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">
                                                {category}
                                            </h4>
                                            <div className="grid gap-1">
                                                {availableInCategory.map((col) => (
                                                    <div
                                                        key={col.collection}
                                                        className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${selectedCollections.has(col.collection)
                                                                ? 'bg-primary/5 border-primary/30'
                                                                : 'bg-muted/30 hover:bg-muted/50'
                                                            }`}
                                                        onClick={() => toggleCollection(col.collection)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Checkbox
                                                                checked={selectedCollections.has(col.collection)}
                                                                onCheckedChange={() => toggleCollection(col.collection)}
                                                            />
                                                            <div>
                                                                <p className="font-medium text-sm">{col.collection}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {COLLECTION_DESCRIPTIONS[col.collection] || ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline">{col.count}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Migration Action */}
            {preview && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>2. Jalankan Migrasi</CardTitle>
                        <CardDescription>
                            Proses ini akan menyalin {selectedCollections.size} collection ({getSelectedCount()} dokumen)
                            dari database lama. Data yang sudah ada akan dilewati (tidak duplikat).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-4">
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                Database lama tidak akan diubah atau dihapus. Hanya proses COPY.
                            </AlertDescription>
                        </Alert>
                        <Button
                            onClick={runMigration}
                            disabled={isLoading || selectedCollections.size === 0}
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sedang Migrasi...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Mulai Migrasi ({selectedCollections.size} collection)
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Error Display */}
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Result Display */}
            {result && result.success && (
                <Alert className="mb-6 border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Migrasi Berhasil!</AlertTitle>
                    <AlertDescription className="text-green-700">
                        {result.message}
                    </AlertDescription>
                </Alert>
            )}

            {result && result.summary && (
                <Card>
                    <CardHeader>
                        <CardTitle>Hasil Migrasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-3xl font-bold text-green-600">{result.summary.totalMigrated}</p>
                                <p className="text-sm text-green-700">Berhasil Dimigrasikan</p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <p className="text-3xl font-bold text-yellow-600">{result.summary.totalSkipped}</p>
                                <p className="text-sm text-yellow-700">Dilewati (Sudah Ada)</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-3xl font-bold text-blue-600">{result.summary.collectionsProcessed}</p>
                                <p className="text-sm text-blue-700">Collection Diproses</p>
                            </div>
                        </div>

                        {result.details && (
                            <div className="max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted sticky top-0">
                                        <tr>
                                            <th className="text-left p-2">Collection</th>
                                            <th className="text-right p-2">Migrated</th>
                                            <th className="text-right p-2">Skipped</th>
                                            <th className="text-right p-2">Errors</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.details.map((detail) => (
                                            <tr key={detail.collection} className="border-b">
                                                <td className="p-2">{detail.collection}</td>
                                                <td className="text-right p-2 text-green-600">{detail.migrated}</td>
                                                <td className="text-right p-2 text-yellow-600">{detail.skipped}</td>
                                                <td className="text-right p-2 text-red-600">{detail.errors.length}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
