"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Eye, Pencil, ShieldCheck, History, ArrowUpDown, Loader2 } from "lucide-react"
import { ViewAccessModal } from "./view-access-modal"
import { EditAccessModal } from "./edit-access-modal"
import { VerifyAccessModal } from "./verify-access-modal"
import { AccessHistoryModal } from "./access-history-modal"

interface AccessReviewListProps {
    reviews: any[]
    systems: any[]
    isLoading: boolean
    onRefresh: () => void
    userRole: string
}

type SortField = "employeeName" | "accountName" | "role" | "accountStatus" | "dateOfEntry" | "verificationStatus" | "verificationDate" | "inactiveDate"
type SortDirection = "asc" | "desc"

export function AccessReviewList({ reviews, systems, isLoading, onRefresh, userRole }: AccessReviewListProps) {
    const [sortField, setSortField] = useState<SortField>("dateOfEntry")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [verifyModalOpen, setVerifyModalOpen] = useState(false)
    const [historyModalOpen, setHistoryModalOpen] = useState(false)
    const [selectedReview, setSelectedReview] = useState<any | null>(null)
    const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)

    const isAdmin = ["admin", "administrator", "superuser"].includes(userRole?.toLowerCase())

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const sortedReviews = useMemo(() => {
        const sorted = [...reviews].sort((a, b) => {
            let aVal = a[sortField] || ""
            let bVal = b[sortField] || ""

            // Handle date fields
            if (["dateOfEntry", "verificationDate", "inactiveDate"].includes(sortField)) {
                aVal = aVal ? new Date(aVal).getTime() : 0
                bVal = bVal ? new Date(bVal).getTime() : 0
            } else {
                aVal = String(aVal).toLowerCase()
                bVal = String(bVal).toLowerCase()
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
            return 0
        })
        return sorted
    }, [reviews, sortField, sortDirection])

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
    }

    const getAccountStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-green-500 hover:bg-green-600 text-white">Active</Badge>
            case "Inactive":
                return <Badge className="bg-red-500 hover:bg-red-600 text-white">Inactive</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getVerificationStatusBadge = (status: string) => {
        switch (status) {
            case "Verified":
                return <Badge className="bg-green-500 hover:bg-green-600 text-white">Verified</Badge>
            case "Pending":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Pending</Badge>
            case "Rejected":
                return <Badge className="bg-red-500 hover:bg-red-600 text-white">Rejected</Badge>
            default:
                return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Pending</Badge>
        }
    }

    const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <TableHead>
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 font-medium"
                onClick={() => handleSort(field)}
            >
                {children}
                <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
        </TableHead>
    )

    const openView = (review: any) => {
        setSelectedReview(review)
        setViewModalOpen(true)
    }

    const openEdit = (review: any) => {
        setSelectedReview(review)
        setEditModalOpen(true)
    }

    const openVerify = (review: any) => {
        setSelectedReview(review)
        setVerifyModalOpen(true)
    }

    const openHistory = (reviewId: string) => {
        setSelectedReviewId(reviewId)
        setHistoryModalOpen(true)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Memuat data akses pengguna...</span>
            </div>
        )
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Belum ada data review akses pengguna.</p>
                <p className="text-muted-foreground text-sm mt-1">
                    Klik tombol &quot;Tambah Akses&quot; untuk menambahkan entri baru.
                </p>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <SortableHeader field="employeeName">Nama Karyawan</SortableHeader>
                            <SortableHeader field="accountName">Nama Akun</SortableHeader>
                            <SortableHeader field="role">Role</SortableHeader>
                            <SortableHeader field="accountStatus">Status Akun</SortableHeader>
                            <SortableHeader field="dateOfEntry">Tanggal Entri Data</SortableHeader>
                            <SortableHeader field="verificationStatus">Status Verifikasi</SortableHeader>
                            <SortableHeader field="verificationDate">Tanggal Verifikasi</SortableHeader>
                            <SortableHeader field="inactiveDate">Tanggal Inactive</SortableHeader>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedReviews.map((review) => (
                            <TableRow key={review._id}>
                                <TableCell className="font-medium">{review.employeeName}</TableCell>
                                <TableCell>{review.accountName}</TableCell>
                                <TableCell>{review.role}</TableCell>
                                <TableCell>{getAccountStatusBadge(review.accountStatus)}</TableCell>
                                <TableCell>{formatDate(review.dateOfEntry)}</TableCell>
                                <TableCell>
                                    {getVerificationStatusBadge(review.verificationStatus)}
                                </TableCell>
                                <TableCell>{formatDate(review.verificationDate)}</TableCell>
                                <TableCell>{formatDate(review.inactiveDate)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openView(review)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Lihat Detail</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(review)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit</TooltipContent>
                                        </Tooltip>

                                        {isAdmin && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openVerify(review)}
                                                    >
                                                        <ShieldCheck className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Verifikasi</TooltipContent>
                                            </Tooltip>
                                        )}

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openHistory(review._id)}
                                                >
                                                    <History className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Riwayat</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Modals */}
            <ViewAccessModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                review={selectedReview}
            />
            <EditAccessModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                review={selectedReview}
                systems={systems}
                onAccessUpdated={onRefresh}
            />
            <VerifyAccessModal
                isOpen={verifyModalOpen}
                onClose={() => setVerifyModalOpen(false)}
                review={selectedReview}
                onAccessVerified={onRefresh}
            />
            <AccessHistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                reviewId={selectedReviewId}
            />
        </TooltipProvider>
    )
}
