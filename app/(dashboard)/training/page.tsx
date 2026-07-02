"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Plus, Calendar, CheckCircle2, Clock, Users, Eye, Edit, Trash2 } from "lucide-react"
import { AddTrainingModal } from "@/components/training/add-training-modal"
import { EditTrainingModal } from "@/components/training/edit-training-modal"
import { ViewTrainingModal } from "@/components/training/view-training-modal"
import { CompleteTrainingModal } from "@/components/training/complete-training-modal"
import { useToast } from "@/components/ui/use-toast"

interface Training {
    _id: string;
    name: string;
    category: string;
    participants: number;
    date: string;
    status: "Completed" | "Scheduled" | "In Progress";
    department?: string;
    posterImage?: string;
    resultPhoto?: string;
    trainingMaterials?: string;
    attendanceList?: string;
}

export default function TrainingPage() {
    const [trainings, setTrainings] = useState<Training[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
    const { toast } = useToast()

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortTrainings = (data: Training[]) => {
        if (!sortConfig) return data;
        return [...data].sort((a, b) => {
            let aValue = (a as any)[sortConfig.key];
            let bValue = (b as any)[sortConfig.key];
            
            if (sortConfig.key === 'date') {
                const dateA = new Date(aValue).getTime();
                const dateB = new Date(bValue).getTime();
                if (!isNaN(dateA) && !isNaN(dateB)) {
                     if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
                     if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
                     return 0;
                }
            }

            if (aValue === bValue) return 0;
            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;
            
            // Numeric comparison for participants
            if (sortConfig.key === 'participants') {
                return sortConfig.direction === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
            }
            
            const aString = String(aValue).toLowerCase();
            const bString = String(bValue).toLowerCase();

            if (aString < bString) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aString > bString) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const renderSortIcon = (columnKey: string) => {
        if (sortConfig?.key !== columnKey) return null;
        return <span className="ml-1 inline-block">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    const fetchTrainings = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/trainings")
            if (!response.ok) {
                throw new Error("Gagal mengambil data pelatihan")
            }
            const data = await response.json()
            setTrainings(data)
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTrainings()
    }, [])

    const handleTrainingAdded = () => {
        fetchTrainings()
    }

    const handleTrainingUpdated = () => {
        fetchTrainings()
    }

    const handleViewTraining = (training: Training) => {
        setSelectedTraining(training)
        setIsViewModalOpen(true)
    }

    const handleEditTraining = (training: Training) => {
        setSelectedTraining(training)
        setIsEditModalOpen(true)
    }

    const handleDeleteTraining = async (training: Training) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus pelatihan "${training.name}"?`)) {
            return
        }

        try {
            const response = await fetch(`/api/trainings/${training._id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Gagal menghapus pelatihan")
            }

            toast({ title: "Sukses", description: "Pelatihan berhasil dihapus." })
            fetchTrainings()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message })
        }
    }

    const getStatusIcon = (status: Training['status']) => {
        switch (status) {
            case "Completed":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "Scheduled":
                return <Calendar className="h-4 w-4 text-blue-500" />
            case "In Progress":
                return <Clock className="h-4 w-4 text-amber-500" />
            default:
                return <Clock className="h-4 w-4 text-red-500" />
        }
    }

    const getStatusText = (status: Training['status']) => {
        switch (status) {
            case "Completed":
                return "Selesai"
            case "Scheduled":
                return "Dijadwalkan"
            case "In Progress":
                return "Dalam Proses"
            default:
                return status
        }
    }

    const summary = {
        completed: trainings.filter(t => t.status === "Completed").length,
        scheduled: trainings.filter(t => t.status === "Scheduled").length,
        inProgress: trainings.filter(t => t.status === "In Progress").length,
    }

    const completedTrainings = trainings.filter(t => t.status === 'Completed');
    const scheduledTrainings = trainings.filter(t => t.status === 'Scheduled');
    const inProgressTrainings = trainings.filter(t => t.status === 'In Progress');

    const TrainingTable = ({ trainingList }: { trainingList: Training[] }) => {
        const sortedList = sortTrainings(trainingList);
        
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('name')}>Nama Pelatihan{renderSortIcon('name')}</th>
                        <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('category')}>Kategori{renderSortIcon('category')}</th>
                        <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('department')}>Departemen{renderSortIcon('department')}</th>
                        <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('participants')}>Peserta{renderSortIcon('participants')}</th>
                        <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('date')}>Tanggal{renderSortIcon('date')}</th>
                        <th className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort('status')}>Status{renderSortIcon('status')}</th>
                        <th className="text-left py-3 px-4">Tindakan</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr><td colSpan={7} className="text-center p-8">Memuat data...</td></tr>
                    ) : sortedList.length === 0 ? (
                        <tr><td colSpan={7} className="text-center p-8 text-muted-foreground">Tidak ada pelatihan dengan status ini.</td></tr>
                    ) : sortedList.map((training) => (
                        <tr key={training._id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 flex items-center">
                                <GraduationCap className="mr-2 h-4 w-4 text-blue-500" />
                                {training.name}
                            </td>
                            <td className="py-3 px-4">{training.category}</td>
                            <td className="py-3 px-4">{training.department}</td>
                            <td className="py-3 px-4">
                                <div className="flex items-center">
                                    <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                                    {training.participants}
                                </div>
                            </td>
                            <td className="py-3 px-4">{new Date(training.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                                <div className="flex items-center">
                                    {getStatusIcon(training.status)}
                                    <span className="ml-1">{getStatusText(training.status)}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex space-x-1">
                                    <Button variant="ghost" size="icon" title="Lihat" onClick={() => handleViewTraining(training)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEditTraining(training)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" title="Hapus" onClick={() => handleDeleteTraining(training)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manajemen Pelatihan</h1>
                <div className="flex space-x-2">
                    <AddTrainingModal onTrainingAdded={handleTrainingAdded} />
                    <CompleteTrainingModal scheduledTrainings={scheduledTrainings} onTrainingCompleted={handleTrainingUpdated} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Pelatihan Selesai</CardTitle>
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{summary.completed}</div>
                        <p className="text-xs text-muted-foreground">Total pelatihan yang telah selesai</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Pelatihan Dijadwalkan</CardTitle>
                        <Calendar className="h-12 w-12 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{summary.scheduled}</div>
                        <p className="text-xs text-muted-foreground">Total pelatihan yang akan datang</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-bold">Dalam Proses</CardTitle>
                        <Clock className="h-12 w-12 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{summary.inProgress}</div>
                        <p className="text-xs text-muted-foreground">Total pelatihan yang sedang berjalan</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">Semua ({trainings.length})</TabsTrigger>
                    <TabsTrigger value="completed">Selesai ({summary.completed})</TabsTrigger>
                    <TabsTrigger value="scheduled">Dijadwalkan ({summary.scheduled})</TabsTrigger>
                    <TabsTrigger value="in-progress">Dalam Proses ({summary.inProgress})</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Semua Pelatihan</CardTitle>
                            <CardDescription>Daftar semua pelatihan yang direncanakan dan dilaksanakan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TrainingTable trainingList={trainings} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="completed">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Pelatihan Selesai</CardTitle>
                            <CardDescription>Daftar pelatihan yang telah selesai.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TrainingTable trainingList={completedTrainings} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="scheduled">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Pelatihan Dijadwalkan</CardTitle>
                            <CardDescription>Daftar pelatihan yang akan datang.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TrainingTable trainingList={scheduledTrainings} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="in-progress">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Pelatihan Dalam Proses</CardTitle>
                            <CardDescription>Daftar pelatihan yang sedang berjalan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TrainingTable trainingList={inProgressTrainings} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <EditTrainingModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                training={selectedTraining}
                onTrainingUpdated={handleTrainingUpdated}
            />

            <ViewTrainingModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                training={selectedTraining}
            />
        </div>
    )
}
