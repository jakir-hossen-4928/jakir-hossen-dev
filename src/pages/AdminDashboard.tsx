import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { AdminOverview } from './admin/AdminOverview';
import { AdminApps } from './admin/AdminApps';
import { AdminSubscribers } from './admin/AdminSubscribers';
import { AdminTesters } from './admin/AdminTesters';
import { AdminBlogs } from './admin/AdminBlogs';
import AdminNotes from './admin/AdminNotes';
import AdminLinks from './admin/AdminLinks';
import { toast } from 'sonner';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useApps } from '@/hooks/useApps';
import { useTesters } from '@/hooks/useTesters';
import { useSubscribers } from '@/hooks/useSubscribers';
import { useBlogs } from '@/hooks/useBlogs';
import { Note } from '@/lib/types';
import { syncNotes } from '@/lib/syncService';

const AdminDashboard = () => {
  const location = useLocation();

  const getAdminTitle = () => {
    const path = location.pathname;
    if (path === '/admin/testers') return "Manage Users | Admin Portal";
    if (path === '/admin/subscribers') return "Manage Subscribers | Admin Portal";
    if (path === '/admin/blogs') return "Manage Articles | Admin Portal";
    if (path === '/admin/blogs') return "Manage Articles | Admin Portal";
    if (path === '/admin/notes') return "My Notebook | Admin Portal";
    if (path === '/admin/links') return "Link Manager | Admin Portal";
    if (path === '/admin/settings') return "Settings | Admin Portal";
    return "Overview | Admin Portal";
  };

  usePageTitle(getAdminTitle());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Use TanStack Query hooks
  const { apps, isLoading: appsLoading } = useApps();
  const { testers, isLoading: testersLoading } = useTesters();
  const { subscribers, isLoading: subsLoading } = useSubscribers();
  const { blogs, isLoading: blogsLoading } = useBlogs();

  // Fetch notes
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const initialNotes = await syncNotes();
        setNotes(initialNotes);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setNotesLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const isLoading = appsLoading || testersLoading || subsLoading || blogsLoading || notesLoading;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const exportToCSV = <T extends Record<string, any>>(data: T[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const allKeys = Array.from(new Set(data.flatMap(item => Object.keys(item))));
    const header = allKeys.join(',');

    const rows = data.map(item => {
      return allKeys.map(key => {
        const value = item[key] !== undefined ? item[key] : '';
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(',');
    });

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTesters = () => exportToCSV(testers, 'testers_export');
  const exportSubscribers = () => exportToCSV(subscribers, 'subscribers_export');

  const renderContent = () => {
    const path = location.pathname;

    switch (path) {
      case '/admin/testers':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminTesters exportTesters={exportTesters} />
          </motion.div>
        );
      case '/admin/subscribers':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminSubscribers exportSubscribers={exportSubscribers} />
          </motion.div>
        );
      case '/admin/blogs':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminBlogs />
          </motion.div>
        );
      case '/admin/notes':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminNotes />
          </motion.div>
        );
      case '/admin/links':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminLinks />
          </motion.div>
        );
      case '/admin/settings':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminApps />
          </motion.div>
        );
      default: // /admin -> Overview
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AdminOverview apps={apps} testers={testers} subscribers={subscribers} blogs={blogs} notes={notes} />
          </motion.div>
        );
    }
  };

  if (isLoading && apps.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Synchronizing Cloud Data...</p>
      </div>
    );
  }

  return (
    <DashboardLayout apps={apps} testers={testers} subscribers={subscribers} blogs={blogs} notes={notes}>
      <div className="mb-4 flex items-center justify-end px-4 md:px-8">
        <Badge variant={isOnline ? "outline" : "destructive"} className="gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-white/10">
          {isOnline ? (
            <><Wifi className="h-3 w-3 text-emerald-500" /> Cloud Sync Active</>
          ) : (
            <><WifiOff className="h-3 w-3 text-red-500" /> Offline Mode</>
          )}
        </Badge>
      </div>
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminDashboard;
