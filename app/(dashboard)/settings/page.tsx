"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Settings, Users, Building, Shield, Database, Bell, Plus, Edit, Trash2, Eye,
    EyeOff, Download, Upload, RefreshCw, User, Mail, Server, HardDrive, Monitor, Key, Users2
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/components/ui/use-toast"
import { logActivity } from "@/lib/logger"
import { Approver, Department, SecurityLog, Standard, User as UserType, UserRole } from "@/lib/types"
import { UserMatrixModal } from "@/components/settings/user-matrix-modal"
import { AddUserModal } from "@/components/settings/add-user-modal"
import { EditUserModal } from "@/components/settings/edit-user-modal"

// Tipe data untuk struktur hirarki
export interface HierarchicalUser extends UserType {
    subordinates: HierarchicalUser[];
}

export interface DepartmentNode {
    department: Department;
    users: HierarchicalUser[];
}


export default function SettingsPage() {
    const { toast } = useToast();
    const [showApiKey, setShowApiKey] = useState(false)
    const [backupInProgress, setBackupInProgress] = useState(false)
    const [departments, setDepartments] = useState<Department[]>([]);
    const [approvers, setApprovers] = useState<Approver[]>([]);
    const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
    const [newDepartment, setNewDepartment] = useState({ name: "", head: "" });
    const [isAddApproverOpen, setIsAddApproverOpen] = useState(false);
    const [newApprover, setNewApprover] = useState({ title: "", name: "" });
    const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [isEditApproverOpen, setIsEditApproverOpen] = useState(false);
    const [editingApprover, setEditingApprover] = useState<Approver | null>(null);
    const [isUserMatrixOpen, setIsUserMatrixOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState({
        open: false, type: null as 'department' | 'approver' | 'user' | null, id: null as string | null, name: null as string | null,
    });
    const [dbStats, setDbStats] = useState<any>(null);
    const [standards, setStandards] = useState<Standard[]>([]);
    const [isAddStandardOpen, setIsAddStandardOpen] = useState(false);
    const [isEditStandardOpen, setIsEditStandardOpen] = useState(false);
    const [editingStandard, setEditingStandard] = useState<Standard | null>(null);
    const [newStandard, setNewStandard] = useState({ name: "", title: "", description: "", category: "", status: "Active" });

    const [smtpSettings, setSmtpSettings] = useState({
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        smtpUser: "noreply@contoh.co.id",
        smtpPass: "••••••••",
    });
    const [testEmailRecipient, setTestEmailRecipient] = useState("");
    const [isTestingEmail, setIsTestingEmail] = useState(false);


    const fetchData = async () => { setIsLoading(true); try { await Promise.all([fetchDepartments(), fetchApprovers(), fetchSecurityLogs(), fetchStandards(), fetchUsers(), fetchDbStats()]); } catch (error) { toast({ variant: "destructive", title: "Error", description: "Gagal memuat semua data pengaturan." }); } finally { setIsLoading(false); } };
    const fetchDepartments = async () => { try { const response = await fetch('/api/settings/departments'); if (!response.ok) throw new Error('Gagal mengambil data departemen'); setDepartments(await response.json()); } catch (error) { toast({ variant: "destructive", title: "Error Departemen", description: (error as Error).message }); } };
    const fetchApprovers = async () => { try { const response = await fetch('/api/settings/approvers'); if (!response.ok) throw new Error('Gagal mengambil data approver'); setApprovers(await response.json()); } catch (error) { toast({ variant: "destructive", title: "Error Approver", description: (error as Error).message }); } };
    const fetchSecurityLogs = async () => { try { const response = await fetch('/api/logs/security'); if (!response.ok) throw new Error('Gagal mengambil data log keamanan'); setSecurityLogs(await response.json()); } catch (error) { toast({ variant: "destructive", title: "Error Log", description: (error as Error).message }); } };
    const fetchUsers = async () => { try { const response = await fetch('/api/users'); if (!response.ok) throw new Error('Gagal mengambil data pengguna'); setUsers(await response.json()); } catch (error) { toast({ variant: "destructive", title: "Error Pengguna", description: (error as Error).message }); } };
    const fetchDbStats = async () => { try { const response = await fetch('/api/database/status'); if (!response.ok) throw new Error('Gagal mengambil status DB'); setDbStats(await response.json()); } catch (error) { toast({ variant: "destructive", title: "Error Status DB", description: (error as Error).message }); } };
    useEffect(() => { fetchData(); }, []);

    const userMatrixData = useMemo(() => {
        if (!users.length) return { departmentNodes: [], unassignedUsers: [] };
        const usersWithSubordinates: HierarchicalUser[] = users.map(u => ({ ...u, subordinates: [] }));
        const userMap = new Map(usersWithSubordinates.map(u => [u._id.toString(), u]));
        const topLevelUsers: HierarchicalUser[] = [];
        usersWithSubordinates.forEach(user => {
            if (user.supervisorId) {
                const supervisor = userMap.get(user.supervisorId.toString());
                if (supervisor) {
                    supervisor.subordinates.push(user);
                } else {
                    topLevelUsers.push(user);
                }
            } else {
                topLevelUsers.push(user);
            }
        });
        const departmentNodes: DepartmentNode[] = departments.map(dept => ({
            department: dept,
            users: [],
        }));
        const departmentMap = new Map(departmentNodes.map(d => [d.department._id.toString(), d]));
        const unassignedUsers: HierarchicalUser[] = [];
        topLevelUsers.forEach(user => {
            if (user.departmentId) {
                const departmentNode = departmentMap.get(user.departmentId.toString());
                if (departmentNode) {
                    departmentNode.users.push(user);
                } else {
                    unassignedUsers.push(user);
                }
            } else {
                unassignedUsers.push(user);
            }
        });
        return { departmentNodes, unassignedUsers };
    }, [users, departments]);

    const handleEditUserClick = (user: UserType) => {
        setEditingUser(user);
        setIsEditUserModalOpen(true);
    };

    const handleBackup = async () => {
        setBackupInProgress(true);
        try {
            const response = await fetch('/api/database/backup', { method: 'POST' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal memulai backup.');
            }
            const header = response.headers.get('Content-Disposition');
            const parts = header ? header.split(';') : [];
            let filename = 'backup.json';
            parts.forEach(part => {
                if (part.trim().startsWith('filename=')) {
                    filename = part.split('=')[1].replace(/"/g, '');
                }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast({ title: "Sukses", description: "Backup database berhasil diunduh." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error Backup", description: (error as Error).message });
        } finally {
            setBackupInProgress(false);
        }
    };
    const handleAddDepartment = async (e: React.FormEvent) => { e.preventDefault(); if (!newDepartment.name || !newDepartment.head) return; setIsLoading(true); try { const response = await fetch('/api/settings/departments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newDepartment) }); if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Gagal'); } await logActivity('CREATE', 'Departemen', `Menambahkan departemen: ${newDepartment.name}`); await fetchData(); setIsAddDepartmentOpen(false); setNewDepartment({ name: "", head: "" }); toast({ title: "Sukses", description: "Departemen baru berhasil ditambahkan." }); } catch (error) { toast({ variant: "destructive", title: "Error", description: (error as Error).message }); } finally { setIsLoading(false); } };
    const handleAddApprover = async (e: React.FormEvent) => { e.preventDefault(); if (!newApprover.title || !newApprover.name) return; setIsLoading(true); try { const response = await fetch('/api/settings/approvers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newApprover) }); if (!response.ok) { const err = await response.json(); throw new Error(err.message); } await logActivity('CREATE', 'Approval', `Menambahkan jabatan <span class="math-inline">\{newApprover\.title\} \(</span>{newApprover.name})`); await fetchData(); setIsAddApproverOpen(false); setNewApprover({ title: "", name: "" }); toast({ title: "Sukses", description: "Jabatan approval berhasil ditambahkan." }); } catch (error) { toast({ variant: "destructive", title: "Error", description: (error as Error).message }); } finally { setIsLoading(false); } };
    const handleEditDepartmentClick = (department: Department) => { setEditingDepartment(JSON.parse(JSON.stringify(department))); setIsEditDepartmentOpen(true); };
    const handleEditApproverClick = (approver: Approver) => { setEditingApprover(JSON.parse(JSON.stringify(approver))); setIsEditApproverOpen(true); };
    const handleUpdateDepartment = async (e: React.FormEvent) => { e.preventDefault(); if (!editingDepartment?._id) return; setIsLoading(true); try { const response = await fetch(`/api/settings/departments/${editingDepartment._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editingDepartment.name, head: editingDepartment.head }), }); if (!response.ok) { const err = await response.json(); throw new Error(err.message); } await logActivity('UPDATE', 'Departemen', `Memperbarui departemen: ${editingDepartment.name}`); await fetchData(); setIsEditDepartmentOpen(false); toast({ title: "Sukses", description: "Departemen berhasil diperbarui." }); } catch (error) { toast({ variant: "destructive", title: "Error", description: (error as Error).message }); } finally { setIsLoading(false); } };
    const handleUpdateApprover = async (e: React.FormEvent) => { e.preventDefault(); if (!editingApprover?._id) return; setIsLoading(true); try { const response = await fetch(`/api/settings/approvers/${editingApprover._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editingApprover.title, name: editingApprover.name }), }); if (!response.ok) { const err = await response.json(); throw new Error(err.message); } await logActivity('UPDATE', 'Approval', `Memperbarui jabatan: ${editingApprover.title}`); await fetchData(); setIsEditApproverOpen(false); toast({ title: "Sukses", description: "Jabatan approval berhasil diperbarui." }); } catch (error) { toast({ variant: "destructive", title: "Error", description: (error as Error).message }); } finally { setIsLoading(false); } };
    const handleUpdateStandard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStandard?._id) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/settings/standards/${editingStandard._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingStandard),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Gagal memperbarui standar');
            }
            await logActivity('UPDATE', 'Standar ISO', `Memperbarui standar: ${editingStandard.name}`);
            await fetchData();
            setIsEditStandardOpen(false);
            toast({ title: "Sukses", description: "Standar berhasil diperbarui." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    };
    const handleDeleteClick = (type: 'department' | 'approver'| 'standard' | 'user', item: { _id?: string, name?: string, title?: string }) => {
        setDeleteConfirm({
            open: true,
            type,
            id: item._id || null,
            name: item.name || item.title || null,
        });
    };
    const fetchStandards = async () => {
        try {
            const response = await fetch('/api/settings/standards');
            if (!response.ok) throw new Error('Gagal mengambil data standar');
            setStandards(await response.json());
        } catch (error) { toast({ variant: "destructive", title: "Error Standar", description: (error as Error).message }); }
    };

    const handleAddStandard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStandard.name || !newStandard.title) return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/settings/standards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newStandard) });
            if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Gagal'); }
            await logActivity('CREATE', 'Standar ISO', `Menambahkan standar: ${newStandard.name}`);
            await fetchData();
            setIsAddStandardOpen(false);
            setNewStandard({ name: "", title: "", description: "", category: "", status: "Active" });
            toast({ title: "Sukses", description: "Standar baru berhasil ditambahkan." });
        } catch (error) { toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally { setIsLoading(false); }
    };

    const handleEditStandardClick = (standard: Standard) => {
        setEditingStandard(JSON.parse(JSON.stringify(standard)));
        setIsEditStandardOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id || !deleteConfirm.type) return;
        setIsLoading(true);
        try {
            const url = deleteConfirm.type === 'user' ? `/api/users/${deleteConfirm.id}` : `/api/settings/${deleteConfirm.type}s/${deleteConfirm.id}`;
            const response = await fetch(url, { method: 'DELETE' });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Gagal menghapus ${deleteConfirm.type}.`);
            }
            await logActivity('DELETE', deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1), `Menghapus ${deleteConfirm.type}: ${deleteConfirm.name}`);
            await fetchData();
            toast({ title: "Berhasil!", description: `${deleteConfirm.name} berhasil dihapus.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Error Hapus!", description: (error as Error).message });
        } finally {
            setIsLoading(false);
            setDeleteConfirm({ open: false, type: null, id: null, name: null });
        }
    };

    const handleSmtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSmtpSettings(prev => ({ ...prev, [id]: id === 'smtpPort' ? parseInt(value, 10) : value }));
    };

    const handleEmailTest = async (type: 'verify' | 'test') => {
        setIsTestingEmail(true);
        try {
            const payload = {
                ...smtpSettings,
                type,
                recipientEmail: testEmailRecipient,
            };
            const response = await fetch('/api/notifications/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Terjadi kesalahan');
            }
            toast({ title: "Sukses", description: result.message });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsTestingEmail(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold">Pengaturan Sistem</h1><div className="flex space-x-2"><Button variant="outline">Reset ke Default</Button><Button>Simpan Perubahan</Button></div></div>
            <Tabs defaultValue="general" className="w-full">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/4">
                        <TabsList className="flex flex-col h-auto p-0 bg-transparent space-y-1">
                            <TabsTrigger value="general" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted"><Settings className="mr-2 h-4 w-4" />Umum</TabsTrigger>
                            <TabsTrigger value="users" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted"><Users className="mr-2 h-4 w-4" />Pengguna</TabsTrigger>
                            <TabsTrigger value="organization" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted"><Building className="mr-2 h-4 w-4" />Organisasi</TabsTrigger>
                            <TabsTrigger value="security" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted"><Shield className="mr-2 h-4 w-4" />Keamanan</TabsTrigger>
                            <TabsTrigger value="database" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted"><Database className="mr-2 h-4 w-4" />Basis Data</TabsTrigger>
                            <TabsTrigger value="notifications" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted"><Bell className="mr-2 h-4 w-4" />Notifikasi</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="md:w-3/4">
                        <TabsContent value="general"><div className="space-y-6"><Card><CardHeader><CardTitle>Informasi Sistem</CardTitle><CardDescription>Kelola pengaturan umum sistem</CardDescription></CardHeader><CardContent className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="system-name">Nama Sistem</Label><Input id="system-name" defaultValue="ISO Integrated System" /></div><div className="space-y-2"><Label htmlFor="system-version">Versi</Label><Input id="system-version" defaultValue="2.1.0" readOnly /></div><div className="space-y-2"><Label htmlFor="company-name">Nama Perusahaan</Label><Input id="company-name" defaultValue="PT. Contoh Indonesia" /></div><div className="space-y-2"><Label htmlFor="license-key">License Key</Label><Input id="license-key" defaultValue="ISO-2024-ENTERPRISE-001" readOnly /></div></div><Separator /><div className="space-y-4"><h3 className="text-lg font-medium">Preferensi Tampilan</h3><div className="space-y-4"><div className="flex items-center justify-between"><div className="space-y-0.5"><Label htmlFor="dark-mode">Mode Gelap</Label><p className="text-sm text-muted-foreground">Aktifkan mode gelap secara default</p></div><Switch id="dark-mode" /></div><div className="flex items-center justify-between"><div className="space-y-0.5"><Label htmlFor="compact-view">Tampilan Kompak</Label><p className="text-sm text-muted-foreground">Gunakan tampilan yang lebih kompak</p></div><Switch id="compact-view" /></div><div className="flex items-center justify-between"><div className="space-y-0.5"><Label htmlFor="sidebar-collapsed">Sidebar Tertutup</Label><p className="text-sm text-muted-foreground">Sidebar tertutup secara default</p></div><Switch id="sidebar-collapsed" /></div></div></div><Separator /><div className="space-y-4"><h3 className="text-lg font-medium">Bahasa & Wilayah</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="language">Bahasa</Label><select id="language" className="w-full p-2 rounded-md border border-input bg-background"><option value="id">Bahasa Indonesia</option><option value="en">English</option></select></div><div className="space-y-2"><Label htmlFor="timezone">Zona Waktu</Label><select id="timezone" className="w-full p-2 rounded-md border border-input bg-background"><option value="Asia/Jakarta">Asia/Jakarta (GMT+7)</option><option value="Asia/Makassar">Asia/Makassar (GMT+8)</option><option value="Asia/Jayapura">Asia/Jayapura (GMT+9)</option></select></div><div className="space-y-2"><Label htmlFor="date-format">Format Tanggal</Label><select id="date-format" className="w-full p-2 rounded-md border border-input bg-background"><option value="dd/mm/yyyy">DD/MM/YYYY</option><option value="mm/dd/yyyy">MM/DD/YYYY</option><option value="yyyy-mm-dd">YYYY-MM-DD</option></select></div><div className="space-y-2"><Label htmlFor="currency">Mata Uang</Label><select id="currency" className="w-full p-2 rounded-md border border-input bg-background"><option value="IDR">Rupiah (IDR)</option><option value="USD">US Dollar (USD)</option><option value="EUR">Euro (EUR)</option></select></div></div></div></CardContent></Card></div></TabsContent>
                        <TabsContent value="users"><div className="space-y-6"><Card><CardHeader><div className="flex justify-between items-center"><div><CardTitle>Manajemen Pengguna</CardTitle><CardDescription>Kelola pengguna dan hak akses sistem</CardDescription></div><div className="flex space-x-2"><Button variant="outline" onClick={() => setIsUserMatrixOpen(true)}><Users2 className="mr-2 h-4 w-4" />Lihat Matriks</Button><Button onClick={() => setIsAddUserModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Tambah Pengguna</Button></div></div></CardHeader><CardContent><div className="space-y-4"><div className="flex justify-between items-center"><Input placeholder="Cari pengguna..." className="max-w-sm" /><div className="flex space-x-2"><Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button><Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" />Import</Button></div></div><div className="border rounded-lg"><div className="overflow-x-auto"><table className="w-full"><thead className="border-b bg-muted/50"><tr><th className="text-left p-4">Pengguna</th><th className="text-left p-4">Role</th><th className="text-left p-4">Status</th><th className="text-left p-4">Login Terakhir</th><th className="text-left p-4">Aksi</th></tr></thead><tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id.toString()} className="border-b">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><User className="h-4 w-4" /></div>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4"><Badge variant={user.role === "administrator" ? "default" : "secondary"}>{user.role}</Badge></td>
                                    <td className="p-4"><Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge></td>
                                    <td className="p-4 text-sm text-muted-foreground">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEditUserClick(user)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick('user', user)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center p-8 text-muted-foreground">{isLoading ? "Memuat data pengguna..." : "Tidak ada data pengguna."}</td></tr>
                        )}
                        </tbody></table></div></div></div></CardContent></Card><Card><CardHeader><CardTitle>Pengaturan Pengguna</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Registrasi Mandiri</Label><p className="text-sm text-muted-foreground">Izinkan pengguna mendaftar sendiri</p></div><Switch /></div><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Verifikasi Email</Label><p className="text-sm text-muted-foreground">Wajibkan verifikasi email untuk akun baru</p></div><Switch defaultChecked /></div><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Two-Factor Authentication</Label><p className="text-sm text-muted-foreground">Wajibkan 2FA untuk semua pengguna</p></div><Switch /></div></CardContent></Card></div></TabsContent>

                        <TabsContent value="organization">
                            <div className="space-y-6">
                                <Card><CardHeader><CardTitle>Informasi Organisasi</CardTitle><CardDescription>Kelola informasi perusahaan dan struktur organisasi</CardDescription></CardHeader><CardContent className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="company-name-org">Nama Perusahaan</Label><Input id="company-name-org" defaultValue="PT. Contoh Indonesia" /></div><div className="space-y-2"><Label htmlFor="company-code">Kode Perusahaan</Label><Input id="company-code" defaultValue="PCI001" /></div><div className="space-y-2"><Label htmlFor="tax-id">NPWP</Label><Input id="tax-id" defaultValue="01.234.567.8-901.000" /></div><div className="space-y-2"><Label htmlFor="business-license">Nomor Izin Usaha</Label><Input id="business-license" defaultValue="NIB-1234567890123" /></div></div><div className="space-y-2"><Label htmlFor="company-address">Alamat Perusahaan</Label><Textarea id="company-address" defaultValue="Jl. Contoh No. 123, Jakarta Selatan 12345" /></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label htmlFor="phone">Telepon</Label><Input id="phone" defaultValue="+62 21 1234 5678" /></div><div className="space-y-2"><Label htmlFor="email-org">Email</Label><Input id="email-org" defaultValue="info@contoh.co.id" /></div><div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" defaultValue="https://www.contoh.co.id" /></div></div></CardContent></Card>
                                <Card>
                                    <CardHeader><div className="flex justify-between items-center"><div><CardTitle>Departemen</CardTitle><CardDescription>Kelola struktur departemen organisasi</CardDescription></div><Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}><DialogTrigger asChild><Button onClick={() => setNewDepartment({ name: "", head: "" })}><Plus className="mr-2 h-4 w-4" />Tambah Departemen</Button></DialogTrigger><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Tambah Departemen Baru</DialogTitle></DialogHeader><form onSubmit={handleAddDepartment} className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="dept-name">Nama Departemen</Label><Input id="dept-name" value={newDepartment.name} onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))} placeholder="Contoh: Quality Assurance" required /></div><div className="space-y-2"><Label htmlFor="dept-head">Kepala Departemen</Label><Input id="dept-head" value={newDepartment.head} onChange={(e) => setNewDepartment(prev => ({ ...prev, head: e.target.value }))} placeholder="Contoh: John Doe" required /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setIsAddDepartmentOpen(false)}>Batal</Button><Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan'}</Button></DialogFooter></form></DialogContent></Dialog></div></CardHeader>
                                    <CardContent><div className="border rounded-lg"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="text-left p-4">Departemen</th><th className="text-left p-4">Kepala</th><th className="text-right p-4">Aksi</th></tr></thead><tbody>{departments.map((dept) => (<tr key={dept._id} className="border-b"><td className="p-4 font-medium">{dept.name}</td><td className="p-4 text-muted-foreground">{dept.head}</td><td className="p-4 text-right"><div className="flex justify-end"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditDepartmentClick(dept)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick('department', dept)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></td></tr>))}</tbody></table></div></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><div className="flex justify-between items-center"><div><CardTitle>Manajemen Approval</CardTitle><CardDescription>Kelola jabatan dan nama penanggung jawab persetujuan.</CardDescription></div><Dialog open={isAddApproverOpen} onOpenChange={setIsAddApproverOpen}><DialogTrigger asChild><Button onClick={() => setNewApprover({ title: "", name: "" })}><Plus className="mr-2 h-4 w-4" />Tambah Approval</Button></DialogTrigger><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Tambah Jabatan Approval</DialogTitle></DialogHeader><form onSubmit={handleAddApprover} className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="approverTitle">Nama Jabatan</Label><Input id="approverTitle" value={newApprover.title} onChange={(e) => setNewApprover(prev => ({...prev, title: e.target.value}))} placeholder="Contoh: Direktur Utama" required/></div><div className="space-y-2"><Label htmlFor="approverName">Nama Penanggung Jawab</Label><Input id="approverName" value={newApprover.name} onChange={(e) => setNewApprover(prev => ({...prev, name: e.target.value}))} placeholder="Contoh: Budi Santoso" required/></div><DialogFooter><Button type="button" variant="outline" onClick={() => setIsAddApproverOpen(false)}>Batal</Button><Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan'}</Button></DialogFooter></form></DialogContent></Dialog></div></CardHeader>
                                    <CardContent><div className="border rounded-lg"><table className="w-full"><thead className="border-b bg-muted/50"><tr><th className="text-left p-4">Jabatan</th><th className="text-left p-4">Nama Penanggung Jawab</th><th className="text-right p-4">Aksi</th></tr></thead><tbody>{approvers.map((approver) => (<tr key={approver._id} className="border-b"><td className="p-4"><div className="flex items-center space-x-3"><Key className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{approver.title}</span></div></td><td className="p-4 text-muted-foreground">{approver.name}</td><td className="p-4 text-right"><div className="flex justify-end"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditApproverClick(approver)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick('approver', approver)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></td></tr>))}</tbody></table></div></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle>Standard</CardTitle>
                                                <CardDescription>Kelola standard yang diterapkan dalam organisasi.</CardDescription>
                                            </div>
                                            <Dialog open={isAddStandardOpen} onOpenChange={setIsAddStandardOpen}>
                                                <DialogTrigger asChild>
                                                    <Button onClick={() => setNewStandard({ name: "", title: "", description: "", category: "", status: "Active" })}>
                                                        <Plus className="mr-2 h-4 w-4" />Tambah Standar
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-lg">
                                                    <DialogHeader><DialogTitle>Tambah Standar Baru</DialogTitle></DialogHeader>
                                                    <form onSubmit={handleAddStandard} className="space-y-4 py-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2"><Label htmlFor="std-name">Nama Standard (e.g., ISO 9001:2015)</Label><Input id="std-name" value={newStandard.name} onChange={(e) => setNewStandard(prev => ({ ...prev, name: e.target.value }))} required /></div>
                                                            <div className="space-y-2"><Label htmlFor="std-title">Judul Standard</Label><Input id="std-title" value={newStandard.title} onChange={(e) => setNewStandard(prev => ({ ...prev, title: e.target.value }))} placeholder="Sistem Manajemen Mutu" required/></div>
                                                        </div>
                                                        <div className="space-y-2"><Label htmlFor="std-desc">Deskripsi</Label><Textarea id="std-desc" value={newStandard.description} onChange={(e) => setNewStandard(prev => ({ ...prev, description: e.target.value }))} /></div>
                                                        <DialogFooter><Button type="button" variant="outline" onClick={() => setIsAddStandardOpen(false)}>Batal</Button><Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan'}</Button></DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border rounded-lg">
                                            <table className="w-full text-sm">
                                                <thead className="border-b bg-muted/50"><tr><th className="text-left p-4">Nama Standar</th><th className="text-left p-4">Judul</th><th className="text-right p-4">Aksi</th></tr></thead>
                                                <tbody>
                                                {standards.map((std) => (
                                                    <tr key={std._id} className="border-b">
                                                        <td className="p-4 font-medium">{std.name}</td>
                                                        <td className="p-4 text-muted-foreground">{std.title}</td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditStandardClick(std)}><Edit className="h-4 w-4" /></Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick('standard', std)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="security"><div className="space-y-6"><Card><CardHeader><CardTitle>Kebijakan Keamanan</CardTitle><CardDescription>Kelola pengaturan keamanan sistem</CardDescription></CardHeader><CardContent className="space-y-6"><div className="space-y-4"><h3 className="text-lg font-medium">Kebijakan Password</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="min-password">Panjang Minimum Password</Label><Input id="min-password" type="number" defaultValue="8" /></div><div className="space-y-2"><Label htmlFor="password-expiry">Masa Berlaku Password (hari)</Label><Input id="password-expiry" type="number" defaultValue="90" /></div></div><div className="space-y-4"><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Wajib Huruf Besar</Label><p className="text-sm text-muted-foreground">Password harus mengandung huruf besar</p></div><Switch defaultChecked /></div><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Wajib Angka</Label><p className="text-sm text-muted-foreground">Password harus mengandung angka</p></div><Switch defaultChecked /></div><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Wajib Karakter Khusus</Label><p className="text-sm text-muted-foreground">Password harus mengandung karakter khusus</p></div><Switch defaultChecked /></div></div></div><Separator /><div className="space-y-4"><h3 className="text-lg font-medium">Pengaturan Session</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="session-timeout">Session Timeout (menit)</Label><Input id="session-timeout" type="number" defaultValue="30" /></div><div className="space-y-2"><Label htmlFor="max-login-attempts">Maksimal Percobaan Login</Label><Input id="max-login-attempts" type="number" defaultValue="5" /></div></div><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Logout Otomatis</Label><p className="text-sm text-muted-foreground">Logout otomatis saat tidak aktif</p></div><Switch defaultChecked /></div></div><Separator /><div className="space-y-4"><h3 className="text-lg font-medium">API Security</h3><div className="space-y-4"><div className="space-y-2"><Label htmlFor="api-key">API Key</Label><div className="flex space-x-2"><Input id="api-key" type={showApiKey ? "text" : "password"} defaultValue="sk-1234567890abcdef1234567890abcdef" readOnly /><Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>{showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /></Button></div></div><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Rate Limiting</Label><p className="text-sm text-muted-foreground">Batasi jumlah request per menit</p></div><Switch defaultChecked /></div><div className="space-y-2"><Label htmlFor="rate-limit">Rate Limit (request/menit)</Label><Input id="rate-limit" type="number" defaultValue="100" /></div></div></div></CardContent></Card><Card><CardHeader><CardTitle>Log Keamanan</CardTitle><CardDescription>Monitor aktivitas perubahan pada data master sistem</CardDescription></CardHeader><CardContent><div className="space-y-4">{securityLogs.map((log) => (<div key={log._id} className="flex items-center justify-between p-3 border rounded-lg"><div className="flex items-center space-x-3"><Shield className="h-5 w-5 text-blue-500" /><div><div className="font-medium">{log.action}: {log.module}</div><div className="text-sm text-muted-foreground">{log.description}</div></div></div><div className="text-sm text-muted-foreground text-right"><div>{new Date(log.timestamp).toLocaleDateString()}</div><div className="text-xs">{new Date(log.timestamp).toLocaleTimeString()}</div></div></div>))}{securityLogs.length === 0 && !isLoading && (<p className="text-sm text-center text-muted-foreground py-4">Belum ada aktivitas tercatat.</p>)}</div></CardContent></Card></div></TabsContent>
                        <TabsContent value="database"><div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Status Database</CardTitle><CardDescription>Monitor status dan performa database</CardDescription></CardHeader>
                                <CardContent>
                                    {isLoading && !dbStats && <p>Memuat status database...</p>}
                                    {dbStats && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center space-x-2 mb-2"><Server className={`h-5 w-5 ${dbStats.isConnected ? 'text-green-500' : 'text-red-500'}`} /><span className="font-medium">Status Koneksi</span></div>
                                                <div className={`text-2xl font-bold ${dbStats.isConnected ? 'text-green-500' : 'text-red-500'}`}>{dbStats.isConnected ? 'Online' : 'Offline'}</div>
                                                <div className="text-sm text-muted-foreground">Database: {dbStats.dbName}</div>
                                            </div>
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center space-x-2 mb-2"><HardDrive className="h-5 w-5 text-blue-500" /><span className="font-medium">Penggunaan Storage</span></div>
                                                <div className="text-2xl font-bold">{(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB</div>
                                                <div className="text-sm text-muted-foreground">{dbStats.collections} koleksi, {dbStats.objects} dokumen</div>
                                            </div>
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center space-x-2 mb-2"><Monitor className="h-5 w-5 text-purple-500" /><span className="font-medium">Rata-rata Ukuran Dokumen</span></div>
                                                <div className="text-2xl font-bold">{(dbStats.avgObjSize / 1024).toFixed(2)} KB</div>
                                                <div className="text-sm text-muted-foreground">{dbStats.indexes} indeks</div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card><CardHeader><CardTitle>Backup & Restore</CardTitle><CardDescription>Kelola backup dan restore database</CardDescription></CardHeader><CardContent className="space-y-6"><div className="flex items-center justify-between p-4 border rounded-lg"><div><div className="font-medium">Backup Otomatis</div><div className="text-sm text-muted-foreground">Backup harian pada pukul 02:00 WIB</div></div><Switch defaultChecked /></div><div className="space-y-4"><div className="flex justify-between items-center"><h3 className="text-lg font-medium">Backup Manual</h3><Button onClick={handleBackup} disabled={backupInProgress}>{backupInProgress ? (<><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Memproses...</>) : (<><Download className="mr-2 h-4 w-4" />Buat Backup</>)}</Button></div><div className="space-y-3">{[{name: "backup_2024_01_15.sql", size: "45.2 MB", date: "15 Jan 2024, 02:00", status: "Berhasil",}, {name: "backup_2024_01_14.sql", size: "44.8 MB", date: "14 Jan 2024, 02:00", status: "Berhasil",}, {name: "backup_2024_01_13.sql", size: "44.1 MB", date: "13 Jan 2024, 02:00", status: "Berhasil",}, {name: "backup_2024_01_12.sql", size: "43.9 MB", date: "12 Jan 2024, 02:00", status: "Gagal",},].map((backup, index) => (<div key={index} className="flex items-center justify-between p-3 border rounded-lg"><div className="flex items-center space-x-3"><Database className="h-5 w-5 text-blue-500" /><div><div className="font-medium">{backup.name}</div><div className="text-sm text-muted-foreground">{backup.size} • {backup.date}</div></div></div><div className="flex items-center space-x-2"><Badge variant={backup.status === "Berhasil" ? "default" : "destructive"}>{backup.status}</Badge><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button><Button variant="ghost" size="sm"><Upload className="h-4 w-4" /></Button></div></div>))}</div></div></CardContent></Card><Card><CardHeader><CardTitle>Pengaturan Database</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="db-host">Database Host</Label><Input id="db-host" defaultValue="localhost" /></div><div className="space-y-2"><Label htmlFor="db-port">Port</Label><Input id="db-port" defaultValue="5432" /></div><div className="space-y-2"><Label htmlFor="db-name">Database Name</Label><Input id="db-name" defaultValue="iso_system" /></div><div className="space-y-2"><Label htmlFor="db-user">Username</Label><Input id="db-user" defaultValue="iso_user" /></div></div><div className="space-y-4"><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>SSL Connection</Label><p className="text-sm text-muted-foreground">Gunakan koneksi SSL untuk keamanan</p></div><Switch defaultChecked /></div><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Connection Pooling</Label><p className="text-sm text-muted-foreground">Aktifkan connection pooling</p></div><Switch defaultChecked /></div></div></CardContent></Card></div></TabsContent>
                        <TabsContent value="notifications"><div className="space-y-6"><Card><CardHeader><CardTitle>Pengaturan Email</CardTitle><CardDescription>Konfigurasi server email untuk notifikasi</CardDescription></CardHeader><CardContent className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="smtpHost">SMTP Host</Label><Input id="smtpHost" value={smtpSettings.smtpHost} onChange={handleSmtpChange} /></div><div className="space-y-2"><Label htmlFor="smtpPort">SMTP Port</Label><Input id="smtpPort" type="number" value={smtpSettings.smtpPort} onChange={handleSmtpChange} /></div><div className="space-y-2"><Label htmlFor="smtpUser">SMTP Username</Label><Input id="smtpUser" value={smtpSettings.smtpUser} onChange={handleSmtpChange} /></div><div className="space-y-2"><Label htmlFor="smtpPass">SMTP Password</Label><Input id="smtpPass" type="password" value={smtpSettings.smtpPass} onChange={handleSmtpChange} /></div></div><div className="space-y-4"><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>TLS/SSL</Label><p className="text-sm text-muted-foreground">Gunakan enkripsi TLS/SSL</p></div><Switch defaultChecked /></div><div className="space-y-2"><Label htmlFor="from-email">From Email</Label><Input id="from-email" defaultValue="ISO System <noreply@contoh.co.id>" /></div></div><Separator /><div className="space-y-4"><h3 className="text-lg font-medium">Kirim Email Tes</h3><div className="space-y-2"><Label htmlFor="testEmailRecipient">Email Penerima Tes</Label><Input id="testEmailRecipient" type="email" placeholder="penerima@example.com" value={testEmailRecipient} onChange={(e) => setTestEmailRecipient(e.target.value)} /></div><div className="flex space-x-2"><Button variant="outline" onClick={() => handleEmailTest('verify')} disabled={isTestingEmail}>{isTestingEmail ? 'Menguji...' : 'Test Koneksi'}</Button><Button variant="outline" onClick={() => handleEmailTest('test')} disabled={isTestingEmail}>{isTestingEmail ? 'Mengirim...' : 'Kirim Test Email'}</Button></div></div></CardContent></Card><Card><CardHeader><CardTitle>Template Notifikasi</CardTitle><CardDescription>Kelola template email notifikasi</CardDescription></CardHeader><CardContent><div className="space-y-4">{[{ name: "Audit Reminder", description: "Pengingat audit yang akan datang", status: "Aktif" }, { name: "CAPA Due Date", description: "Notifikasi CAPA yang akan jatuh tempo", status: "Aktif", }, { name: "Risk Alert", description: "Peringatan risiko tinggi", status: "Aktif" }, { name: "Document Review", description: "Pengingat review dokumen", status: "Tidak Aktif" }, { name: "Training Reminder", description: "Pengingat pelatihan", status: "Aktif" },].map((template, index) => (<div key={index} className="flex items-center justify-between p-4 border rounded-lg"><div className="flex items-center space-x-3"><Mail className="h-5 w-5 text-blue-500" /><div><div className="font-medium">{template.name}</div><div className="text-sm text-muted-foreground">{template.description}</div></div></div><div className="flex items-center space-x-2"><Badge variant={template.status === "Aktif" ? "default" : "secondary"}>{template.status}</Badge><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></div></div>))}</div></CardContent></Card><Card><CardHeader><CardTitle>Pengaturan Notifikasi</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-4"><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Email Notifications</Label><p className="text-sm text-muted-foreground">Kirim notifikasi melalui email</p></div><Switch defaultChecked /></div><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Push Notifications</Label><p className="text-sm text-muted-foreground">Notifikasi push di browser</p></div><Switch defaultChecked /></div><div className="flex items-center justify-between"><div className="space-y-0.5"><Label>SMS Notifications</Label><p className="text-sm text-muted-foreground">Notifikasi melalui SMS (untuk alert kritis)</p></div><Switch /></div></div><Separator /><div className="space-y-4"><h3 className="text-lg font-medium">Frekuensi Notifikasi</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="audit-reminder">Pengingat Audit (hari sebelum)</Label><Input id="audit-reminder" type="number" defaultValue="7" /></div><div className="space-y-2"><Label htmlFor="capa-reminder">Pengingat CAPA (hari sebelum)</Label><Input id="capa-reminder" type="number" defaultValue="3" /></div><div className="space-y-2"><Label htmlFor="doc-review">Review Dokumen (hari sebelum)</Label><Input id="doc-review" type="number" defaultValue="14" /></div><div className="space-y-2"><Label htmlFor="training-reminder">Pengingat Training (hari sebelum)</Label><Input id="training-reminder" type="number" defaultValue="5" /></div></div></div></CardContent></Card></div></TabsContent>
                    </div>
                </div>
            </Tabs>

            {/* --- Dialog untuk Edit --- */}
            <Dialog open={isEditDepartmentOpen} onOpenChange={setIsEditDepartmentOpen}><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Edit Departemen</DialogTitle></DialogHeader>{editingDepartment && (<form onSubmit={handleUpdateDepartment} className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="edit-dept-name">Nama Departemen</Label><Input id="edit-dept-name" value={editingDepartment.name} onChange={(e) => setEditingDepartment(prev => prev ? {...prev, name: e.target.value} : null)} required /></div><div className="space-y-2"><Label htmlFor="edit-dept-head">Kepala Departemen</Label><Input id="edit-dept-head" value={editingDepartment.head} onChange={(e) => setEditingDepartment(prev => prev ? {...prev, head: e.target.value} : null)} required /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setIsEditDepartmentOpen(false)}>Batal</Button><Button type="submit" disabled={isLoading}>{isLoading ? 'Memperbarui...' : 'Simpan Perubahan'}</Button></DialogFooter></form>)}</DialogContent></Dialog>
            <Dialog open={isEditApproverOpen} onOpenChange={setIsEditApproverOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Jabatan Approval</DialogTitle>
                    </DialogHeader>
                    {editingApprover && (
                        <form onSubmit={handleUpdateApprover} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-approver-title">Nama Jabatan</Label>
                                <Input
                                    id="edit-approver-title"
                                    value={editingApprover.title}
                                    onChange={(e) => setEditingApprover(prev => prev ? {...prev, title: e.target.value} : null)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-approver-name">Nama Penanggung Jawab</Label>
                                <Input
                                    id="edit-approver-name"
                                    value={editingApprover.name}
                                    onChange={(e) => setEditingApprover(prev => prev ? {...prev, name: e.target.value} : null)}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditApproverOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={isLoading}>{isLoading ? 'Memperbarui...' : 'Simpan Perubahan'}</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Konfirmasi Penghapusan</DialogTitle><DialogDescription>Apakah Anda yakin ingin menghapus <b>{deleteConfirm.name}</b>? Tindakan ini tidak dapat dibatalkan.</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={() => setDeleteConfirm({ open: false, type: null, id: null, name: null })} disabled={isLoading}>Batal</Button><Button type="submit" variant="destructive" disabled={isLoading} onClick={confirmDelete}>{isLoading ? "Menghapus..." : "Hapus"}</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={isEditStandardOpen} onOpenChange={setIsEditStandardOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Standar: {editingStandard?.name}</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi untuk standar ISO ini.
                        </DialogDescription>
                    </DialogHeader>
                    {editingStandard && (
                        <form onSubmit={handleUpdateStandard} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-std-name">Nama Standar (e.g., ISO 9001:2015)</Label>
                                    <Input
                                        id="edit-std-name"
                                        value={editingStandard.name}
                                        onChange={(e) => setEditingStandard(prev => prev ? {...prev, name: e.target.value} : null)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-std-title">Judul Standar</Label>
                                    <Input
                                        id="edit-std-title"
                                        value={editingStandard.title}
                                        onChange={(e) => setEditingStandard(prev => prev ? {...prev, title: e.target.value} : null)}
                                        placeholder="Sistem Manajemen Mutu"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-std-desc">Deskripsi</Label>
                                <Textarea
                                    id="edit-std-desc"
                                    value={editingStandard.description}
                                    onChange={(e) => setEditingStandard(prev => prev ? {...prev, description: e.target.value} : null)}
                                    placeholder="Deskripsi singkat mengenai standar"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-std-category">Kategori</Label>
                                    <Input
                                        id="edit-std-category"
                                        value={editingStandard.category}
                                        onChange={(e) => setEditingStandard(prev => prev ? {...prev, category: e.target.value} : null)}
                                        placeholder="Contoh: Quality"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-std-status">Status</Label>
                                    <Input
                                        id="edit-std-status"
                                        value={editingStandard.status}
                                        onChange={(e) => setEditingStandard(prev => prev ? {...prev, status: e.target.value} : null)}
                                        placeholder="Contoh: Active"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditStandardOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Memperbarui...' : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <UserMatrixModal
                isOpen={isUserMatrixOpen}
                onOpenChange={setIsUserMatrixOpen}
                matrixData={userMatrixData}
            />
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onOpenChange={setIsAddUserModalOpen}
                departments={departments}
                users={users}
                onUserAdded={fetchData}
            />
            <EditUserModal
                isOpen={isEditUserModalOpen}
                onOpenChange={setIsEditUserModalOpen}
                departments={departments}
                users={users}
                editingUser={editingUser}
                onUserUpdated={fetchData}
            />
        </div>
    )
}