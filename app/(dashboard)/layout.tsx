import type React from "react"
import { Header } from "@/components/header"
import { PageTrackingProvider } from "@/providers/page-tracking-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <PageTrackingProvider>
        <div className="flex-1">{children}</div>
      </PageTrackingProvider>
    </div>
  )
}
