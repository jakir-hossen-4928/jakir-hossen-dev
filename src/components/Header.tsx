import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LogOut, LogIn, LayoutDashboard, User, Settings, Shield } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";

const navItems = [
  { label: "Home", href: "/", isHash: true, targetId: "#home" },
  { label: "About", href: "/", isHash: true, targetId: "#about" },
  { label: "Experience", href: "/", isHash: true, targetId: "#about" },
  { label: "Projects", href: "/", isHash: true, targetId: "#projects" },
  { label: "Contact", href: "/", isHash: true, targetId: "#contact" },
  { label: "Play Store Apps", href: "/apps", isHash: false },
  { label: "Blog", href: "/blogs", isHash: false },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const { user, profile, isAdmin, showLogin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (item: typeof navItems[0]) => {
    setMobileOpen(false);
    if (item.isHash) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const el = document.querySelector(item.targetId!);
          el?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const el = document.querySelector(item.targetId!);
        el?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(item.href);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="section-container flex items-center justify-between h-20">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => {
            if (location.pathname === "/") {
              document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="text-2xl font-black tracking-tighter text-foreground hover:opacity-80 transition-opacity"
        >
          Jakir<span className="text-primary">.</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-muted ${(location.pathname === item.href && !item.isHash)
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {item.label}
            </button>
          ))}

          <div className="ml-2 pl-2 border-l border-border flex items-center gap-1">

            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative ml-2 flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-muted transition-all focus:outline-none group border border-transparent hover:border-border/50">
                    <Avatar className="h-8 w-8 border border-border/50 group-hover:border-primary/30 transition-all shadow-sm">
                      <AvatarImage src={profile?.photoURL || ''} alt={profile?.displayName || 'User'} referrerPolicy="no-referrer" />
                      <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">
                        {profile?.displayName?.charAt(0) || profile?.email?.charAt(0) || <User size={14} />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start min-w-0 max-w-[120px]">
                      <span className="text-xs font-black text-foreground truncate w-full">
                        {profile?.displayName || profile?.email?.split('@')[0] || 'Account'}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mt-2 bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl p-2 shadow-2xl animate-in fade-in-0 zoom-in-95">
                  <DropdownMenuLabel className="px-3 py-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-black leading-none text-foreground truncate">{profile?.displayName || 'User Account'}</p>
                      <p className="text-[10px] font-bold leading-none text-muted-foreground truncate uppercase tracking-widest">{profile?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50 mx-1" />

                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 focus:bg-primary/10 focus:text-primary transition-colors">
                      <Link to="/admin" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Shield size={16} />
                        </div>
                        <span className="font-bold text-xs tracking-tight">Admin Portal</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem className="rounded-xl cursor-not-allowed opacity-50 py-2.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      <Settings size={16} />
                    </div>
                    <span className="font-bold text-xs tracking-tight">Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border/50 mx-1" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="rounded-xl cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                      <LogOut size={16} />
                    </div>
                    <span className="font-bold text-xs tracking-tight">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={showLogin}
                className="ml-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-md md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{
              x: 0,
              transition: {
                x: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                staggerChildren: 0.08,
                delayChildren: 0.1
              }
            }}
            exit={{
              x: "-100%",
              transition: {
                x: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                staggerChildren: 0.04,
                staggerDirection: -1
              }
            }}
            className="fixed top-0 left-0 z-[80] w-[300px] h-screen bg-background border-r border-border shadow-[0_0_50px_rgba(0,0,0,0.3)] md:hidden overflow-hidden flex flex-col"
            style={{
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
          >
            {/* Decorative Header Glow */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 via-primary/2 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="flex flex-col h-full relative z-10">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between px-8 pt-12 pb-10">
                <div className="flex flex-col gap-1">
                  <Link
                    to="/"
                    onClick={() => {
                      setMobileOpen(false);
                      if (location.pathname === "/") {
                        document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="text-3xl font-black tracking-tightest text-foreground transition-transform active:scale-95"
                  >
                    Jakir<span className="text-primary">.</span>
                  </Link>
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] pl-1">
                    Portfolio v2.0
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl bg-muted/30 hover:bg-muted text-foreground h-12 w-12 transition-all active:scale-90 border border-border/50"
                >
                  <X size={24} />
                </Button>
              </div>

              {/* Nav Items */}
              <div className="flex flex-col gap-1.5 px-4 overflow-y-auto flex-grow">
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => handleNavClick(item)}
                    className={`group relative px-6 py-4.5 text-lg font-black rounded-3xl text-left transition-all active:scale-[0.97] ${(location.pathname === item.href && !item.isHash)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                  >
                    <span className="relative z-10 flex items-center justify-between">
                      {item.label}
                      {(location.pathname === item.href && !item.isHash) && (
                        <motion.div
                          layoutId="activeDotMobile"
                          className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        />
                      )}
                    </span>
                  </motion.button>
                ))}

                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className={`group px-6 py-4.5 text-lg font-black flex items-center gap-4 rounded-3xl transition-all active:scale-[0.97] ${location.pathname === "/admin"
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${location.pathname === "/admin" ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-muted text-muted-foreground"}`}>
                        <Shield size={20} />
                      </div>
                      Admin Portal
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Account Section - Pinned to bottom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-auto p-6 bg-background border-t border-border"
                style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
              >
                {user ? (
                  <div className="flex items-center justify-between p-4.5 bg-muted/40 rounded-[2.5rem] border border-border shadow-sm">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-lg">
                          <AvatarImage src={profile?.photoURL || ''} alt={profile?.displayName || 'User'} referrerPolicy="no-referrer" />
                          <AvatarFallback className="bg-primary/10 text-primary text-base font-black uppercase">
                            {profile?.displayName?.charAt(0) || profile?.email?.charAt(0) || <User size={20} />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-background rounded-full shadow-lg shadow-green-500/20" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black text-foreground truncate">{profile?.displayName || profile?.email?.split('@')[0] || 'User'}</span>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest truncate">{profile?.email}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="h-11 w-11 text-destructive hover:bg-destructive/10 rounded-2xl shrink-0"
                      aria-label="Sign out"
                    >
                      <LogOut size={20} />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => { showLogin(); setMobileOpen(false); }}
                    className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-[2rem] shadow-xl shadow-primary/20 flex items-center gap-3"
                  >
                    <LogIn size={20} />
                    Sign In
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
