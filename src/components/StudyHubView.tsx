import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotesSection } from './NotesSection';
import { QuizzesSection } from './QuizzesSection';
import { ChatSection } from './ChatSection';

type StudyHubTab = 'notes' | 'quizzes' | 'chat';

export function StudyHubView() {
  const { subjects } = useApp();
  const [currentTab, setCurrentTab] = useState<StudyHubTab>('notes');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

  const tabs: { id: StudyHubTab; label: string; icon: string }[] = [
    { id: 'notes', label: 'Notes & Documents', icon: '📁' },
    { id: 'quizzes', label: 'AI Quizzes', icon: '🎯' },
    { id: 'chat', label: 'Study Assistant', icon: '💬' },
  ];

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  const renderContent = () => {
    if (!selectedSubjectId || !selectedSubject) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-2">No subjects available</p>
          <p className="text-gray-500 text-sm">Create a subject to get started</p>
        </div>
      );
    }

    switch (currentTab) {
      case 'notes':
        return <NotesSection subjectId={selectedSubjectId} />;
      case 'quizzes':
        return <QuizzesSection subjectId={selectedSubjectId} />;
      case 'chat':
        return <ChatSection subjectId={selectedSubjectId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subject Selector & Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subject Selector */}
          <div className="py-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                  currentTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedSubject && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedSubject.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedSubject.color }}
              />
              <span className="text-sm text-gray-600">
                {tabs.find(t => t.id === currentTab)?.label}
              </span>
            </div>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}
