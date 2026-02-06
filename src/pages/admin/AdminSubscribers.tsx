import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Users } from 'lucide-react';
import { Tester } from '@/lib/types'; // We can reuse Tester type for now as fields are similar

interface AdminSubscribersProps {
    subscribers: Tester[];
    exportSubscribers: () => void;
}

export const AdminSubscribers: React.FC<AdminSubscribersProps> = ({ subscribers, exportSubscribers }) => {
    return (
        <Card className="border border-white/5 shadow-2xl rounded-2xl md:rounded-[32px] overflow-hidden h-full flex flex-col min-h-[400px] bg-card/30 backdrop-blur-2xl">
            <CardHeader className="pb-6 md:pb-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.02] px-6 md:px-8">
                <div className="space-y-1 text-left">
                    <CardTitle className="text-lg md:text-xl font-black text-foreground">Newsletter Subscribers</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground/70">Managing {subscribers.length} subscribers.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportSubscribers} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 font-black text-[10px] md:text-xs h-9 md:h-10 px-3 md:px-4 shrink-0 uppercase tracking-widest transition-all">
                    <Download className="mr-2 w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Export CSV
                </Button>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white/[0.01]">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest pl-6 md:pl-8 py-5 text-muted-foreground/50">Email</TableHead>
                                <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest py-5 text-right pr-6 md:pr-8 text-muted-foreground/50">Joined At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscribers.length === 0 ? (
                                <TableRow><TableCell colSpan={2} className="text-center py-24 text-muted-foreground/20"><Users size={48} className="mx-auto mb-4 opacity-50" /><p className="font-black uppercase tracking-widest text-[10px]">No subscribers yet</p></TableCell></TableRow>
                            ) : (
                                subscribers.map((sub) => (
                                    <TableRow key={sub.uid} className="border-b border-white/5 last:border-none hover:bg-white/[0.02] transition-colors group text-left">
                                        <TableCell className="pl-6 md:pl-8 py-4 font-bold text-xs md:text-sm tracking-tight text-foreground">{sub.email}</TableCell>
                                        <TableCell className="text-right pr-6 md:pr-8 py-4 font-black text-[10px] md:text-xs text-muted-foreground/50 whitespace-nowrap">{new Date(sub.joinedAt).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
