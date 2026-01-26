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
import { Plus, Edit, Trash2, RefreshCw, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface SubscriptionPlan {
    _id: string;
    name: string;
    code: string;
    description: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    features: string[];
    maxUsers: number;
    maxDocuments: number;
    isActive: boolean;
    isPopular: boolean;
}

const defaultPlans: SubscriptionPlan[] = [
    {
        _id: '1',
        name: 'Basic',
        code: 'basic',
        description: 'Untuk perusahaan kecil',
        price: 500000,
        billingCycle: 'monthly',
        features: ['5 Users', '100 Documents', 'Email Support'],
        maxUsers: 5,
        maxDocuments: 100,
        isActive: true,
        isPopular: false,
    },
    {
        _id: '2',
        name: 'Professional',
        code: 'professional',
        description: 'Untuk perusahaan menengah',
        price: 1500000,
        billingCycle: 'monthly',
        features: ['25 Users', '1000 Documents', 'Priority Support', 'Audit Module'],
        maxUsers: 25,
        maxDocuments: 1000,
        isActive: true,
        isPopular: true,
    },
    {
        _id: '3',
        name: 'Enterprise',
        code: 'enterprise',
        description: 'Untuk perusahaan besar',
        price: 5000000,
        billingCycle: 'monthly',
        features: ['Unlimited Users', 'Unlimited Documents', '24/7 Support', 'All Modules', 'Custom Integration'],
        maxUsers: -1,
        maxDocuments: -1,
        isActive: true,
        isPopular: false,
    },
]

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>(defaultPlans)
    const [isLoading, setIsLoading] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        price: 0,
        billingCycle: 'monthly' as 'monthly' | 'yearly',
        maxUsers: 5,
        maxDocuments: 100,
        features: '',
        isActive: true,
        isPopular: false,
    })
    const { toast } = useToast()

    const fetchPlans = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/billing/plans')
            if (res.ok) {
                const data = await res.json()
                if (data.plans && data.plans.length > 0) {
                    setPlans(data.plans)
                }
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPlans()
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const handleSave = async () => {
        toast({ title: "Berhasil", description: "Plan disimpan" })
        setIsAddOpen(false)
        setIsEditOpen(false)
    }

    const openEditDialog = (plan: SubscriptionPlan) => {
        setEditingPlan(plan)
        setFormData({
            name: plan.name,
            code: plan.code,
            description: plan.description,
            price: plan.price,
            billingCycle: plan.billingCycle,
            maxUsers: plan.maxUsers,
            maxDocuments: plan.maxDocuments,
            features: plan.features.join('\n'),
            isActive: plan.isActive,
            isPopular: plan.isPopular,
        })
        setIsEditOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Subscription Plans</h1>
                    <p className="text-muted-foreground">Kelola paket langganan</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchPlans} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => {
                        setFormData({
                            name: '', code: '', description: '', price: 0,
                            billingCycle: 'monthly', maxUsers: 5, maxDocuments: 100,
                            features: '', isActive: true, isPopular: false,
                        })
                        setIsAddOpen(true)
                    }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Plan
                    </Button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan) => (
                    <Card key={plan._id} className={`relative ${plan.isPopular ? 'border-primary border-2' : ''}`}>
                        {plan.isPopular && (
                            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                                Most Popular
                            </Badge>
                        )}
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </div>
                                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                                <span className="text-muted-foreground">/{plan.billingCycle === 'monthly' ? 'bulan' : 'tahun'}</span>
                            </div>

                            <div className="space-y-2">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-green-500" />
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(plan)}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
                setIsAddOpen(false)
                setIsEditOpen(false)
            }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEditOpen ? 'Edit Plan' : 'Tambah Plan Baru'}</DialogTitle>
                        <DialogDescription>Konfigurasi paket langganan</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nama Plan</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kode</Label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Deskripsi</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Harga (IDR)</Label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Billing Cycle</Label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={formData.billingCycle}
                                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'monthly' | 'yearly' })}
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Max Users (-1 = unlimited)</Label>
                                <Input
                                    type="number"
                                    value={formData.maxUsers}
                                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Documents</Label>
                                <Input
                                    type="number"
                                    value={formData.maxDocuments}
                                    onChange={(e) => setFormData({ ...formData, maxDocuments: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Features (satu per baris)</Label>
                            <textarea
                                className="w-full p-2 border rounded-md min-h-[100px]"
                                value={formData.features}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                placeholder="5 Users&#10;100 Documents&#10;Email Support"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Active</Label>
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Mark as Popular</Label>
                            <Switch
                                checked={formData.isPopular}
                                onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>
                            Batal
                        </Button>
                        <Button onClick={handleSave}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
