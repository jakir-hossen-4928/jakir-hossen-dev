# Implementation Plan: Services Page 

## 🎯 Goal
Create a premium, high-impact "Services" page showcasing Jakir's digital offerings (Portfolio Website, Animations, Blog, Custom Dev) with dual pricing ($/£) and Framer Motion transitions.

## 🛠️ Design Commitment (Asymmetric Depth)
- **Topological Betrayal:** No standard 50/50 hero. Instead, a **Massive Typographic Header** that overlaps with the service cards on scroll.
- **Micro-animations:** Staggered reveal of service blocks (`0.1s` delay each). Cards will have a subtle floating effect (`y: [0, -10, 0]`) to feel "alive".
- **Risk Factor:** Using raw, high-contrast gold/onyx borders (2px) without standard rounded corners (`rounded-none` or `rounded-sm`) for a sharp, technical feel.

## 📋 Task List
### 1. New Component: `Services.tsx`
- Build a pricing grid with 4 tiers:
  - **Portfolio Website:** $200 (Starting) / £160
  - **Advanced Animations:** +$300 / £240
  - **Blog Section:** +$400 / £320
  - **Custom Scaffolding (React/Firebase):** $120 / £100
- Add "Key Inclusions" (Bullet points with gold icons).
- Add "Contact Me" buttons linking to `/contact?service=[name]`.

### 2. Update Routing (`App.tsx`)
- Add `const Services = lazy(() => import("./pages/Services"));`
- Add route `<Route path="/services" element={<Services />} />`

### 3. Update Global Navigation (`Header.tsx`)
- Add "Services" to `navItems` after "Projects".
- Add "Services" to `mobileNavItems`.

### 4. Visual Polish
- Verify "Jakir." brand consistency.
- Ensure 2025 "WOW" aesthetics (GPU-accelerated animations).

## 🧭 Questions for User
- Should the **$ vs £** be a toggle switch at the top, or show both prices side-by-side on each card?
- Do you have a specific icon set preference (Lucide is current)?
