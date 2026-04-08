import { Suspense, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./lib/AuthContext";
import { ThemeProvider } from "./lib/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthModal from "./components/AuthModal";
import ScrollToTop from "./components/ScrollToTop";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

// Refined Skeleton Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background p-8 pt-32 animate-in fade-in duration-500">
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="space-y-6 text-center">
        <Skeleton className="h-16 w-[70%] max-w-xl mx-auto rounded-2xl" />
        <Skeleton className="h-6 w-[50%] max-w-sm mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-6 p-6 border border-border/40 rounded-3xl">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

import { useProductionSecurity } from "./hooks/useProductionSecurity";

export const Providers = ({ children }: { children: ReactNode }) => {
  useProductionSecurity();
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ErrorBoundary>
              <TooltipProvider>
                <Toaster />
                <ToastContainer theme="dark" position="bottom-right" />
                <AuthModal />
                <ScrollToTop />
                <Suspense fallback={<PageLoader />}>
                  {children}
                </Suspense>
              </TooltipProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};
