"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Building, User, Briefcase, ChevronRight, ChevronDown } from "lucide-react"
import { DepartmentNode, HierarchicalUser } from "@/app/(dashboard)/settings/page"
import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { UserRole } from "@/lib/types"

interface UserMatrixModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    matrixData: {
        departmentNodes: DepartmentNode[];
        unassignedUsers: HierarchicalUser[];
    };
}

// Komponen rekursif untuk menampilkan setiap pengguna dan bawahannya
const UserNode: React.FC<{ user: HierarchicalUser; level: number }> = ({ user, level }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasSubordinates = user.subordinates && user.subordinates.length > 0;

    const getRoleBadgeVariant = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMINISTRATOR: return "default";
            case UserRole.MANAGER: return "destructive";
            default: return "secondary";
        }
    }

    return (
        <li className="ml-4">
            <div className="flex items-center space-x-2 py-1">
                {hasSubordinates && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-md hover:bg-accent">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                )}
                {!hasSubordinates && <span className="w-6"></span>}
                <User className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{user.name}</span>
                <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
            </div>
            {isExpanded && hasSubordinates && (
                <ul className="pl-6 border-l border-dashed ml-3">
                    {user.subordinates.map(sub => (
                        <UserNode key={sub._id.toString()} user={sub} level={level + 1} />
                    ))}
                </ul>
            )}
        </li>
    );
};


export function UserMatrixModal({ isOpen, onOpenChange, matrixData }: UserMatrixModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Briefcase className="mr-2 h-5 w-5" />
                        Matriks Hirarki Pengguna
                    </DialogTitle>
                    <DialogDescription>
                        Visualisasi struktur organisasi dan hubungan antar pengguna.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[70vh] overflow-y-auto">
                    {matrixData.departmentNodes.map(node => (
                        <div key={node.department._id.toString()} className="mb-4">
                            <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                                <Building className="h-5 w-5"/>
                                <h3 className="text-lg font-semibold">{node.department.name}</h3>
                            </div>
                            <ul className="mt-2">
                                {node.users.map(user => (
                                    <UserNode key={user._id.toString()} user={user} level={0} />
                                ))}
                            </ul>
                        </div>
                    ))}

                    {matrixData.unassignedUsers.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                                <User className="h-5 w-5"/>
                                <h3 className="text-lg font-semibold">Pengguna Tanpa Departemen</h3>
                            </div>
                            <ul className="mt-2">
                                {matrixData.unassignedUsers.map(user => (
                                    <UserNode key={user._id.toString()} user={user} level={0} />
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
