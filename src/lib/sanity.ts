import { createClient } from '@sanity/client';

// Sanity client configuration
export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2025-01-05',
  useCdn: false, // Set to false for write operations and real-time data
  token: import.meta.env.VITE_SANITY_TOKEN,
});

// Helper function to create document with user scope
export function createUserDocument(userId: string, docType: string, data: any) {
  return sanityClient.create({
    _type: docType,
    userId,
    ...data,
  });
}

// Helper function to query user documents
export function queryUserDocuments(userId: string, docType: string) {
  return sanityClient.fetch(
    `*[_type == $docType && userId == $userId] | order(_createdAt desc)`,
    { docType, userId }
  );
}

// Helper function to update document
export function updateDocument(documentId: string, updates: any) {
  return sanityClient.patch(documentId).set(updates).commit();
}

// Helper function to delete document
export function deleteDocument(documentId: string) {
  return sanityClient.delete(documentId);
}
