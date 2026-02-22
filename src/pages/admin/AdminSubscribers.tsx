import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Users, Search, Loader2, Trash2 } from 'lucide-react';
import { useSubscribers } from '@/hooks/useSubscribers';
import { deleteSubscriber } from '@/lib/syncService';
import { confirmToast } from '@/components/ui/ConfirmToast';
import { toast } from 'react-toastify';
interface AdminSubscribersProps {
    exportSubscribers: () => void;
}

export const AdminSubscribers: React.FC<AdminSubscribersProps> = ({ exportSubscribers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { subscribers, isLoading } = useSubscribers();

    const filteredSubscribers = subscribers.filter(sub =>
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (uid: string) => {
        confirmToast("Are you sure you want to delete this subscriber?", async () => {
            try {
                await deleteSubscriber(uid);
                toast.success('Subscriber deleted');
            } catch (error) {
                console.error('Error deleting subscriber:', error);
                toast.error('Failed to delete subscriber');
            }
        });
    };

    return (
        <Card className="border border-border shadow-2xl rounded-2xl md:rounded-[32px] overflow-hidden h-full flex flex-col min-h-[400px] bg-card/30 backdrop-blur-2xl">
            <CardHeader className="pb-6 md:pb-8 border-b border-border flex flex-col md:flex-row items-center justify-between bg-white/[0.02] px-6 md:px-8 gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                    <div className="space-y-1 text-left">
                        <CardTitle className="text-lg md:text-xl font-black text-foreground">Newsletter Subscribers</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground/70">Managing {filteredSubscribers.length} subscribers.</CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 rounded-xl bg-muted/50 border-border text-xs font-bold focus-visible:ring-primary/20"
                        />
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={exportSubscribers} className="rounded-xl border-border bg-muted/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-black text-[10px] md:text-xs h-9 md:h-10 px-3 md:px-4 shrink-0 uppercase tracking-widest transition-all w-full md:w-auto">
                    <Download className="mr-2 w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Export CSV
                </Button>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                <div className="overflow-x-auto">
                    {isLoading && subscribers.length === 0 ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-white/[0.01]">
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest pl-6 md:pl-8 py-5 text-muted-foreground/50">Email</TableHead>
                                    <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest py-5 text-right text-muted-foreground/50">Joined At</TableHead>
                                    <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest py-5 text-right pr-6 md:pr-8 text-muted-foreground/50">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubscribers.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-24 text-muted-foreground/20"><Users size={48} className="mx-auto mb-4 opacity-50" /><p className="font-black uppercase tracking-widest text-[10px]">No subscribers found</p></TableCell></TableRow>
                                ) : (
                                    filteredSubscribers.map((sub) => (
                                        <TableRow key={sub.uid} className="border-b border-border last:border-none hover:bg-white/[0.02] transition-colors group text-left">
                                            <TableCell className="pl-6 md:pl-8 py-4 font-bold text-xs md:text-sm tracking-tight text-foreground">{sub.email}</TableCell>
                                            <TableCell className="text-right py-4 font-black text-[10px] md:text-xs text-muted-foreground/50 whitespace-nowrap">{new Date(sub.joinedAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right pr-6 md:pr-8 py-4">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.uid)} className="h-8 w-8 text-destructive hover:text-red-600 hover:bg-red-500/10 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
