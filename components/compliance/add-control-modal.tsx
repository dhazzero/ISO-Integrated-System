// components/compliance/add-control-modal.tsx
"use client"

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; //
import { Plus } from "lucide-react";
import { useState, useEffect } from "react"; // Tambahkan useEffect
import { useAuditTrail } from "@/hooks/use-audit-trail"; //
import { useToast } from "@/components/ui/use-toast"; //

interface StandardOption {
  _id: string; // ID dari MongoDB
  name: string;
  // tambahkan properti lain jika perlu ditampilkan
}

interface AddControlModalProps {
  onControlAdded: (newControl: any) => void; // Callback ke parent
}

export function AddControlModal({ onControlAdded }: AddControlModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); //

  const initialFormData = {
    name: "",
    description: "",
    category: "",
    owner: "",
    status: "Not Implemented",
    effectiveness: "Medium",
    relatedStandards: [] as string[], // Akan menyimpan nama standar yang dipilih
  };
  const [formData, setFormData] = useState(initialFormData);
  const [availableStandards, setAvailableStandards] = useState<StandardOption[]>([]);
  const [selectedStandardsMap, setSelectedStandardsMap] = useState<Record<string, boolean>>({});


  const { logCreate } = useAuditTrail(); //

  useEffect(() => {
    const fetchAvailableStandards = async () => {
      if (open) { // Hanya fetch jika modal terbuka
        try {
          const response = await fetch('/api/settings/standards');
          if (!response.ok) throw new Error('Gagal mengambil daftar standar');
          const data: StandardOption[] = await response.json();
          setAvailableStandards(data);
          // Inisialisasi selectedStandardsMap berdasarkan formData.relatedStandards (jika edit)
          // Untuk add, defaultnya kosong
          const initialMap: Record<string, boolean> = {};
          data.forEach(std => {
            initialMap[std.name] = formData.relatedStandards.includes(std.name);
          });
          setSelectedStandardsMap(initialMap);
        } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Tidak dapat memuat daftar standar." });
        }
      }
    };
    fetchAvailableStandards();
  }, [open, formData.relatedStandards]); // Tambahkan formData.relatedStandards jika Anda ingin map terupdate jika nilai default berubah


  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStandardChange = (standardName: string, checked: boolean | 'indeterminate') => {
    const isChecked = typeof checked === 'boolean' ? checked : false;
    setSelectedStandardsMap(prev => ({
      ...prev,
      [standardName]: isChecked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const finalRelatedStandards = Object.entries(selectedStandardsMap)
        .filter(([_,isSelected]) => isSelected)
        .map(([standardName, _]) => standardName);

    const controlDataToSave = {
      ...formData,
      relatedStandards: finalRelatedStandards,
    };

    try {
      const response = await fetch('/api/compliance/controls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(controlDataToSave),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Gagal menyimpan kontrol');
      }
      const newControl = await response.json();

      logCreate( //
          "Compliance",
          "Control",
          newControl._id || `CTRL-${Date.now()}`,
          newControl.name,
          newControl,
          "Current User", // Ganti dengan user aktual
          "Compliance Officer" // Ganti dengan role aktual
      );

      toast({ title: "Sukses", description: `Kontrol "${newControl.name}" berhasil ditambahkan.` });
      setOpen(false);
      setFormData(initialFormData); // Reset form
      setSelectedStandardsMap({}); // Reset map standar
      onControlAdded(newControl); // Panggil callback

    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : 'Gagal menyimpan kontrol.' });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["Dokumentasi", "Keamanan", "Operasional", "Manajemen", "Teknis"];
  const statuses = ["Implemented", "Partial", "Not Implemented", "Under Review"];
  const effectivenessOptions = ["High", "Medium", "Low"]; // Ubah nama variabel agar tidak konflik

  return (
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) { // Reset form jika modal ditutup
          setFormData(initialFormData);
          setSelectedStandardsMap({});
        }
      }}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kontrol
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Kontrol Baru</DialogTitle>
            <DialogDescription>
              Masukkan informasi kontrol baru yang akan ditambahkan ke sistem kepatuhan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... field Nama Kontrol, Kategori, Deskripsi ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kontrol *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>{categories.map((category) => (<SelectItem key={category} value={category}>{category}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi *</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={3} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Pemilik Kontrol *</Label>
                <Input id="owner" value={formData.owner} onChange={(e) => handleInputChange("owner", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                  <SelectContent>{statuses.map((status) => (<SelectItem key={status} value={status}>{status === "Implemented" ? "Diterapkan" : status === "Partial" ? "Sebagian" : status === "Not Implemented" ? "Belum Diterapkan" : "Dalam Tinjauan"}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveness">Efektivitas *</Label>
                <Select value={formData.effectiveness} onValueChange={(value) => handleInputChange("effectiveness", value)}>
                  <SelectTrigger><SelectValue placeholder="Pilih efektivitas" /></SelectTrigger>
                  <SelectContent>{effectivenessOptions.map((eff) => (<SelectItem key={eff} value={eff}>{eff === "High" ? "Tinggi" : eff === "Medium" ? "Sedang" : "Rendah"}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Standar Terkait</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                {availableStandards.length > 0 ? availableStandards.map((standard) => (
                    <div key={standard._id} className="flex items-center space-x-2">
                      <Checkbox
                          id={`standard-${standard._id}`}
                          checked={selectedStandardsMap[standard.name] || false}
                          onCheckedChange={(checked) => handleStandardChange(standard.name, checked)}
                      />
                      <Label htmlFor={`standard-${standard._id}`}>{standard.name}</Label>
                    </div>
                )) : <p className="text-sm text-muted-foreground">Memuat standar atau tidak ada standar tersedia...</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Kontrol"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  )
}