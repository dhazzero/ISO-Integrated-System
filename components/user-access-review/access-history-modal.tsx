"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, PlusCircle, Edit, ShieldCheck, XCircle, RefreshCw, ArrowRightLeft } from "lucide-react"

interface HistoryEntry {
    _id: string
    action: string
    performedBy: string
    performedAt: string
    changes?: { field: string; oldValue: string; newValue: string }[]
    notes?: string
}

interface AccessHistoryModalProps {
    isOpen: boolean
    onClose: () => void
    reviewId: string | null
}

const actionConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    CREATED: { label: "Dibuat", color: "text-blue-600", bgColor: "bg-blue-100", icon: PlusCircle },
    UPDATED: { label: "Diperbarui", color: "text-amber-600", bgColor: "bg-amber-100", icon: Edit },
    VERIFIED: { label: "Diverifikasi", color: "text-green-600", bgColor: "bg-green-100", icon: ShieldCheck },
    DEACTIVATED: { label: "Dinonaktifkan", color: "text-red-600", bgColor: "bg-red-100", icon: XCircle },
    REACTIVATED: { label: "Diaktifkan Kembali", color: "text-green-600", bgColor: "bg-green-100", icon: RefreshCw },
    STATUS_CHANGED: { label: "Status Diubah", color: "text-orange-600", bgColor: "bg-orange-100", icon: ArrowRightLeft },
}

export function AccessHistoryModal({ isOpen, onClose, reviewId }: AccessHistoryModalProps) {
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && reviewId) {
            const fetchHistory = async () => {
                setIsLoading(true)
                try {
                    const response = await fetch(`/api/user-access-reviews/${reviewId}/history`)
                    if (response.ok) {
                        const data = await response.json()
                        setHistory(data)
                    } else {
                        setHistory([])
                    }
                } catch (error) {
                    console.error("Failed to fetch history:", error)
                    setHistory([])
                } finally {
                    setIsLoading(false)
                }
            }
            fetchHistory()
        } else {
            setHistory([])
        }
    }, [isOpen, reviewId])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getActionConfig = (action: string) => {
        return actionConfig[action] || {
            label: action,
            color: "text-gray-600",
            bgColor: "bg-gray-100",
            icon: Edit,
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Riwayat Perubahan</DialogTitle>
                    <DialogDescription>
                        Timeline riwayat perubahan data akses pengguna.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Memuat riwayat...</span>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Belum ada riwayat perubahan.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Vertical timeline line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                            <div className="space-y-6">
                                {history.map((entry, index) => {
                                    const config = getActionConfig(entry.action)
                                    const IconComponent = config.icon

                                    return (
                                        <div key={entry._id || index} className="relative pl-12">
                                            {/* Timeline dot */}
                                            <div
                                                className={`absolute left-1.5 w-5 h-5 rounded-full ${config.bgColor} flex items-center justify-center`}
                                            >
                                                <IconComponent className={`h-3 w-3 ${config.color}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="rounded-lg border p-3 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant="outline"
                                                        className={`${config.color} border-current`}
                                                    >
                                                        {config.label}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(entry.performedAt)}
                                                    </span>
                                                </div>

                                                <p className="text-sm">
                                                    <span className="text-muted-foreground">Oleh: </span>
                                                    <span className="font-medium">{entry.performedBy}</span>
                                                </p>

                                                {/* Changes */}
                                                {entry.changes && entry.changes.length > 0 && (
                                                    <div className="space-y-1">
                                                        {entry.changes.map((change, i) => (
                                                            <div
                                                                key={i}
                                                                className="text-xs bg-muted rounded px-2 py-1"
                                                            >
                                                                <span className="font-medium">{change.field}:</span>{" "}
                                                                <span className="text-red-500 line-through">
                                                                    {change.oldValue}
                                                                </span>{" "}
                                                                <span className="text-muted-foreground">→</span>{" "}
                                                                <span className="text-green-600">
                                                                    {change.newValue}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {entry.notes && (
                                                    <p className="text-xs text-muted-foreground italic">
                                                        Catatan: {entry.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
