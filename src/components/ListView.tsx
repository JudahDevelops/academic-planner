import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AssignmentCard } from './AssignmentCard';
import { AssignmentForm } from './AssignmentForm';
import { Assignment } from '../types';

export function ListView() {
  const { assignments } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'course'>('dueDate');

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAssignment(undefined);
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'active') return a.status !== 'completed';
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.subjectId.localeCompare(b.subjectId);
  });

  const activeCount = assignments.filter(a => a.status !== 'completed').length;
  const completedCount = assignments.filter(a => a.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
          <p className="text-sm text-gray-600 mt-1">
            {activeCount} active • {completedCount} completed
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          New Assignment
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({assignments.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="course">Sort by Course</option>
        </select>
      </div>

      {sortedAssignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-2">No assignments found</p>
          <p className="text-gray-500 text-sm">
            {filter === 'all'
              ? 'Create your first assignment to get started!'
              : `No ${filter} assignments.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {showForm && (
        <AssignmentForm
          onClose={handleCloseForm}
          editingAssignment={editingAssignment}
        />
      )}
    </div>
  );
}
