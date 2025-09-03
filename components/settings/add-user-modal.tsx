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

interface AddUserModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  departments: Department[];
  users: UserType[];
  onUserAdded: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Nama lengkap diperlukan"),
  userId: z.string().min(3, "User ID minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Role harus dipilih" }) }),
  departmentId: z.string().optional().nullable(),
  supervisorId: z.string().optional().nullable(),
})

export function AddUserModal({ isOpen, onOpenChange, departments, users, onUserAdded }: AddUserModalProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      userId: "",
      email: "",
      password: "",
      role: UserRole.STAFF, // Menetapkan nilai default untuk role
      departmentId: "null",
      supervisorId: "null",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Menangani nilai 'null' dari select-box
    const payload = {
      ...values,
      departmentId: values.departmentId === "null" ? null : values.departmentId,
      supervisorId: values.supervisorId === "null" ? null : values.supervisorId,
    };

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal membuat pengguna");
      }

      toast({ title: "Sukses", description: `Pengguna "${values.name}" berhasil ditambahkan.` });
      await logActivity('CREATE', 'Pengguna', `Menambahkan pengguna baru: ${values.name} (${values.userId})`);
      onUserAdded();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Isi detail di bawah ini untuk membuat akun pengguna baru.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl><Input placeholder="johndoe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Sementara</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.values(UserRole).map(role => (
                          <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departemen</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "null"}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih departemen" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="null">Tidak ada</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept._id.toString()} value={dept._id.toString()}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="supervisorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atasan Langsung (Supervisor)</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value || "null"}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih atasan" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="null">Tidak ada atasan</SelectItem>
                        {users.filter(u => u.role === UserRole.MANAGER || u.role === UserRole.ADMINISTRATOR).map(user => (
                          <SelectItem key={user._id.toString()} value={user._id.toString()}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
