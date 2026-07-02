"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useAuditTrail } from "@/hooks/use-audit-trail";
import { useToast } from "@/components/ui/use-toast";

interface StandardOption {
  _id: string;
  name: string;
}

interface DocumentOption {
  id: string;
  name: string;
}

interface AddControlModalProps {
  onControlAdded: (newControl: unknown) => void;
}

export function AddControlModal({ onControlAdded }: AddControlModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initialFormData = {
    name: "",
    description: "",
    category: "",
    owner: "",
    status: "Belum Diterapkan",
    effectiveness: "Sedang",
    compliance: "",
    relatedStandards: [] as string[],
    documentIds: [] as string[],
  };
  const [formData, setFormData] = useState(initialFormData);
  const [availableStandards, setAvailableStandards] = useState<StandardOption[]>([]);
  const [selectedStandardsMap, setSelectedStandardsMap] = useState<Record<string, boolean>>({});
  const [availableDocuments, setAvailableDocuments] = useState<DocumentOption[]>([]);
  const [selectedDocsMap, setSelectedDocsMap] = useState<Record<string, boolean>>({});

  const { logCreate } = useAuditTrail();

  useEffect(() => {
    const fetchOptions = async () => {
      if (open) {
        try {
          const [stdRes, docRes] = await Promise.all([
            fetch("/api/settings/standards"),
            fetch("/api/documents"),
          ]);
          if (!stdRes.ok || !docRes.ok) throw new Error("Failed to load options");
          const stdData: StandardOption[] = await stdRes.json();
          const docData: DocumentOption[] = await docRes.json();
          setAvailableStandards(stdData);
          setAvailableDocuments(docData);
          const stdMap: Record<string, boolean> = {};
          stdData.forEach((std) => {
            const name = std.name || std.title || ""
            if (name) {
              stdMap[name] = formData.relatedStandards.includes(name)
            }
          });
          setSelectedStandardsMap(stdMap);
          const docMap: Record<string, boolean> = {};
          docData.forEach((doc) => {
            docMap[doc.id] = formData.documentIds.includes(doc.id);
          });
          setSelectedDocsMap(docMap);
        } catch {
          toast({ variant: "destructive", title: "Error", description: "Tidak dapat memuat pilihan." });
        }
      }
    };
    fetchOptions();
  }, [open, formData.relatedStandards, formData.documentIds, toast]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStandardChange = (standardName: string, checked: boolean | "indeterminate") => {
    const isChecked = typeof checked === "boolean" ? checked : false;
    setSelectedStandardsMap((prev) => ({
      ...prev,
      [standardName]: isChecked,
    }));
  };

  const handleDocumentChange = (docId: string, checked: boolean | "indeterminate") => {
    const isChecked = typeof checked === "boolean" ? checked : false;
    setSelectedDocsMap((prev) => ({
      ...prev,
      [docId]: isChecked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const finalRelatedStandards = Object.entries(selectedStandardsMap)
        .filter(([, isSelected]) => isSelected)
        .map(([standardName]) => standardName);

    const finalDocs = Object.entries(selectedDocsMap)
        .filter(([, isSel]) => isSel)
        .map(([docId]) => docId);

    const controlDataToSave = {
      ...formData,
      relatedStandards: finalRelatedStandards,
      documentIds: finalDocs,
    };

    try {
      const response = await fetch("/api/compliance/controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(controlDataToSave),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || "Gagal menyimpan kontrol");
      }
      const newControl = await response.json();

      logCreate(
          "Compliance",
          "Control",
          newControl._id || `CTRL-${Date.now()}`,
          newControl.name,
          newControl,
          "Current User",
          "Compliance Officer"
      );

      toast({ title: "Sukses", description: `Kontrol "${newControl.name}" berhasil ditambahkan.` });
      setOpen(false);
      setFormData(initialFormData);
      setSelectedStandardsMap({});
      setSelectedDocsMap({});
      onControlAdded(newControl);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan kontrol.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["Dokumentasi", "Keamanan", "Operasional", "Manajemen", "Teknis"];
  const statuses = ["Belum Diterapkan", "Dalam Tinjauan", "Sebagian", "Diterapkan"];
  const effectivenessOptions = ["Tinggi", "Sedang", "Rendah"];

  return (
      <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              setFormData(initialFormData);
              setSelectedStandardsMap({});
              setSelectedDocsMap({});
            }
          }}
      >
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kontrol *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Pemilik Kontrol</Label>
                <Input
                    id="owner"
                    value={formData.owner}
                    onChange={(e) => handleInputChange("owner", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effectiveness">Efektivitas *</Label>
                <Select
                    value={formData.effectiveness}
                    onValueChange={(value) => handleInputChange("effectiveness", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih efektivitas" />
                  </SelectTrigger>
                  <SelectContent>
                    {effectivenessOptions.map((eff) => (
                        <SelectItem key={eff} value={eff}>
                          {eff}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="compliance">Kepatuhan (%)</Label>
                <Input
                    id="compliance"
                    type="number"
                    value={formData.compliance}
                    onChange={(e) => handleInputChange("compliance", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Standar Terkait</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                {availableStandards.length > 0 ? (
                    availableStandards.map((standard) => {
                      const name = standard.name || standard.title || ""
                      return name ? (
                          <div key={standard._id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`standard-${standard._id}`}
                                checked={selectedStandardsMap[name] || false}
                                onCheckedChange={(checked) => handleStandardChange(name, checked)}
                            />
                            <Label htmlFor={`standard-${standard._id}`}>{name}</Label>
                          </div>
                      ) : null
                    })
                ) : (
                    <p className="text-sm text-muted-foreground">Memuat standar atau tidak ada standar tersedia...</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dokumen Terkait</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                {availableDocuments.length > 0 ? (
                    availableDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-2">
                          <Checkbox
                              id={`doc-${doc.id}`}
                              checked={selectedDocsMap[doc.id] || false}
                              onCheckedChange={(checked) => handleDocumentChange(doc.id, checked)}
                          />
                          <Label htmlFor={`doc-${doc.id}`}>{doc.name}</Label>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">Memuat dokumen atau tidak ada data...</p>
                )}
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
  );
}
