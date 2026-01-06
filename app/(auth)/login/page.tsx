"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
    const [userId, setUserId] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, password }),
            })

            if (res.ok) {
                const data = await res.json()
                toast({
                    title: "Login Berhasil!",
                    description: `Selamat datang, ${data.user?.name || userId}!`,
                    variant: "default",
                })
                // Redirect ke home setelah delay untuk menampilkan toast
                setTimeout(() => {
                    router.push('/home')
                }, 500)
            } else {
                const data = await res.json()
                const errorMsg = data.message || 'Login gagal. Silakan coba lagi.'
                setError(errorMsg)
                toast({
                    title: "Login Gagal",
                    description: errorMsg,
                    variant: "destructive",
                })
            }
        } catch (err) {
            const errorMsg = 'Terjadi kesalahan. Periksa koneksi Anda.'
            setError(errorMsg)
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive",
            })
            console.error('Login request failed', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">ISO Integrated System</CardTitle>
                    <CardDescription className="text-center">Masuk ke akun Anda untuk mengakses sistem</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
                        <div className="space-y-2">
                            <Label htmlFor="userId">User ID</Label>
                            <Input
                                id="userId"
                                type="text"
                                placeholder="Masukkan User ID Anda"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Kata Sandi</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Memproses..." : "Masuk"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
