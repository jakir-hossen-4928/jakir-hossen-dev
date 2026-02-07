import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Download, Users, Search, Loader2, Crown, User, Shield, AlertTriangle, Lock } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/lib/AuthContext';
import { updateUserRole } from '@/lib/userService';
import { UserProfile, UserRole } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdminTestersProps {
    exportTesters: () => void;
}

type RoleFilter = 'all' | 'admin' | 'user';

export const AdminTesters: React.FC<AdminTestersProps> = ({ exportTesters }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [newRole, setNewRole] = useState<UserRole>('user');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const { users, isLoading, error } = useUsers();
    const { profile } = useAuth();

    // Filter users by search term and role
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole =
            roleFilter === 'all' ||
            user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const handleRoleChangeClick = (user: UserProfile, role: UserRole) => {
        if (user.uid === profile?.uid) {
            toast.error('You cannot change your own role');
            return;
        }

        setSelectedUser(user);
        setNewRole(role);
        setShowConfirmDialog(true);
    };

    const handleConfirmRoleChange = async () => {
        if (!selectedUser || !profile) return;

        setIsUpdating(true);
        try {
            await updateUserRole(
                selectedUser.uid,
                newRole,
                profile.uid,
                profile.email || '',
                selectedUser.email || '',
                selectedUser.role
            );
            setShowConfirmDialog(false);
            setSelectedUser(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update role');
        } finally {
            setIsUpdating(false);
        }
    };

    const getRoleBadge = (role: UserRole, isCurrentUser: boolean) => {
        if (role === 'admin') {
            return (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-black text-[10px] uppercase flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Admin
                    {isCurrentUser && <Lock className="w-3 h-3 ml-1" />}
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-black text-[10px] uppercase flex items-center gap-1">
                <User className="w-3 h-3" />
                User
            </Badge>
        );
    };

    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;

    return (
        <>
            <Card className="border border-white/5 shadow-2xl rounded-2xl md:rounded-[32px] overflow-hidden h-full flex flex-col min-h-[400px] bg-card/30 backdrop-blur-2xl">
                <CardHeader className="pb-6 md:pb-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between bg-white/[0.02] px-6 md:px-8 gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                        <div className="space-y-1 text-left">
                            <CardTitle className="text-lg md:text-xl font-black text-foreground flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                User Management
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground/70">
                                Managing {filteredUsers.length} users • {adminCount} admins • {userCount} regular users
                            </CardDescription>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-10 rounded-xl bg-white/5 border-white/10 text-xs font-bold"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
                                <SelectTrigger className="w-[120px] h-10 rounded-xl bg-white/5 border-white/10 text-xs font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admins</SelectItem>
                                    <SelectItem value="user">Users</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportTesters}
                        className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 font-black text-[10px] md:text-xs h-9 md:h-10 px-3 md:px-4 shrink-0 uppercase tracking-widest transition-all w-full md:w-auto"
                    >
                        <Download className="mr-2 w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Export
                    </Button>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                    <div className="overflow-x-auto">
                        {isLoading && users.length === 0 ? (
                            <div className="flex items-center justify-center py-24">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-24 text-destructive">
                                <AlertTriangle className="w-12 h-12 mb-4" />
                                <p className="font-bold text-sm">{error}</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-white/[0.01]">
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest pl-6 md:pl-8 py-5 text-muted-foreground/50">User</TableHead>
                                        <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest py-5 text-muted-foreground/50">Email</TableHead>
                                        <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest py-5 text-muted-foreground/50">Role</TableHead>
                                        <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest py-5 text-muted-foreground/50">Actions</TableHead>
                                        <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest py-5 text-right pr-6 md:pr-8 text-muted-foreground/50">Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-24 text-muted-foreground/20">
                                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                                <p className="font-black uppercase tracking-widest text-[10px]">No users found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => {
                                            const isCurrentUser = user.uid === profile?.uid;
                                            return (
                                                <TableRow
                                                    key={user.uid}
                                                    className={cn(
                                                        "border-b border-white/5 last:border-none hover:bg-white/[0.02] transition-colors group text-left",
                                                        isCurrentUser && "bg-primary/5"
                                                    )}
                                                >
                                                    <TableCell className="pl-6 md:pl-8 py-4 font-bold text-xs md:text-sm tracking-tight truncate max-w-[120px] md:max-w-[150px] text-foreground">
                                                        {user.displayName || 'Unknown'}
                                                        {isCurrentUser && <span className="ml-2 text-[10px] text-primary">(You)</span>}
                                                    </TableCell>
                                                    <TableCell className="py-4 font-medium text-xs md:text-sm text-muted-foreground truncate max-w-[150px] md:max-w-[200px]">
                                                        {user.email}
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        {getRoleBadge(user.role, isCurrentUser)}
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        {isCurrentUser ? (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Lock className="w-3 h-3" />
                                                                <span className="text-[10px]">Protected</span>
                                                            </div>
                                                        ) : (
                                                            <Select
                                                                value={user.role}
                                                                onValueChange={(value) => handleRoleChangeClick(user, value as UserRole)}
                                                            >
                                                                <SelectTrigger className="w-[100px] h-8 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="user">User</SelectItem>
                                                                    <SelectItem value="admin">Admin</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6 md:pr-8 py-4 font-black text-[10px] md:text-xs text-muted-foreground/50 whitespace-nowrap">
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Confirm Role Change
                        </DialogTitle>
                        <DialogDescription>
                            You are about to change the role for this user. This action will take effect immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">User Details:</p>
                            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                                <p className="text-sm font-bold">{selectedUser?.displayName}</p>
                                <p className="text-xs text-muted-foreground">{selectedUser?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Current:</span>
                                {selectedUser && getRoleBadge(selectedUser.role, false)}
                            </div>
                            <span className="text-muted-foreground">→</span>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">New:</span>
                                {getRoleBadge(newRole, false)}
                            </div>
                        </div>
                        {newRole === 'admin' && (
                            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg flex items-start gap-2">
                                <Crown className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-orange-500">
                                    This user will have full administrative access to manage all users, apps, and content.
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmRoleChange}
                            disabled={isUpdating}
                            className="bg-primary"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Confirm Change'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
