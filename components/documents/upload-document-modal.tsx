"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react"

interface UploadDocumentModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UploadedFile {
  file: File
  progress: number
  status: "uploading" | "completed" | "error"
  category?: string
  version?: string
}

export function UploadDocumentModal({ isOpen, onClose }: UploadDocumentModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Simulate upload progress
    newFiles.forEach((uploadFile, index) => {
      const interval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.file === uploadFile.file ? { ...f, progress: Math.min(f.progress + 10, 100) } : f)),
        )
      }, 200)

      setTimeout(() => {
        clearInterval(interval)
        setUploadedFiles((prev) =>
          prev.map((f) => (f.file === uploadFile.file ? { ...f, progress: 100, status: "completed" } : f)),
        )
      }, 2000)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFileCategory = (index: number, category: string) => {
    setUploadedFiles((prev) => prev.map((f, i) => (i === index ? { ...f, category } : f)))
  }

  const updateFileVersion = (index: number, version: string) => {
    setUploadedFiles((prev) => prev.map((f, i) => (i === index ? { ...f, version } : f)))
  }

  const handleSubmit = () => {
    // Process uploaded files
    console.log("Processing files:", uploadedFiles)
    setUploadedFiles([])
    onClose()
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    return <FileText className="h-5 w-5 text-blue-500" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Dokumen</DialogTitle>
          <DialogDescription>
            Upload dokumen dari komputer Anda. Mendukung format PDF, DOC, DOCX, XLS, XLSX
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-lg font-medium text-gray-900">Drag dan drop file di sini</span>
                <span className="mt-1 block text-sm text-gray-500">atau klik untuk memilih file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX hingga 50MB per file</p>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">File yang diupload ({uploadedFiles.length})</h3>

              <div className="space-y-3">
                {uploadedFiles.map((uploadFile, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {getFileIcon(uploadFile.file.name)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{uploadFile.file.name}</p>
                            {getStatusIcon(uploadFile.status)}
                          </div>
                          <p className="text-xs text-gray-500">{(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB</p>

                          {/* Progress Bar */}
                          {uploadFile.status === "uploading" && (
                            <div className="mt-2">
                              <Progress value={uploadFile.progress} className="h-2" />
                              <p className="text-xs text-gray-500 mt-1">{uploadFile.progress}% uploaded</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="ml-2">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* File Metadata */}
                    {uploadFile.status === "completed" && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`category-${index}`}>Kategori Dokumen</Label>
                          <Select
                            value={uploadFile.category || ""}
                            onValueChange={(value) => updateFileCategory(index, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kebijakan">Kebijakan</SelectItem>
                              <SelectItem value="prosedur">Prosedur</SelectItem>
                              <SelectItem value="instruksi-kerja">Instruksi Kerja</SelectItem>
                              <SelectItem value="formulir">Formulir</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`version-${index}`}>Versi</Label>
                          <Input
                            id={`version-${index}`}
                            value={uploadFile.version || ""}
                            onChange={(e) => updateFileVersion(index, e.target.value)}
                            placeholder="1.0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploadedFiles.length === 0 || uploadedFiles.some((f) => f.status === "uploading")}
          >
            Simpan Dokumen ({uploadedFiles.filter((f) => f.status === "completed").length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
