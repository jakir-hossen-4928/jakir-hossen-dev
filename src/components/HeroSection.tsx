import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] };

// Hacker text scramble effect
const useTextScramble = (texts: string[], interval: number = 3000) => {
  const [displayText, setDisplayText] = useState(texts[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrambling, setIsScrambling] = useState(false);

  const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  useEffect(() => {
    const cycleText = () => {
      setIsScrambling(true);
      const nextIndex = (currentIndex + 1) % texts.length;
      const targetText = texts[nextIndex];
      let iteration = 0;
      const maxIterations = targetText.length * 3;

      const scrambleInterval = setInterval(() => {
        setDisplayText(
          targetText
            .split("")
            .map((char, index) => {
              if (char === " ") return " ";
              if (index < iteration / 3) {
                return targetText[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );

        iteration++;

        if (iteration >= maxIterations) {
          clearInterval(scrambleInterval);
          setDisplayText(targetText);
          setIsScrambling(false);
          setCurrentIndex(nextIndex);
        }
      }, 30);
    };

    const timer = setTimeout(cycleText, interval);
    return () => clearTimeout(timer);
  }, [currentIndex, texts, interval]);

  return { displayText, isScrambling };
};

export default function HeroSection() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const roles = ["Frontend Developer", "Shopify Developer"];
  const { displayText, isScrambling } = useTextScramble(roles, 4000);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Background glow effects - adaptive for light/dark */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl opacity-[0.03] dark:opacity-[0.1] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary blur-[140px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-orange-500 blur-[140px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Gradient transition to About section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      <div className="section-container relative z-10 w-full pt-20">
        <div className="flex flex-col items-center text-center">
          {/* Greeting */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-black mb-6 text-xs sm:text-sm tracking-[0.3em] uppercase"
          >
            Hello, I'm
          </motion.p>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] mb-8 tracking-tighter"
          >
            Jakir Hossen
          </motion.h1>

          {/* Subtitle / Role with Hacker Scramble Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-3">
              <motion.span 
                className={`font-mono tracking-wider ${isScrambling ? 'text-primary' : 'text-muted-foreground'}`}
                animate={isScrambling ? { opacity: [1, 0.8, 1] } : {}}
                transition={{ duration: 0.1, repeat: isScrambling ? Infinity : 0 }}
              >
                {displayText}
              </motion.span>
              <motion.span
                className="inline-block w-0.5 h-6 bg-primary"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              />
            </h2>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto font-medium px-4 opacity-80"
          >
            Specializing in React, TypeScript, Shopify, and Firebase to build high-performance,
            <br className="hidden sm:block" /> UI-integrated web applications and scalable automation solutions.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <button
              onClick={() => scrollTo("#projects")}
              className="btn-premium btn-premium-primary text-sm px-10 py-4"
            >
              View Projects
            </button>
            <button
              onClick={() => scrollTo("#contact")}
              className="btn-premium btn-premium-outline text-sm px-10 py-4"
            >
              Get In Touch
            </button>
          </motion.div>

          {/* Play Store Developer Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-8 flex items-center justify-center gap-2 text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer group"
          >
            <a
              href="https://play.google.com/store/apps/dev?id=6495908705399463745"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              Official Developer on Google Play Store
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
