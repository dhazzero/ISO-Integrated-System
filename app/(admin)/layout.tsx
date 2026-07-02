import { SuperAdminNav } from "@/components/super-admin-nav"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { redirect } from "next/navigation"

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-bytes-long'
);

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Check if user is super admin
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
        redirect('/login')
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)

        if (!payload.isSuperAdmin) {
            // Not a super admin, redirect to regular dashboard
            redirect('/home')
        }
    } catch (error) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <SuperAdminNav />
            <main className="flex-1 overflow-auto p-6">
                {children}
            </main>
        </div>
    )
}
