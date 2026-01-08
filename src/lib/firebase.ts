import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBIhbjvdqa-rGq2qh7osTkAAtHyNMo0V7o",
  authDomain: "studyflow-f0ef9.firebaseapp.com",
  projectId: "studyflow-f0ef9",
  storageBucket: "studyflow-f0ef9.firebasestorage.app",
  messagingSenderId: "53178789124",
  appId: "1:53178789124:web:0bc7e47cb43357932af451"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

/**
 * Sign in to Firebase using Clerk's custom token
 */
export async function signIntoFirebaseWithClerk(getToken: () => Promise<string | null>) {
  try {
    const token = await getToken({ template: 'integration_firebase' });
    if (!token) {
      throw new Error('No Firebase token from Clerk');
    }

    const userCredential = await signInWithCustomToken(auth, token);
    console.log('✅ Signed into Firebase with Clerk:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Firebase sign-in error:', error);
    throw error;
  }
}

// Uncomment this for local development with Firebase emulator
// if (import.meta.env.DEV) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }
