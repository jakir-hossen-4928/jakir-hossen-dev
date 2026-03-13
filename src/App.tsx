import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
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

const queryClient = new QueryClient();

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => {
  useProductionSecurity();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <TooltipProvider>
            <Toaster />
            <ToastContainer theme="dark" position="bottom-right" />
            <AuthModal />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/testers"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/subscribers"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/blogs"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/notes"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/links"
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
            </BrowserRouter>
          </TooltipProvider>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );

};

export default App;
