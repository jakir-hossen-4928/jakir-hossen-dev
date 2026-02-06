// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
} as const;

// Prevent app from initializing with missing/invalid config in production
if (!firebaseConfig.apiKey) {   
    throw new Error('Missing Firebase configuration. Check your .env.local file.');
}

const app = initializeApp(firebaseConfig);

// Export services only when you actually use them (tree-shaking friendly)
export default app;

// ImageBB API Key
export const IMAGE_BB_API_KEY = import.meta.env.VITE_IMAGE_BB_API_KEY;

// Uncomment & export as needed:
export const auth = getAuth(app);
export const db = getFirestore(app);
// export const storage = getStorage(app);