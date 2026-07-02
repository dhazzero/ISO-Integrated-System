'use client';

import { useState, useEffect } from 'react';
import { User, NotificationSetting, NotificationType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Check, X, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';


// New, advanced multi-select component
const MultiSelectUsers = ({ users, selectedUserIds, onChange, disabled }: {
    users: User[];
    selectedUserIds: string[];
    onChange: (selectedIds: string[]) => void;
    disabled?: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const selectedUsers = users.filter(user => selectedUserIds.includes(user._id.toString()));

    const handleSelect = (userId: string) => {
        const newSelection = selectedUserIds.includes(userId)
            ? selectedUserIds.filter(id => id !== userId)
            : [...selectedUserIds, userId];
        onChange(newSelection);
    };

    const handleRemove = (userId: string) => {
        onChange(selectedUserIds.filter(id => id !== userId));
    };

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={disabled}
                    >
                        {selectedUsers.length > 0 ? `${selectedUsers.length} pengguna dipilih` : "Pilih pengguna..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput placeholder="Cari pengguna..." />
                        <CommandList>
                            <CommandEmpty>Pengguna tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                                {users.map((user) => (
                                    <CommandItem
                                        key={user._id.toString()}
                                        value={user.name}
                                        onSelect={() => handleSelect(user._id.toString())}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedUserIds.includes(user._id.toString()) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem]">
                {selectedUsers.map(user => (
                    <Badge
                        key={user._id.toString()}
                        variant="secondary"
                        className="flex items-center gap-1"
                    >
                        {user.name}
                        <button
                            onClick={() => !disabled && handleRemove(user._id.toString())}
                            className={cn("rounded-full hover:bg-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", disabled && "cursor-not-allowed")}
                            disabled={disabled}
                            aria-label={`Remove ${user.name}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
};


export function NotificationSettingsManager() {
    const [settings, setSettings] = useState<NotificationSetting[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingStatus, setSavingStatus] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                console.log("Debugging: Fetching notification settings...");
                const settingsRes = await fetch('/api/notification-settings');
                console.log(`Debugging: Settings API response status: ${settingsRes.status}`);
                if (!settingsRes.ok) {
                    const errorBody = await settingsRes.text();
                    console.error("Debugging: Settings API failed:", errorBody);
                    throw new Error('Gagal mengambil data pengaturan notifikasi dari server');
                }
                const settingsData = await settingsRes.json();
                console.log("Debugging: Successfully fetched notification settings.");

                console.log("Debugging: Fetching users...");
                const usersRes = await fetch('/api/users');
                console.log(`Debugging: Users API response status: ${usersRes.status}`);
                if (!usersRes.ok) {
                    const errorBody = await usersRes.text();
                    console.error("Debugging: Users API failed:", errorBody);
                    throw new Error('Gagal mengambil data pengguna dari server');
                }
                const usersData = await usersRes.json();
                console.log("Debugging: Successfully fetched users.");

                setSettings(settingsData);
                setUsers(usersData.filter((u: User) => u.role === 'administrator' || u.role === 'manager'));

            } catch (error) {
                console.error("Error in fetchData:", error);
                toast.error('Gagal memuat pengaturan notifikasi.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    const handleRecipientsChange = (notificationType: NotificationType, newUserIds: string[]) => {
        setSettings(prevSettings =>
            prevSettings.map(s => {
                if (s.notificationType === notificationType) {
                    const newRecipients = users.filter(u => newUserIds.includes(u._id.toString()));
                    return {
                        ...s,
                        recipientUserIds: newRecipients.map(u => u._id),
                        recipients: newRecipients,
                    };
                }
                return s;
            })
        );
    };

    const handleSave = async (setting: NotificationSetting) => {
        setSavingStatus(prev => ({ ...prev, [setting.notificationType]: true }));
        try {
            const response = await fetch('/api/notification-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificationType: setting.notificationType,
                    recipientUserIds: setting.recipients?.map(r => r._id.toString()) || [],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menyimpan pengaturan');
            }

            toast.success(`Pengaturan untuk "${setting.notificationType.replace(/_/g, ' ').toLowerCase()}" berhasil disimpan.`);
        } catch (error) {
            console.error(error);
            toast.error(`Gagal menyimpan pengaturan untuk "${setting.notificationType.replace(/_/g, ' ').toLowerCase()}".`);
        } finally {
            setSavingStatus(prev => ({ ...prev, [setting.notificationType]: false }));
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 border rounded-md space-y-3">
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-10 w-32 mt-2" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manajemen Notifikasi Email</CardTitle>
                <CardDescription>
                    Atur siapa saja yang akan menerima notifikasi email untuk setiap kejadian penting dalam sistem.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {settings.map((setting) => {
                    const isSaving = savingStatus[setting.notificationType] || false;
                    return (
                        <div key={setting.notificationType} className="p-4 border rounded-md bg-background/50">
                            <h4 className="font-semibold text-lg capitalize">{setting.notificationType.replace(/_/g, ' ').toLowerCase()}</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Pilih pengguna (Admin/Manager) yang akan menerima notifikasi ini.
                            </p>
                            <MultiSelectUsers
                                users={users}
                                selectedUserIds={setting.recipients?.map(r => r._id.toString()) || []}
                                onChange={(newUserIds) => handleRecipientsChange(setting.notificationType, newUserIds)}
                                disabled={isSaving}
                            />
                            <Button onClick={() => handleSave(setting)} disabled={isSaving} className="mt-4">
                                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </Button>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}