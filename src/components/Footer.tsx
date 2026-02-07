import { useState } from 'react';
import { motion } from "framer-motion";
import { ArrowUp, Github, Linkedin, Mail, Send } from "lucide-react";
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const subId = `sub_${Date.now()}`;
      await setDoc(doc(db, 'subscribers', subId), {
        email: email,
        playStoreEmail: email,
        displayName: "Subscriber",
        joinedAt: new Date().toISOString(),
        source: 'footer_subscription',
        uid: subId
      });

      toast.success("Thanks for subscribing! You've been added to the beta list.");
      setEmail('');
    } catch (error: any) {
      console.error("Subscription error:", error);
      if (error?.message?.includes('Failed to fetch') || error?.code === 'unavailable') {
        toast.error("Network request blocked. Please disable ad-blockers for this site.");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-border bg-background relative overflow-hidden">
      <div className="section-container py-12 md:py-14">
        <div className="flex flex-col items-center gap-8">

          {/* Subscription Section */}
          <div className="w-full max-w-md space-y-3 text-center">
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-foreground">Join the Beta Program</h3>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">
              Subscribe with your <span className="text-primary font-bold">Google Play Store Email</span> to get instant access to testing builds.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 relative z-10">
              <Input
                type="email"
                placeholder="google.play.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-input focus:border-primary h-11 rounded-xl text-sm"
                required
              />
              <Button type="submit" disabled={loading} size="icon" className="h-11 w-11 rounded-xl shrink-0 shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90">
                <Send size={16} className={loading ? "animate-pulse" : ""} />
              </Button>
            </form>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent max-w-2xl" />

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <motion.a
              whileHover={{ y: -5, scale: 1.1 }}
              href="https://github.com/jakir-hossen-4928"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all cursor-pointer shadow-sm border border-border/50"
              aria-label="GitHub"
            >
              <Github size={20} />
            </motion.a>
            <motion.a
              whileHover={{ y: -5, scale: 1.1 }}
              href="https://www.linkedin.com/in/jakir-hossen-36b26b244/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all cursor-pointer shadow-sm border border-border/50"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </motion.a>
            <motion.a
              whileHover={{ y: -5, scale: 1.1 }}
              href="mailto:mdjakirkhan4928@gmail.com"
              className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all cursor-pointer shadow-sm border border-border/50"
              aria-label="Email"
            >
              <Mail size={20} />
            </motion.a>
            <motion.button
              whileHover={{ y: -5, scale: 1.1 }}
              onClick={scrollToTop}
              className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-primary/20"
              aria-label="Back to top"
            >
              <ArrowUp size={20} />
            </motion.button>
          </div>

          {/* Copyright */}
          <div className="text-center space-y-2">
            <div className="flex justify-center gap-6 text-[10px] font-semibold uppercase tracking-widest opacity-60">
              <a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
            <p className="text-base font-black text-foreground tracking-tight uppercase">
              Jakir Hossen
            </p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
              © {new Date().getFullYear()} All rights reserved. Built with Passion & Precision.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
