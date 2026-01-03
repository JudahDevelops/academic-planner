import { Assignment } from '../types';
import { useApp } from '../context/AppContext';

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: (assignment: Assignment) => void;
}

export function AssignmentCard({ assignment, onEdit }: AssignmentCardProps) {
  const { courses, updateAssignment, deleteAssignment } = useApp();
  const course = courses.find(c => c.id === assignment.courseId);

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{assignment.title}</h3>
          {course && (
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: course.color }}
              />
              <span className="text-sm text-gray-600">{course.name}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(assignment)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => deleteAssignment(assignment.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {assignment.description && (
        <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
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
        <div className={`text-sm font-medium ${
          isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-600'
        }`}>
          {isOverdue ? '⚠️ Overdue: ' : '📅 Due: '}{formatDueDate()}
        </div>

        <select
          value={assignment.status}
          onChange={(e) => updateAssignment(assignment.id, { status: e.target.value as any })}
          className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
