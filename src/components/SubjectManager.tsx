import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface SubjectManagerProps {
  onClose: () => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
];

export function SubjectManager({ onClose }: SubjectManagerProps) {
  const { subjects, addSubject, deleteSubject } = useApp();
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      await addSubject({
        name: newSubjectName.trim(),
        color: selectedColor,
      });

      setNewSubjectName('');
      setSelectedColor(PRESET_COLORS[0]);
    } catch (err) {
      console.error('Error adding subject:', err);
      setError(err instanceof Error ? err.message : 'Failed to add subject. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setSubjectToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;

    setDeletingId(subjectToDelete.id);
    setError(null);
    try {
      await deleteSubject(subjectToDelete.id);
      setSubjectToDelete(null);
      setConfirmationInput('');
    } catch (err) {
      console.error('Error deleting subject:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete subject. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const [confirmationInput, setConfirmationInput] = useState('');
  const isConfirmationValid = confirmationInput === subjectToDelete?.name;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Subjects</h2>
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Add New Subject */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add New Subject</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                  placeholder="e.g., Machine Learning"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        selectedColor === color
                          ? 'ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-gray-900 dark:ring-white scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleAddSubject}
                disabled={!newSubjectName.trim() || isAdding}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Adding...</span>
                  </>
                ) : (
                  'Add Subject'
                )}
              </button>
            </div>
          </div>

          {/* Existing Subjects */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Your Subjects ({subjects.length})
            </h3>

            {subjects.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No subjects yet. Add your first subject above!
              </p>
            ) : (
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-8 h-8 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{subject.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{subject.color}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteClick(subject.id, subject.name)}
                      disabled={deletingId === subject.id}
                      className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {deletingId === subject.id && (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {deletingId === subject.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {subjectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-2xl border-2 border-red-200 dark:border-red-800">
            <div className="p-6">
              {/* Warning Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Delete Subject?
              </h3>

              {/* Warning Text */}
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-4">
                You are about to permanently delete <span className="font-semibold text-gray-900 dark:text-white">"{subjectToDelete.name}"</span>
              </p>

              {/* What will be deleted */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    All assignments for this subject
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    All notes and uploaded documents
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    All generated quizzes
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    All chat history with AI assistant
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    All timetable entries for this subject
                  </li>
                </ul>
                <p className="text-sm font-bold text-red-800 dark:text-red-400 mt-3">
                  This action cannot be undone.
                </p>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <span className="font-bold text-gray-900 dark:text-white">"{subjectToDelete.name}"</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder="Type subject name here"
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSubjectToDelete(null);
                    setConfirmationInput('');
                  }}
                  disabled={deletingId !== null}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={!isConfirmationValid || deletingId !== null}
                  className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  {deletingId === subjectToDelete.id ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    'Delete Subject'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
