"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  FileText,
  ClipboardList,
  AlertTriangle,
  FileCheck,
  Shield,
  BarChart,
  GraduationCap,
  Settings,
  Home,
} from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Beranda",
      icon: <Home className="h-5 w-5 mr-2" />,
      active: pathname === "/",
    },
    {
      href: "/documents",
      label: "Dokumentasi",
      icon: <FileText className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/documents"),
    },
    {
      href: "/compliance",
      label: "Kepatuhan",
      icon: <ClipboardList className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/compliance"),
    },
    {
      href: "/risk",
      label: "Risiko",
      icon: <AlertTriangle className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/risk"),
    },
    {
      href: "/audit",
      label: "Audit",
      icon: <FileCheck className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/audit"),
    },
    {
      href: "/capa",
      label: "CAPA",
      icon: <Shield className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/capa"),
    },
    {
      href: "/reports",
      label: "Laporan",
      icon: <BarChart className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/reports"),
    },
    {
      href: "/training",
      label: "Pelatihan",
      icon: <GraduationCap className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/training"),
    },
    {
      href: "/settings",
      label: "Pengaturan",
      icon: <Settings className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/settings"),
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-black dark:text-white" : "text-muted-foreground",
          )}
        >
          {route.icon}
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
