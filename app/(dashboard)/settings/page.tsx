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
  Settings,
  Users,
  Building,
  Shield,
  Database,
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  User,
  Mail,
  Server,
  HardDrive,
  Monitor,
} from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [backupInProgress, setBackupInProgress] = useState(false)

  const handleBackup = () => {
    setBackupInProgress(true)
    setTimeout(() => setBackupInProgress(false), 3000)
  }

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pengaturan Sistem</h1>
          <div className="flex space-x-2">
            <Button variant="outline">Reset ke Default</Button>
            <Button>Simpan Perubahan</Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              <TabsList className="flex flex-col h-auto p-0 bg-transparent space-y-1">
                <TabsTrigger value="general" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                  <Settings className="mr-2 h-4 w-4" />
                  Umum
                </TabsTrigger>
                <TabsTrigger value="users" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                  <Users className="mr-2 h-4 w-4" />
                  Pengguna
                </TabsTrigger>
                <TabsTrigger value="organization" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                  <Building className="mr-2 h-4 w-4" />
                  Organisasi
                </TabsTrigger>
                <TabsTrigger value="security" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                  <Shield className="mr-2 h-4 w-4" />
                  Keamanan
                </TabsTrigger>
                <TabsTrigger value="database" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                  <Database className="mr-2 h-4 w-4" />
                  Basis Data
                </TabsTrigger>
                <TabsTrigger value="notifications" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifikasi
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="md:w-3/4">
              {/* GENERAL TAB */}
              <TabsContent value="general">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informasi Sistem</CardTitle>
                      <CardDescription>Kelola pengaturan umum sistem</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="system-name">Nama Sistem</Label>
                          <Input id="system-name" defaultValue="ISO Integrated System" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="system-version">Versi</Label>
                          <Input id="system-version" defaultValue="2.1.0" readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company-name">Nama Perusahaan</Label>
                          <Input id="company-name" defaultValue="PT. Contoh Indonesia" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="license-key">License Key</Label>
                          <Input id="license-key" defaultValue="ISO-2024-ENTERPRISE-001" readOnly />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Preferensi Tampilan</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="dark-mode">Mode Gelap</Label>
                              <p className="text-sm text-muted-foreground">Aktifkan mode gelap secara default</p>
                            </div>
                            <Switch id="dark-mode" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="compact-view">Tampilan Kompak</Label>
                              <p className="text-sm text-muted-foreground">Gunakan tampilan yang lebih kompak</p>
                            </div>
                            <Switch id="compact-view" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="sidebar-collapsed">Sidebar Tertutup</Label>
                              <p className="text-sm text-muted-foreground">Sidebar tertutup secara default</p>
                            </div>
                            <Switch id="sidebar-collapsed" />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Bahasa & Wilayah</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="language">Bahasa</Label>
                            <select id="language" className="w-full p-2 rounded-md border border-input bg-background">
                              <option value="id">Bahasa Indonesia</option>
                              <option value="en">English</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timezone">Zona Waktu</Label>
                            <select id="timezone" className="w-full p-2 rounded-md border border-input bg-background">
                              <option value="Asia/Jakarta">Asia/Jakarta (GMT+7)</option>
                              <option value="Asia/Makassar">Asia/Makassar (GMT+8)</option>
                              <option value="Asia/Jayapura">Asia/Jayapura (GMT+9)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="date-format">Format Tanggal</Label>
                            <select id="date-format" className="w-full p-2 rounded-md border border-input bg-background">
                              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currency">Mata Uang</Label>
                            <select id="currency" className="w-full p-2 rounded-md border border-input bg-background">
                              <option value="IDR">Rupiah (IDR)</option>
                              <option value="USD">US Dollar (USD)</option>
                              <option value="EUR">Euro (EUR)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* USERS TAB */}
              <TabsContent value="users">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Manajemen Pengguna</CardTitle>
                          <CardDescription>Kelola pengguna dan hak akses sistem</CardDescription>
                        </div>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Tambah Pengguna
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Input placeholder="Cari pengguna..." className="max-w-sm" />
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </Button>
                            <Button variant="outline" size="sm">
                              <Upload className="mr-2 h-4 w-4" />
                              Import
                            </Button>
                          </div>
                        </div>

                        <div className="border rounded-lg">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="border-b bg-muted/50">
                              <tr>
                                <th className="text-left p-4">Pengguna</th>
                                <th className="text-left p-4">Role</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Login Terakhir</th>
                                <th className="text-left p-4">Aksi</th>
                              </tr>
                              </thead>
                              <tbody>
                              {[
                                {
                                  name: "Admin System",
                                  email: "admin@example.com",
                                  role: "Super Admin",
                                  status: "Aktif",
                                  lastLogin: "2 menit lalu",
                                },
                                {
                                  name: "John Doe",
                                  email: "john@example.com",
                                  role: "Auditor",
                                  status: "Aktif",
                                  lastLogin: "1 jam lalu",
                                },
                                {
                                  name: "Jane Smith",
                                  email: "jane@example.com",
                                  role: "Manager",
                                  status: "Tidak Aktif",
                                  lastLogin: "2 hari lalu",
                                },
                                {
                                  name: "Bob Wilson",
                                  email: "bob@example.com",
                                  role: "User",
                                  status: "Aktif",
                                  lastLogin: "5 menit lalu",
                                },
                              ].map((user, index) => (
                                  <tr key={index} className="border-b">
                                    <td className="p-4">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                          <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <div className="font-medium">{user.name}</div>
                                          <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <Badge variant={user.role === "Super Admin" ? "default" : "secondary"}>
                                        {user.role}
                                      </Badge>
                                    </td>
                                    <td className="p-4">
                                      <Badge variant={user.status === "Aktif" ? "default" : "secondary"}>
                                        {user.status}
                                      </Badge>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">{user.lastLogin}</td>
                                    <td className="p-4">
                                      <div className="flex space-x-2">
                                        <Button variant="ghost" size="sm">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pengaturan Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Registrasi Mandiri</Label>
                          <p className="text-sm text-muted-foreground">Izinkan pengguna mendaftar sendiri</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Verifikasi Email</Label>
                          <p className="text-sm text-muted-foreground">Wajibkan verifikasi email untuk akun baru</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Wajibkan 2FA untuk semua pengguna</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ORGANIZATION TAB */}
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

                  <Card>
                    <CardHeader>
                      <CardTitle>Standar ISO</CardTitle>
                      <CardDescription>Standar ISO yang diterapkan dalam organisasi</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          {
                            standard: "ISO 27001:2022",
                            name: "Sistem Manajemen Keamanan Informasi",
                            status: "Aktif",
                            cert: "Tersertifikasi",
                          },
                          {
                            standard: "ISO 9001:2015",
                            name: "Sistem Manajemen Mutu",
                            status: "Aktif",
                            cert: "Tersertifikasi",
                          },
                          {
                            standard: "ISO 37001:2016",
                            name: "Sistem Manajemen Anti-Penyuapan",
                            status: "Aktif",
                            cert: "Dalam Proses",
                          },
                        ].map((iso, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <div className="font-medium">{iso.standard}</div>
                                <div className="text-sm text-muted-foreground">{iso.name}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={iso.cert === "Tersertifikasi" ? "default" : "secondary"}>{iso.cert}</Badge>
                                <Badge variant="outline">{iso.status}</Badge>
                              </div>
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* SECURITY TAB */}
              <TabsContent value="security">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Kebijakan Keamanan</CardTitle>
                      <CardDescription>Kelola pengaturan keamanan sistem</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Kebijakan Password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="min-password">Panjang Minimum Password</Label>
                            <Input id="min-password" type="number" defaultValue="8" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password-expiry">Masa Berlaku Password (hari)</Label>
                            <Input id="password-expiry" type="number" defaultValue="90" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Wajib Huruf Besar</Label>
                              <p className="text-sm text-muted-foreground">Password harus mengandung huruf besar</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Wajib Angka</Label>
                              <p className="text-sm text-muted-foreground">Password harus mengandung angka</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Wajib Karakter Khusus</Label>
                              <p className="text-sm text-muted-foreground">Password harus mengandung karakter khusus</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Pengaturan Session</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="session-timeout">Session Timeout (menit)</Label>
                            <Input id="session-timeout" type="number" defaultValue="30" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="max-login-attempts">Maksimal Percobaan Login</Label>
                            <Input id="max-login-attempts" type="number" defaultValue="5" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Logout Otomatis</Label>
                            <p className="text-sm text-muted-foreground">Logout otomatis saat tidak aktif</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">API Security</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="api-key">API Key</Label>
                            <div className="flex space-x-2">
                              <Input
                                  id="api-key"
                                  type={showApiKey ? "text" : "password"}
                                  defaultValue="sk-1234567890abcdef1234567890abcdef"
                                  readOnly
                              />
                              <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Rate Limiting</Label>
                              <p className="text-sm text-muted-foreground">Batasi jumlah request per menit</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rate-limit">Rate Limit (request/menit)</Label>
                            <Input id="rate-limit" type="number" defaultValue="100" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Log Keamanan</CardTitle>
                      <CardDescription>Monitor aktivitas keamanan sistem</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          {
                            type: "Login Berhasil",
                            user: "admin@example.com",
                            ip: "192.168.1.100",
                            time: "2 menit lalu",
                            status: "success",
                          },
                          {
                            type: "Login Gagal",
                            user: "unknown@example.com",
                            ip: "203.0.113.1",
                            time: "5 menit lalu",
                            status: "warning",
                          },
                          {
                            type: "Password Changed",
                            user: "john@example.com",
                            ip: "192.168.1.101",
                            time: "1 jam lalu",
                            status: "info",
                          },
                          {
                            type: "Suspicious Activity",
                            user: "attacker@evil.com",
                            ip: "198.51.100.1",
                            time: "2 jam lalu",
                            status: "danger",
                          },
                        ].map((log, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        log.status === "success"
                                            ? "bg-green-500"
                                            : log.status === "warning"
                                                ? "bg-yellow-500"
                                                : log.status === "danger"
                                                    ? "bg-red-500"
                                                    : "bg-blue-500"
                                    }`}
                                />
                                <div>
                                  <div className="font-medium">{log.type}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {log.user} dari {log.ip}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">{log.time}</div>
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* DATABASE TAB */}
              <TabsContent value="database">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Database</CardTitle>
                      <CardDescription>Monitor status dan performa database</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Server className="h-5 w-5 text-green-500" />
                            <span className="font-medium">Status Koneksi</span>
                          </div>
                          <div className="text-2xl font-bold text-green-500">Online</div>
                          <div className="text-sm text-muted-foreground">Uptime: 99.9%</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <HardDrive className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">Penggunaan Storage</span>
                          </div>
                          <div className="text-2xl font-bold">2.4 GB</div>
                          <div className="text-sm text-muted-foreground">dari 10 GB (24%)</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Monitor className="h-5 w-5 text-purple-500" />
                            <span className="font-medium">Query Performance</span>
                          </div>
                          <div className="text-2xl font-bold">45ms</div>
                          <div className="text-sm text-muted-foreground">Rata-rata response time</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Backup & Restore</CardTitle>
                      <CardDescription>Kelola backup dan restore database</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Backup Otomatis</div>
                          <div className="text-sm text-muted-foreground">Backup harian pada pukul 02:00 WIB</div>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Backup Manual</h3>
                          <Button onClick={handleBackup} disabled={backupInProgress}>
                            {backupInProgress ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Memproses...
                                </>
                            ) : (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  Buat Backup
                                </>
                            )}
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {[
                            {
                              name: "backup_2024_01_15.sql",
                              size: "45.2 MB",
                              date: "15 Jan 2024, 02:00",
                              status: "Berhasil",
                            },
                            {
                              name: "backup_2024_01_14.sql",
                              size: "44.8 MB",
                              date: "14 Jan 2024, 02:00",
                              status: "Berhasil",
                            },
                            {
                              name: "backup_2024_01_13.sql",
                              size: "44.1 MB",
                              date: "13 Jan 2024, 02:00",
                              status: "Berhasil",
                            },
                            {
                              name: "backup_2024_01_12.sql",
                              size: "43.9 MB",
                              date: "12 Jan 2024, 02:00",
                              status: "Gagal",
                            },
                          ].map((backup, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <Database className="h-5 w-5 text-blue-500" />
                                  <div>
                                    <div className="font-medium">{backup.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {backup.size} • {backup.date}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={backup.status === "Berhasil" ? "default" : "destructive"}>
                                    {backup.status}
                                  </Badge>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pengaturan Database</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="db-host">Database Host</Label>
                          <Input id="db-host" defaultValue="localhost" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="db-port">Port</Label>
                          <Input id="db-port" defaultValue="5432" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="db-name">Database Name</Label>
                          <Input id="db-name" defaultValue="iso_system" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="db-user">Username</Label>
                          <Input id="db-user" defaultValue="iso_user" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>SSL Connection</Label>
                            <p className="text-sm text-muted-foreground">Gunakan koneksi SSL untuk keamanan</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Connection Pooling</Label>
                            <p className="text-sm text-muted-foreground">Aktifkan connection pooling</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* NOTIFICATIONS TAB */}
              <TabsContent value="notifications">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pengaturan Email</CardTitle>
                      <CardDescription>Konfigurasi server email untuk notifikasi</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="smtp-host">SMTP Host</Label>
                          <Input id="smtp-host" defaultValue="smtp.gmail.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smtp-port">SMTP Port</Label>
                          <Input id="smtp-port" defaultValue="587" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smtp-user">SMTP Username</Label>
                          <Input id="smtp-user" defaultValue="noreply@contoh.co.id" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smtp-pass">SMTP Password</Label>
                          <Input id="smtp-pass" type="password" defaultValue="••••••••" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>TLS/SSL</Label>
                            <p className="text-sm text-muted-foreground">Gunakan enkripsi TLS/SSL</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="from-email">From Email</Label>
                          <Input id="from-email" defaultValue="ISO System <noreply@contoh.co.id>" />
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline">Test Koneksi</Button>
                        <Button variant="outline">Kirim Test Email</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Template Notifikasi</CardTitle>
                      <CardDescription>Kelola template email notifikasi</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { name: "Audit Reminder", description: "Pengingat audit yang akan datang", status: "Aktif" },
                          {
                            name: "CAPA Due Date",
                            description: "Notifikasi CAPA yang akan jatuh tempo",
                            status: "Aktif",
                          },
                          { name: "Risk Alert", description: "Peringatan risiko tinggi", status: "Aktif" },
                          { name: "Document Review", description: "Pengingat review dokumen", status: "Tidak Aktif" },
                          { name: "Training Reminder", description: "Pengingat pelatihan", status: "Aktif" },
                        ].map((template, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-blue-500" />
                                <div>
                                  <div className="font-medium">{template.name}</div>
                                  <div className="text-sm text-muted-foreground">{template.description}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={template.status === "Aktif" ? "default" : "secondary"}>
                                  {template.status}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pengaturan Notifikasi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Kirim notifikasi melalui email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">Notifikasi push di browser</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">Notifikasi melalui SMS (untuk alert kritis)</p>
                          </div>
                          <Switch />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Frekuensi Notifikasi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="audit-reminder">Pengingat Audit (hari sebelum)</Label>
                            <Input id="audit-reminder" type="number" defaultValue="7" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="capa-reminder">Pengingat CAPA (hari sebelum)</Label>
                            <Input id="capa-reminder" type="number" defaultValue="3" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="doc-review">Review Dokumen (hari sebelum)</Label>
                            <Input id="doc-review" type="number" defaultValue="14" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="training-reminder">Pengingat Training (hari sebelum)</Label>
                            <Input id="training-reminder" type="number" defaultValue="5" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
  )
}
