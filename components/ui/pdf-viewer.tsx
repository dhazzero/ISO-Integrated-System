"use client"

import { useState } from "react"
import { FileText, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PDFViewerProps {
    url: string
    className?: string
    hideToolbar?: boolean
}

export function PDFViewer({ url, className = "", hideToolbar = false }: PDFViewerProps) {
    const [error, setError] = useState(false)

    // Use PDF.js viewer from Mozilla CDN for reliable PDF rendering
    // Adding parameters to control the viewer appearance
    const pdfJsViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`

    // Simple direct URL with parameters for Chrome's built-in viewer
    const directUrl = hideToolbar
        ? `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`
        : `${url}#view=FitH`

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 rounded ${className}`}>
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                    Tidak dapat memuat preview PDF
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                    Gunakan browser Chrome atau Firefox untuk melihat PDF
                </p>
                {!hideToolbar && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(url, '_blank')}
                    >
                        Buka di Tab Baru
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className={`relative bg-gray-100 rounded overflow-hidden ${className}`}>
            <iframe
                src={directUrl}
                className="w-full h-full border-0"
                onError={() => setError(true)}
                title="PDF Preview"
                style={{ minHeight: "400px" }}
            />
        </div>
    )
}
