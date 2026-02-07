import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Disable console logs in production
if (import.meta.env.PROD) {
    console.log = () => { };
    console.error = () => { };
    console.warn = () => { };
    console.info = () => { };
}

createRoot(document.getElementById("root")!).render(<App />);
