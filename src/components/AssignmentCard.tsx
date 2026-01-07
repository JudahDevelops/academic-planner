import { useState } from 'react';
import { Assignment } from '../types';
import { useApp } from '../context/AppContext';
import { CalendarIcon } from './icons';

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: (assignment: Assignment) => void;
}

export function AssignmentCard({ assignment, onEdit }: AssignmentCardProps) {
  const { subjects, updateAssignment, deleteAssignment } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);
  const course = subjects.find(c => c.id === assignment.subjectId);

  const handleDelete = async () => {
    if (window.confirm(`Delete "${assignment.title}"? This cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await deleteAssignment(assignment.id);
      } catch (err) {
        console.error('Error deleting assignment:', err);
        alert(err instanceof Error ? err.message : 'Failed to delete assignment');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    'not-started': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
  };

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isOverdue = hoursUntilDue < 0;
  const isDueSoon = hoursUntilDue < 24 && hoursUntilDue > 0;

  const formatDueDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = dueDate.toDateString() === today.toDateString();
    const isTomorrow = dueDate.toDateString() === tomorrow.toDateString();

    if (isToday) return `Today at ${dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (isTomorrow) return `Tomorrow at ${dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

    return dueDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{assignment.title}</h3>
          {course && (
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: course.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{course.name}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(assignment)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isDeleting && (
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {assignment.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{assignment.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[assignment.priority]}`}>
          {assignment.priority.toUpperCase()}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[assignment.status]}`}>
          {assignment.status.replace('-', ' ').toUpperCase()}
        </span>
        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
          {assignment.weight}% of grade
        </span>
        {assignment.estimatedHours && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
            ~{assignment.estimatedHours}h
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className={`text-sm font-medium flex items-center gap-1.5 ${
          isOverdue ? 'text-red-600 dark:text-red-400' : isDueSoon ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {isOverdue ? (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Overdue:
            </>
          ) : (
            <>
              <CalendarIcon size={16} />
              Due:
            </>
          )} {formatDueDate()}
        </div>

        <select
          value={assignment.status}
          onChange={(e) => updateAssignment(assignment.id, { status: e.target.value as any })}
          className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
