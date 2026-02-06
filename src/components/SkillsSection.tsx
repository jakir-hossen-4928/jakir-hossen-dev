import { motion } from "framer-motion";

const skills = [
  { name: "JavaScript", slug: "javascript", bg: "bg-yellow-50 dark:bg-[#F7DF1E]/5" },
  { name: "TypeScript", slug: "typescript", bg: "bg-slate-50 dark:bg-[#3178C6]/5" },
  { name: "React", slug: "react", bg: "bg-blue-50 dark:bg-[#61DAFB]/5" },
  { name: "Vite", slug: "vite", bg: "bg-violet-50 dark:bg-[#646CFF]/5" },
  { name: "Node.js", slug: "nodedotjs", bg: "bg-green-50 dark:bg-[#339933]/5" },
  { name: "MongoDB", slug: "mongodb", bg: "bg-emerald-50 dark:bg-[#47A248]/5" },
  { name: "Tailwind CSS", slug: "tailwindcss", bg: "bg-cyan-50 dark:bg-[#06B6D4]/5" },
  { name: "Firebase", slug: "firebase", bg: "bg-orange-50 dark:bg-[#FFCA28]/5" },
  { name: "Vercel", slug: "vercel", bg: "bg-gray-100 dark:bg-white/5" },
  { name: "Netlify", slug: "netlify", bg: "bg-blue-50 dark:bg-[#00AD9F]/5" },
  { name: "Supabase", slug: "supabase", bg: "bg-emerald-50 dark:bg-[#3ECF8E]/5" },
  { name: "EmailJS", slug: "emailjs", bg: "bg-orange-50 dark:bg-[#F15A24]/5" },
  { name: "GitHub", slug: "github", bg: "bg-gray-100 dark:bg-white/5" },
  { name: "Google Apps Script", slug: "googleappsscript", bg: "bg-blue-50 dark:bg-[#4285F4]/5" },
  { name: "n8n Automation", slug: "n8n", bg: "bg-red-50 dark:bg-[#FF6C37]/5" },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3"
          >
            Technical Expertise
          </motion.h3>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-black text-foreground tracking-tighter"
          >
            My <span className="text-primary italic">Tech Stack</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-muted-foreground text-sm sm:text-lg mt-4 max-w-2xl mx-auto font-medium opacity-80"
          >
            A curated list of technologies and tools I've mastered to deliver high-quality digital products.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 max-w-7xl mx-auto px-4">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.02 }}
              whileHover={{
                y: -5,
                borderColor: "hsl(var(--primary) / 0.2)",
                boxShadow: "0 10px 25px -10px hsl(var(--primary) / 0.1)"
              }}
              className="group p-5 sm:p-7 rounded-[2rem] bg-card border border-border flex flex-col items-center justify-center gap-4 transition-all cursor-pointer shadow-sm hover:shadow-lg"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${skill.bg} flex items-center justify-center transition-all duration-500 group-hover:scale-110 relative overflow-hidden`}>
                <img
                  src={skill.slug === 'emailjs' ? 'https://avatars.githubusercontent.com/u/12061994?s=200&v=4' : `https://cdn.simpleicons.org/${skill.slug}`}
                  alt={skill.name}
                  className={`w-6 h-6 sm:w-7 sm:h-7 object-contain transition-all duration-500 ${['nextdotjs', 'github', 'prisma', 'vercel'].includes(skill.slug)
                    ? 'dark:invert'
                    : ''
                    }`}
                />
              </div>
              <span className="text-[10px] sm:text-[11px] font-black text-foreground tracking-tight group-hover:text-primary transition-colors text-center uppercase">
                {skill.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
