import { motion } from "framer-motion";
import { Award, BookOpen, GraduationCap, Calendar, ChevronRight, FileText, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutSection() {
  const profileImage = "/jakir-hossen.jpg";

  return (
    <section id="about" className="pt-0 pb-8 bg-background relative overflow-hidden group">
      {/* Smooth gradient transition from Hero */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background via-background to-transparent pointer-events-none" />
      
      <div className="section-container relative z-10 pt-8">

        {/* Section Header */}
        <div className="text-left mb-6">
          <div className="relative inline-block">
            <h2 className="text-xl font-black text-primary uppercase tracking-widest pb-1 border-b-2 border-primary">
              About Me
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-11 gap-12 lg:gap-16 items-center">
          {/* Left Side: Image and Stats Cards */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center">
            {/* Image Area with Themed Frames */}
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square flex items-center justify-center group mb-10">
              {/* Background Frames (Themed & Subtle) */}
              <div className="absolute inset-4 border-2 border-primary/30 rounded-[3rem] -translate-x-4 translate-y-4 sm:-translate-x-6 sm:translate-y-6 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
              <div className="absolute inset-4 border-2 border-blue-500/10 rounded-[3rem] translate-x-4 -translate-y-4 sm:translate-x-6 sm:-translate-y-6 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />

              {/* Image Container */}
              <div className="relative w-[85%] h-[85%] rounded-[2.5rem] overflow-hidden border-4 border-card shadow-2xl bg-white z-10">
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
                <div className="text-xl sm:text-2xl font-black text-blue-500 tracking-tight">25+</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-70">Projects</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="flex-1 bg-muted/50 border border-border p-4 sm:p-5 rounded-[1.25rem] text-center shadow-lg group transition-all"
              >
                <div className="text-xl sm:text-2xl font-black text-green-500 tracking-tight">8+</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-70">Clients</div>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="lg:col-span-6 xl:col-span-7 text-left space-y-6 sm:space-y-8">
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="pt-2"
            >
              <Button
                asChild
                className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all"
              >
                <a
                  href="https://drive.google.com/file/d/19rU58Su0m_H-W6K456Fv48dAnbznfhV8/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                >
                  <FileText size={18} className="group-hover:rotate-12 transition-transform" />
                  Download My Resume
                </a>
              </Button>
            </motion.div>

            {/* Icon Cards (Responsive stack) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 w-full">
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-row items-center gap-5 p-6 rounded-[2rem] bg-card border border-border group hover:border-primary/30 transition-all shadow-sm h-full text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FDF8EE] dark:bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 transition-transform group-hover:scale-110 shadow-sm">
                  <Award size={24} className="text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-foreground text-[13px] uppercase tracking-widest leading-none">Quality Driven</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium opacity-80">Clean and maintainable code.</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-row items-center gap-5 p-6 rounded-[2rem] bg-card border border-border group hover:border-blue-500/30 transition-all shadow-sm h-full text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#EEF2FD] dark:bg-blue-500/5 flex items-center justify-center shrink-0 border border-blue-500/10 transition-transform group-hover:scale-110 shadow-sm">
                  <BookOpen size={24} className="text-blue-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-foreground text-[13px] uppercase tracking-widest leading-none">Always Learning</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium opacity-80">Modern web stack.</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-row items-center gap-5 p-6 rounded-[2rem] bg-card border border-border group hover:border-pink-500/30 transition-all shadow-sm relative overflow-hidden h-full text-left"
              >
                <a
                  href="https://lalita-story.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10"
                />
                <div className="w-14 h-14 rounded-2xl bg-[#FDEEF8] dark:bg-pink-500/5 flex items-center justify-center shrink-0 border border-pink-500/10 transition-transform group-hover:scale-110 shadow-sm">
                  <Heart size={24} className="text-pink-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-foreground text-[13px] uppercase tracking-widest leading-none">Creative writing</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium opacity-80 italic">ললিতা - A Love Story.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div id="experience" className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-border/30" itemScope itemType="https://schema.org/Person">
          <meta itemProp="name" content="Jakir Hossen" />
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3">Professional Path</h3>
            <h2 className="text-2xl sm:text-5xl font-black text-foreground tracking-tighter">Work <span className="text-primary italic">Experience</span></h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Softvance Delta */}
            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 sm:p-8 rounded-[2rem] bg-card border border-border transition-all hover:shadow-2xl hover:shadow-primary/10 group text-left flex flex-col items-start"
              itemScope
              itemType="https://schema.org/Organization"
            >
              <meta itemProp="name" content="Softvance Delta" />
              <meta itemProp="description" content="Frontend Developer - Leading frontend development and crafting high-converting Shopify store designs" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center p-2 mb-5 sm:mb-6 border border-primary/10 transition-all duration-500 overflow-hidden shadow-sm">
                <img
                  src="softvance.png"
                  alt="Softvance Delta Logo"
                  className="w-full h-full object-contain"
                  itemProp="logo"
                />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-foreground mb-2 tracking-tight" itemProp="jobTitle">Frontend Developer</h4>
              <div className="flex flex-col gap-1 mb-4">
                <p className="font-bold text-muted-foreground flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest">
                  <Calendar size={12} className="text-primary" /> 
                  <time itemProp="startDate" dateTime="2026-02">Feb 2026</time> - <time itemProp="endDate" dateTime="Present">Present</time>
                </p>
                <h5 className="text-[11px] sm:text-sm font-bold text-muted-foreground flex items-center gap-1">
                  Softvance Delta <ChevronRight size={14} className="text-primary" /> 
                  <span itemProp="location" itemScope itemType="https://schema.org/Place">
                    <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                      Onsite, <span itemProp="addressLocality">Dhaka</span>
                    </span>
                  </span>
                </h5>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed opacity-80 pt-1" itemProp="description">
                Leading frontend development and crafting high-converting Shopify store designs with a focus on modern web standards.
              </p>
            </motion.div>

            {/* MySchool */}
            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 sm:p-8 rounded-[2rem] bg-card border border-border transition-all hover:shadow-2xl hover:shadow-primary/10 group text-left flex flex-col items-start"
              itemScope
              itemType="https://schema.org/Organization"
            >
              <meta itemProp="name" content="MySchool (মাইস্কুল)" />
              <meta itemProp="description" content="Accountant - Managing administrative tasks, staff training, and leading digital transformation initiatives" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center p-2 mb-5 sm:mb-6 border border-primary/10 transition-all duration-500 overflow-hidden shadow-sm">
                <img
                  src="myschool.png"
                  alt="MySchool Logo"
                  className="w-full h-full object-contain"
                  itemProp="logo"
                />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-foreground mb-2 tracking-tight" itemProp="jobTitle">Accountant</h4>
              <div className="flex flex-col gap-1 mb-4">
                <p className="font-bold text-muted-foreground flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest">
                  <Calendar size={12} className="text-primary" /> 
                  <time itemProp="startDate" dateTime="2024-12">Dec 2024</time> - <time itemProp="endDate" dateTime="2025-08">Aug 2025</time>
                </p>
                <h5 className="text-[11px] sm:text-sm font-bold text-muted-foreground flex items-center gap-1">
                  MySchool (মাইস্কুল) <ChevronRight size={14} className="text-primary" /> 
                  <span itemProp="location" itemScope itemType="https://schema.org/Place">
                    <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                      <span itemProp="addressLocality">Cheora, Cumilla</span>
                    </span>
                  </span>
                </h5>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed opacity-80 pt-1" itemProp="description">
                Managing administrative tasks, staff training, and leading digital transformation initiatives for school management.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Education Section */}
        <div className="mt-10 sm:mt-12">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3">Educational Pillars</h3>
            <h2 className="text-2xl sm:text-5xl font-black text-foreground tracking-tighter">Academic <span className="text-primary italic">Roots</span></h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 sm:p-8 rounded-[2rem] bg-card border border-border transition-all hover:shadow-2xl hover:shadow-primary/10 group text-left"
              itemScope
              itemType="https://schema.org/EducationalOrganization"
            >
              <meta itemProp="name" content="Feni Computer Institute" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center p-2 mb-5 sm:mb-6 border border-primary/10 transition-all duration-500 overflow-hidden">
                <img
                  src="fci.jpg"
                  alt="FCI Logo"
                  className="w-full h-full object-contain"
                  itemProp="logo"
                />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-foreground mb-2 tracking-tight" itemProp="description">Computer Science & Tech</h4>
              <p className="font-bold text-muted-foreground mb-3 flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest">
                <Calendar size={12} className="text-primary" /> 
                <time itemProp="startDate" dateTime="2022">2022</time> - <time itemProp="endDate" dateTime="2026">2026</time>
              </p>
              <p className="text-sm sm:text-muted-foreground font-medium text-base leading-relaxed opacity-80">
                Feni Computer Institute. Deepening technical knowledge and engineering principles in computing and software development.
                <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress" className="hidden">
                  <span itemProp="addressLocality">Ranir Hat, Feni</span>
                </span>
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="p-6 sm:p-8 rounded-[2rem] bg-card border border-border transition-all hover:shadow-2xl hover:shadow-primary/10 group text-left"
              itemScope
              itemType="https://schema.org/EducationalOrganization"
            >
              <meta itemProp="name" content="Ibn Taimiya School & College" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center p-2 mb-5 sm:mb-6 border border-primary/10 transition-all duration-500 overflow-hidden">
                <img
                  src="ibne-taimiya-school.jpg"
                  alt="ITSC Logo"
                  className="w-full h-full object-contain scale-110"
                  itemProp="logo"
                />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-foreground mb-2 tracking-tight" itemProp="description">Secondary Education</h4>
              <p className="font-bold text-muted-foreground mb-3 flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest">
                <Calendar size={12} className="text-primary" /> 
                <time itemProp="startDate" dateTime="2016">2016</time> - <time itemProp="endDate" dateTime="2021">2021</time>
              </p>
              <p className="text-sm sm:text-muted-foreground font-medium text-base leading-relaxed opacity-80">
                Ibn Taimiya School & College, Comilla. Establishing a strong foundational education through excellence in academic achievement.
                <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress" className="hidden">
                  <span itemProp="addressLocality">Tomsom Bridge, Cumilla</span>
                </span>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}