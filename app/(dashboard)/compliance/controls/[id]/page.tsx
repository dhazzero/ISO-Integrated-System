"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Edit } from "lucide-react"

interface Control {
  name: string
  description?: string
  category?: string
  owner?: string
  status?: string
  effectiveness?: string
  nextReview?: string
  standards?: { id: string; name: string; selected?: boolean }[]
  gaps?: { id: string; standard: string; clause: string; description: string; severity: string; dueDate: string; responsible: string }[]
  documentIds?: string[]
}

interface Document { id: string; name: string }

export default function ControlViewPage() {
  const params = useParams()
  const id = params.id as string
  const [control, setControl] = useState<Control | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/compliance/controls/${id}`)
      if (!res.ok) return
      const data: Control = await res.json()
      setControl(data)
      if (data.documentIds?.length) {
        const dres = await fetch("/api/documents")
        if (dres.ok) {
          const docs: Document[] = await dres.json()
          setDocuments(docs.filter((d) => data.documentIds!.includes(d.id)))
        }
      }
    }
    load()
  }, [id])

  if (!control) return <p className="p-4">Loading...</p>

  const statuses = ["Implemented", "Partial", "Not Implemented", "Under Review"]
  const effectiveness = ["High", "Medium", "Low"]

  return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/compliance">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{control.name}</h1>
          </div>
          <Link href={`/compliance/controls/${id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Kontrol</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kontrol</Label>
                <Input id="name" value={control.name} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input id="category" value={control.category || ""} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" value={control.description || ""} disabled rows={4} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Pemilik</Label>
                <Input id="owner" value={control.owner || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={control.status} disabled>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveness">Efektivitas</Label>
                <Select value={control.effectiveness} disabled>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {effectiveness.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextReview">Next Review</Label>
              <Input id="nextReview" value={control.nextReview || ""} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Standar Terkait</CardTitle>
          </CardHeader>
          <CardContent>
            {control.standards && control.standards.length > 0 ? (
                <ul className="space-y-1">
                  {control.standards.map((std) => (
                      <li key={std.id} className="flex items-center space-x-2">
                        <Checkbox checked={!!std.selected} disabled />
                        <span>{std.name}</span>
                      </li>
                  ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">Tidak ada standar terkait.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            {control.gaps && control.gaps.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Standar</th>
                      <th className="text-left py-2 px-3">Clause</th>
                      <th className="text-left py-2 px-3">Deskripsi</th>
                      <th className="text-left py-2 px-3">Severity</th>
                      <th className="text-left py-2 px-3">Due Date</th>
                      <th className="text-left py-2 px-3">Responsible</th>
                    </tr>
                    </thead>
                    <tbody>
                    {control.gaps.map((gap) => (
                        <tr key={gap.id} className="border-b">
                          <td className="py-2 px-3">{gap.standard}</td>
                          <td className="py-2 px-3">{gap.clause}</td>
                          <td className="py-2 px-3">{gap.description}</td>
                          <td className="py-2 px-3">{gap.severity}</td>
                          <td className="py-2 px-3">{gap.dueDate}</td>
                          <td className="py-2 px-3">{gap.responsible}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Tidak ada gap.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dokumen Terkait</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada dokumen terkait.</p>
            ) : (
                <ul className="list-disc list-inside">
                  {documents.map((doc) => (
                      <li key={doc.id}>{doc.name}</li>
                  ))}
                </ul>
            )}
          </CardContent>
        </Card>
      </div>
  )
}