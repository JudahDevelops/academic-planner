import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { extractText, validateFileSize, getFileType } from '../utils/textExtraction';
import { storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useUser } from '@clerk/clerk-react';
import { FolderIcon, AssignmentsIcon } from './icons';
import { ConfirmDialog } from './ConfirmDialog';

interface NotesSectionProps {
  subjectId: string;
}

export function NotesSection({ subjectId }: NotesSectionProps) {
  const { user } = useUser();
  const { getSubjectNotes, addNote, deleteNote, updateNote } = useApp();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notes = getSubjectNotes(subjectId);

  const handleDeleteClick = (id: string, title: string) => {
    setNoteToDelete({ id, title });
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;

    setDeletingId(noteToDelete.id);
    setUploadError(null);
    try {
      await deleteNote(noteToDelete.id);
      setShowConfirm(false);
      setNoteToDelete(null);
    } catch (err) {
      console.error('Error deleting note:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!user?.id) {
      setUploadError('You must be signed in to upload files');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const fileArray = Array.from(files);

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setCurrentFileName(file.name);

        // Validate file size (5MB max)
        if (!validateFileSize(file, 5)) {
          throw new Error(`File "${file.name}" exceeds 5MB limit`);
        }

        // Step 1: Upload file to Firebase Storage (instant feedback!)
        setUploadStatus('Uploading file...');
        const timestamp = Date.now();
        const storageRef = ref(storage, `notes/${user.id}/${subjectId}/${timestamp}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Track upload progress
        await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.floor(progress));
              setUploadStatus(`Uploading... ${Math.floor(progress)}%`);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(new Error(`Upload failed: ${error.message}. Make sure Firebase Storage is enabled and rules are configured.`));
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        }).then(async (fileUrl) => {
          // Step 2: Save note immediately with "processing" status
          setUploadStatus('Saving note...');
          const noteId = await addNote({
            subjectId,
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            fileName: file.name,
            fileType: getFileType(file),
            content: 'Processing document... This may take a moment.',
            uploadDate: new Date().toISOString(),
            fileSize: file.size,
            fileUrl,
            processingStatus: 'processing',
          });

          // Step 3: Parse in background (user doesn't wait!)
          setUploadProgress(100);
          setUploadStatus('Uploaded! Processing in background...');

          // Background parsing (non-blocking)
          extractText(file).then(async (result) => {
            if (result.success && noteId) {
              await updateNote(noteId, {
                content: result.text || 'No text content found.',
                processingStatus: 'completed',
              });
            } else if (noteId) {
              await updateNote(noteId, {
                content: 'Failed to extract text from document.',
                processingStatus: 'error',
                processingError: result.error,
              });
            }
          }).catch(async (error) => {
            if (noteId) {
              await updateNote(noteId, {
                content: 'Failed to extract text from document.',
                processingStatus: 'error',
                processingError: error.message,
              });
            }
          });
        });
      }

      setUploadStatus('Complete!');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setUploadStatus('');
        setCurrentFileName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFileIcon = (fileType: string) => {
    const iconProps = { size: 22 };
    switch (fileType) {
      case 'pdf': return <FolderIcon {...iconProps} />;
      case 'docx': return <AssignmentsIcon {...iconProps} />;
      case 'image':
        return (
          <svg width={iconProps.size} height={iconProps.size} viewBox="0 0 24 24" fill="none" className="text-blue-600 dark:text-blue-400">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'md': return <AssignmentsIcon {...iconProps} />;
      default: return <FolderIcon {...iconProps} />;
    }
  };

  return (
    <div>
      {/* Upload Section */}
      <div className="mb-8">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className={`block w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            uploading
              ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
        >
          {uploading ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-2">
                <svg className="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <div>
                <p className="text-gray-900 dark:text-white font-medium mb-2">{currentFileName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{uploadStatus}</p>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-500 dark:bg-blue-400 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-center mb-2">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-gray-900 dark:text-white font-medium mb-1">Upload Notes & Documents</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                PDF, DOCX, TXT, MD, or Images (Max 5MB per file)
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Click or drag files here
              </p>
            </div>
          )}
        </label>

        {uploadError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 dark:text-red-300 text-sm">{uploadError}</p>
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No notes uploaded yet</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">Upload your first document to get started</p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Notes ({notes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0">{getFileIcon(note.fileType)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={note.title}>
                          {note.title}
                        </h4>
                        {note.processingStatus === 'processing' && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{note.fileName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(note.id, note.title)}
                    disabled={deletingId === note.id}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium ml-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">{formatFileSize(note.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span className="font-medium">{formatDate(note.uploadDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content:</span>
                    <span className="font-medium">{note.content.length} chars</span>
                  </div>
                </div>

                {note.content && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                      {note.content.substring(0, 150)}...
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Note?"
        message={noteToDelete ? `Are you sure you want to delete "${noteToDelete.title}"? This action cannot be undone.` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirm(false);
          setNoteToDelete(null);
        }}
        isLoading={deletingId !== null}
      />
    </div>
  );
}
