import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { usePageTitle } from '@/hooks/usePageTitle';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { AppEntry, Tester } from '@/lib/types';
import { AdminOverview } from './admin/AdminOverview';
import { AdminApps } from './admin/AdminApps';
import { AdminSubscribers } from './admin/AdminSubscribers';
import { AdminTesters } from './admin/AdminTesters';
import { toast } from 'sonner';

const AdminDashboard = () => {
  usePageTitle("Admin Dashboard");
  const location = useLocation();
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [testers, setTesters] = useState<Tester[]>([]);
  const [subscribers, setSubscribers] = useState<Tester[]>([]); // Reuse Tester type
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync Apps
    const unsubscribeApps = onSnapshot(collection(db, 'apps'), (snapshot) => {
      const appsList: AppEntry[] = [];
      snapshot.forEach((docSnap) => {
        appsList.push({ id: docSnap.id, ...docSnap.data() } as AppEntry);
      });
      setApps(appsList);
    });

    // Sync Testers
    const qTesters = query(collection(db, 'testers'), orderBy('joinedAt', 'desc'));
    const unsubscribeTesters = onSnapshot(qTesters, (querySnapshot) => {
      const testersList: Tester[] = [];
      querySnapshot.forEach((docSnap) => {
        testersList.push(docSnap.data() as Tester);
      });
      setTesters(testersList);
    });

    // Sync Subscribers
    const qSubscribers = query(collection(db, 'subscribers'), orderBy('joinedAt', 'desc'));
    const unsubscribeSubscribers = onSnapshot(qSubscribers, (querySnapshot) => {
      const subList: Tester[] = [];
      querySnapshot.forEach((docSnap) => {
        subList.push(docSnap.data() as Tester);
      });
      setSubscribers(subList);
      setLoading(false); // Set loading false after initial fetch attempts
    });

    return () => {
      unsubscribeApps();
      unsubscribeTesters();
      unsubscribeSubscribers();
    };
  }, []);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export.");
      return;
    }

    // Get all unique keys
    const allKeys = Array.from(new Set(data.flatMap(item => Object.keys(item))));

    // Create CSV header
    const header = allKeys.join(',');

    // Create CSV rows
    const rows = data.map(item => {
      return allKeys.map(key => {
        const value = item[key] !== undefined ? item[key] : '';
        // Escape quotes and wrap in quotes if contains comma
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


  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  const renderContent = () => {
    const path = location.pathname;

    switch (path) {
      case '/admin/testers':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminTesters testers={testers} exportTesters={exportTesters} />
          </motion.div>
        );
      case '/admin/subscribers': // New Route
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminSubscribers subscribers={subscribers} exportSubscribers={exportSubscribers} />
          </motion.div>
        );
      case '/admin/settings': // Mapped to App Registry
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <AdminApps apps={apps} />
          </motion.div>
        );
      default: // /admin -> Overview
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminOverview apps={apps} testers={testers} />
          </motion.div>
        );
    }
  };

  return (
    <DashboardLayout>
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminDashboard;
