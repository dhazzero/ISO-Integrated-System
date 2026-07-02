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
import { CheckCircle } from "lucide-react"

interface Training {
    _id: string;
    name: string;
}

interface CompleteTrainingModalProps {
    scheduledTrainings: Training[];
    onTrainingCompleted: () => void;
}

export function CompleteTrainingModal({ scheduledTrainings, onTrainingCompleted }: CompleteTrainingModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedTrainingId, setSelectedTrainingId] = useState("")
    const [resultPhoto, setResultPhoto] = useState<File | null>(null)
    const [trainingMaterials, setTrainingMaterials] = useState<File | null>(null)
    const [attendanceList, setAttendanceList] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const uploadFile = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        })
        if (!response.ok) throw new Error(`Gagal mengunggah file: ${file.name}`)
        const result = await response.json()
        return result.fileId
    }

    const handleSubmit = async () => {
        if (!selectedTrainingId) {
            toast({ variant: "destructive", title: "Gagal", description: "Pilih pelatihan yang akan diselesaikan." })
            return
        }

        setIsLoading(true)
        try {
            const updateData: any = {
                status: "Completed",
            }
            if (resultPhoto) updateData.resultPhoto = await uploadFile(resultPhoto)
            if (trainingMaterials) updateData.trainingMaterials = await uploadFile(trainingMaterials)
            if (attendanceList) updateData.attendanceList = await uploadFile(attendanceList)

            const response = await fetch(`/api/trainings/${selectedTrainingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Gagal menyelesaikan pelatihan")
            }

            toast({ title: "Sukses", description: "Pelatihan berhasil diselesaikan." })
            setIsOpen(false)
            onTrainingCompleted()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Selesaikan Pelatihan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Selesaikan Pelatihan</DialogTitle>
                    <DialogDescription>
                        Pilih pelatihan yang sudah selesai dan unggah file pendukungnya.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="training" className="text-right">
                            Pelatihan
                        </Label>
                        <Select onValueChange={setSelectedTrainingId} value={selectedTrainingId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih pelatihan terjadwal" />
                            </SelectTrigger>
                            <SelectContent>
                                {scheduledTrainings.map((training) => (
                                    <SelectItem key={training._id} value={training._id}>
                                        {training.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="resultPhoto" className="text-right">
                            Foto Hasil
                        </Label>
                        <Input id="resultPhoto" type="file" onChange={(e) => setResultPhoto(e.target.files?.[0] || null)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trainingMaterials" className="text-right">
                            Materi
                        </Label>
                        <Input id="trainingMaterials" type="file" onChange={(e) => setTrainingMaterials(e.target.files?.[0] || null)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="attendanceList" className="text-right">
                            Absensi
                        </Label>
                        <Input id="attendanceList" type="file" onChange={(e) => setAttendanceList(e.target.files?.[0] || null)} className="col-span-3" />
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
