import { motion } from "framer-motion";

const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] };

export default function HeroSection() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const roleText = "Frontend Developer";

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

          {/* Subtitle / Role with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-muted-foreground flex items-center justify-center gap-3">
              <motion.span className="flex">
                {roleText.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 0.5 + index * 0.05,
                      duration: 0.5,
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.span>
            </h2>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto font-medium px-4 opacity-80"
          >
            Specializing in React, TypeScript, and Firebase to build high-performance,
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
        </div>
      </div>
    </section>
  );
}
