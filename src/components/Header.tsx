import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LogOut, LogIn, LayoutDashboard } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "./ui/button";

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
  const { user, isAdmin, showLogin, logout } = useAuth();
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
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

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors rounded-lg hover:bg-muted ${location.pathname === "/admin" ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          )}

          <div className="ml-2 pl-2 border-l border-border flex items-center gap-1">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <button
                onClick={logout}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            ) : (
              <button
                onClick={showLogin}
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="Login with Google"
              >
                <LogIn size={18} />
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${(location.pathname === item.href && !item.isHash)
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {item.label}
                </button>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 text-sm font-medium flex items-center gap-2 rounded-lg transition-colors ${location.pathname === "/admin" ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  <LayoutDashboard size={14} />
                  Admin Dashboard
                </Link>
              )}

              <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground ml-3">Account</span>
                {user ? (
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { showLogin(); setMobileOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <LogIn size={16} />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
