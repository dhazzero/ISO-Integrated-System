"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import Link from "next/link"

export function ViewTrainingModal({ isOpen, onClose, training }: { isOpen: boolean, onClose: () => void, training: any }) {
    if (!training) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{training.name}</DialogTitle>
                    <DialogDescription>
                        Detail Pelatihan
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label>Kategori</Label>
                        <p>{training.category}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label>Peserta</Label>
                        <p>{training.participants}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label>Tanggal</Label>
                        <p>{new Date(training.date).toLocaleDateString()}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label>Status</Label>
                        <p>{training.status}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label>Departemen</Label>
                        <p>{training.department}</p>
                    </div>

                    <div className="col-span-2">
                        <Label>Lampiran</Label>
                        <div className="flex flex-col space-y-2 mt-2">
                            {training.resultPhoto && (
                                <Link href={`/api/files/${training.resultPhoto}`} target="_blank" passHref>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Download className="mr-2 h-4 w-4" /> Foto Hasil
                                    </Button>
                                </Link>
                            )}
                            {training.trainingMaterials && (
                                <Link href={`/api/files/${training.trainingMaterials}`} target="_blank" passHref>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Download className="mr-2 h-4 w-4" /> Materi Pelatihan
                                    </Button>
                                </Link>
                            )}
                            {training.attendanceList && (
                                <Link href={`/api/files/${training.attendanceList}`} target="_blank" passHref>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Download className="mr-2 h-4 w-4" /> Daftar Hadir
                                    </Button>
                                </Link>
                            )}
                            {!training.resultPhoto && !training.trainingMaterials && !training.attendanceList && (
                                <p className="text-sm text-muted-foreground">Tidak ada lampiran.</p>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
