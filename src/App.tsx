import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { ThemeProvider } from "./lib/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthModal from "./components/AuthModal";
import ScrollToTop from "./components/ScrollToTop";
import { useProductionSecurity } from "./hooks/useProductionSecurity";

// Lazy-load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const AppPromo = lazy(() => import("./pages/AppPromo"));
const AppDetails = lazy(() => import("./pages/AppDetails"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const BlogGallery = lazy(() => import("./pages/BlogGallery"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));
const Contact = lazy(() => import("./pages/Contact"));
const ThemesGallery = lazy(() => import("./pages/ThemesGallery"));
const ThemePreview = lazy(() => import("./pages/ThemePreview"));
const Services = lazy(() => import("./pages/Services"));

const queryClient = new QueryClient();


// Refined Skeleton Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background p-8 pt-32 animate-in fade-in duration-500">
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section Skeleton */}
      <div className="space-y-6 text-center">
        <Skeleton className="h-16 w-[70%] max-w-xl mx-auto rounded-2xl" />
        <Skeleton className="h-6 w-[50%] max-w-sm mx-auto" />
      </div>

      {/* Content Grid Skeleton */}
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

const App = () => {
  useProductionSecurity();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider>
          <AuthProvider>
            <ErrorBoundary>
              <TooltipProvider>
                <Toaster />
                <ToastContainer theme="dark" position="bottom-right" />
                <AuthModal />
                <ScrollToTop />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/apps" element={<AppPromo />} />
                    <Route path="/apps/:slug" element={<AppDetails />} />
                    <Route path="/blogs" element={<BlogGallery />} />
                    <Route path="/blogs/:slug" element={<BlogDetails />} />
                    <Route path="/themes" element={<ThemesGallery />} />
                    <Route path="/themes/:id" element={<ThemePreview />} />
                    <Route path="/services" element={<Services />} />
                    <Route
                      path="/admin/*"
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </TooltipProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
