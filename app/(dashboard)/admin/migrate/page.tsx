// app/(dashboard)/admin/migrate/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Database, Loader2, ArrowRight } from "lucide-react"
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

interface PreviewResponse {
    legacyDatabase: string
    collections: { collection: string; count: number }[]
    totalDocuments: number
}

export default function MigratePage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isPreviewing, setIsPreviewing] = useState(false)
    const [preview, setPreview] = useState<PreviewResponse | null>(null)
    const [result, setResult] = useState<MigrationResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchPreview = async () => {
        setIsPreviewing(true)
        setError(null)
        try {
            const res = await fetch('/api/admin/migrate-legacy')
            const data = await res.json()
            if (res.ok) {
                setPreview(data)
            } else {
                setError(data.message || 'Gagal mengambil preview')
            }
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsPreviewing(false)
        }
    }

    const runMigration = async () => {
        if (!confirm('Apakah Anda yakin ingin menjalankan migrasi? Data dari database lama akan disalin ke database PBB.')) {
            return
        }

        setIsLoading(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch('/api/admin/migrate-legacy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetCompanyCode: 'PBB',
                    targetDatabaseName: 'iso_pbb',
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

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Migrasi Database</h1>
                <p className="text-muted-foreground mt-2">
                    Salin data dari database lama (isoIntegratedSystemDB) ke database PBB (iso_pbb)
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
                        <p className="text-2xl font-bold">isoIntegratedSystemDB</p>
                        <p className="text-sm text-muted-foreground">Database lama (akan tetap utuh)</p>
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
                        <p className="text-2xl font-bold">iso_pbb</p>
                        <p className="text-sm text-muted-foreground">Database PBB (multi-tenant)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Section */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Preview Data</CardTitle>
                    <CardDescription>
                        Lihat data yang tersedia di database lama sebelum migrasi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={fetchPreview} disabled={isPreviewing} variant="outline">
                        {isPreviewing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memuat...
                            </>
                        ) : (
                            'Lihat Preview'
                        )}
                    </Button>

                    {preview && (
                        <div className="mt-4">
                            <div className="mb-4">
                                <Badge variant="secondary" className="text-lg px-4 py-1">
                                    Total: {preview.totalDocuments} dokumen
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {preview.collections.map((col) => (
                                    <div key={col.collection} className="flex justify-between p-2 bg-muted rounded">
                                        <span className="text-sm truncate">{col.collection}</span>
                                        <Badge variant="outline">{col.count}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Migration Action */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Jalankan Migrasi</CardTitle>
                    <CardDescription>
                        Proses ini akan menyalin data dari database lama ke database PBB. Data yang sudah ada akan dilewati (tidak duplikat).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={runMigration}
                        disabled={isLoading}
                        size="lg"
                        className="w-full md:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sedang Migrasi...
                            </>
                        ) : (
                            <>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Mulai Migrasi ke PBB
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

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
                                <p className="text-sm text-blue-700">Koleksi Diproses</p>
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
