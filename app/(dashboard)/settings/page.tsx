// app/(dashboard)/settings/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" //
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" //
import { Button } from "@/components/ui/button" //
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog" //
import { Input } from "@/components/ui/input" //
import { Label } from "@/components/ui/label" //
import { Plus, Edit, Trash2, Building } from "lucide-react"
import { Textarea } from "@/components/ui/textarea" //
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" //
import { Badge } from "@/components/ui/badge" //
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

interface Standard {
  _id?: string;
  id?: number | string;
  name: string;
  title: string;
  description: string;
  category: string;
  status: string;
  usageCount?: number;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isStandardsLoading, setIsStandardsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    type: null as 'standard' | null,
    id: null as string | null,
    name: null as string | null,
  });

  const [isAddStandardOpen, setIsAddStandardOpen] = useState(false);
  const [isEditStandardOpen, setIsEditStandardOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null);
  const [newStandard, setNewStandard] = useState<Omit<Standard, '_id' | 'id' | 'usageCount'>>({
    name: "",
    title: "",
    description: "",
    category: "",
    status: "Active",
  });

  const [standards, setStandards] = useState<Standard[]>([]);
  const [documentLogs, setDocumentLogs] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchStandards = async () => {
    setIsStandardsLoading(true);
    try {
      const response = await fetch('/api/settings/standards');
      if (!response.ok) throw new Error('Gagal mengambil data standar');
      const data = await response.json();
      setStandards(data.map((s: any) => ({...s, id: s._id})));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Tidak dapat memuat standar.",
      });
    } finally {
      setIsStandardsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs/documents');
      if (!res.ok) throw new Error('Gagal mengambil log');
      const data = await res.json();
      setDocumentLogs(data);
    } catch (err) {
      console.error('Fetch logs error', err);
    }
  };

  useEffect(() => {
    fetchStandards();
    fetchLogs();
  }, []);

  const confirmDelete = async () => {
    // ... (fungsi confirmDelete Anda yang sudah ada)
    if (!deleteConfirm.id || deleteConfirm.type !== 'standard') return;
    setIsLoading(true);
    try {
      // TODO: Implement API DELETE call here
      // const response = await fetch(`/api/settings/standards/${deleteConfirm.id}`, { method: 'DELETE' });
      // if (!response.ok) throw new Error(`Gagal menghapus standar ${deleteConfirm.name}.`);

      await new Promise(resolve => setTimeout(resolve, 500));
      setStandards((prev) => prev.filter((s) => s._id !== deleteConfirm.id));
      toast({
        title: "Berhasil!",
        description: `Standar ${deleteConfirm.name} berhasil dihapus.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Hapus!",
        description: error instanceof Error ? error.message : `Gagal menghapus standar.`,
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirm({ open: false, type: null, id: null, name: null });
    }
  };

  const handleAddStandard = async (e: React.FormEvent) => {
    // ... (fungsi handleAddStandard Anda yang sudah ada)
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/standards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStandard),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan standar');
      }
      await fetchStandards();
      setIsAddStandardOpen(false);
      setNewStandard({ name: "", title: "", description: "", category: "", status: "Active" });
      toast({ title: "Sukses", description: "Standar baru berhasil ditambahkan." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : 'Gagal menambahkan standar' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStandard = (standard: Standard) => {
    // ... (fungsi handleEditStandard Anda yang sudah ada)
    setEditingStandard(standard);
    setNewStandard({
      name: standard.name,
      title: standard.title,
      description: standard.description,
      category: standard.category,
      status: standard.status,
    });
    setIsEditStandardOpen(true);
  };

  const handleUpdateStandard = async (e: React.FormEvent) => {
    // ... (fungsi handleUpdateStandard Anda yang sudah ada)
    e.preventDefault();
    if (!editingStandard || !editingStandard._id) return;
    setIsLoading(true);

    try {
      // TODO: Implement API PUT call here
      // const response = await fetch(`/api/settings/standards/${editingStandard._id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newStandard),
      // });
      // if (!response.ok) throw new Error('Gagal memperbarui standar');

      await new Promise(resolve => setTimeout(resolve, 500));
      setStandards((prev) => prev.map((s) => (s._id === editingStandard._id ? { ...s, ...newStandard, _id: s._id } : s)));

      await fetchStandards();
      setIsEditStandardOpen(false);
      setEditingStandard(null);
      toast({ title: "Sukses", description: "Standar berhasil diperbarui." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : 'Gagal memperbarui standar' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStandard = (id: string, name: string) => {
    // ... (fungsi handleDeleteStandard Anda yang sudah ada)
    setDeleteConfirm({ open: true, type: "standard", id: id, name: name });
  };

  const getStandardStatusColor = (status: string) => {
    // ... (fungsi getStandardStatusColor Anda yang sudah ada)
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
  };

  return (
      <div>
        <div className="md:hidden"> {/* Untuk tampilan mobile */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan</CardTitle>
              <CardDescription>Kelola pengaturan organisasi dan preferensi Anda.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {/* Tombol-tombol ini bisa mengarah ke section atau modal terpisah di mobile */}
              <Button variant="outline">Profil Organisasi</Button>
              <Button variant="outline">Standar ISO</Button>
              <Button variant="outline">Pengguna</Button>
              {/* ... Tombol lainnya ... */}
            </CardContent>
          </Card>
        </div>

        <div className="hidden md:block"> {/* Untuk tampilan desktop */}
          <Tabs defaultValue="organization" className="space-y-4"> {/* <--- Tag <Tabs> PEMBUKA */}
            <TabsList>
              <TabsTrigger value="organization">Organisasi</TabsTrigger>
              <TabsTrigger value="standards">Standar ISO</TabsTrigger>
              <TabsTrigger value="users">Pengguna</TabsTrigger>
              <TabsTrigger value="security">Keamanan</TabsTrigger>
              <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
              <TabsTrigger value="integrations">Integrasi</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            {/* Konten Tab Organisasi */}
            <TabsContent value="organization">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Organisasi</CardTitle>
                    <CardDescription>Kelola informasi perusahaan dan struktur organisasi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* ... Isi form informasi organisasi ... */}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Departemen</CardTitle>
                        <CardDescription>Kelola struktur departemen organisasi</CardDescription>
                      </div>
                      <Button><Plus className="mr-2 h-4 w-4" />Tambah Departemen</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* ... Daftar departemen ... */}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Konten Tab Standar ISO */}
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
                        <Button onClick={() => setNewStandard({ name: "", title: "", description: "", category: "", status: "Active" })}>
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
                            <Input id="standardName" value={newStandard.name} onChange={(e) => setNewStandard((prev) => ({ ...prev, name: e.target.value }))} placeholder="ISO 9001:2015" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="standardTitle">Judul Standar *</Label>
                            <Input id="standardTitle" value={newStandard.title} onChange={(e) => setNewStandard((prev) => ({ ...prev, title: e.target.value }))} placeholder="Quality Management Systems" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="standardDescription">Deskripsi</Label>
                            <Textarea id="standardDescription" value={newStandard.description} onChange={(e) => setNewStandard((prev) => ({ ...prev, description: e.target.value }))} placeholder="Deskripsi standar ISO" rows={3} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="standardCategory">Kategori</Label>
                              <Select value={newStandard.category} onValueChange={(value) => setNewStandard((prev) => ({ ...prev, category: value }))} >
                                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
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
                              <Select value={newStandard.status} onValueChange={(value) => setNewStandard((prev) => ({ ...prev, status: value }))} >
                                <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
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
                            <Button type="button" variant="outline" onClick={() => setIsAddStandardOpen(false)} disabled={isLoading}>Batal</Button>
                            <Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan Standar"}</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {isStandardsLoading ? (
                      <div className="flex justify-center items-center p-8"><Progress value={50} className="w-1/2" /> <p className="ml-2">Memuat standar...</p></div>
                  ) : (
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
                              <tr key={standard._id || standard.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-4 font-medium">{standard.name}</td>
                                <td className="py-3 px-4">{standard.title}</td>
                                <td className="py-3 px-4"><Badge variant="outline">{standard.category}</Badge></td>
                                <td className="py-3 px-4"><Badge className={getStandardStatusColor(standard.status)}>{standard.status}</Badge></td>
                                <td className="py-3 px-4"><span className="text-sm text-muted-foreground">{standard.usageCount || 0} modul</span></td>
                                <td className="py-3 px-4">
                                  <div className="flex space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditStandard(standard)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => standard._id && handleDeleteStandard(standard._id, standard.name)} disabled={(standard.usageCount || 0) > 0 || !standard._id}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                  </div>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Konten Tab Pengguna */}
            <TabsContent value="users">
              <Card>
                <CardHeader><CardTitle>Pengguna</CardTitle><CardDescription>Kelola pengguna yang memiliki akses ke sistem</CardDescription></CardHeader>
                <CardContent><p>Ini adalah konten untuk tab Pengguna.</p></CardContent>
              </Card>
            </TabsContent>

            {/* Konten Tab Keamanan */}
            <TabsContent value="security">
              <Card>
                <CardHeader><CardTitle>Keamanan</CardTitle><CardDescription>Konfigurasi pengaturan keamanan untuk organisasi Anda</CardDescription></CardHeader>
                <CardContent><p>Ini adalah konten untuk tab Keamanan.</p></CardContent>
              </Card>
            </TabsContent>

            {/* Konten Tab Notifikasi */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader><CardTitle>Notifikasi</CardTitle><CardDescription>Kelola preferensi notifikasi Anda</CardDescription></CardHeader>
                <CardContent><p>Ini adalah konten untuk tab Notifikasi.</p></CardContent>
              </Card>
            </TabsContent>

            {/* Konten Tab Integrasi */}
            <TabsContent value="integrations">
              <Card>
                <CardHeader><CardTitle>Integrasi</CardTitle><CardDescription>Hubungkan dengan alat lain yang Anda gunakan</CardDescription></CardHeader>
                <CardContent><p>Ini adalah konten untuk tab Integrasi.</p></CardContent>
              </Card>
            </TabsContent>

            {/* Konten Tab Billing */}
            <TabsContent value="billing">
              <Card>
                <CardHeader><CardTitle>Billing</CardTitle><CardDescription>Lihat riwayat tagihan dan kelola langganan Anda</CardDescription></CardHeader>
                <CardContent><p>Ini adalah konten untuk tab Billing.</p></CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>Log Dokumen</CardTitle>
                  <CardDescription>Riwayat perubahan dokumen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Waktu</th>
                          <th className="py-2 px-4 text-left">Dokumen</th>
                          <th className="py-2 px-4 text-left">Aksi</th>
                          <th className="py-2 px-4 text-left">User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documentLogs.map((log) => (
                          <tr key={log.id} className="border-b">
                            <td className="py-2 px-4">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="py-2 px-4">{log.before?.name || log.after?.name}</td>
                            <td className="py-2 px-4">{log.action}</td>
                            <td className="py-2 px-4">{log.user}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs> {/* <--- Tag </Tabs> PENUTUP SEHARUSNYA DI SINI */}
        </div>

        {/* Dialog Edit Standard */}
        <Dialog open={isEditStandardOpen} onOpenChange={setIsEditStandardOpen}>
          {/* ... Isi Dialog Edit Standard ... */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Standar ISO</DialogTitle>
              <DialogDescription>Perbarui informasi standar ISO: {editingStandard?.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateStandard} className="space-y-4">
              {/* Form fields sama seperti Add, tapi diisi dengan editingStandard */}
              <div className="space-y-2">
                <Label htmlFor="editStandardName">Nama Standar *</Label>
                <Input id="editStandardName" value={newStandard.name} onChange={(e) => setNewStandard((prev) => ({ ...prev, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStandardTitle">Judul Standar *</Label>
                <Input id="editStandardTitle" value={newStandard.title} onChange={(e) => setNewStandard((prev) => ({ ...prev, title: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStandardDescription">Deskripsi</Label>
                <Textarea id="editStandardDescription" value={newStandard.description} onChange={(e) => setNewStandard((prev) => ({ ...prev, description: e.target.value }))} rows={3}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editStandardCategory">Kategori</Label>
                  <Select value={newStandard.category} onValueChange={(value) => setNewStandard(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih Kategori"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quality">Quality</SelectItem>
                      <SelectItem value="Information">Information</SelectItem>
                      <SelectItem value="Anti-Bribery">Anti-Bribery</SelectItem>
                      {/* Tambah kategori lain */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editStandardStatus">Status</Label>
                  <Select value={newStandard.status} onValueChange={(value) => setNewStandard(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Withdrawn">Ditarik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditStandardOpen(false)} disabled={isLoading}>Batal</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Memperbarui..." : "Perbarui Standar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog konfirmasi delete */}
        <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}>
          {/* ... Isi Dialog Delete ... */}
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Hapus {deleteConfirm.type}?</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus {deleteConfirm.type}{" "}
                <b>{deleteConfirm.name}</b>? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteConfirm({ open: false, type: null, id: null, name: null })} disabled={isLoading}>Batal</Button>
              <Button type="submit" variant="destructive" disabled={isLoading} onClick={confirmDelete}>
                {isLoading ? "Menghapus..." : "Hapus"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}