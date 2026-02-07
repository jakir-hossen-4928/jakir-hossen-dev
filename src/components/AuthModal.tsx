import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Sparkles } from "lucide-react";

const AuthModal = () => {
    const { isAuthModalOpen, setAuthModalOpen, login } = useAuth();

    return (
        <Dialog open={isAuthModalOpen} onOpenChange={setAuthModalOpen}>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none bg-background/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl">
                <div className="relative p-8 md:p-12 overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-blue-500/50 to-primary/50 opacity-50" />
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

                    <DialogHeader className="relative z-10 text-center space-y-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2 border border-primary/20">
                            <LogIn className="w-8 h-8 text-primary" />
                        </div>
                        <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
                            Welcome <span className="text-primary NOT-italic">Back.</span>
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium text-base">
                            Join our creative community to share your thoughts and feedback.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative z-10 space-y-6">
                        <Button
                            onClick={login}
                            variant="outline"
                            className="w-full h-16 rounded-2xl border-2 border-border bg-background/50 hover:bg-foreground hover:border-foreground transition-all duration-300 flex items-center justify-center gap-4 group"
                        >
                            <img src="/google.png" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="text-base font-black uppercase tracking-widest text-foreground group-hover:text-background transition-colors">
                                Sign in with Google
                            </span>
                        </Button>

                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 px-2 justify-center">
                            <div className="h-px flex-1 bg-border/50" />
                            <span>Premium Experience</span>
                            <div className="h-px flex-1 bg-border/50" />
                        </div>

                        <p className="text-[11px] text-center text-muted-foreground leading-relaxed px-4">
                            By signing in, you agree to our premium community standards and collaborative environment.
                        </p>
                    </div>

                    {/* Bottom Sparkle Detail */}
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Secure Access</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
