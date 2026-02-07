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
import { Sparkles, ArrowRight } from 'lucide-react';
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
  usePageTitle("Play Store Apps");
  const navigate = useNavigate();
  const { apps, isLoading, refetch } = useApps();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.NEWEST);

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


  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />

      <main className="relative overflow-hidden pt-16 md:pt-20 pb-20 min-h-[calc(100vh-80px)]">
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
          <div className="space-y-8 md:space-y-10">
            {/* Hero Section */}
            <section className="text-center max-w-5xl mx-auto space-y-6">
              <motion.div variants={itemVariants} className="flex justify-center mb-6">
                <div className="p-1 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 shadow-xl shadow-primary/10">
                  <div className="bg-white rounded-full p-6 md:p-8 border border-border/50 flex items-center justify-center w-28 h-28 md:w-40 md:h-40 overflow-hidden shadow-inner">
                    <img
                      src="https://i.ibb.co.com/Vpk8Z8Js/sajuriya-studio-logo.png"
                      alt="Sajuriya Studio"
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-lg md:text-2xl lg:text-3xl font-black tracking-tight"
              >
                Sajuriya Studio
              </motion.h1>

              {/* Search and Sort Controls */}
              <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-center gap-3 pt-6 w-full max-w-2xl mx-auto">
                <AppSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search apps..."
                />
                <div className="shrink-0 w-full md:w-auto">
                  <AppSort value={sortBy} onChange={setSortBy} />
                </div>
              </motion.div>
            </section>

            {isLoading && apps.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="relative overflow-hidden border border-border/40 bg-card/40 backdrop-blur-sm rounded-[32px] h-[300px]">
                    <div className="pt-6 pb-2 flex justify-center">
                      <Skeleton className="w-20 h-20 rounded-[22%]" />
                    </div>
                    <div className="p-5 pt-2 space-y-2 flex flex-col items-center">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-8 w-full rounded-xl mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[32px] blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative overflow-hidden border border-border/40 bg-card/40 backdrop-blur-sm rounded-[32px] hover:border-primary/30 transition-all h-full shadow-sm hover:shadow-md">
                        {/* App Icon Container */}
                        <div className="pt-6 pb-2 flex justify-center">
                          <div className="w-20 h-20 rounded-[22%] overflow-hidden shadow-xl border border-border/10 bg-gradient-to-br from-primary/5 to-blue-500/5">
                            {app.icon ? (
                              <img
                                src={app.icon}
                                alt={app.appName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-primary/20" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* App Info */}
                        <div className="p-5 pt-1 space-y-2 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            {app.status && (
                              <Badge variant="outline" className="text-[8px] py-0 h-4 uppercase tracking-tighter">{app.status.toUpperCase()}</Badge>
                            )}
                            {app.appName && (
                              <h3 className="text-sm md:text-base font-black leading-tight line-clamp-1">{app.appName}</h3>
                            )}
                          </div>

                          {app.description && (
                            <div
                              className="text-[10px] md:text-[11px] text-muted-foreground line-clamp-2 leading-snug h-8"
                              dangerouslySetInnerHTML={{
                                __html: app.description.replace(/<[^>]*>/g, '').substring(0, 80) + '...'
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
    </div >
  );
};

export default AppPromo;
