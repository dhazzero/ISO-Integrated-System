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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

export function AddTrainingModal({ onTrainingAdded }: { onTrainingAdded: () => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [participants, setParticipants] = useState("")
    const [date, setDate] = useState("")
    const [department, setDepartment] = useState("")
    const [departments, setDepartments] = useState<{ _id: string, name: string }[]>([])
    const [posterImage, setPosterImage] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (isOpen) {
            const fetchDepartments = async () => {
                try {
                    const response = await fetch("/api/settings/departments")
                    if (response.ok) {
                        const data = await response.json()
                        setDepartments(data)
                    }
                } catch (error) {
                    console.error("Failed to fetch departments:", error)
                }
            }
            fetchDepartments()
        }
    }, [isOpen])

    const uploadFile = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        })
        if (!response.ok) {
            throw new Error(`Gagal mengunggah file: ${file.name}`)
        }
        const result = await response.json()
        return result.fileId
    }

    const handleSubmit = async () => {
        if (!name || !category || !participants || !date || !department) {
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Semua field harus diisi.",
            })
            return
        }

        setIsLoading(true)

        try {
            let posterImageId = null
            if (posterImage) {
                posterImageId = await uploadFile(posterImage)
            }

            const trainingData = {
                name,
                category,
                participants: Number(participants),
                date,
                status: "Scheduled", // New trainings are always scheduled first
                department,
                posterImage: posterImageId,
            }

            const response = await fetch("/api/trainings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trainingData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Gagal menambahkan pelatihan")
            }

            toast({ title: "Sukses", description: "Pelatihan baru berhasil dijadwalkan." })
            setIsOpen(false)
            onTrainingAdded()
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
                    Tambah Pelatihan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Jadwalkan Pelatihan Baru</DialogTitle>
                    <DialogDescription>
                        Isi detail pelatihan di bawah ini untuk membuat jadwal baru.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nama
                        </Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Kategori
                        </Label>
                        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="participants" className="text-right">
                            Peserta
                        </Label>
                        <Input id="participants" type="number" value={participants} onChange={(e) => setParticipants(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Tanggal
                        </Label>
                        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="department" className="text-right">
                            Departemen
                        </Label>
                        <Select onValueChange={setDepartment} value={department}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih departemen" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dept) => (
                                    <SelectItem key={dept._id} value={dept.name}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="posterImage" className="text-right">
                            Poster/Info
                        </Label>
                        <Input id="posterImage" type="file" onChange={(e) => setPosterImage(e.target.files?.[0] || null)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Menyimpan..." : "Simpan Jadwal"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
