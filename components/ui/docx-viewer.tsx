"use client"

import { useEffect, useRef, useState } from "react"
import { FileText, Loader2 } from "lucide-react"

interface DocxViewerProps {
    url: string
    fileId?: string
    filename?: string
    canEdit?: boolean
    className?: string
}

export function DocxViewer({ url, fileId, filename = "document.docx", canEdit = true, className = "" }: DocxViewerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const renderDocx = async () => {
            if (!iframeRef.current) return

            try {
                setLoading(true)
                setError(false)

                const docx = await import("docx-preview")

                // Fetch the file
                const fileUrl = fileId ? `/api/files/${fileId}?inline=1` : url
                const response = await fetch(fileUrl)
                if (!response.ok) throw new Error("Failed to fetch")
                const blob = await response.blob()

                // Create a document inside iframe for isolation
                const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document
                if (!iframeDoc) throw new Error("No iframe document")

                // Setup iframe HTML with styles
                iframeDoc.open()
                iframeDoc.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                                background: #f5f5f5;
                                padding: 8px;
                                overflow: auto;
                            }
                            #docx-content {
                                background: white;
                                padding: 16px;
                                border-radius: 4px;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                                min-height: 100%;
                            }
                            #docx-content img { max-width: 100%; height: auto; }
                            #docx-content table { width: 100%; border-collapse: collapse; font-size: 11px; }
                            #docx-content table td, #docx-content table th { 
                                border: 1px solid #ddd; 
                                padding: 4px 6px; 
                                vertical-align: top;
                            }
                            #docx-content p { margin-bottom: 0.5em; line-height: 1.5; }
                            /* Hide docx-preview wrapper styles */
                            .docx-wrapper { background: transparent !important; padding: 0 !important; }
                            section.docx { width: 100% !important; padding: 0 !important; box-shadow: none !important; }
                        </style>
                    </head>
                    <body>
                        <div id="docx-content"></div>
                    </body>
                    </html>
                `)
                iframeDoc.close()

                // Wait for iframe to be ready
                await new Promise(r => setTimeout(r, 100))

                const container = iframeDoc.getElementById('docx-content')
                if (!container) throw new Error("Container not found")

                // Render DOCX into iframe
                await docx.renderAsync(blob, container, undefined, {
                    className: "docx-rendered",
                    inWrapper: false,
                    ignoreWidth: true,
                    ignoreHeight: true,
                    ignoreFonts: false,
                    breakPages: false,
                    useBase64URL: true
                })

                setLoading(false)
            } catch (err) {
                console.error("DOCX render error:", err)
                setError(true)
                setLoading(false)
            }
        }

        renderDocx()
    }, [url, fileId])

    if (error) {
        return (
            <div className={`border rounded bg-gray-100 flex items-center justify-center ${className}`} style={{ height: "350px" }}>
                <FileText className="h-10 w-10 text-gray-400 mr-3" />
                <div>
                    <p className="text-sm font-medium">{filename}</p>
                    <p className="text-xs text-muted-foreground">Preview tidak tersedia</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`border rounded overflow-hidden bg-gray-100 relative ${className}`} style={{ height: "350px" }}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-gray-500">Memuat dokumen...</span>
                </div>
            )}
            <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="DOCX Preview"
                sandbox="allow-same-origin"
            />
        </div>
    )
}
