"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

interface AddAccessModalProps {
    systems: { _id: string; name: string }[]
    onAccessAdded: () => void
}

export function AddAccessModal({ systems, onAccessAdded }: AddAccessModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [systemId, setSystemId] = useState("")
    const [employeeName, setEmployeeName] = useState("")
    const [accountName, setAccountName] = useState("")
    const [role, setRole] = useState("")
    const [accountStatus, setAccountStatus] = useState("Active")
    const [dateOfEntry, setDateOfEntry] = useState(new Date().toISOString().split("T")[0])
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const resetForm = () => {
        setSystemId("")
        setEmployeeName("")
        setAccountName("")
        setRole("")
        setAccountStatus("Active")
        setDateOfEntry(new Date().toISOString().split("T")[0])
    }

    const handleSubmit = async () => {
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

            const response = await fetch("/api/user-access-reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(accessData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Gagal menambahkan data akses")
            }

            toast({ title: "Sukses", description: "Data akses pengguna berhasil ditambahkan." })
            resetForm()
            setIsOpen(false)
            onAccessAdded()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Akses
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah Data Akses Pengguna</DialogTitle>
                    <DialogDescription>
                        Isi detail akses pengguna di bawah ini untuk menambahkan entri baru.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="system" className="text-right">
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
                        <Label htmlFor="employeeName" className="text-right">
                            Nama Karyawan
                        </Label>
                        <Input
                            id="employeeName"
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            className="col-span-3"
                            placeholder="Masukkan nama karyawan"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="accountName" className="text-right">
                            Nama Akun
                        </Label>
                        <Input
                            id="accountName"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            className="col-span-3"
                            placeholder="Masukkan nama akun"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Input
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="col-span-3"
                            placeholder="Masukkan role akses"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="accountStatus" className="text-right">
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
                        <Label htmlFor="dateOfEntry" className="text-right">
                            Tanggal Entri
                        </Label>
                        <Input
                            id="dateOfEntry"
                            type="date"
                            value={dateOfEntry}
                            onChange={(e) => setDateOfEntry(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Menyimpan..." : "Simpan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
