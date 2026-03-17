import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { UniversalSearch } from './UniversalSearch';
import { Menu, ChevronRight, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { AppEntry, Tester, Subscriber, BlogPost, Note, BookmarkFolder, BookmarkLink, WebTheme } from '@/lib/types';

interface DashboardLayoutProps {
    children: React.ReactNode;
    apps?: AppEntry[];
    testers?: Tester[];
    subscribers?: Subscriber[];
    blogs?: BlogPost[];
    notes?: Note[];
    bookmarkFolders?: BookmarkFolder[];
    bookmarkLinks?: BookmarkLink[];
    themes?: WebTheme[];
}

import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTheme } from '@/hooks/useTheme';

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, apps = [], testers = [], subscribers = [], blogs = [], notes = [], bookmarkFolders = [], bookmarkLinks = [], themes = [] }) => {
    const { sidebarCollapsed, setSidebarCollapsed } = useUserPreferences();
    const { isDark, toggle } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/admin') return 'Overview';
        if (path.includes('testers')) return 'Users Management';
        if (path.includes('blogs')) return 'Blog Management';
        if (path.includes('notes')) return 'My Notebook';
        if (path.includes('settings')) return 'App Settings';
        return 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
            <AppSidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className={cn(
                "flex-grow flex flex-col transition-all duration-500 min-w-0",
                sidebarCollapsed ? "md:pl-20" : "md:pl-72"
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
                        {/* Universal Search */}
                        <UniversalSearch apps={apps} testers={testers} subscribers={subscribers} blogs={blogs} notes={notes} bookmarkFolders={bookmarkFolders} bookmarkLinks={bookmarkLinks} themes={themes} />

                        <div className="flex items-center gap-1">
                            <button
                                onClick={toggle}
                                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-90 border border-transparent hover:border-border/50"
                                aria-label="Toggle theme"
                            >
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Area */}
                <main className="flex-grow overflow-y-auto p-4 md:p-8 lg:p-10 custom-scrollbar bg-[radial-gradient(hsl(var(--muted))_1px,transparent_1px)] dark:bg-[radial-gradient(hsl(var(--muted)/0.3)_1px,transparent_1px)] [background-size:16px_16px]">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
