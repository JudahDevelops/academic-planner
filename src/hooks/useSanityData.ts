import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { sanityClient } from '../lib/sanity';
import type { Subject, Assignment, Note, Quiz, ChatMessage, TimetableEntry } from '../types';

// Helper to convert Sanity references to IDs
function resolveReferences(doc: any): any {
  if (!doc) return doc;

  const resolved = { ...doc };

  // Convert _id to id
  if (resolved._id) {
    resolved.id = resolved._id;
    delete resolved._id;
  }

  // Convert subject reference to subjectId
  if (resolved.subjectId?._ref) {
    resolved.subjectId = resolved.subjectId._ref;
  }

  // Convert note references to noteIds array
  if (resolved.noteIds && Array.isArray(resolved.noteIds)) {
    resolved.noteIds = resolved.noteIds.map((ref: any) => ref._ref || ref);
  }

  // Remove Sanity metadata
  delete resolved._type;
  delete resolved._createdAt;
  delete resolved._updatedAt;
  delete resolved._rev;
  delete resolved.userId;

  return resolved;
}

// Helper to convert plain IDs to Sanity references (opposite of resolveReferences)
function convertToReferences(doc: any): any {
  if (!doc) return doc;

  const converted = { ...doc };

  // Convert subjectId string to reference
  if (converted.subjectId && typeof converted.subjectId === 'string') {
    converted.subjectId = {
      _type: 'reference',
      _ref: converted.subjectId,
    };
  }

  // Convert noteIds array of strings to references
  if (converted.noteIds && Array.isArray(converted.noteIds)) {
    converted.noteIds = converted.noteIds.map((id: any) => {
      if (typeof id === 'string') {
        return {
          _type: 'reference',
          _ref: id,
        };
      }
      return id; // Already a reference object
    });
  }

  return converted;
}

// Hook for fetching and managing data
export function useSanityData<T>(docType: string) {
  const { user } = useUser();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Chat messages should be ordered oldest first (ascending)
      // Everything else should be newest first (descending)
      const orderDirection = docType === 'chatMessage' ? 'asc' : 'desc';
      const query = `*[_type == $docType && userId == $userId] | order(_createdAt ${orderDirection})`;
      const params = { docType, userId: user.id };

      let results = await sanityClient.fetch(query, params);

      // Resolve references for assignments that reference subjects
      if (docType === 'assignment') {
        results = await Promise.all(
          results.map(async (doc: any) => {
            if (doc.subjectId && doc.subjectId._ref) {
              return resolveReferences(doc);
            }
            return resolveReferences(doc);
          })
        );
      } else {
        results = results.map(resolveReferences);
      }

      setData(results);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${docType}:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, docType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addDocument = useCallback(async (doc: Omit<T, 'id'>) => {
    if (!user) return;

    try {
      // Convert plain string IDs to Sanity references
      const docWithReferences = convertToReferences(doc);

      const newDoc = await sanityClient.create({
        _type: docType,
        userId: user.id,
        ...docWithReferences,
      });

      await fetchData(); // Refresh data
      return resolveReferences(newDoc);
    } catch (err) {
      console.error(`Error adding ${docType}:`, err);
      throw err;
    }
  }, [user, docType, fetchData]);

  const updateDocument = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      // Convert plain string IDs to Sanity references
      const updatesWithReferences = convertToReferences(updates);

      await sanityClient.patch(id).set(updatesWithReferences).commit();
      await fetchData(); // Refresh data
    } catch (err) {
      console.error(`Error updating ${docType}:`, err);
      throw err;
    }
  }, [docType, fetchData]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      await sanityClient.delete(id);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error(`Error deleting ${docType}:`, err);
      throw err;
    }
  }, [docType, fetchData]);

  return {
    data,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    refresh: fetchData,
  };
}

// Specific hooks for each data type
export function useSubjects() {
  return useSanityData<Subject>('subject');
}

export function useAssignments() {
  return useSanityData<Assignment>('assignment');
}

export function useNotes() {
  return useSanityData<Note>('note');
}

export function useQuizzes() {
  return useSanityData<Quiz>('quiz');
}

export function useChatMessages() {
  return useSanityData<ChatMessage>('chatMessage');
}

export function useTimetableEntries() {
  return useSanityData<TimetableEntry>('timetableEntry');
}
