"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ShieldCheck } from "lucide-react"

interface VerifyAccessModalProps {
    isOpen: boolean
    onClose: () => void
    review: any | null
    onAccessVerified: () => void
}

export function VerifyAccessModal({ isOpen, onClose, review, onAccessVerified }: VerifyAccessModalProps) {
    const [statusVerification, setStatusVerification] = useState("")
    const [notes, setNotes] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (review) {
            setStatusVerification(review.statusVerification || "")
            setNotes(review.verificationNotes || "")
        }
    }, [review, isOpen])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-green-500 hover:bg-green-600 text-white">{status}</Badge>
            case "Inactive":
                return <Badge className="bg-red-500 hover:bg-red-600 text-white">{status}</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const handleSubmit = async () => {
        if (!review) return

        if (!statusVerification) {
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Status verifikasi dari log harus diisi.",
            })
            return
        }

        setIsLoading(true)

        try {
            const verifyData = {
                statusVerification,
                notes,
            }

            const response = await fetch(`/api/user-access-reviews/${review._id}/verify`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(verifyData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Gagal memverifikasi data akses")
            }

            toast({ title: "Sukses", description: "Data akses berhasil diverifikasi." })
            onClose()
            onAccessVerified()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        } finally {
            setIsLoading(false)
        }
    }

    if (!review) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        Verifikasi Akses Pengguna
                    </DialogTitle>
                    <DialogDescription>
                        Periksa informasi akses dan lakukan verifikasi.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Read-only entry info */}
                    <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                        <h4 className="font-medium text-sm text-muted-foreground">Informasi Akses</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Nama Karyawan:</span>
                                <p className="font-medium">{review.employeeName}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Nama Akun:</span>
                                <p className="font-medium">{review.accountName}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Sistem:</span>
                                <p className="font-medium">{review.systemName}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Status Akun:</span>
                                <div className="mt-1">{getStatusBadge(review.accountStatus)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Editable verification fields */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="statusVerification" className="text-right pt-2">
                            Status Verifikasi dari Log
                        </Label>
                        <Textarea
                            id="statusVerification"
                            value={statusVerification}
                            onChange={(e) => setStatusVerification(e.target.value)}
                            className="col-span-3"
                            placeholder="Masukkan status verifikasi berdasarkan log sistem"
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="verifyNotes" className="text-right pt-2">
                            Catatan
                        </Label>
                        <Textarea
                            id="verifyNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="col-span-3"
                            placeholder="Catatan tambahan (opsional)"
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                        {isLoading ? "Memverifikasi..." : "Verifikasi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
