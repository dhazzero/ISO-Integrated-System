"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Plus, Edit, Trash2, Building } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    type: null,
    id: null,
    name: null,
  })

  // Tambahkan state untuk standar ISO di bagian useState:
  const [isAddStandardOpen, setIsAddStandardOpen] = useState(false)
  const [isEditStandardOpen, setIsEditStandardOpen] = useState(false)
  const [editingStandard, setEditingStandard] = useState(null)
  const [newStandard, setNewStandard] = useState({
    name: "",
    title: "",
    description: "",
    category: "",
    status: "Active",
  })

  const [standards, setStandards] = useState([
    {
      id: 1,
      name: "ISO 9001:2015",
      title: "Quality Management Systems",
      description: "Requirements for quality management systems",
      category: "Quality",
      status: "Active",
      usageCount: 15,
    },
    {
      id: 2,
      name: "ISO 27001:2022",
      title: "Information Security Management",
      description: "Requirements for information security management systems",
      category: "Information",
      status: "Active",
      usageCount: 12,
    },
    {
      id: 3,
      name: "ISO 37001:2016",
      title: "Anti-Bribery Management Systems",
      description: "Requirements for anti-bribery management systems",
      category: "Anti-Bribery",
      status: "Active",
      usageCount: 8,
    },
    {
      id: 4,
      name: "ISO 14001:2015",
      title: "Environmental Management Systems",
      description: "Requirements for environmental management systems",
      category: "Environmental",
      status: "Active",
      usageCount: 6,
    },
    {
      id: 5,
      name: "ISO 45001:2018",
      title: "Occupational Health and Safety",
      description: "Requirements for occupational health and safety management systems",
      category: "Safety",
      status: "Active",
      usageCount: 4,
    },
  ])

  const { toast } = useToast()

  const confirmDelete = async () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Handle different types of deletion
      if (deleteConfirm.type === "standard") {
        setStandards((prev) => prev.filter((s) => s.id !== deleteConfirm.id))
        toast({
          title: "Berhasil!",
          description: `Standar ${deleteConfirm.name} berhasil dihapus.`,
        })
      }

      setIsLoading(false)
      setDeleteConfirm({
        open: false,
        type: null,
        id: null,
        name: null,
      })
    }, 1500)
  }

  // Tambahkan fungsi handler:
  const handleAddStandard = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulasi API call
    setTimeout(() => {
      const newId = Math.max(...standards.map((s) => s.id)) + 1
      setStandards((prev) => [
        ...prev,
        {
          ...newStandard,
          id: newId,
          usageCount: 0,
        },
      ])
      setIsLoading(false)
      setIsAddStandardOpen(false)
      setNewStandard({
        name: "",
        title: "",
        description: "",
        category: "",
        status: "Active",
      })
    }, 1500)
  }

  const handleEditStandard = (standard) => {
    setEditingStandard(standard)
    setNewStandard({
      name: standard.name,
      title: standard.title,
      description: standard.description,
      category: standard.category,
      status: standard.status,
    })
    setIsEditStandardOpen(true)
  }

  const handleUpdateStandard = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulasi API call
    setTimeout(() => {
      setStandards((prev) => prev.map((s) => (s.id === editingStandard.id ? { ...s, ...newStandard } : s)))
      setIsLoading(false)
      setIsEditStandardOpen(false)
      setEditingStandard(null)
      setNewStandard({
        name: "",
        title: "",
        description: "",
        category: "",
        status: "Active",
      })
    }, 1500)
  }

  const handleDeleteStandard = (id, name) => {
    setDeleteConfirm({
      open: true,
      type: "standard",
      id: id,
      name: name,
    })
  }

  const getStandardStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      case "Draft":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "Withdrawn":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  return (
    <div>
      <div className="md:hidden">
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan</CardTitle>
            <CardDescription>Kelola pengaturan organisasi dan preferensi Anda.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Button variant="outline">Profil Organisasi</Button>
            <Button variant="outline">Standar ISO</Button>
            <Button variant="outline">Pengguna</Button>
            <Button variant="outline">Keamanan</Button>
            <Button variant="outline">Notifikasi</Button>
            <Button variant="outline">Integrasi</Button>
            <Button variant="outline">Billing</Button>
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:block">
        <Tabs defaultValue="organization" className="space-y-4">
          <TabsList>
            <TabsTrigger value="organization">Organisasi</TabsTrigger>
            {/* Tambahkan tab baru untuk Standar ISO setelah tab "Organisasi" */}
            {/* Di dalam TabsList, tambahkan: */}
            <TabsTrigger value="standards">Standar ISO</TabsTrigger>
            <TabsTrigger value="users">Pengguna</TabsTrigger>
            <TabsTrigger value="security">Keamanan</TabsTrigger>
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            <TabsTrigger value="integrations">Integrasi</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="organization">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Organisasi</CardTitle>
                  <CardDescription>Kelola informasi perusahaan dan struktur organisasi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name-org">Nama Perusahaan</Label>
                      <Input id="company-name-org" defaultValue="PT. Contoh Indonesia" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-code">Kode Perusahaan</Label>
                      <Input id="company-code" defaultValue="PCI001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-id">NPWP</Label>
                      <Input id="tax-id" defaultValue="01.234.567.8-901.000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business-license">Nomor Izin Usaha</Label>
                      <Input id="business-license" defaultValue="NIB-1234567890123" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-address">Alamat Perusahaan</Label>
                    <Textarea id="company-address" defaultValue="Jl. Contoh No. 123, Jakarta Selatan 12345" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telepon</Label>
                      <Input id="phone" defaultValue="+62 21 1234 5678" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-org">Email</Label>
                      <Input id="email-org" defaultValue="info@contoh.co.id" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" defaultValue="https://www.contoh.co.id" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Departemen</CardTitle>
                      <CardDescription>Kelola struktur departemen organisasi</CardDescription>
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Departemen
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "IT & Digital", head: "John Doe", employees: 15, status: "Aktif" },
                      { name: "Quality Assurance", head: "Jane Smith", employees: 8, status: "Aktif" },
                      { name: "Human Resources", head: "Bob Wilson", employees: 5, status: "Aktif" },
                      { name: "Finance", head: "Alice Brown", employees: 6, status: "Aktif" },
                      { name: "Operations", head: "Charlie Davis", employees: 25, status: "Aktif" },
                    ].map((dept, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{dept.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Kepala: {dept.head} • {dept.employees} karyawan
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default">{dept.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tambahkan TabsContent untuk Standar ISO setelah TabsContent "organization": */}
          <TabsContent value="standards">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Manajemen Standar ISO</CardTitle>
                    <CardDescription>Kelola standar ISO yang digunakan dalam sistem</CardDescription>
                  </div>
                  <Dialog open={isAddStandardOpen} onOpenChange={setIsAddStandardOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Standar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Standar ISO Baru</DialogTitle>
                        <DialogDescription>Masukkan informasi standar ISO yang akan ditambahkan</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddStandard} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="standardName">Nama Standar *</Label>
                          <Input
                            id="standardName"
                            value={newStandard.name}
                            onChange={(e) => setNewStandard((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="ISO 9001:2015"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="standardTitle">Judul Standar *</Label>
                          <Input
                            id="standardTitle"
                            value={newStandard.title}
                            onChange={(e) => setNewStandard((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Quality Management Systems"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="standardDescription">Deskripsi</Label>
                          <Textarea
                            id="standardDescription"
                            value={newStandard.description}
                            onChange={(e) => setNewStandard((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Deskripsi standar ISO"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="standardCategory">Kategori</Label>
                            <Select
                              value={newStandard.category}
                              onValueChange={(value) => setNewStandard((prev) => ({ ...prev, category: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Quality">Quality Management</SelectItem>
                                <SelectItem value="Environmental">Environmental Management</SelectItem>
                                <SelectItem value="Safety">Occupational Health & Safety</SelectItem>
                                <SelectItem value="Information">Information Security</SelectItem>
                                <SelectItem value="Anti-Bribery">Anti-Bribery Management</SelectItem>
                                <SelectItem value="Energy">Energy Management</SelectItem>
                                <SelectItem value="Food">Food Safety</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="standardStatus">Status</Label>
                            <Select
                              value={newStandard.status}
                              onValueChange={(value) => setNewStandard((prev) => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Active">Aktif</SelectItem>
                                <SelectItem value="Inactive">Tidak Aktif</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Withdrawn">Ditarik</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsAddStandardOpen(false)}>
                            Batal
                          </Button>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Menyimpan..." : "Simpan Standar"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Standar</th>
                        <th className="text-left py-3 px-4">Judul</th>
                        <th className="text-left py-3 px-4">Kategori</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Digunakan</th>
                        <th className="text-left py-3 px-4">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standards.map((standard) => (
                        <tr key={standard.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{standard.name}</td>
                          <td className="py-3 px-4">{standard.title}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{standard.category}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStandardStatusColor(standard.status)}>{standard.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">{standard.usageCount} modul</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditStandard(standard)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {standard.usageCount > 0 ? (
                                <div className="relative group">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled
                                    className="opacity-50 cursor-not-allowed"
                                  >
                                    <Trash2 className="h-4 w-4 text-gray-400" />
                                  </Button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Tidak dapat dihapus: digunakan di {standard.usageCount} modul
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteStandard(standard.id, standard.name)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Pengguna</CardTitle>
                <CardDescription>Kelola pengguna yang memiliki akses ke sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Ini adalah konten untuk tab Pengguna.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Keamanan</CardTitle>
                <CardDescription>Konfigurasi pengaturan keamanan untuk organisasi Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Ini adalah konten untuk tab Keamanan.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifikasi</CardTitle>
                <CardDescription>Kelola preferensi notifikasi Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Ini adalah konten untuk tab Notifikasi.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrasi</CardTitle>
                <CardDescription>Hubungkan dengan alat lain yang Anda gunakan</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Ini adalah konten untuk tab Integrasi.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
                <CardDescription>Lihat riwayat tagihan dan kelola langganan Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Ini adalah konten untuk tab Billing.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open: open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus {deleteConfirm.type}?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {deleteConfirm.type} <b>{deleteConfirm.name}</b>? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>
              Batal
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading} onClick={confirmDelete}>
              {isLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tambahkan dialog untuk edit standar setelah dialog add standar: */}
      <Dialog open={isEditStandardOpen} onOpenChange={setIsEditStandardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Standar ISO</DialogTitle>
            <DialogDescription>Perbarui informasi standar ISO</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStandard} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editStandardName">Nama Standar *</Label>
              <Input
                id="editStandardName"
                value={newStandard.name}
                onChange={(e) => setNewStandard((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="ISO 9001:2015"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStandardTitle">Judul Standar *</Label>
              <Input
                id="editStandardTitle"
                value={newStandard.title}
                onChange={(e) => setNewStandard((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Quality Management Systems"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStandardDescription">Deskripsi</Label>
              <Textarea
                id="editStandardDescription"
                value={newStandard.description}
                onChange={(e) => setNewStandard((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi standar ISO"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editStandardCategory">Kategori</Label>
                <Select
                  value={newStandard.category}
                  onValueChange={(value) => setNewStandard((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quality">Quality Management</SelectItem>
                    <SelectItem value="Environmental">Environmental Management</SelectItem>
                    <SelectItem value="Safety">Occupational Health & Safety</SelectItem>
                    <SelectItem value="Information">Information Security</SelectItem>
                    <SelectItem value="Anti-Bribery">Anti-Bribery Management</SelectItem>
                    <SelectItem value="Energy">Energy Management</SelectItem>
                    <SelectItem value="Food">Food Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStandardStatus">Status</Label>
                <Select
                  value={newStandard.status}
                  onValueChange={(value) => setNewStandard((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Aktif</SelectItem>
                    <SelectItem value="Inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Withdrawn">Ditarik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditStandardOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Memperbarui..." : "Perbarui Standar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
