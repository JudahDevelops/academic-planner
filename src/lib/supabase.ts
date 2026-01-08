import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apbxgodmpjtehwirfipa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwYnhnb2RtcGp0ZWh3aXJmaXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDQ0NTcsImV4cCI6MjA4MzQyMDQ1N30.O70bqxElGgl4m_UMP_DVsPzUeBomO8i22zhY5QJy1sA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'notes';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  userId: string,
  subjectId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 20MB limit`);
    }

    // Create unique file path: userId/subjectId/timestamp_filename
    const timestamp = Date.now();
    const fileName = `${userId}/${subjectId}/${timestamp}_${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    onProgress?.(100);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(fileUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    // URL format: https://apbxgodmpjtehwirfipa.supabase.co/storage/v1/object/public/notes/userId/subjectId/timestamp_filename
    const urlParts = fileUrl.split('/notes/');
    if (urlParts.length < 2) {
      throw new Error('Invalid file URL');
    }
    const filePath = urlParts[1];

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('File delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}
