"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { CreditCard, Plus, Trash2, RefreshCw, Building, Wallet, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface PaymentMethod {
    _id: string;
    name: string;
    type: 'bank_transfer' | 'credit_card' | 'ewallet' | 'virtual_account';
    provider: string;
    accountNumber?: string;
    accountName?: string;
    isActive: boolean;
    isDefault: boolean;
}

const initialMethods: PaymentMethod[] = [
    {
        _id: '1',
        name: 'BCA Transfer',
        type: 'bank_transfer',
        provider: 'BCA',
        accountNumber: '1234567890',
        accountName: 'PT ISO System Indonesia',
        isActive: true,
        isDefault: true,
    },
    {
        _id: '2',
        name: 'Mandiri Transfer',
        type: 'bank_transfer',
        provider: 'Mandiri',
        accountNumber: '0987654321',
        accountName: 'PT ISO System Indonesia',
        isActive: true,
        isDefault: false,
    },
    {
        _id: '3',
        name: 'GoPay',
        type: 'ewallet',
        provider: 'GoPay',
        isActive: false,
        isDefault: false,
    },
]

export default function PaymentMethodsPage() {
    const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        type: 'bank_transfer' as PaymentMethod['type'],
        provider: '',
        accountNumber: '',
        accountName: '',
        isActive: true,
    })
    const { toast } = useToast()

    const getTypeIcon = (type: PaymentMethod['type']) => {
        switch (type) {
            case 'bank_transfer': return <Building className="h-5 w-5" />
            case 'credit_card': return <CreditCard className="h-5 w-5" />
            case 'ewallet': return <Wallet className="h-5 w-5" />
            default: return <CreditCard className="h-5 w-5" />
        }
    }

    const getTypeName = (type: PaymentMethod['type']) => {
        switch (type) {
            case 'bank_transfer': return 'Bank Transfer'
            case 'credit_card': return 'Credit Card'
            case 'ewallet': return 'E-Wallet'
            case 'virtual_account': return 'Virtual Account'
            default: return type
        }
    }

    const handleAdd = () => {
        if (!formData.name || !formData.provider) {
            toast({ title: "Error", description: "Nama dan provider wajib diisi", variant: "destructive" })
            return
        }
        const newMethod: PaymentMethod = {
            _id: Date.now().toString(),
            ...formData,
            isDefault: false,
        }
        setMethods([...methods, newMethod])
        setIsAddOpen(false)
        setFormData({ name: '', type: 'bank_transfer', provider: '', accountNumber: '', accountName: '', isActive: true })
        toast({ title: "Berhasil", description: "Metode pembayaran ditambahkan" })
    }

    const toggleActive = (id: string) => {
        setMethods(methods.map(m =>
            m._id === id ? { ...m, isActive: !m.isActive } : m
        ))
    }

    const setDefault = (id: string) => {
        setMethods(methods.map(m => ({
            ...m,
            isDefault: m._id === id
        })))
        toast({ title: "Berhasil", description: "Default payment method diubah" })
    }

    const handleDelete = (id: string) => {
        if (!confirm('Hapus metode pembayaran ini?')) return
        setMethods(methods.filter(m => m._id !== id))
        toast({ title: "Berhasil", description: "Metode pembayaran dihapus" })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Payment Methods</h1>
                    <p className="text-muted-foreground">Kelola metode pembayaran yang tersedia</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Metode
                </Button>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {methods.map((method) => (
                    <Card key={method._id} className={`relative ${method.isDefault ? 'border-primary' : ''}`}>
                        {method.isDefault && (
                            <Badge className="absolute -top-2 right-4">Default</Badge>
                        )}
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        {getTypeIcon(method.type)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{method.name}</CardTitle>
                                        <CardDescription>{getTypeName(method.type)}</CardDescription>
                                    </div>
                                </div>
                                <Switch
                                    checked={method.isActive}
                                    onCheckedChange={() => toggleActive(method._id)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm">
                                <span className="text-muted-foreground">Provider:</span>
                                <span className="ml-2 font-medium">{method.provider}</span>
                            </div>
                            {method.accountNumber && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">No. Rekening:</span>
                                    <span className="ml-2 font-mono">{method.accountNumber}</span>
                                </div>
                            )}
                            {method.accountName && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Atas Nama:</span>
                                    <span className="ml-2">{method.accountName}</span>
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                {!method.isDefault && (
                                    <Button variant="outline" size="sm" onClick={() => setDefault(method._id)}>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Set Default
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => handleDelete(method._id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Metode Pembayaran</DialogTitle>
                        <DialogDescription>Konfigurasi metode pembayaran baru</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nama</Label>
                            <Input
                                placeholder="BCA Transfer"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipe</Label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentMethod['type'] })}
                            >
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="credit_card">Credit Card</option>
                                <option value="ewallet">E-Wallet</option>
                                <option value="virtual_account">Virtual Account</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Provider</Label>
                            <Input
                                placeholder="BCA, Mandiri, GoPay, etc."
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                            />
                        </div>
                        {formData.type === 'bank_transfer' && (
                            <>
                                <div className="space-y-2">
                                    <Label>No. Rekening</Label>
                                    <Input
                                        placeholder="1234567890"
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Atas Nama</Label>
                                    <Input
                                        placeholder="PT ISO System Indonesia"
                                        value={formData.accountName}
                                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                        <div className="flex items-center justify-between">
                            <Label>Active</Label>
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
                        <Button onClick={handleAdd}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
