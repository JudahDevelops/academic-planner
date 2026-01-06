import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotesSection } from './NotesSection';
import { QuizzesSection } from './QuizzesSection';
import { ChatSection } from './ChatSection';
import { SubjectManager } from './SubjectManager';
import { StudyIcon, SparklesIcon, IdeaIcon, TargetIcon, FolderIcon, ChatIcon, AssignmentsIcon } from './icons';

type StudyHubTab = 'notes' | 'quizzes' | 'chat';

interface ExpandedSubject {
  subjectId: string;
  tab: StudyHubTab;
}

export function StudyHubView() {
  const { subjects, getSubjectNotes } = useApp();
  const [expandedSubject, setExpandedSubject] = useState<ExpandedSubject | null>(null);
  const [showSubjectManager, setShowSubjectManager] = useState(false);

  const handleOpenSubject = (subjectId: string, tab: StudyHubTab) => {
    setExpandedSubject({ subjectId, tab });
  };

  const handleCloseExpanded = () => {
    setExpandedSubject(null);
  };

  // If a subject is expanded, show the full view
  if (expandedSubject) {
    const subject = subjects.find(s => s.id === expandedSubject.subjectId);
    const subjectNotes = getSubjectNotes(expandedSubject.subjectId);

    if (!subject) {
      setExpandedSubject(null);
      return null;
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCloseExpanded}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Back to subjects"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject.color }}
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{subject.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    {expandedSubject.tab === 'notes' && <><FolderIcon size={16} /> Notes & Documents</>}
                    {expandedSubject.tab === 'quizzes' && <><TargetIcon size={16} /> AI Quizzes</>}
                    {expandedSubject.tab === 'chat' && <><ChatIcon size={16} /> Study Assistant</>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {expandedSubject.tab === 'notes' && <NotesSection subjectId={expandedSubject.subjectId} />}
          {expandedSubject.tab === 'quizzes' && (
            subjectNotes.length > 0 ? (
              <QuizzesSection subjectId={expandedSubject.subjectId} />
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="flex justify-center mb-4">
                  <AssignmentsIcon size={48} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Notes Uploaded Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Upload notes first to generate AI quizzes</p>
                <button
                  onClick={() => setExpandedSubject({ ...expandedSubject, tab: 'notes' })}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Notes
                </button>
              </div>
            )
          )}
          {expandedSubject.tab === 'chat' && (
            subjectNotes.length > 0 ? (
              <ChatSection subjectId={expandedSubject.subjectId} />
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="flex justify-center mb-4">
                  <AssignmentsIcon size={48} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Notes Uploaded Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Upload notes first to chat with the AI study assistant</p>
                <button
                  onClick={() => setExpandedSubject({ ...expandedSubject, tab: 'notes' })}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Notes
                </button>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  // Subject card grid view (default)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        {subjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-12 border-2 border-dashed border-blue-300 dark:border-blue-700 max-w-2xl mx-auto">
              <div className="flex justify-center mb-6 animate-bounce">
                <StudyIcon size={56} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Create Your First Subject</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">Subjects are the foundation of StudyFlow!</p>
              <p className="text-gray-500 dark:text-gray-500 mb-8 max-w-md mx-auto">
                Create subjects to organize your notes, assignments, quizzes, and class schedule all in one place.
              </p>
              <button
                onClick={() => setShowSubjectManager(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:scale-105"
              >
                <SparklesIcon size={20} variant="white" />
                Create Your First Subject
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 flex items-center justify-center gap-1">
                <IdeaIcon size={16} />
                Examples: Mathematics, Biology, Computer Science
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subjects.map((subject) => {
              const notes = getSubjectNotes(subject.id);
              const hasNotes = notes.length > 0;

              return (
                <div
                  key={subject.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Subject Header */}
                  <div
                    className="p-6 border-b border-gray-100 dark:border-gray-700"
                    style={{ borderLeftWidth: '4px', borderLeftColor: subject.color }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: subject.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {notes.length} {notes.length === 1 ? 'note' : 'notes'} uploaded
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Cards */}
                  <div className="p-4 space-y-3">
                    {/* Notes */}
                    <button
                      onClick={() => handleOpenSubject(subject.id, 'notes')}
                      className="w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="group-hover:scale-110 transition-transform">
                          <FolderIcon size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">
                            Notes & Documents
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            Upload and manage study materials
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>

                    {/* Quizzes */}
                    <button
                      onClick={() => hasNotes && handleOpenSubject(subject.id, 'quizzes')}
                      disabled={!hasNotes}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all group ${
                        hasNotes
                          ? 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                          : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`${hasNotes && 'group-hover:scale-110'} transition-transform`}>
                          <TargetIcon size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${hasNotes ? 'text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400' : 'text-gray-500 dark:text-gray-500'}`}>
                              AI Quizzes
                            </h4>
                            {!hasNotes && (
                              <svg className="w-4 h-4 text-gray-500 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className={`text-sm mt-0.5 ${hasNotes ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                            {hasNotes ? 'Generate practice quizzes from notes' : 'Upload notes first to unlock'}
                          </p>
                        </div>
                        {hasNotes && (
                          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Chat */}
                    <button
                      onClick={() => hasNotes && handleOpenSubject(subject.id, 'chat')}
                      disabled={!hasNotes}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all group ${
                        hasNotes
                          ? 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`${hasNotes && 'group-hover:scale-110'} transition-transform`}>
                          <ChatIcon size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${hasNotes ? 'text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                              Study Assistant
                            </h4>
                            {!hasNotes && (
                              <svg className="w-4 h-4 text-gray-500 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className={`text-sm mt-0.5 ${hasNotes ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                            {hasNotes ? 'Chat with AI about your materials' : 'Upload notes first to unlock'}
                          </p>
                        </div>
                        {hasNotes && (
                          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Manage Subjects Button - only show when subjects exist */}
      {subjects.length > 0 && (
        <button
          onClick={() => setShowSubjectManager(true)}
          className="fixed bottom-20 lg:bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 z-20"
          aria-label="Manage Subjects"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {/* Subject Manager Modal */}
      {showSubjectManager && (
        <SubjectManager onClose={() => setShowSubjectManager(false)} />
      )}
    </div>
  );
}
