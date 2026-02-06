import { motion } from "framer-motion";
import { useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { Mail, Github, Linkedin, Send, MapPin, Check, MessageCircle } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "mdjakirkhan4928@gmail.com",
    href: "mailto:mdjakirkhan4928@gmail.com",
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "Jakir Hossen",
    href: "https://www.linkedin.com/in/jakir-hossen-36b26b244/",
    color: "text-blue-600",
    bg: "bg-blue-600/10"
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+8801647470849",
    href: "https://wa.me/8801647470849",
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  {
    icon: Github,
    label: "GitHub",
    value: "jakir-hossen-4928",
    href: "https://github.com/jakir-hossen-4928",
    color: "text-foreground",
    bg: "bg-foreground/10"
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Dhaka, Bangladesh",
    href: "#",
    color: "text-red-500",
    bg: "bg-red-500/10"
  }
];

export default function ContactSection() {
  const [state, handleSubmit] = useForm("xykdyyzk");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleSubmit(e);
    setIsSubmitting(false);
  };

  if (state.succeeded) {
    return (
      <section id="contact" className="py-24 bg-background">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center p-10 rounded-[2rem] bg-card border border-border shadow-2xl"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check className="text-green-500 w-10 h-10" />
            </div>
            <h3 className="text-3xl font-black mb-3 tracking-tighter">Message Sent!</h3>
            <p className="text-muted-foreground mb-8 text-base font-medium">
              Thank you for reaching out. I'll get back to you as soon as possible.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-premium btn-premium-primary text-sm w-full py-4 px-8"
            >
              Send Another
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-24 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3">Communication</h3>
          <h2 className="text-3xl sm:text-5xl font-black text-foreground mb-6 tracking-tighter">
            Get In <span className="text-primary italic">Touch</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium opacity-80">
            Have a project in mind or want to collaborate? Feel free to reach out!
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
          {/* Left: Contact Info */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <div className="text-left">
              <h3 className="text-2xl font-black text-foreground mb-4 flex items-center gap-3 tracking-tight">
                <span className="w-8 h-1.5 bg-primary rounded-full" />
                Contact Info
              </h3>
              <p className="text-muted-foreground mb-10 text-lg leading-relaxed font-medium">
                I'm active on these platforms. I usually respond within 24 hours.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, i) => (
                <motion.a
                  key={info.label}
                  href={info.href}
                  target={info.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-[1.5rem] bg-card border border-border flex flex-col items-center text-center gap-4 transition-all group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl ${info.bg} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <info.icon className={`w-6 h-6 ${info.color}`} />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1 opacity-60">
                      {info.label}
                    </div>
                    <div className="text-sm font-black text-foreground truncate max-w-[140px] tracking-tight">
                      {info.value}
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-12 xl:col-span-7">
            <div className="bg-card border border-border p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              {/* Card accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />

              <form onSubmit={onFormSubmit} className="space-y-6 text-left relative z-10">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="name" className="text-[10px] font-black text-foreground uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your Name"
                      className="w-full px-6 py-4 rounded-xl bg-muted/30 border border-border text-foreground focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-muted-foreground/40 font-medium text-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="email" className="text-[10px] font-black text-foreground uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full px-6 py-4 rounded-xl bg-muted/30 border border-border text-foreground focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-muted-foreground/40 font-medium text-sm"
                    />
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="text-[10px] text-red-500 mt-1 font-bold" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="message" className="text-[10px] font-black text-foreground uppercase tracking-widest ml-1">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Tell me about your project..."
                    rows={5}
                    className="w-full px-6 py-4 rounded-xl bg-muted/30 border border-border text-foreground focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none placeholder:text-muted-foreground/40 font-medium text-sm"
                  />
                  <ValidationError prefix="Message" field="message" errors={state.errors} className="text-[10px] text-red-500 mt-1 font-bold" />
                </div>

                <motion.button
                  type="submit"
                  disabled={state.submitting || isSubmitting}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-premium btn-premium-primary w-full text-base py-5 tracking-[0.2em] font-black"
                >
                  {isSubmitting ? "Sending..." : (
                    <span className="flex items-center justify-center gap-3">
                      Send Message <Send size={20} />
                    </span>
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
