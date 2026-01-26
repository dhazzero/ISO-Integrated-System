"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Settings, Save, Database, Shield, Bell, Server,
    Key, Globe, Mail, Clock, HardDrive, RefreshCw,
    Download, Upload, Trash2, AlertTriangle
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function AdminSettingsPage() {
    const { toast } = useToast()
    const [isSaving, setIsSaving] = useState(false)

    // System Settings
    const [systemSettings, setSystemSettings] = useState({
        systemName: 'ISO Integrated System',
        systemVersion: '2.0.0',
        maintenanceMode: false,
        debugMode: false,
        allowRegistration: false,
    })

    // Database Settings
    const [dbSettings, setDbSettings] = useState({
        masterDbName: 'iso_master',
        connectionPoolSize: 10,
        timeout: 30000,
        enableSSL: true,
    })

    // Security Settings
    const [securitySettings, setSecuritySettings] = useState({
        sessionTimeout: 240, // minutes
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        enforcePasswordExpiry: false,
        passwordExpiryDays: 90,
    })

    // Email Settings
    const [emailSettings, setEmailSettings] = useState({
        smtpEnabled: false,
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: '',
        fromEmail: 'noreply@iso-system.com',
        fromName: 'ISO System',
    })

    // Subscription Settings
    const [subscriptionSettings, setSubscriptionSettings] = useState({
        defaultPlan: 'basic',
        defaultDurationDays: 365,
        trialDays: 30,
        enableAutoRenewal: false,
    })

    const handleSaveSystem = async () => {
        setIsSaving(true)
        try {
            // Here you would call an API to save settings
            await new Promise(resolve => setTimeout(resolve, 500))
            toast({ title: "Berhasil", description: "Pengaturan sistem disimpan" })
        } catch (error) {
            toast({ title: "Error", description: "Gagal menyimpan", variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    const handleClearCache = () => {
        toast({ title: "Cache Cleared", description: "Semua cache telah dihapus" })
    }

    const handleExportConfig = () => {
        const config = {
            system: systemSettings,
            database: dbSettings,
            security: securitySettings,
            email: emailSettings,
            subscription: subscriptionSettings,
        }
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'iso-system-config.json'
        a.click()
        toast({ title: "Berhasil", description: "Konfigurasi diekspor" })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Pengaturan Sistem</h1>
                    <p className="text-muted-foreground">Konfigurasi sistem multi-tenant</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportConfig}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Config
                    </Button>
                    <Button onClick={handleSaveSystem} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Menyimpan...' : 'Simpan Semua'}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="system" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="system">
                        <Settings className="h-4 w-4 mr-2" />
                        Sistem
                    </TabsTrigger>
                    <TabsTrigger value="database">
                        <Database className="h-4 w-4 mr-2" />
                        Database
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Shield className="h-4 w-4 mr-2" />
                        Keamanan
                    </TabsTrigger>
                    <TabsTrigger value="email">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                    </TabsTrigger>
                    <TabsTrigger value="subscription">
                        <Key className="h-4 w-4 mr-2" />
                        Langganan
                    </TabsTrigger>
                </TabsList>

                {/* System Settings */}
                <TabsContent value="system">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengaturan Umum</CardTitle>
                            <CardDescription>Konfigurasi dasar sistem</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nama Sistem</Label>
                                    <Input
                                        value={systemSettings.systemName}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, systemName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Versi</Label>
                                    <Input value={systemSettings.systemVersion} disabled className="bg-muted" />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-medium">Mode Sistem</h3>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Mode Maintenance</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Blokir akses user saat maintenance
                                        </p>
                                    </div>
                                    <Switch
                                        checked={systemSettings.maintenanceMode}
                                        onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Mode Debug</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Tampilkan error detail (tidak untuk production)
                                        </p>
                                    </div>
                                    <Switch
                                        checked={systemSettings.debugMode}
                                        onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, debugMode: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Izinkan Registrasi</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Izinkan perusahaan baru mendaftar sendiri
                                        </p>
                                    </div>
                                    <Switch
                                        checked={systemSettings.allowRegistration}
                                        onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, allowRegistration: checked })}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-medium">Aksi Sistem</h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleClearCache}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Clear Cache
                                    </Button>
                                    <Button variant="outline">
                                        <Server className="h-4 w-4 mr-2" />
                                        Restart Services
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Database Settings */}
                <TabsContent value="database">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengaturan Database</CardTitle>
                            <CardDescription>Konfigurasi koneksi database MongoDB</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Master Database</Label>
                                    <Input value={dbSettings.masterDbName} disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Connection Pool Size</Label>
                                    <Input
                                        type="number"
                                        value={dbSettings.connectionPoolSize}
                                        onChange={(e) => setDbSettings({ ...dbSettings, connectionPoolSize: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Timeout (ms)</Label>
                                    <Input
                                        type="number"
                                        value={dbSettings.timeout}
                                        onChange={(e) => setDbSettings({ ...dbSettings, timeout: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SSL Connection</Label>
                                    <div className="flex items-center h-10">
                                        <Switch
                                            checked={dbSettings.enableSSL}
                                            onCheckedChange={(checked) => setDbSettings({ ...dbSettings, enableSSL: checked })}
                                        />
                                        <span className="ml-2 text-sm">{dbSettings.enableSSL ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <HardDrive className="h-4 w-4" />
                                    <span className="font-medium">Database Info</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge className="ml-2" variant="default">Connected</Badge>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Driver:</span>
                                        <span className="ml-2">MongoDB Node.js</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Version:</span>
                                        <span className="ml-2">6.0+</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengaturan Keamanan</CardTitle>
                            <CardDescription>Konfigurasi keamanan global untuk semua perusahaan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Session Timeout (menit)</Label>
                                    <Input
                                        type="number"
                                        value={securitySettings.sessionTimeout}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Login Attempts</Label>
                                    <Input
                                        type="number"
                                        value={securitySettings.maxLoginAttempts}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <h3 className="font-medium">Kebijakan Password</h3>

                            <div className="space-y-2">
                                <Label>Minimum Panjang Password</Label>
                                <Input
                                    type="number"
                                    value={securitySettings.passwordMinLength}
                                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                                    className="w-32"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Wajib Huruf Besar</Label>
                                    <Switch
                                        checked={securitySettings.requireUppercase}
                                        onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireUppercase: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Wajib Angka</Label>
                                    <Switch
                                        checked={securitySettings.requireNumbers}
                                        onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireNumbers: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Wajib Karakter Khusus</Label>
                                    <Switch
                                        checked={securitySettings.requireSpecialChars}
                                        onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireSpecialChars: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Enforce Password Expiry</Label>
                                    <Switch
                                        checked={securitySettings.enforcePasswordExpiry}
                                        onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enforcePasswordExpiry: checked })}
                                    />
                                </div>
                            </div>

                            {securitySettings.enforcePasswordExpiry && (
                                <div className="space-y-2">
                                    <Label>Password Expiry (hari)</Label>
                                    <Input
                                        type="number"
                                        value={securitySettings.passwordExpiryDays}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiryDays: parseInt(e.target.value) })}
                                        className="w-32"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Email Settings */}
                <TabsContent value="email">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengaturan Email</CardTitle>
                            <CardDescription>Konfigurasi SMTP untuk notifikasi sistem</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Aktifkan pengiriman email dari sistem
                                    </p>
                                </div>
                                <Switch
                                    checked={emailSettings.smtpEnabled}
                                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, smtpEnabled: checked })}
                                />
                            </div>

                            {emailSettings.smtpEnabled && (
                                <>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>SMTP Host</Label>
                                            <Input
                                                placeholder="smtp.gmail.com"
                                                value={emailSettings.smtpHost}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>SMTP Port</Label>
                                            <Input
                                                type="number"
                                                value={emailSettings.smtpPort}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>SMTP Username</Label>
                                            <Input
                                                value={emailSettings.smtpUser}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>SMTP Password</Label>
                                            <Input
                                                type="password"
                                                value={emailSettings.smtpPass}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPass: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>From Email</Label>
                                            <Input
                                                value={emailSettings.fromEmail}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>From Name</Label>
                                            <Input
                                                value={emailSettings.fromName}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <Button variant="outline">
                                        <Mail className="h-4 w-4 mr-2" />
                                        Test Connection
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Subscription Settings */}
                <TabsContent value="subscription">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengaturan Langganan</CardTitle>
                            <CardDescription>Konfigurasi default untuk perusahaan baru</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Plan</Label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={subscriptionSettings.defaultPlan}
                                        onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, defaultPlan: e.target.value })}
                                    >
                                        <option value="basic">Basic</option>
                                        <option value="professional">Professional</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Default Duration (hari)</Label>
                                    <Input
                                        type="number"
                                        value={subscriptionSettings.defaultDurationDays}
                                        onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, defaultDurationDays: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Trial Period (hari)</Label>
                                    <Input
                                        type="number"
                                        value={subscriptionSettings.trialDays}
                                        onChange={(e) => setSubscriptionSettings({ ...subscriptionSettings, trialDays: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Auto Renewal</Label>
                                    <div className="flex items-center h-10">
                                        <Switch
                                            checked={subscriptionSettings.enableAutoRenewal}
                                            onCheckedChange={(checked) => setSubscriptionSettings({ ...subscriptionSettings, enableAutoRenewal: checked })}
                                        />
                                        <span className="ml-2 text-sm">{subscriptionSettings.enableAutoRenewal ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-800 dark:text-amber-200">Catatan Penting</p>
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            Pengaturan ini hanya berlaku untuk perusahaan baru.
                                            Untuk mengubah pengaturan perusahaan existing, gunakan menu Perusahaan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
