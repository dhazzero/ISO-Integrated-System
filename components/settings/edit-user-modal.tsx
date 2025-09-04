"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Department, User as UserType, UserRole } from "@/lib/types"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { logActivity } from "@/lib/logger"
import { useEffect } from "react"

interface EditUserModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    departments: Department[];
    users: UserType[];
    editingUser: UserType | null;
    onUserUpdated: () => void;
}

const passwordValidation = z.string()
    .min(8, { message: "Password minimal 8 karakter." })
    .refine(value => /[A-Z]/.test(value), { message: "Harus ada min. 1 huruf besar." })
    .refine(value => /[a-z]/.test(value), { message: "Harus ada min. 1 huruf kecil." })
    .refine(value => /\d/.test(value), { message: "Harus ada min. 1 angka." })
    .refine(value => /[@$!%*?&]/.test(value), { message: "Harus ada min. 1 karakter spesial." });

const formSchema = z.object({
    name: z.string().min(1, "Nama lengkap diperlukan"),
    userId: z.string().min(3, "User ID minimal 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.union([z.literal(''), passwordValidation]).optional(),
    role: z.nativeEnum(UserRole),
    status: z.enum(['active', 'inactive', 'pending']),
    departmentId: z.string().optional().nullable(),
    supervisorId: z.string().optional().nullable(),
});

export function EditUserModal({ isOpen, onOpenChange, departments, users, editingUser, onUserUpdated }: EditUserModalProps) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    // Pre-fill form when editingUser changes
    useEffect(() => {
        if (editingUser) {
            form.reset({
                name: editingUser.name,
                userId: editingUser.userId,
                email: editingUser.email,
                password: '', // Jangan pre-fill password
                role: editingUser.role,
                status: editingUser.status,
                departmentId: editingUser.departmentId?.toString() || "null",
                supervisorId: editingUser.supervisorId?.toString() || "null",
            });
        }
    }, [editingUser, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!editingUser) return;

        const payload = {
            ...values,
            departmentId: values.departmentId === "null" ? null : values.departmentId,
            supervisorId: values.supervisorId === "null" ? null : values.supervisorId,
        };

        try {
            const response = await fetch(`/api/users/${editingUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(errorData.message || "Gagal memperbarui pengguna");
                (error as any).status = response.status;
                throw error;
            }

            toast({ title: "Sukses", description: `Pengguna "${values.name}" berhasil diperbarui.` });
            await logActivity('UPDATE', 'Pengguna', `Memperbarui pengguna: ${values.name} (${values.userId})`);
            onUserUpdated();
            onOpenChange(false);
        } catch (error: any) {
            if (error.status === 409) {
                form.setError("email", { type: "manual", message: "Email ini sudah digunakan oleh pengguna lain." });
            } else {
                toast({ variant: "destructive", title: "Error", description: error.message });
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Pengguna: {editingUser?.name}</DialogTitle>
                    <DialogDescription>
                        Perbarui detail pengguna. Biarkan password kosong jika tidak ingin mengubahnya.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Form fields are similar to AddUserModal, but with pre-filled values */}
                        {/* Name and UserID */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nama Lengkap</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="userId" render={({ field }) => ( <FormItem> <FormLabel>User ID</FormLabel> <FormControl><Input {...field} readOnly /></FormControl> <FormMessage /> </FormItem> )}/>
                        </div>
                        {/* Email */}
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input type="email" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                        {/* Password */}
                        <FormField control={form.control} name="password" render={({ field }) => ( <FormItem> <FormLabel>Password Baru (Opsional)</FormLabel> <FormControl><Input type="password" {...field} placeholder="Kosongkan jika tidak berubah" /></FormControl> <FormMessage /> </FormItem> )}/>
                        {/* Role and Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="role" render={({ field }) => ( <FormItem> <FormLabel>Role</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl> <SelectContent>{Object.values(UserRole).map(role => (<SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="status" render={({ field }) => ( <FormItem> <FormLabel>Status</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl> <SelectContent>{['active', 'inactive', 'pending'].map(s => (<SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                        </div>
                        {/* Department */}
                        <FormField control={form.control} name="departmentId" render={({ field }) => ( <FormItem> <FormLabel>Departemen</FormLabel> <Select onValueChange={field.onChange} value={field.value || "null"}> <FormControl><SelectTrigger><SelectValue placeholder="Pilih departemen" /></SelectTrigger></FormControl> <SelectContent><SelectItem value="null">Tidak ada</SelectItem>{departments.map(d => (<SelectItem key={d._id.toString()} value={d._id.toString()}>{d.name}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                        {/* Supervisor */}
                        <FormField control={form.control} name="supervisorId" render={({ field }) => ( <FormItem> <FormLabel>Atasan Langsung</FormLabel> <Select onValueChange={field.onChange} value={field.value || "null"}> <FormControl><SelectTrigger><SelectValue placeholder="Pilih atasan" /></SelectTrigger></FormControl> <SelectContent><SelectItem value="null">Tidak ada</SelectItem>{users.filter(u => u.role === UserRole.MANAGER || u.role === UserRole.ADMINISTRATOR && u._id !== editingUser?._id).map(u => (<SelectItem key={u._id.toString()} value={u._id.toString()}>{u.name}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )}/>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Memperbarui...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
