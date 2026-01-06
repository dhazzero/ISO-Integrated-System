"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
  FileText,
  ClipboardList,
  AlertTriangle,
  FileCheck,
  BarChart,
  GraduationCap,
  Settings,
  Home,
} from "lucide-react"

interface UserPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canViewAudit: boolean;
  canAccessSettings: boolean;
}

export function MainNav() {
  const pathname = usePathname()
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setPermissions(data.permissions)
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error)
      }
    }
    fetchPermissions()
  }, [])

  const allRoutes = [
    {
      href: "/",
      label: "Beranda",
      icon: <Home className="h-5 w-5 mr-2" />,
      active: pathname === "/",
      requiresPermission: null, // Always visible
    },
    {
      href: "/documents",
      label: "Dokumentasi",
      icon: <FileText className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/documents"),
      requiresPermission: null, // Always visible
    },
    {
      href: "/compliance",
      label: "Kepatuhan",
      icon: <ClipboardList className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/compliance"),
      requiresPermission: null, // Always visible
    },
    {
      href: "/risk",
      label: "Risiko",
      icon: <AlertTriangle className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/risk"),
      requiresPermission: null, // Always visible
    },
    {
      href: "/audit",
      label: "Audit",
      icon: <FileCheck className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/audit"),
      requiresPermission: 'canViewAudit', // STAFF cannot view
    },
    {
      href: "/reports",
      label: "Laporan",
      icon: <BarChart className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/reports"),
      requiresPermission: null, // Always visible
    },
    {
      href: "/training",
      label: "Pelatihan",
      icon: <GraduationCap className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/training"),
      requiresPermission: null, // Always visible
    },
    {
      href: "/settings",
      label: "Pengaturan",
      icon: <Settings className="h-5 w-5 mr-2" />,
      active: pathname.startsWith("/settings"),
      requiresPermission: 'canAccessSettings', // Only SUPERUSER and ADMIN
    },
  ]

  // Filter routes based on permissions
  const routes = allRoutes.filter(route => {
    if (!route.requiresPermission) return true
    if (!permissions) return false
    return permissions[route.requiresPermission as keyof UserPermissions]
  })

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
