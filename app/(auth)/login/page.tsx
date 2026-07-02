"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Building2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface CompanyOption {
    code: string;
    name: string;
}

export default function LoginPage() {
    const [companyCode, setCompanyCode] = useState("")
    const [companies, setCompanies] = useState<CompanyOption[]>([])
    const [userId, setUserId] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    // Load available companies on mount
    useEffect(() => {
        async function loadCompanies() {
            try {
                const res = await fetch('/api/companies');
                if (res.ok) {
                    const data = await res.json();
                    setCompanies(data.companies || []);
                    // Auto-select if only one company
                    if (data.companies?.length === 1) {
                        setCompanyCode(data.companies[0].code);
                    }
                    // Check localStorage for last used company
                    const lastCompany = localStorage.getItem('lastCompanyCode');
                    if (lastCompany && data.companies?.find((c: CompanyOption) => c.code === lastCompany)) {
                        setCompanyCode(lastCompany);
                    }
                }
            } catch (err) {
                console.error('Failed to load companies:', err);
            } finally {
                setIsLoadingCompanies(false);
            }
        }
        loadCompanies();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (!companyCode) {
            setError('Pilih perusahaan terlebih dahulu')
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyCode: companyCode.toUpperCase(),
                    userId,
                    password
                }),
            })

            if (res.ok) {
                const data = await res.json()
                // Save last used company
                localStorage.setItem('lastCompanyCode', companyCode.toUpperCase())

                toast({
                    title: "Login Berhasil!",
                    description: `Selamat datang, ${data.user?.name || userId}!`,
                    variant: "default",
                })
                // Redirect based on user type
                setTimeout(() => {
                    if (data.user?.isSuperAdmin || companyCode.toUpperCase() === 'SUPERADMIN') {
                        router.push('/admin')
                    } else {
                        router.push('/home')
                    }
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <Card className="w-full max-w-md shadow-2xl border-slate-700/50">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">ISO Integrated System</CardTitle>
                    <CardDescription>Masuk ke akun Anda untuk mengakses sistem</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && <p className="text-sm font-medium text-destructive text-center bg-destructive/10 py-2 px-3 rounded-md">{error}</p>}

                        {/* Company Code Input */}
                        <div className="space-y-2">
                            <Label htmlFor="company">Kode Perusahaan</Label>
                            <Input
                                id="company"
                                type="text"
                                placeholder="Masukkan Kode Perusahaan (contoh: PBB)"
                                value={companyCode}
                                onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                                required
                                className="uppercase"
                            />
                            <p className="text-xs text-muted-foreground">
                                Masukkan kode perusahaan yang diberikan oleh administrator
                            </p>
                        </div>

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
                    <CardFooter className="flex flex-col gap-3">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Memproses..." : "Masuk"}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            Hubungi administrator jika Anda lupa kredensial
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
