import sajuriyaImg from "@/assets/project-sajuriya.png";
import aiVocabImg from "@/assets/project-ai-vocab.png";
import myMealsImg from "@/assets/project-my-meals.png";

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  thumbnail: string;
  liveUrl: string;
  githubUrl: string;
  techStack: string[];
}

export const projects: Project[] = [
  {
    id: "sajuriya",
    title: "Sajuriya",
    tagline: "Premium Skincare & Cosmetics E-commerce Platform",
    description:
      "Modern, high-performance web application for a premium beauty brand in Bangladesh. Delivers an intuitive shopping experience with responsive design and Firebase backend.",
    thumbnail: sajuriyaImg,
    liveUrl: "https://sajuriya.com/",
    githubUrl: "https://github.com/jakir-hossen-4928/sajuriya-client",
    techStack: ["Vite", "TypeScript", "Tailwind CSS", "Firebase", "Bun"],
  },
  {
    id: "ai-vocab-coach",
    title: "AI Vocabulary Coach",
    tagline: "AI-Powered English Vocabulary Builder for Bengali Speakers",
    description:
      "Sophisticated learning platform for IELTS prep. Uses GPT-4o for content generation, supports offline-first usage, flashcards, and PDF export.",
    thumbnail: aiVocabImg,
    liveUrl: "https://ai-vocabulary-coach.netlify.app/",
    githubUrl: "https://github.com/jakir-hossen-4928/ai-vocab-web",
    techStack: ["React 18", "TypeScript", "Framer Motion", "Firebase", "OpenAI GPT-4o"],
  },
  {
    id: "my-meals",
    title: "My Meals",
    tagline: "Hostel Meal Management & Expense Tracker",
    description:
      "Practical web app for hostel residents to track daily meals, calculate costs, manage budgets, and generate PDF reports with offline support.",
    thumbnail: myMealsImg,
    liveUrl: "https://meal-tracker-jakir.netlify.app/",
    githubUrl: "https://github.com/jakir-hossen-4928/my-meals",
    techStack: ["React", "TypeScript", "Radix UI", "Firebase", "html2pdf.js"],
  },
];
