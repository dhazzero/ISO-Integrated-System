"use client"

import { usePageTracking } from "@/hooks/use-page-tracking"

/**
 * Provider component that enables automatic page view tracking.
 * 
 * Place this inside the dashboard layout to track all page navigations
 * across the application. It renders no visible UI - only activates
 * the tracking hook.
 */
export function PageTrackingProvider({ children }: { children: React.ReactNode }) {
    usePageTracking()
    return <>{children}</>
}
