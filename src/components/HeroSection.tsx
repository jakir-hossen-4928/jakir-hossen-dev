import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] };

const ROLES = ["Shopify Store Designer", "React Developer", "Portfolio Designer", "Landing Page Designer"] as const;

// Developer-style typewriter effect with typing and deleting
const useTypewriter = (texts: readonly string[], typeSpeed: number = 100, deleteSpeed: number = 50, pauseTime: number = 2000) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[currentIndex] ?? "";
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (!currentText) {
      if (displayText !== "") setDisplayText("");
      return;
    }

    if (!isDeleting) {
      // Typing phase
      if (displayText.length < currentText.length) {
        timer = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, typeSpeed);
      } else {
        // Finished typing, pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else if (isDeleting) {
      // Deleting phase
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deleteSpeed);
      } else {
        // Finished deleting, move to next text
        setIsDeleting(false);
        setCurrentIndex((prev) => (texts.length === 0 ? 0 : (prev + 1) % texts.length));
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [displayText, isDeleting, currentIndex, texts, typeSpeed, deleteSpeed, pauseTime]);

  const currentText = texts[currentIndex] ?? "";
  return { displayText, isTyping: !isDeleting && !!currentText && displayText.length < currentText.length };
};

export default function HeroSection() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const { displayText, isTyping } = useTypewriter(ROLES, 100, 50, 2000);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Background glow effects - adaptive for light/dark */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl opacity-[0.03] dark:opacity-[0.1] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary blur-[140px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-orange-500 blur-[140px] rounded-full animate-pulse [animation-delay:700ms]" />
      </div>

      {/* Gradient transition to About section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      <div className="section-container relative z-10 w-full pt-20">
        <div className="flex flex-col items-center text-center">
          {/* Greeting */}
          <p
            className="text-primary font-black mb-6 text-xs sm:text-sm tracking-[0.3em] uppercase animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
          >
            Hello, I'm
          </p>

          {/* Name */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] mb-8 tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:150ms] fill-mode-both"
            itemScope
            itemType="https://schema.org/Person"
          >
            <span itemProp="name">Jakir Hossen</span>
          </h1>

          {/* Subtitle / Role with Developer Typewriter Animation */}
          <div
            className="mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:300ms] fill-mode-both"
          >
            <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-1">
              <span className="font-mono tracking-wider text-muted-foreground" itemProp="jobTitle">
                {displayText}
              </span>
              <motion.span
                className="inline-block w-0.5 h-6 bg-primary"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
              />
            </h2>
          </div>

          {/* Description */}
          <p
            className="text-base sm:text-lg text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto font-medium px-4 opacity-80 animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:400ms] fill-mode-both"
            itemProp="description"
          >
            Specializing in Shopify store design, React, and Firebase, as well as Supabase to build high-performance,
            <br className="hidden sm:block" /> UI-integrated web applications and scalable automation solutions.
          </p>

          {/* Buttons */}
          <div
            className="flex flex-wrap justify-center gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:500ms] fill-mode-both"
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
          </div>

          {/* Play Store Developer Link */}
          <div
            className="mt-8 flex items-center justify-center gap-2 text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer group animate-in fade-in duration-1000 [animation-delay:1000ms] fill-mode-both"
          >
            <a
              href="https://play.google.com/store/apps/dev?id=6495908705399463745"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              Official Developer on Google Play Store
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
