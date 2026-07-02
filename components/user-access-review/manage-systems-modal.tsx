"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Settings, Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react"

interface System {
    _id: string
    name: string
    description?: string
    isActive: boolean
}

interface ManageSystemsModalProps {
    onSystemsChanged: () => void
}

export function ManageSystemsModal({ onSystemsChanged }: ManageSystemsModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [systems, setSystems] = useState<System[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [newName, setNewName] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editDescription, setEditDescription] = useState("")
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const { toast } = useToast()

    const fetchSystems = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/user-access-reviews/systems")
            if (response.ok) {
                const data = await response.json()
                setSystems(data)
            }
        } catch (error) {
            console.error("Failed to fetch systems:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchSystems()
        }
    }, [isOpen])

    const handleAddSystem = async () => {
        if (!newName.trim()) {
            toast({ variant: "destructive", title: "Gagal", description: "Nama sistem harus diisi." })
            return
        }

        setIsAdding(true)
        try {
            const response = await fetch("/api/user-access-reviews/systems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, description: newDescription }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Gagal menambahkan sistem")
            }

            toast({ title: "Sukses", description: "Sistem berhasil ditambahkan." })
            setNewName("")
            setNewDescription("")
            fetchSystems()
            onSystemsChanged()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        } finally {
            setIsAdding(false)
        }
    }

    const handleEditSystem = async (id: string) => {
        if (!editName.trim()) {
            toast({ variant: "destructive", title: "Gagal", description: "Nama sistem harus diisi." })
            return
        }

        try {
            const response = await fetch(`/api/user-access-reviews/systems/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, description: editDescription }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Gagal memperbarui sistem")
            }

            toast({ title: "Sukses", description: "Sistem berhasil diperbarui." })
            setEditingId(null)
            fetchSystems()
            onSystemsChanged()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        }
    }

    const handleDeleteSystem = async (id: string) => {
        try {
            const response = await fetch(`/api/user-access-reviews/systems/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Gagal menghapus sistem")
            }

            toast({ title: "Sukses", description: "Sistem berhasil dihapus." })
            setDeletingId(null)
            fetchSystems()
            onSystemsChanged()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        }
    }

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/user-access-reviews/systems/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Gagal mengubah status sistem")
            }

            toast({
                title: "Sukses",
                description: `Sistem berhasil ${!currentStatus ? "diaktifkan" : "dinonaktifkan"}.`,
            })
            fetchSystems()
            onSystemsChanged()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        }
    }

    const startEditing = (system: System) => {
        setEditingId(system._id)
        setEditName(system.name)
        setEditDescription(system.description || "")
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Kelola Sistem
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Kelola Sistem</DialogTitle>
                    <DialogDescription>
                        Tambah, edit, atau hapus sistem yang tersedia untuk review akses pengguna.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Add new system form */}
                    <div className="rounded-lg border p-4 space-y-3">
                        <h4 className="font-medium text-sm">Tambah Sistem Baru</h4>
                        <div className="grid gap-3">
                            <div className="grid grid-cols-4 items-center gap-3">
                                <Label htmlFor="newSystemName" className="text-right text-sm">
                                    Nama
                                </Label>
                                <Input
                                    id="newSystemName"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Nama sistem"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-3">
                                <Label htmlFor="newSystemDesc" className="text-right text-sm">
                                    Deskripsi
                                </Label>
                                <Input
                                    id="newSystemDesc"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Deskripsi sistem (opsional)"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleAddSystem} disabled={isAdding} size="sm">
                                    {isAdding ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="mr-2 h-4 w-4" />
                                    )}
                                    Tambah
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Systems list */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Daftar Sistem</h4>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">Memuat...</span>
                            </div>
                        ) : systems.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">
                                Belum ada sistem yang terdaftar.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {systems.map((system) => (
                                    <div
                                        key={system._id}
                                        className="rounded-lg border p-3 flex items-center justify-between gap-3"
                                    >
                                        {editingId === system._id ? (
                                            /* Edit mode */
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    placeholder="Nama sistem"
                                                    className="text-sm"
                                                />
                                                <Input
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    placeholder="Deskripsi (opsional)"
                                                    className="text-sm"
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setEditingId(null)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleEditSystem(system._id)}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : deletingId === system._id ? (
                                            /* Delete confirmation */
                                            <div className="flex-1 space-y-2">
                                                <p className="text-sm text-destructive">
                                                    Yakin ingin menghapus sistem &quot;{system.name}&quot;?
                                                </p>
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setDeletingId(null)}
                                                    >
                                                        Batal
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteSystem(system._id)}
                                                    >
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* View mode */
                                            <>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{system.name}</p>
                                                    {system.description && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {system.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor={`switch-${system._id}`} className="text-xs text-muted-foreground">
                                                            {system.isActive ? "Aktif" : "Nonaktif"}
                                                        </Label>
                                                        <Switch
                                                            id={`switch-${system._id}`}
                                                            checked={system.isActive}
                                                            onCheckedChange={() =>
                                                                handleToggleActive(system._id, system.isActive)
                                                            }
                                                        />
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => startEditing(system)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setDeletingId(system._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
