import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, BookOpen, Users, Mail, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppEntry, Tester, BlogPost, Subscriber } from '@/lib/types';

interface AdminOverviewProps {
    apps: AppEntry[];
    testers: Tester[];
    subscribers: Subscriber[];
    blogs?: BlogPost[];
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ apps, testers, subscribers, blogs = [] }) => {
    const liveCount = apps.filter(app => app.status === 'production').length;
    const testingCount = apps.filter(app => app.status === 'testing').length;

    return (
        <div className="space-y-6 md:space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-primary/5 border-primary/20 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Live Hub</CardTitle>
                        <Rocket size={14} className="text-primary/40" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-black text-foreground">{liveCount}</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-500/5 border-amber-500/20 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Coming Soon</CardTitle>
                        <Clock size={14} className="text-amber-500/40" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-black text-foreground">{testingCount}</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-500/5 border-blue-500/20 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Articles</CardTitle>
                        <BookOpen size={14} className="text-blue-500/40" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-black text-foreground">{blogs.length}</p>
                    </CardContent>
                </Card>

                <Card className="bg-orange-500/5 border-orange-500/20 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Active Testers</CardTitle>
                        <Users size={14} className="text-orange-500/40" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-black text-foreground">{testers.length}</p>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-500/5 border-emerald-500/20 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Subscribers</CardTitle>
                        <Mail size={14} className="text-emerald-500/40" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-black text-foreground">{subscribers.length}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 md:gap-8">
                <div className="space-y-4 md:space-y-6">
                    <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                        <Rocket size={18} className="text-primary" />
                        Quick Access Dashboard
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apps.slice(0, 3).map(app => (
                            <Card key={app.id} className="border border-white/5 shadow-xl overflow-hidden bg-card/40 backdrop-blur-xl hover:border-primary/40 transition-all group">
                                <CardHeader className="p-4 flex flex-row items-center justify-between bg-gradient-to-br from-white/5 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted/20 border border-white/10 shrink-0">
                                            {app.icon && <img src={app.icon} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">{app.appName}</CardTitle>
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">{app.status}</p>
                                        </div>
                                    </div>
                                    <Badge variant={app.status === 'production' ? 'default' : 'outline'} className={cn(
                                        "text-[8px] px-1.5 py-0 font-black uppercase",
                                        app.status === 'production' ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-primary/10 text-primary border-primary/20"
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
