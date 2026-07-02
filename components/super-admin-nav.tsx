"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
    Building2,
    Settings,
    LayoutDashboard,
    LogOut,
    Shield,
    Activity,
    ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SuperAdminUser {
    name: string;
    userId: string;
    role: string;
}

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
}

export function SuperAdminNav() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<SuperAdminUser | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me')
                if (response.ok) {
                    const data = await response.json()
                    if (data.user) {
                        setUser(data.user)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user:', error)
            }
        }
        fetchUser()
    }, [])

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/login'
        } catch (error) {
            console.error("Logout failed", error)
        }
    }

    const mainRoutes: NavItem[] = [
        {
            href: "/admin",
            label: "Dashboard",
            icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
            active: pathname === "/admin",
        },
        {
            href: "/admin/companies",
            label: "Perusahaan",
            icon: <Building2 className="h-5 w-5 mr-3" />,
            active: pathname.startsWith("/admin/companies"),
        },
        {
            href: "/admin/monitoring",
            label: "Monitoring",
            icon: <Activity className="h-5 w-5 mr-3" />,
            active: pathname.startsWith("/admin/monitoring"),
        },
        {
            href: "/admin/settings",
            label: "Pengaturan",
            icon: <Settings className="h-5 w-5 mr-3" />,
            active: pathname.startsWith("/admin/settings"),
        },
        {
            href: "/admin/compliance",
            label: "Kepatuhan",
            icon: <ClipboardList className="h-5 w-5 mr-3" />,
            active: pathname.startsWith("/admin/compliance"),
        },
    ]

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white w-64 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Super Admin</h1>
                        <p className="text-xs text-slate-400">Multi-Tenant Manager</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {mainRoutes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            route.active
                                ? "bg-primary text-white"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        {route.icon}
                        {route.label}
                    </Link>
                ))}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-white">
                            {user?.name?.substring(0, 2).toUpperCase() || 'SA'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.name || 'Super Admin'}</p>
                        <p className="text-xs text-slate-400">{user?.userId || 'superadmin'}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Keluar
                </Button>
            </div>
        </div>
    )
}
