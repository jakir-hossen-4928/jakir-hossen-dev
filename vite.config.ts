import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import ViteSitemap from 'vite-plugin-sitemap';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Jakir Hossen - Frontend Developer',
        short_name: 'Jakir Hossen',
        description: 'Portfolio of Jakir Hossen, a Frontend Developer specialized in React and AI.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: 'web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    // Gzip compression for production builds
    mode === 'production' && viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files > 1KB
    }),
    // Brotli compression for production builds
    mode === 'production' && viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
    // Bundle analysis (generates stats.html on build)
    mode === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    ViteSitemap({
      hostname: 'https://jakirhossen.dev',
      dynamicRoutes: [
        '/',
        '/apps',
        '/blogs',
        '/themes',
        '/services',
        '/privacy-policy',
        '/contact'
      ],
      generateRobotsTxt: true,
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'Jakir Hossen - Frontend Developer',
          description: 'Portfolio of Jakir Hossen, a Frontend Developer specialized in React and AI.',
        },
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Target modern browsers for smaller output
    target: 'es2020',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      // output: {
      //   manualChunks: {
      //     // Core React runtime
      //     'react': ['react', 'react-dom', 'react-router-dom'],
      //     // Firebase (typically the largest dependency)
      //     'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
      //     // Animation library
      //     'vendor-framer': ['framer-motion'],
      //     // UI utilities
      //     'vendor-ui': ['@tanstack/react-query', 'lucide-react'],
      //   },
      // },
    },
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
  },
  // @ts-ignore
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    includedRoutes() {
      return [
        '/',
        '/apps',
        '/blogs',
        '/themes',
        '/services',
        '/privacy-policy',
        '/contact'
      ]
    },
  },
}));
