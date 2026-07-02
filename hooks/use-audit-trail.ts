"use client"

import { useState, useCallback } from "react"

interface AuditLogEntry {
  id: number
  timestamp: string
  user: string
  userRole: string
  action: "CREATE" | "UPDATE" | "DELETE" | "VIEW"
  module: string
  entity: string
  entityId: string
  entityName: string
  description: string
  ipAddress: string
  userAgent: string
  changes?: {
    before?: any
    after?: any
  }
}

export function useAuditTrail() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])

  const logActivity = useCallback((activity: Omit<AuditLogEntry, "id" | "timestamp" | "ipAddress" | "userAgent">) => {
    const newLog: AuditLogEntry = {
      ...activity,
      id: Date.now(),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      ipAddress: "192.168.1.100", // In real app, get from request
      userAgent: navigator.userAgent,
    }

    setLogs((prev) => [newLog, ...prev])

    // In real app, send to backend
    console.log("Audit Log:", newLog)

    return newLog
  }, [])

  const logCreate = useCallback(
    (
      module: string,
      entity: string,
      entityId: string,
      entityName: string,
      data: any,
      user = "Current User",
      userRole = "User",
    ) => {
      return logActivity({
        user,
        userRole,
        action: "CREATE",
        module,
        entity,
        entityId,
        entityName,
        description: `Menambahkan ${entity.toLowerCase()} baru '${entityName}'`,
        changes: {
          before: null,
          after: data,
        },
      })
    },
    [logActivity],
  )

  const logUpdate = useCallback(
    (
      module: string,
      entity: string,
      entityId: string,
      entityName: string,
      beforeData: any,
      afterData: any,
      user = "Current User",
      userRole = "User",
    ) => {
      return logActivity({
        user,
        userRole,
        action: "UPDATE",
        module,
        entity,
        entityId,
        entityName,
        description: `Memperbarui ${entity.toLowerCase()} '${entityName}'`,
        changes: {
          before: beforeData,
          after: afterData,
        },
      })
    },
    [logActivity],
  )

  const logDelete = useCallback(
    (
      module: string,
      entity: string,
      entityId: string,
      entityName: string,
      data: any,
      user = "Current User",
      userRole = "User",
    ) => {
      return logActivity({
        user,
        userRole,
        action: "DELETE",
        module,
        entity,
        entityId,
        entityName,
        description: `Menghapus ${entity.toLowerCase()} '${entityName}'`,
        changes: {
          before: data,
          after: null,
        },
      })
    },
    [logActivity],
  )

  const logView = useCallback(
    (
      module: string,
      entity: string,
      entityId: string,
      entityName: string,
      user = "Current User",
      userRole = "User",
    ) => {
      return logActivity({
        user,
        userRole,
        action: "VIEW",
        module,
        entity,
        entityId,
        entityName,
        description: `Melihat detail ${entity.toLowerCase()} '${entityName}'`,
        changes: null,
      })
    },
    [logActivity],
  )

  return {
    logs,
    logCreate,
    logUpdate,
    logDelete,
    logView,
    logActivity,
  }
}
