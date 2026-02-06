import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { Menu, Search, Bell, Grid, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/admin') return 'Overview';
        if (path.includes('testers')) return 'Enrolled Testers';
        if (path.includes('settings')) return 'App Settings';
        return 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-foreground flex overflow-hidden">
            <AppSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className={cn(
                "flex-grow flex flex-col transition-all duration-500 min-w-0",
                collapsed ? "md:pl-20" : "md:pl-72"
            )}>
                {/* Top Header */}
                <header className="h-16 md:h-20 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="p-2 md:hidden hover:bg-muted rounded-xl transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden sm:flex flex-col min-w-0">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                <span>Console</span>
                                <ChevronRight size={10} />
                                <span className="text-primary">{getPageTitle()}</span>
                            </div>
                            <h1 className="text-lg md:text-xl font-black truncate">{getPageTitle()}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        {/* Search Bar (Desktop) */}
                        <div className="hidden lg:flex items-center gap-2 bg-muted/50 border border-border px-3 py-2 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                            <Search size={16} className="text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Universal search..."
                                className="bg-transparent border-none outline-none text-sm w-48 font-medium placeholder:font-normal"
                            />
                            <kbd className="text-[10px] font-bold bg-background px-1.5 py-0.5 rounded border border-border text-muted-foreground">⌘K</kbd>
                        </div>

                        <div className="flex items-center gap-1">
                            <button className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all relative">
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-card shadow-sm shadow-primary/40"></span>
                            </button>
                            <button className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all">
                                <Grid size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Area */}
                <main className="flex-grow overflow-y-auto p-4 md:p-8 lg:p-10 custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
