import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata = {
  title: "ISO Integrated System",
  description: "Sistem Manajemen Terintegrasi untuk Governance, Risk, dan Compliance",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
