import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Settings,
    Smartphone,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Home,
    Sparkles,
    NotebookPen,
    Link2
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
    { icon: Users, label: 'Users', href: '/admin/testers' },
    { icon: Users, label: 'Subscribers', href: '/admin/subscribers' },
    { icon: NotebookPen, label: 'Notebook', href: '/admin/notes' },
    { icon: NotebookPen, label: 'Blogs', href: '/admin/blogs' },
    { icon: Link2, label: 'Link Manager', href: '/admin/links' },
    { icon: Smartphone, label: 'Sajuriya Studio', href: '/admin/settings' },
];

export const AppSidebar: React.FC<SidebarProps> = ({
    collapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen
}) => {
    const { logout, user } = useAuth();

    const handleLinkClick = () => {
        if (mobileOpen) setMobileOpen(false);
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden",
                    mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setMobileOpen(false)}
            />

            <aside
                className={cn(
                    "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-500 ease-in-out flex flex-col shadow-2xl overflow-hidden",
                    collapsed ? "w-20" : "w-72",
                    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Header/Logo */}
                <div className="h-20 flex items-center px-6 border-b border-border/50 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                            <Sparkles className="text-primary-foreground w-6 h-6" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                                <span className="font-black text-xl tracking-tighter leading-none">Console</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mt-0.5">Pro Max Admin</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-grow py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {sidebarItems.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end
                            onClick={handleLinkClick}
                            className={({ isActive }) => cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110")} />
                                    {!collapsed && (
                                        <span className="font-bold text-sm tracking-tight animate-in fade-in slide-in-from-left-3 duration-300">
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && !collapsed && (
                                        <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-border/50 space-y-3 bg-muted/20">
                    <NavLink
                        to="/"
                        className={cn(
                            "flex items-center gap-4 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        )}
                    >
                        <Home className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="font-bold text-sm tracking-tight">Main Site</span>}
                    </NavLink>

                    {!collapsed ? (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50 shadow-inner group transition-all animate-in zoom-in-95 duration-500">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border group-hover:border-primary transition-colors">
                                <img src={user?.photoURL || ''} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="font-bold text-xs truncate">{user?.displayName}</p>
                                <p className="text-[10px] text-muted-foreground truncate font-medium">System Admin</p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={logout}
                            className="w-full flex justify-center p-3 hover:bg-destructive/10 hover:text-destructive rounded-2xl transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    )}

                    {/* Collapse Toggle (Desktop) */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:flex w-full items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors mt-2"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>
            </aside>
        </>
    );
};
