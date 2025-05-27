"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, FileText, Trash2, Edit, Plus, Eye, Filter } from "lucide-react"
import { useState } from "react"

export function AuditLogModal() {
  const [open, setOpen] = useState(false)
  const [filterAction, setFilterAction] = useState("all")
  const [filterUser, setFilterUser] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const auditLogs = [
    {
      id: 1,
      timestamp: "2024-01-15 14:30:25",
      user: "Admin User",
      userRole: "System Administrator",
      action: "DELETE",
      module: "Compliance",
      entity: "Control",
      entityId: "CTRL-001",
      entityName: "Kontrol Akses Fisik",
      description: "Menghapus kontrol 'Kontrol Akses Fisik' dari sistem kepatuhan",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      changes: {
        before: {
          name: "Kontrol Akses Fisik",
          status: "Implemented",
          standards: ["ISO 27001:2022"],
        },
        after: null,
      },
    },
    {
      id: 2,
      timestamp: "2024-01-15 13:45:12",
      user: "John Doe",
      userRole: "Compliance Officer",
      action: "UPDATE",
      module: "Compliance",
      entity: "Control",
      entityId: "CTRL-002",
      entityName: "Kontrol Dokumen",
      description: "Memperbarui status kontrol dari 'Partial' menjadi 'Implemented'",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      changes: {
        before: {
          status: "Partial",
          effectiveness: "Medium",
          lastReview: "2024-01-01",
        },
        after: {
          status: "Implemented",
          effectiveness: "High",
          lastReview: "2024-01-15",
        },
      },
    },
    {
      id: 3,
      timestamp: "2024-01-15 12:20:08",
      user: "Jane Smith",
      userRole: "IT Manager",
      action: "CREATE",
      module: "Compliance",
      entity: "Gap",
      entityId: "GAP-003",
      entityName: "Keamanan Endpoint",
      description: "Menambahkan kesenjangan baru untuk keamanan endpoint",
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      changes: {
        before: null,
        after: {
          standard: "ISO 27001:2022",
          clause: "A.8.1.3",
          severity: "High",
          responsible: "IT Manager",
        },
      },
    },
    {
      id: 4,
      timestamp: "2024-01-15 11:15:33",
      user: "Admin User",
      userRole: "System Administrator",
      action: "DELETE",
      module: "Compliance",
      entity: "Mapping",
      entityId: "MAP-005",
      entityName: "Manajemen Vendor",
      description: "Menghapus pemetaan standar untuk manajemen vendor",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      changes: {
        before: {
          requirement: "Manajemen Vendor",
          iso9001: "8.4",
          iso27001: "A.15.1.1",
          iso37001: "8.2",
        },
        after: null,
      },
    },
    {
      id: 5,
      timestamp: "2024-01-15 10:30:45",
      user: "Sarah Wilson",
      userRole: "Quality Manager",
      action: "VIEW",
      module: "Compliance",
      entity: "Control",
      entityId: "CTRL-001",
      entityName: "Kontrol Dokumen",
      description: "Melihat detail kontrol dokumen",
      ipAddress: "192.168.1.103",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      changes: null,
    },
    {
      id: 6,
      timestamp: "2024-01-15 09:45:22",
      user: "Mike Johnson",
      userRole: "Auditor",
      action: "UPDATE",
      module: "Compliance",
      entity: "Gap",
      entityId: "GAP-001",
      entityName: "Inventarisasi Aset",
      description: "Memperbarui status kesenjangan dari 'Open' menjadi 'In Progress'",
      ipAddress: "192.168.1.104",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      changes: {
        before: {
          status: "Open",
          responsible: "IT Manager",
          dueDate: "2024-02-15",
        },
        after: {
          status: "In Progress",
          responsible: "IT Manager",
          dueDate: "2024-01-30",
        },
      },
    },
    {
      id: 7,
      timestamp: "2024-01-14 16:20:15",
      user: "Admin User",
      userRole: "System Administrator",
      action: "CREATE",
      module: "Compliance",
      entity: "Control",
      entityId: "CTRL-007",
      entityName: "Anti-Penyuapan",
      description: "Menambahkan kontrol baru untuk anti-penyuapan sesuai ISO 37001",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      changes: {
        before: null,
        after: {
          name: "Anti-Penyuapan",
          category: "Manajemen",
          status: "Not Implemented",
          standards: ["ISO 37001:2016"],
        },
      },
    },
  ]

  const getActionIcon = (action) => {
    switch (action) {
      case "CREATE":
        return <Plus className="h-4 w-4" />
      case "UPDATE":
        return <Edit className="h-4 w-4" />
      case "DELETE":
        return <Trash2 className="h-4 w-4" />
      case "VIEW":
        return <Eye className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "UPDATE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "VIEW":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === "all" || log.action === filterAction
    const matchesUser = filterUser === "all" || log.user === filterUser
    const matchesSearch =
      searchTerm === "" ||
      log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesAction && matchesUser && matchesSearch
  })

  const uniqueUsers = [...new Set(auditLogs.map((log) => log.user))]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Audit Trail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Audit Trail - Log Aktivitas</DialogTitle>
          <DialogDescription>Riwayat semua perubahan dan aktivitas pada sistem kepatuhan</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Cari berdasarkan nama, deskripsi, atau user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Aksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aksi</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="VIEW">View</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-[150px]">
                <User className="mr-2 h-4 w-4" />
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua User</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audit Logs */}
          <ScrollArea className="h-[500px] w-full">
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getActionColor(log.action)}>
                        {getActionIcon(log.action)}
                        <span className="ml-1">{log.action}</span>
                      </Badge>
                      <div>
                        <h4 className="font-medium">{log.entityName}</h4>
                        <p className="text-sm text-muted-foreground">{log.description}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {log.timestamp.split(" ")[0]}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {log.timestamp.split(" ")[1]}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">User:</span>
                      <div className="flex items-center mt-1">
                        <User className="mr-1 h-3 w-3" />
                        {log.user} ({log.userRole})
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Module:</span>
                      <div className="mt-1">
                        {log.module} - {log.entity}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Entity ID:</span>
                      <div className="mt-1 font-mono">{log.entityId}</div>
                    </div>
                  </div>

                  {log.changes && (
                    <div className="border-t pt-3">
                      <span className="font-medium text-sm">Perubahan Data:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {log.changes.before && (
                          <div>
                            <span className="text-sm font-medium text-red-600">Sebelum:</span>
                            <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(log.changes.before, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.changes.after && (
                          <div>
                            <span className="text-sm font-medium text-green-600">Sesudah:</span>
                            <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(log.changes.after, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <div>IP Address: {log.ipAddress}</div>
                    <div className="truncate">User Agent: {log.userAgent}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada log yang sesuai dengan filter yang dipilih.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
