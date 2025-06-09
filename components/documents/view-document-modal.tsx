"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Edit, Calendar, User, Building, Tag, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface ViewDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document: any
  onEdit: (doc: any) => void
}

export function ViewDocumentModal({ isOpen, onClose, document, onEdit }: ViewDocumentModalProps) {
  if (!document) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aktif
          </Badge>
        )
      case "Review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Review
          </Badge>
        )
      case "Draft":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Edit className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        )
      case "Expired":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDownload = () => {
    if (!document.fileId) return

    const link = document.createElement("a")
    link.href = `/api/files/${document.fileId}`
    link.target = "_blank"
    link.download = document.name
    link.click()
  }

  const handleEdit = () => {
    onClose()
    onEdit(document)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <div>
              <DialogTitle className="text-xl">{document.name}</DialogTitle>
              <DialogDescription>Versi {document.version}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            {getStatusBadge(document.status)}
            <div className="text-sm text-muted-foreground">ID: DOC-{document.id.toString().padStart(4, "0")}</div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium mb-2">Deskripsi</h3>
            <p className="text-sm text-muted-foreground">{document.description}</p>
          </div>

          <Separator />

          {/* Document Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Versi</p>
                  <p className="text-sm text-muted-foreground">{document.version}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Terakhir Diperbarui</p>
                  <p className="text-sm text-muted-foreground">{document.updatedAt}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Review Berikutnya</p>
                  <p className="text-sm text-muted-foreground">{document.nextReview}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {document.approver && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Approver</p>
                    <p className="text-sm text-muted-foreground">{document.approver}</p>
                  </div>
                </div>
              )}

              {document.owner && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Owner</p>
                    <p className="text-sm text-muted-foreground">{document.owner}</p>
                  </div>
                </div>
              )}

              {document.department && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{document.department}</p>
                  </div>
                </div>
              )}

              {document.scope && (
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Scope</p>
                    <p className="text-sm text-muted-foreground">{document.scope}</p>
                  </div>
                </div>
              )}

              {document.usage && (
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Usage</p>
                    <p className="text-sm text-muted-foreground">{document.usage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Document Preview */}
          <div>
            <h3 className="font-medium mb-3">Preview Dokumen</h3>
            {document.fileId ? (
              <iframe
                src={`/api/files/${document.fileId}?inline=1`}
                className="w-full h-96 border rounded"
              />
            ) : (
              <div className="border rounded-lg p-8 text-center bg-gray-50">
                <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-sm text-muted-foreground mb-2">Preview dokumen tidak tersedia</p>
                <p className="text-xs text-muted-foreground">Klik download untuk melihat dokumen lengkap</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
