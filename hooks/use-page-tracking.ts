"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { logPageView } from "@/lib/logger"

// Map of paths to readable page labels
const PAGE_LABELS: Record<string, string> = {
    '/': 'Beranda',
    '/documents': 'Dokumentasi',
    '/compliance': 'Kepatuhan',
    '/issues': 'Manajemen Isu',
    '/risk': 'Risiko',
    '/audit': 'Audit',
    '/audit-logs': 'Audit Trail',
    '/reports': 'Laporan',
    '/training': 'Pelatihan',
    '/settings': 'Pengaturan',
}

/**
 * Resolves a pathname to a human-readable page label.
 * Handles exact matches and prefix-based matches for nested pages.
 */
function getPageLabel(pathname: string): string {
    // Exact match first
    if (PAGE_LABELS[pathname]) {
        return PAGE_LABELS[pathname]
    }

    // Prefix match for nested pages (e.g., /documents/xxx → Dokumentasi)
    const sortedKeys = Object.keys(PAGE_LABELS)
        .filter(k => k !== '/')
        .sort((a, b) => b.length - a.length) // longest first

    for (const key of sortedKeys) {
        if (pathname.startsWith(key)) {
            // Build a more descriptive label for nested pages
            const subPath = pathname.slice(key.length)
            if (subPath === '' || subPath === '/') {
                return PAGE_LABELS[key]
            }
            return `${PAGE_LABELS[key]} - Detail`
        }
    }

    return pathname // fallback to raw path
}

/**
 * Hook that tracks page navigation and logs it to the audit trail.
 * 
 * This hook should be placed in the dashboard layout or a top-level provider
 * so it can capture all page transitions within the app.
 * 
 * Features:
 * - Automatically logs every page navigation
 * - Prevents duplicate logs for the same page
 * - Maps paths to human-readable Indonesian labels
 * - Debounces rapid navigation changes
 */
export function usePageTracking() {
    const pathname = usePathname()
    const lastLoggedPath = useRef<string | null>(null)
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Skip if same path (e.g., re-render without actual navigation)
        if (pathname === lastLoggedPath.current) {
            return
        }

        // Clear any pending debounce
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }

        // Debounce to avoid logging intermediate navigation (e.g., redirects)
        debounceTimer.current = setTimeout(() => {
            const pageLabel = getPageLabel(pathname)
            lastLoggedPath.current = pathname
            logPageView(pathname, pageLabel)
        }, 500)

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
            }
        }
    }, [pathname])
}
