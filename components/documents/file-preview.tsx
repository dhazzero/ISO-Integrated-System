"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Loader2 } from "lucide-react"
import { DocxViewer } from "@/components/ui/docx-viewer"

interface FileInfo {
    id: string
    filename: string
    extension: string
    contentType: string
    size: number
    previewType: 'pdf' | 'docx' | 'excel' | 'ppt' | 'image' | 'fallback'
}

interface FilePreviewProps {
    fileId: string
    canEdit?: boolean
}

export function FilePreview({ fileId, canEdit = true }: FilePreviewProps) {
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchFileInfo = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(`/api/files/${fileId}/info`)
                if (!response.ok) {
                    throw new Error('Gagal memuat informasi file')
                }

                const data = await response.json()
                setFileInfo(data)
            } catch (err) {
                console.error('Error fetching file info:', err)
                setError(err instanceof Error ? err.message : 'Gagal memuat file')
            } finally {
                setLoading(false)
            }
        }

        if (fileId) {
            fetchFileInfo()
        }
    }, [fileId])

    const handleDownload = () => {
        const link = window.document.createElement("a")
        link.href = `/api/files/${fileId}`
        link.target = "_blank"
        link.download = fileInfo?.filename || 'download'
        link.click()
    }

    if (loading) {
        return (
            <div className="w-full h-96 border rounded flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-muted-foreground">Memuat preview...</span>
            </div>
        )
    }

    if (error || !fileInfo) {
        return (
            <div className="border rounded-lg p-8 text-center bg-gray-50">
                <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-sm text-muted-foreground mb-2">Gagal memuat preview</p>
                <p className="text-xs text-muted-foreground">{error || 'File tidak ditemukan'}</p>
            </div>
        )
    }

    // Render based on preview type
    switch (fileInfo.previewType) {
        case 'pdf':
            return (
                <div className="w-full h-96 border rounded overflow-hidden bg-gray-100">
                    <iframe
                        src={`/api/files/${fileId}?inline=1${!canEdit ? '#toolbar=0&navpanes=0' : '#view=FitH'}`}
                        className="w-full h-full border-0"
                        title="PDF Preview"
                        style={{ minHeight: "384px" }}
                    />
                </div>
            )

        case 'image':
            return (
                <div className="w-full h-96 border rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                        src={`/api/files/${fileId}?inline=1`}
                        alt={fileInfo.filename}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )

        case 'docx':
            return (
                <DocxViewer
                    url={`/api/files/${fileId}?inline=1`}
                    fileId={fileId}
                    filename={fileInfo.filename}
                    canEdit={canEdit}
                    className="w-full"
                />
            )

        case 'excel':
        case 'ppt':
        default:
            // Fallback view for unsupported file types
            const fileTypeInfo = fileInfo.previewType === 'excel'
                ? 'Microsoft Excel'
                : fileInfo.previewType === 'ppt'
                    ? 'Microsoft PowerPoint'
                    : 'Dokumen'
            const fileIcon = fileInfo.previewType === 'excel'
                ? '📊'
                : fileInfo.previewType === 'ppt'
                    ? '📽️'
                    : '📁'

            return (
                <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="flex flex-col items-center text-center">
                        <div className="text-6xl mb-4">{fileIcon}</div>
                        <h4 className="font-semibold text-lg mb-1">{fileInfo.filename}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            Tipe: {fileTypeInfo} (.{fileInfo.extension})
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            Browser tidak dapat menampilkan file {fileInfo.extension.toUpperCase()} secara langsung.
                        </p>
                        {canEdit && (
                            <div className="flex gap-2">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleDownload}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download untuk Melihat
                                </Button>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-4">
                            💡 Tip: Download file lalu buka dengan Microsoft Office atau aplikasi sejenis
                        </p>
                    </div>
                </div>
            )
    }
}
