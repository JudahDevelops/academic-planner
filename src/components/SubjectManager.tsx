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

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;

    addSubject({
      name: newSubjectName.trim(),
      color: selectedColor,
    });

    setNewSubjectName('');
    setSelectedColor(PRESET_COLORS[0]);
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (confirm(`Delete "${name}" and all its assignments, notes, quizzes, and chat history?`)) {
      deleteSubject(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manage Subjects</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Add New Subject */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Add New Subject</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                  placeholder="e.g., Machine Learning"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        selectedColor === color
                          ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddSubject}
                disabled={!newSubjectName.trim()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Subject
              </button>
            </div>
          </div>

          {/* Existing Subjects */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Your Subjects ({subjects.length})
            </h3>

            {subjects.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No subjects yet. Add your first subject above!
              </p>
            ) : (
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-8 h-8 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{subject.name}</h4>
                        <p className="text-xs text-gray-500">{subject.color}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSubject(subject.id, subject.name)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
