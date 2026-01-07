import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Uncomment this for local development with Firebase emulator
// if (import.meta.env.DEV) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }
