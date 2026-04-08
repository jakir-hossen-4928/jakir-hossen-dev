import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import "./index.css";

// Disable console logs in production
if (import.meta.env.PROD) {
  console.log = () => { };
  console.error = () => { };
  console.warn = () => { };
  console.info = () => { };
}

export const createRoot = ViteReactSSG(
  { routes },
  () => { }
)
