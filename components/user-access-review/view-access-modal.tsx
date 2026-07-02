"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface ViewAccessModalProps {
    isOpen: boolean
    onClose: () => void
    review: any | null
}

export function ViewAccessModal({ isOpen, onClose, review }: ViewAccessModalProps) {
    if (!review) return null

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
                return <Badge variant="secondary">{status || "Pending"}</Badge>
        }
    }

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Detail Akses Pengguna</DialogTitle>
                    <DialogDescription>
                        Informasi lengkap data akses pengguna.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Nama Karyawan</Label>
                        <p className="font-medium">{review.employeeName}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Nama Akun</Label>
                        <p className="font-medium">{review.accountName}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Sistem</Label>
                        <p className="font-medium">{review.systemName}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Role</Label>
                        <p className="font-medium">{review.role}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Status Akun</Label>
                        <div>{getAccountStatusBadge(review.accountStatus)}</div>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Tanggal Entri Data</Label>
                        <p className="font-medium">{formatDate(review.dateOfEntry)}</p>
                    </div>

                    <Separator />

                    {/* Verification Info */}
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Status Verifikasi</Label>
                        <div>{getVerificationStatusBadge(review.verificationStatus)}</div>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Tanggal Verifikasi</Label>
                        <p className="font-medium">{formatDate(review.verificationDate)}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Status Verifikasi dari Log</Label>
                        <p className="font-medium">{review.statusVerification || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Diverifikasi Oleh</Label>
                        <p className="font-medium">{review.verifiedBy || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Catatan Verifikasi</Label>
                        <p className="font-medium">{review.verificationNotes || "-"}</p>
                    </div>

                    <Separator />

                    {/* Inactive Info */}
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Tanggal Inactive</Label>
                        <p className="font-medium">{formatDate(review.inactiveDate)}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Dibuat Oleh</Label>
                        <p className="font-medium">{review.createdBy || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Tanggal Dibuat</Label>
                        <p className="font-medium">{formatDate(review.createdAt)}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label className="text-muted-foreground">Terakhir Diperbarui</Label>
                        <p className="font-medium">{formatDate(review.updatedAt)}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
