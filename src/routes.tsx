import { lazy } from "react";
import type { RouteRecord } from 'vite-react-ssg';
import ProtectedRoute from "./components/ProtectedRoute";

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

import App from "./App";

export const routes: RouteRecord[] = [
  {
    path: "/",
    Component: App,
    children: [
      { index: true, Component: Index },
      { path: "/apps", Component: AppPromo },
      { path: "/apps/:slug", Component: AppDetails },
      { path: "/blogs", Component: BlogGallery },
      { path: "/blogs/:slug", Component: BlogDetails },
      { path: "/themes", Component: ThemesGallery },
      { path: "/themes/:id", Component: ThemePreview },
      { path: "/services", Component: Services },
      {
        path: "/admin/*",
        element: (
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      { path: "/privacy-policy", Component: PrivacyPolicy },
      { path: "/contact", Component: Contact },
      { path: "*", Component: NotFound },
    ],
  },
];
