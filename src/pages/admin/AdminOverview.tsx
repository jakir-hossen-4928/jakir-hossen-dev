import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppEntry, Tester } from '@/lib/types';

interface AdminOverviewProps {
    apps: AppEntry[];
    testers: Tester[];
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ apps, testers }) => {
    return (
        <div className="space-y-6 md:space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/20 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Total Apps</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-black text-foreground">{apps.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/20 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Active Testers</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-black text-foreground">{testers.length}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 md:gap-8">
                <div className="space-y-4 md:space-y-6">
                    <h2 className="text-lg font-black flex items-center gap-2">
                        <Rocket size={18} className="text-primary" />
                        Active Registry
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apps.slice(0, 6).map(app => (
                            <Card key={app.id} className="border border-white/5 shadow-xl overflow-hidden bg-card/40 backdrop-blur-xl hover:border-primary/40 transition-all group">
                                <CardHeader className="p-4 flex flex-row items-center justify-between bg-gradient-to-br from-white/5 to-transparent">
                                    <div>
                                        <CardTitle className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{app.appName}</CardTitle>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{app.status}</p>
                                    </div>
                                    <Badge variant={app.status === 'production' ? 'default' : 'outline'} className={cn(
                                        "text-[8px] px-1.5 py-0 font-black uppercase",
                                        app.status === 'production' ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" : "bg-primary/10 text-primary border-primary/20"
                                    )}>
                                        {app.status}
                                    </Badge>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
