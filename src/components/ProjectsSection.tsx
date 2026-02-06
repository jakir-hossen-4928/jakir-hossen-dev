import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";

import sajuriyaImg from "@/assets/project-sajuriya.png";
import aiVocabImg from "@/assets/project-ai-vocab.png";
import myMealsImg from "@/assets/project-my-meals.png";

const projects = [
  {
    title: "Sajuriya",
    tagline: "Premium Skincare & Cosmetics E-commerce",
    description: "A modern, high-performance web application for a premium beauty brand in Bangladesh. Delivers an intuitive shopping experience with responsive design and Firebase backend.",
    image: sajuriyaImg,
    tech: ["Vite", "TypeScript", "Tailwind CSS", "Firebase", "Bun"],
    github: "https://github.com/jakir-hossen-4928/sajuriya-client",
    live: "https://sajuriya.com/",
    category: "Web App"
  },
  {
    title: "AI Vocabulary Coach",
    tagline: "AI-Powered English Vocabulary Builder",
    description: "Sophisticated vocabulary learning platform for IELTS Band 7+. Uses GPT-4o for content generation, supports offline-first usage with sync, flashcards, and PDF export.",
    image: "https://i.ibb.co.com/Zz6ZNk18/5.png",
    tech: ["React 18", "TypeScript", "Framer Motion", "Firebase", "OpenAI GPT-4o"],
    github: "https://github.com/jakir-hossen-4928/ai-vocab-web",
    live: "https://ai-vocabulary-coach.netlify.app/",
    category: "AI Tool"
  },
  {
    title: "My Meals",
    tagline: "Hostel Meal Management & Expense Tracker",
    description: "A practical web app for hostel students to track daily meals, calculate costs, manage budgets, and generate PDF reports with offline support.",
    image: myMealsImg,
    tech: ["React 18", "TypeScript", "Tailwind", "Firebase", "html2pdf.js"],
    github: "https://github.com/jakir-hossen-4928/my-meals",
    live: "https://meal-tracker-jakir.netlify.app/",
    category: "Utility App"
  },
  {
    title: "i-Chat",
    tagline: "Real-time Messaging Platform",
    description: "Multi-featured chat app with voice/video calls, group messaging, and complex GSAP animations. Optimized for Bangladesh time and high-performance real-time updates.",
    image: "https://i.ibb.co.com/G43Wt6H5/3.png",
    tech: ["React", "TypeScript", "Firebase", "GSAP", "React Query"],
    github: "https://github.com/jakir-hossen-4928/i-Chat-Messaging-Platform",
    live: "https://ichatofficial.netlify.app/login",
    category: "Messaging App"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-24 bg-background relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full -ml-40 pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="text-center mb-20">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3"
          >
            Featured Work
          </motion.h3>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-black text-foreground tracking-tighter"
          >
            Creative <span className="text-primary italic">Projects</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto font-medium opacity-80"
          >
            Exploring the intersection of design and technology through practical implementation.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {projects.map((project, index) => (
            <motion.div
              key={index}
              variants={item}
              className="group bg-card border border-border rounded-[2rem] overflow-hidden hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <div className="flex gap-3">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:scale-110 transition-transform shadow-lg"
                      title="View GitHub"
                    >
                      <Github size={18} />
                    </a>
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white text-black hover:scale-110 transition-transform shadow-lg"
                      title="Live Demo"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-foreground text-[9px] font-black uppercase tracking-widest border border-white/10 shadow-sm">
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="p-7 sm:p-8 flex flex-col flex-1 text-left">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 opacity-80">
                  {project.tagline}
                </h4>
                <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-3 font-medium leading-relaxed opacity-80">
                  {project.description}
                </p>
                <div className="mt-auto pt-5 border-t border-border/50 flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[9px] font-bold uppercase tracking-wider border border-border/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
