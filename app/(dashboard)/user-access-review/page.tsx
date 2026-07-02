"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    ShieldCheck,
    Users,
    UserCheck,
    UserX,
    Clock,
    Search,
    Filter,
    Eye,
    Edit,
    History,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Trash2,
} from "lucide-react"
import { AddAccessModal } from "@/components/user-access-review/add-access-modal"
import { EditAccessModal } from "@/components/user-access-review/edit-access-modal"
import { VerifyAccessModal } from "@/components/user-access-review/verify-access-modal"
import { ViewAccessModal } from "@/components/user-access-review/view-access-modal"
import { AccessHistoryModal } from "@/components/user-access-review/access-history-modal"
import { ManageSystemsModal } from "@/components/user-access-review/manage-systems-modal"
import { useToast } from "@/components/ui/use-toast"

interface AccessReview {
    _id: string
    systemId: string
    systemName: string
    employeeName: string
    accountName: string
    role: string
    accountStatus: "Active" | "Inactive"
    dateOfDataEntry: string
    department: string
    departmentId: string | null
    enteredBy: string
    enteredByName: string
    verificationStatus: "Pending" | "Verified" | "Rejected"
    verificationFromLog: string | null
    dateOfVerification: string | null
    verifiedBy: string | null
    verifiedByName: string | null
    inactiveDate: string | null
    createdAt: string
    updatedAt: string
}

interface SystemInfo {
    _id: string
    name: string
    description: string
    isActive: boolean
}

interface Stats {
    totalEntries: number
    activeAccounts: number
    inactiveAccounts: number
    pendingVerification: number
    verified: number
    systemStats: { systemName: string; total: number; active: number; inactive: number; pending: number }[]
    departmentStats: { department: string; total: number; active: number; inactive: number }[]
}

interface UserInfo {
    role: string
    permissions: {
        canEdit: boolean
        canDelete: boolean
        canViewAudit: boolean
        canAccessSettings: boolean
    }
}

export default function UserAccessReviewPage() {
    const [reviews, setReviews] = useState<AccessReview[]>([])
    const [systems, setSystems] = useState<SystemInfo[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

    // Filter state
    const [selectedSystem, setSelectedSystem] = useState<string>("all")
    const [selectedStatus, setSelectedStatus] = useState<string>("all")
    const [selectedVerification, setSelectedVerification] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [selectedReview, setSelectedReview] = useState<AccessReview | null>(null)
    const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)

    // Sorting state
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)

    const { toast } = useToast()

    const fetchUserInfo = async () => {
        try {
            const response = await fetch("/api/auth/me")
            if (response.ok) {
                const data = await response.json()
                if (data.user) {
                    setUserInfo({ role: data.user.role || data.user.userRole || "user", permissions: data.user.permissions || {} })
                }
            }
        } catch (error) {
            console.error("Failed to fetch user info:", error)
        }
    }

    const fetchSystems = useCallback(async () => {
        try {
            const response = await fetch("/api/user-access-reviews/systems?activeOnly=true")
            if (response.ok) {
                const data = await response.json()
                setSystems(data)
            }
        } catch (error) {
            console.error("Failed to fetch systems:", error)
        }
    }, [])

    const fetchReviews = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (selectedSystem !== "all") params.append("systemId", selectedSystem)
            if (selectedStatus !== "all") params.append("accountStatus", selectedStatus)
            if (selectedVerification !== "all") params.append("verificationStatus", selectedVerification)
            if (searchQuery) params.append("search", searchQuery)

            const response = await fetch(`/api/user-access-reviews?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setReviews(data)
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Gagal mengambil data akses pengguna" })
        } finally {
            setIsLoading(false)
        }
    }, [selectedSystem, selectedStatus, selectedVerification, searchQuery, toast])

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch("/api/user-access-reviews/stats")
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error)
        }
    }, [])

    useEffect(() => {
        fetchUserInfo()
        fetchSystems()
        fetchStats()
    }, [fetchSystems, fetchStats])

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    const handleRefresh = () => {
        fetchReviews()
        fetchStats()
    }

    const handleSystemsChanged = () => {
        fetchSystems()
        fetchReviews()
        fetchStats()
    }

    const handleSort = (key: string) => {
        let direction: "asc" | "desc" = "asc"
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc"
        }
        setSortConfig({ key, direction })
    }

    const sortReviews = (data: AccessReview[]) => {
        if (!sortConfig) return data
        return [...data].sort((a, b) => {
            const aValue = (a as Record<string, unknown>)[sortConfig.key]
            const bValue = (b as Record<string, unknown>)[sortConfig.key]

            if (sortConfig.key === "dateOfDataEntry" || sortConfig.key === "dateOfVerification" || sortConfig.key === "inactiveDate") {
                const dateA = aValue ? new Date(aValue as string).getTime() : 0
                const dateB = bValue ? new Date(bValue as string).getTime() : 0
                return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA
            }

            if (aValue === bValue) return 0
            if (aValue === undefined || aValue === null) return 1
            if (bValue === undefined || bValue === null) return -1

            const aString = String(aValue).toLowerCase()
            const bString = String(bValue).toLowerCase()

            if (aString < bString) return sortConfig.direction === "asc" ? -1 : 1
            if (aString > bString) return sortConfig.direction === "asc" ? 1 : -1
            return 0
        })
    }

    const renderSortIcon = (columnKey: string) => {
        if (sortConfig?.key !== columnKey) return null
        return <span className="ml-1 inline-block">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
    }

    const handleView = (review: AccessReview) => {
        setSelectedReview(review)
        setIsViewModalOpen(true)
    }

    const handleEdit = (review: AccessReview) => {
        setSelectedReview(review)
        setIsEditModalOpen(true)
    }

    const handleVerify = (review: AccessReview) => {
        setSelectedReview(review)
        setIsVerifyModalOpen(true)
    }

    const handleHistory = (review: AccessReview) => {
        setSelectedReviewId(review._id)
        setIsHistoryModalOpen(true)
    }

    const handleDelete = async (review: AccessReview) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus data akses "${review.employeeName}" di sistem "${review.systemName}"?`)) {
            return
        }

        try {
            const response = await fetch(`/api/user-access-reviews/${review._id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.message || "Gagal menghapus data")
            }

            toast({ title: "Sukses", description: "Data akses berhasil dihapus." })
            handleRefresh()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        }
    }

    const isAdmin = userInfo?.role && ["superuser", "admin", "administrator", "superadmin"].includes(userInfo.role.toLowerCase())

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>
            case "Inactive":
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getVerificationBadge = (status: string) => {
        switch (status) {
            case "Verified":
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>
            case "Pending":
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
            case "Rejected":
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-"
        try {
            return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
        } catch {
            return "-"
        }
    }

    // Group reviews by system for tab view
    const reviewsBySystem = systems.reduce<Record<string, AccessReview[]>>((acc, system) => {
        acc[system._id] = reviews.filter(r => r.systemId === system._id)
        return acc
    }, {})

    const ReviewTable = ({ reviewList }: { reviewList: AccessReview[] }) => {
        const sortedList = sortReviews(reviewList)

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none text-sm font-semibold" onClick={() => handleSort("employeeName")}>
                                Employee Name{renderSortIcon("employeeName")}
                            </th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none text-sm font-semibold" onClick={() => handleSort("accountName")}>
                                Account Name{renderSortIcon("accountName")}
                            </th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none text-sm font-semibold" onClick={() => handleSort("role")}>
                                Role{renderSortIcon("role")}
                            </th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none text-sm font-semibold" onClick={() => handleSort("accountStatus")}>
                                Account Status{renderSortIcon("accountStatus")}
                            </th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none text-sm font-semibold" onClick={() => handleSort("dateOfDataEntry")}>
                                Date of Data Entry{renderSortIcon("dateOfDataEntry")}
                            </th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none text-sm font-semibold" onClick={() => handleSort("verificationStatus")}>
                                Status Verification{renderSortIcon("verificationStatus")}
                            </th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none text-sm font-semibold" onClick={() => handleSort("dateOfVerification")}>
                                Date of Verification{renderSortIcon("dateOfVerification")}
                            </th>
                            <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none text-sm font-semibold" onClick={() => handleSort("inactiveDate")}>
                                Tanggal Inactive{renderSortIcon("inactiveDate")}
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={9} className="text-center p-8">Memuat data...</td></tr>
                        ) : sortedList.length === 0 ? (
                            <tr><td colSpan={9} className="text-center p-8 text-muted-foreground">Tidak ada data akses pengguna.</td></tr>
                        ) : sortedList.map((review) => (
                            <tr key={review._id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-4">
                                    <div className="flex items-center">
                                        <Users className="mr-2 h-4 w-4 text-blue-500" />
                                        <span className="font-medium">{review.employeeName}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4">{review.accountName}</td>
                                <td className="py-3 px-4">{review.role}</td>
                                <td className="py-3 px-4">{getStatusBadge(review.accountStatus)}</td>
                                <td className="py-3 px-4">{formatDate(review.dateOfDataEntry)}</td>
                                <td className="py-3 px-4">{getVerificationBadge(review.verificationStatus)}</td>
                                <td className="py-3 px-4">{formatDate(review.dateOfVerification)}</td>
                                <td className="py-3 px-4">{formatDate(review.inactiveDate)}</td>
                                <td className="py-3 px-4">
                                    <div className="flex space-x-1">
                                        <Button variant="ghost" size="icon" title="Lihat Detail" onClick={() => handleView(review)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(review)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        {isAdmin && (
                                            <Button variant="ghost" size="icon" title="Verifikasi" onClick={() => handleVerify(review)}>
                                                <ShieldCheck className="h-4 w-4 text-blue-500" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" title="Riwayat" onClick={() => handleHistory(review)}>
                                            <History className="h-4 w-4" />
                                        </Button>
                                        {isAdmin && (
                                            <Button variant="ghost" size="icon" title="Hapus" onClick={() => handleDelete(review)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-blue-600" />
                        User Access Review
                    </h1>
                    <p className="text-muted-foreground mt-1">Tinjauan dan pengelolaan akses pengguna pada setiap sistem</p>
                </div>
                <div className="flex space-x-2">
                    <AddAccessModal systems={systems} onAccessAdded={handleRefresh} />
                    {isAdmin && <ManageSystemsModal onSystemsChanged={handleSystemsChanged} />}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Total Akun</CardTitle>
                        <Users className="h-10 w-10 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.totalEntries || 0}</div>
                        <p className="text-xs text-muted-foreground">Total akun terdaftar di semua sistem</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Akun Aktif</CardTitle>
                        <UserCheck className="h-10 w-10 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{stats?.activeAccounts || 0}</div>
                        <p className="text-xs text-muted-foreground">Akun dengan status aktif</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Akun Nonaktif</CardTitle>
                        <UserX className="h-10 w-10 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{stats?.inactiveAccounts || 0}</div>
                        <p className="text-xs text-muted-foreground">Akun dengan status nonaktif</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Menunggu Verifikasi</CardTitle>
                        <Clock className="h-10 w-10 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{stats?.pendingVerification || 0}</div>
                        <p className="text-xs text-muted-foreground">Akun belum diverifikasi oleh Admin</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-1 block">
                                <Search className="h-4 w-4 inline mr-1" /> Cari
                            </label>
                            <Input
                                placeholder="Cari nama karyawan atau akun..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="min-w-[180px]">
                            <label className="text-sm font-medium mb-1 block">
                                <Filter className="h-4 w-4 inline mr-1" /> Sistem
                            </label>
                            <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                                <SelectTrigger><SelectValue placeholder="Semua Sistem" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Sistem</SelectItem>
                                    {systems.map((s) => (
                                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="min-w-[150px]">
                            <label className="text-sm font-medium mb-1 block">Status Akun</label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger><SelectValue placeholder="Semua Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="min-w-[150px]">
                            <label className="text-sm font-medium mb-1 block">Verifikasi</label>
                            <Select value={selectedVerification} onValueChange={setSelectedVerification}>
                                <SelectTrigger><SelectValue placeholder="Semua" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Verified">Verified</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content - Tabs per System */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 flex-wrap h-auto">
                    <TabsTrigger value="all">
                        Semua Sistem ({reviews.length})
                    </TabsTrigger>
                    {systems.map((system) => (
                        <TabsTrigger key={system._id} value={system._id}>
                            {system.name} ({reviewsBySystem[system._id]?.length || 0})
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="all">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Semua Akses Pengguna</CardTitle>
                            <CardDescription>Data akses pengguna di semua sistem</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReviewTable reviewList={reviews} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {systems.map((system) => (
                    <TabsContent key={system._id} value={system._id}>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>{system.name}</CardTitle>
                                <CardDescription>{system.description || `Data akses pengguna di ${system.name}`}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ReviewTable reviewList={reviewsBySystem[system._id] || []} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Modals */}
            <EditAccessModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                review={selectedReview}
                systems={systems}
                onAccessUpdated={handleRefresh}
            />

            <VerifyAccessModal
                isOpen={isVerifyModalOpen}
                onClose={() => setIsVerifyModalOpen(false)}
                review={selectedReview}
                onAccessVerified={handleRefresh}
            />

            <ViewAccessModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                review={selectedReview}
            />

            <AccessHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                reviewId={selectedReviewId}
            />
        </div>
    )
}
