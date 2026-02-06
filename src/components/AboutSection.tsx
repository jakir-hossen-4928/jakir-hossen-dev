import { motion } from "framer-motion";
import { Award, BookOpen, GraduationCap, Calendar, ChevronRight } from "lucide-react";

export default function AboutSection() {
  const profileImage = "https://i.ibb.co.com/LDz6vpPY/Jakir.jpg";

  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      <div className="section-container relative z-10">

        {/* Section Header */}
        <div className="text-left mb-16">
          <div className="relative inline-block">
            <h2 className="text-xl font-black text-primary uppercase tracking-widest pb-1 border-b-2 border-primary">
              About Me
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Side: Image and Stats Cards */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col items-center">
            {/* Image Area with Themed Frames */}
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square flex items-center justify-center group mb-10">
              {/* Background Frames (Themed & Subtle) */}
              <div className="absolute inset-4 border-2 border-primary/30 rounded-[3rem] -translate-x-4 translate-y-4 sm:-translate-x-6 sm:translate-y-6 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700" />
              <div className="absolute inset-4 border-2 border-blue-500/10 rounded-[3rem] translate-x-4 -translate-y-4 sm:translate-x-6 sm:-translate-y-6 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700" />

              {/* Image Container */}
              <div className="relative w-[85%] h-[85%] rounded-[2.5rem] overflow-hidden border-4 border-card shadow-2xl bg-muted z-10">
                <img
                  src={profileImage}
                  alt="Jakir Hossen"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Stats Cards Row (Stone & Gold Themed) */}
            <div className="flex gap-3 sm:gap-4 w-full max-w-[420px]">
              <motion.div
                whileHover={{ y: -5 }}
                className="flex-1 bg-muted/50 border border-border p-4 sm:p-5 rounded-[1.25rem] text-center shadow-lg group transition-all"
              >
                <div className="text-xl sm:text-2xl font-black text-primary tracking-tight">1+</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-70">Years</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="flex-1 bg-muted/50 border border-border p-4 sm:p-5 rounded-[1.25rem] text-center shadow-lg group transition-all"
              >
                <div className="text-xl sm:text-2xl font-black text-blue-500 tracking-tight">5+</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-70">Projects</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="flex-1 bg-muted/50 border border-border p-4 sm:p-5 rounded-[1.25rem] text-center shadow-lg group transition-all"
              >
                <div className="text-xl sm:text-2xl font-black text-green-500 tracking-tight">1+</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-70">Clients</div>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="lg:col-span-12 xl:col-span-7 text-left space-y-6 sm:space-y-8">
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-3xl sm:text-4xl md:text-6xl font-black text-foreground leading-[1.1] tracking-tighter"
            >
              Transforming Ideas into <br />
              <span className="text-primary italic">Digital Reality</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium opacity-80 max-w-2xl"
            >
              I am a passionate Frontend Developer based in Dhaka, Bangladesh.
              My expertise lies in building high-performance web applications using React, TypeScript, and Firebase, often integrating automation and AI solutions to solve complex problems.
            </motion.p>

            {/* Icon Cards (Screenshot Style) */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 pt-4 max-w-3xl">
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-5 sm:gap-6 p-6 sm:p-7 rounded-[2rem] bg-card border border-border group hover:border-primary/30 transition-all shadow-sm"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FDF8EE] dark:bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                  <Award size={28} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-black text-foreground text-xs sm:text-sm uppercase tracking-widest leading-none mb-2">Quality Driven</h4>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">Clean and maintainable code.</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-5 sm:gap-6 p-6 sm:p-7 rounded-[2rem] bg-card border border-border group hover:border-blue-500/30 transition-all shadow-sm"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EEF2FD] dark:bg-blue-500/5 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <BookOpen size={28} className="text-blue-500" />
                </div>
                <div>
                  <h4 className="font-black text-foreground text-xs sm:text-sm uppercase tracking-widest leading-none mb-2">Always Learning</h4>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">Modern web stack.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="mt-24 sm:mt-32 pt-16 sm:pt-24 border-t border-border/30">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3">Professional Path</h3>
            <h2 className="text-2xl sm:text-5xl font-black text-foreground tracking-tighter">Work <span className="text-primary italic">Experience</span></h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-card border border-border p-6 sm:p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 md:gap-10 hover:border-primary/20 transition-all text-left">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 border border-primary/10">
                  {/* <Award size={32} /> */}
                  <img
                    src="myschool.jpg"
                    alt="FCI Logo"
                    className="w-full rounded-full  h-full object-contain"
                  />

                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Dec 2024 - Aug 2025</span>
                    <h4 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Accountant</h4>
                  </div>
                  <h5 className="text-base sm:text-lg font-bold text-muted-foreground flex items-center gap-2">
                    MySchool (মাইস্কুল) <ChevronRight size={14} className="text-primary" /> Cheora, Cumilla
                  </h5>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium opacity-80 leading-relaxed pt-1">
                    Managing administrative tasks, staff training on internal software, and leading digital transformation initiatives for school management.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Education Section */}
        <div className="mt-24 sm:mt-32">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3">Educational Pillars</h3>
            <h2 className="text-2xl sm:text-5xl font-black text-foreground tracking-tighter">Academic <span className="text-primary italic">Roots</span></h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 sm:p-8 rounded-[2rem] bg-card border border-border transition-all hover:shadow-2xl hover:shadow-primary/10 group text-left"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center p-2 mb-5 sm:mb-6 border border-primary/10 transition-all duration-500 overflow-hidden">
                <img
                  src="fci.jpg"
                  alt="FCI Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-foreground mb-2 tracking-tight">Computer Science & Tech</h4>
              <p className="font-bold text-muted-foreground mb-3 flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest">
                <Calendar size={12} className="text-primary" /> 2022 - 2026
              </p>
              <p className="text-sm sm:text-muted-foreground font-medium text-base leading-relaxed opacity-80">
                Feni Computer Institute. Deepening technical knowledge and engineering principles in computing and software development.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 sm:p-8 rounded-[2rem] bg-card border border-border transition-all hover:shadow-2xl hover:shadow-primary/10 group text-left"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center p-2 mb-5 sm:mb-6 border border-primary/10 transition-all duration-500 overflow-hidden">
                <img
                  src="ibne-taimiya-school.jpg"
                  alt="ITSC Logo"
                  className="w-full h-full object-contain scale-110"
                />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-foreground mb-2 tracking-tight">Secondary Education</h4>
              <p className="font-bold text-muted-foreground mb-3 flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest">
                <Calendar size={12} className="text-primary" /> 2016 - 2021
              </p>
              <p className="text-sm sm:text-muted-foreground font-medium text-base leading-relaxed opacity-80">
                Ibn Taimiya School & College, Comilla. Establishing a strong foundational education through excellence in academic achievement.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
