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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface EditAccessModalProps {
    isOpen: boolean
    onClose: () => void
    review: any | null
    systems: { _id: string; name: string }[]
    onAccessUpdated: () => void
}

export function EditAccessModal({ isOpen, onClose, review, systems, onAccessUpdated }: EditAccessModalProps) {
    const [systemId, setSystemId] = useState("")
    const [employeeName, setEmployeeName] = useState("")
    const [accountName, setAccountName] = useState("")
    const [role, setRole] = useState("")
    const [accountStatus, setAccountStatus] = useState("")
    const [dateOfEntry, setDateOfEntry] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (review) {
            setSystemId(review.systemId || "")
            setEmployeeName(review.employeeName || "")
            setAccountName(review.accountName || "")
            setRole(review.role || "")
            setAccountStatus(review.accountStatus || "Active")
            setDateOfEntry(
                review.dateOfEntry
                    ? new Date(review.dateOfEntry).toISOString().split("T")[0]
                    : ""
            )
        }
    }, [review, isOpen])

    const handleSubmit = async () => {
        if (!review) return

        if (!systemId || !employeeName || !accountName || !role) {
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Semua field wajib harus diisi.",
            })
            return
        }

        setIsLoading(true)

        try {
            const selectedSystem = systems.find((s) => s._id === systemId)
            const accessData = {
                systemId,
                systemName: selectedSystem?.name || "",
                employeeName,
                accountName,
                role,
                accountStatus,
                dateOfEntry,
            }

            const response = await fetch(`/api/user-access-reviews/${review._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(accessData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Gagal memperbarui data akses")
            }

            toast({ title: "Sukses", description: "Data akses pengguna berhasil diperbarui." })
            onClose()
            onAccessUpdated()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Data Akses Pengguna</DialogTitle>
                    <DialogDescription>
                        Perbarui detail akses pengguna di bawah ini. Klik simpan jika sudah selesai.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="editSystem" className="text-right">
                            Sistem
                        </Label>
                        <Select onValueChange={setSystemId} value={systemId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih sistem" />
                            </SelectTrigger>
                            <SelectContent>
                                {systems.map((system) => (
                                    <SelectItem key={system._id} value={system._id}>
                                        {system.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="editEmployeeName" className="text-right">
                            Nama Karyawan
                        </Label>
                        <Input
                            id="editEmployeeName"
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="editAccountName" className="text-right">
                            Nama Akun
                        </Label>
                        <Input
                            id="editAccountName"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="editRole" className="text-right">
                            Role
                        </Label>
                        <Input
                            id="editRole"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="editAccountStatus" className="text-right">
                            Status Akun
                        </Label>
                        <Select onValueChange={setAccountStatus} value={accountStatus}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="editDateOfEntry" className="text-right">
                            Tanggal Entri
                        </Label>
                        <Input
                            id="editDateOfEntry"
                            type="date"
                            value={dateOfEntry}
                            onChange={(e) => setDateOfEntry(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
