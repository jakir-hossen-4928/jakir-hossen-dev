import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Users } from 'lucide-react';
import { Tester } from '@/lib/types';

interface AdminTestersProps {
    testers: Tester[];
    exportTesters: () => void;
}

export const AdminTesters: React.FC<AdminTestersProps> = ({ testers, exportTesters }) => {
    return (
        <Card className="border border-white/5 shadow-2xl rounded-2xl md:rounded-[32px] overflow-hidden h-full flex flex-col min-h-[400px] bg-card/30 backdrop-blur-2xl">
            <CardHeader className="pb-6 md:pb-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.02] px-6 md:px-8">
                <div className="space-y-1 text-left">
                    <CardTitle className="text-lg md:text-xl font-black text-foreground">Tester Network</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground/70">Managing {testers.length} verified users.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportTesters} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 font-black text-[10px] md:text-xs h-9 md:h-10 px-3 md:px-4 shrink-0 uppercase tracking-widest transition-all">
                    <Download className="mr-2 w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Export
                </Button>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white/[0.01]">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest pl-6 md:pl-8 py-5 text-muted-foreground/50">Tester</TableHead>
                                <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest py-5 text-muted-foreground/50">Auth Email</TableHead>
                                <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest py-5 text-muted-foreground/50">Play Store Email</TableHead>
                                <TableHead className="font-black text-[9px] md:text-[10px] uppercase tracking-widest py-5 text-right pr-6 md:pr-8 text-muted-foreground/50">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testers.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-24 text-muted-foreground/20"><Users size={48} className="mx-auto mb-4 opacity-50" /><p className="font-black uppercase tracking-widest text-[10px]">Waiting for first signup</p></TableCell></TableRow>
                            ) : (
                                testers.map((tester) => (
                                    <TableRow key={tester.uid} className="border-b border-white/5 last:border-none hover:bg-white/[0.02] transition-colors group text-left">
                                        <TableCell className="pl-6 md:pl-8 py-4 font-bold text-xs md:text-sm tracking-tight truncate max-w-[120px] md:max-w-[150px] text-foreground">{tester.displayName}</TableCell>
                                        <TableCell className="py-4 font-medium text-xs md:text-sm text-muted-foreground truncate max-w-[150px] md:max-w-[200px]">{tester.email}</TableCell>
                                        <TableCell className="py-4 font-bold text-xs md:text-sm text-primary/90">{tester.playStoreEmail || '—'}</TableCell>
                                        <TableCell className="text-right pr-6 md:pr-8 py-4 font-black text-[10px] md:text-xs text-muted-foreground/50 whitespace-nowrap">{new Date(tester.joinedAt).toLocaleDateString()}</TableCell>
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
