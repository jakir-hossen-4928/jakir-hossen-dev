import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { SEO, seoConfig } from "@/components/SEO";
import { motion } from "framer-motion";

const Contact = () => {
    return (
        <div className="min-h-screen bg-background">
            <SEO {...seoConfig.contact} />
            <Header />
            <main className="pt-20 md:pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ContactSection />
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;
