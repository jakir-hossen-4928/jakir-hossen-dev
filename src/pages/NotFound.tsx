import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/usePageTitle';

const NotFound = () => {
  // Force HMR update
  usePageTitle("404 - Page Not Found");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4 py-20 min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-none glassmorphism rounded-[32px] p-8 md:p-12 text-center">
            {/* 404 Illustration */}
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-9xl md:text-[12rem] font-black text-primary/20 leading-none"
              >
                404
              </motion.div>
            </div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 mb-8"
            >
              <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                Page Not Found
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved.
                Let's get you back on track.
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                size="lg"
                className="rounded-xl gap-2 font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate('/')}
                size="lg"
                className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t border-border/50"
            >
              <p className="text-xs text-muted-foreground mb-4 font-medium">
                Quick Links
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  onClick={() => navigate('/')}
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-xs"
                >
                  Home
                </Button>
                <Button
                  onClick={() => navigate('/apps')}
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-xs"
                >
                  Apps
                </Button>
                <Button
                  onClick={() => navigate('/#contact')}
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-xs"
                >
                  Contact
                </Button>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;

