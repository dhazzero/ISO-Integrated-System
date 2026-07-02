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

export function EditTrainingModal({ isOpen, onClose, training, onTrainingUpdated }: { isOpen: boolean, onClose: () => void, training: any, onTrainingUpdated: () => void }) {
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [participants, setParticipants] = useState("")
    const [date, setDate] = useState("")
    const [status, setStatus] = useState("")
    const [department, setDepartment] = useState("")
    const [departments, setDepartments] = useState<{ _id: string, name: string }[]>([])
    const [posterImage, setPosterImage] = useState<File | null>(null)
    const [resultPhoto, setResultPhoto] = useState<File | null>(null)
    const [trainingMaterials, setTrainingMaterials] = useState<File | null>(null)
    const [attendanceList, setAttendanceList] = useState<File | null>(null)
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

        if (training) {
            setName(training.name || "")
            setCategory(training.category || "")
            setParticipants(training.participants?.toString() || "")
            setDate(training.date ? new Date(training.date).toISOString().split('T')[0] : "")
            setStatus(training.status || "")
            setDepartment(training.department || "")
        }
    }, [training, isOpen])

    const uploadFile = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch("/api/upload", { method: "POST", body: formData })
        if (!response.ok) throw new Error(`Gagal mengunggah file: ${file.name}`)
        const result = await response.json()
        return result.fileId
    }

    const handleSubmit = async () => {
        if (!training) return
        setIsLoading(true)
        try {
            const trainingData: any = {
                name,
                category,
                participants: Number(participants),
                date,
                status,
                department,
            }

            if (posterImage) trainingData.posterImage = await uploadFile(posterImage)
            if (resultPhoto) trainingData.resultPhoto = await uploadFile(resultPhoto)
            if (trainingMaterials) trainingData.trainingMaterials = await uploadFile(trainingMaterials)
            if (attendanceList) trainingData.attendanceList = await uploadFile(attendanceList)

            const response = await fetch(`/api/trainings/${training._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trainingData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Gagal memperbarui pelatihan")
            }

            toast({ title: "Sukses", description: "Pelatihan berhasil diperbarui." })
            onClose()
            onTrainingUpdated()
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
                    <DialogTitle>Edit Pelatihan</DialogTitle>
                    <DialogDescription>
                        Perbarui detail pelatihan di bawah ini. Klik simpan jika sudah selesai.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Form fields for name, category, etc. go here */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nama</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Kategori</Label>
                        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="participants" className="text-right">Peserta</Label>
                        <Input id="participants" type="number" value={participants} onChange={(e) => setParticipants(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Tanggal</Label>
                        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="department" className="text-right">Departemen</Label>
                        <Select onValueChange={setDepartment} value={department}>
                            <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih departemen" /></SelectTrigger>
                            <SelectContent>
                                {departments.map((dept) => (<SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select onValueChange={setStatus} value={status}>
                            <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Scheduled">Dijadwalkan</SelectItem>
                                <SelectItem value="In Progress">Dalam Proses</SelectItem>
                                <SelectItem value="Completed">Selesai</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* File inputs */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="posterImage" className="text-right">Poster/Info</Label>
                        <Input id="posterImage" type="file" onChange={(e) => setPosterImage(e.target.files?.[0] || null)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="resultPhoto" className="text-right">Foto Hasil</Label>
                        <Input id="resultPhoto" type="file" onChange={(e) => setResultPhoto(e.target.files?.[0] || null)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trainingMaterials" className="text-right">Materi</Label>
                        <Input id="trainingMaterials" type="file" onChange={(e) => setTrainingMaterials(e.target.files?.[0] || null)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="attendanceList" className="text-right">Absensi</Label>
                        <Input id="attendanceList" type="file" onChange={(e) => setAttendanceList(e.target.files?.[0] || null)} className="col-span-3" />
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
