import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { AppEntry } from '@/lib/types';
import { searchApps } from '@/utils/searchUtils';
import { sortApps, SortOption } from '@/utils/sortUtils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppSearch from '@/components/AppSearch';
import AppSort from '@/components/AppSort';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { useApps } from '@/hooks/useApps';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const AppPromo = () => {
  usePageTitle("App Gallery");
  const navigate = useNavigate();
  const { apps, isLoading, refetch } = useApps();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.NEWEST);
  const [refreshing, setRefreshing] = useState(false);

  // Apply search and sort using useMemo for performance
  const filteredApps = useMemo(() => {
    let result = [...apps];

    // Search
    if (searchQuery.trim()) {
      result = searchApps(result, searchQuery);
    }

    // Sort
    result = sortApps(result, sortBy);

    return result;
  }, [apps, searchQuery, sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await (refetch ? refetch() : Promise.resolve());
    } catch (error) {
      console.error('Error refreshing apps:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />

      <main className="relative overflow-hidden pt-32 pb-24 min-h-[calc(100vh-80px)]">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full animate-pulse delay-700"></div>
        </div>

        <motion.div
          className="container mx-auto px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-16">
            {/* Hero Section */}
            <section className="text-center max-w-5xl mx-auto space-y-8">
              <motion.div variants={itemVariants} className="flex justify-center mb-6">
                <img
                  src="https://i.ibb.co.com/Vpk8Z8Js/sajuriya-studio-logo.png"
                  alt="Sajuriya Studio"
                  className="h-20 w-auto object-contain"
                />
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-2xl md:text-5xl font-black tracking-tight"
              >
                Sajuriya Studio
              </motion.h1>

              {/* Search and Sort Controls */}
              <motion.div variants={itemVariants} className="flex flex-row items-center justify-center gap-4 pt-8">
                <AppSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search apps..."
                />
                <AppSort value={sortBy} onChange={setSortBy} />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-12 w-12 rounded-xl"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </motion.div>
            </section>

            {isLoading && apps.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="relative overflow-hidden border border-border/40 bg-card/40 backdrop-blur-sm rounded-[32px] h-[320px]">
                    <div className="pt-8 pb-4 flex justify-center">
                      <Skeleton className="w-24 h-24 rounded-[22%]" />
                    </div>
                    <div className="p-6 pt-2 space-y-3 flex flex-col items-center">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-9 w-full rounded-xl mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredApps.length === 0 ? (
                  <div className="col-span-full text-center py-20 opacity-50">
                    <p className="font-black uppercase tracking-widest text-xs text-muted-foreground">
                      {searchQuery ? 'No apps match your search' : 'No apps available'}
                    </p>
                  </div>
                ) : (
                  filteredApps.map((app) => (
                    <motion.div
                      key={app.id}
                      variants={itemVariants}
                      className="relative group cursor-pointer"
                      onClick={() => navigate(`/apps/${app.slug || app.id}`)}
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative overflow-hidden border border-border/40 bg-card/40 backdrop-blur-sm rounded-[32px] hover:border-primary/30 transition-all h-full shadow-sm hover:shadow-md">
                        {/* App Icon Container */}
                        <div className="pt-8 pb-4 flex justify-center">
                          <div className="w-24 h-24 rounded-[22%] overflow-hidden shadow-2xl border border-border/10 bg-gradient-to-br from-primary/5 to-blue-500/5">
                            {app.icon ? (
                              <img
                                src={app.icon}
                                alt={app.appName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-primary/20" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* App Info */}
                        <div className="p-6 pt-2 space-y-3 text-center">
                          <div className="flex flex-col items-center gap-2">
                            {app.status && (
                              <Badge variant="outline" className="text-[10px] py-0 h-5">{app.status.toUpperCase()}</Badge>
                            )}
                            {app.appName && (
                              <h3 className="text-base md:text-lg font-black leading-tight">{app.appName}</h3>
                            )}
                          </div>

                          {app.description && (
                            <div
                              className="text-[10px] md:text-xs text-muted-foreground line-clamp-2 leading-relaxed h-10"
                              dangerouslySetInnerHTML={{
                                __html: app.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                              }}
                            />
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all text-xs"
                          >
                            View Details <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default AppPromo;
