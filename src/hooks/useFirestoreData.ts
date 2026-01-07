import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FirestoreHook<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  addDocument: (data: Omit<T, 'id'>) => Promise<string>;
  updateDocument: (id: string, data: Partial<T>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  refresh: () => void;
}

function useFirestoreCollection<T>(collectionName: string): FirestoreHook<T> {
  const { user } = useUser();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create a query for documents belonging to this user
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where('userId', '==', user.id));

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => {
          const docData = doc.data();

          // Convert Firestore Timestamps to ISO strings
          const convertedData: any = { id: doc.id };
          for (const [key, value] of Object.entries(docData)) {
            if (value instanceof Timestamp) {
              convertedData[key] = value.toDate().toISOString();
            } else {
              convertedData[key] = value;
            }
          }

          return convertedData as T;
        });
        setData(documents);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user?.id, collectionName, refreshTrigger]);

  const addDocument = useCallback(
    async (docData: Omit<T, 'id'>): Promise<string> => {
      if (!user?.id) throw new Error('User not authenticated');

      const collectionRef = collection(db, collectionName);
      const dataToAdd = {
        ...docData,
        userId: user.id,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collectionRef, dataToAdd);
      return docRef.id;
    },
    [user?.id, collectionName]
  );

  const updateDocument = useCallback(
    async (id: string, docData: Partial<T>): Promise<void> => {
      if (!user?.id) throw new Error('User not authenticated');

      const docRef = doc(db, collectionName, id);
      const dataToUpdate = {
        ...docData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, dataToUpdate);
    },
    [user?.id, collectionName]
  );

  const deleteDocument = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) throw new Error('User not authenticated');

      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    },
    [user?.id, collectionName]
  );

  return {
    data,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    refresh,
  };
}

// Typed hooks for each collection
export const useSubjects = () => useFirestoreCollection<any>('subjects');
export const useAssignments = () => useFirestoreCollection<any>('assignments');
export const useNotes = () => useFirestoreCollection<any>('notes');
export const useQuizzes = () => useFirestoreCollection<any>('quizzes');
export const useChatMessages = () => useFirestoreCollection<any>('chatMessages');
export const useTimetableEntries = () => useFirestoreCollection<any>('timetableEntries');
