import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AssignmentCard } from './AssignmentCard';
import { AssignmentForm } from './AssignmentForm';
import { Assignment } from '../types';
import { BooksIcon, StudyIcon } from './icons';

export function ListView() {
  const { assignments, subjects } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'course'>('dueDate');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'course', label: 'Course' },
  ];

  // Show prominent message if no subjects exist
  if (subjects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-12 border-2 border-dashed border-blue-300 dark:border-blue-700 max-w-2xl mx-auto">
            <div className="flex justify-center mb-6 animate-bounce">
              <BooksIcon size={64} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Create a Subject First!</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">You need subjects before creating assignments</p>
            <p className="text-gray-500 dark:text-gray-500 mb-8 max-w-md mx-auto">
              Go to Study Hub to create your first subject, then come back here to add assignments.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigate-to-study-hub'));
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:scale-105"
            >
              <StudyIcon size={20} variant="white" />
              Go to Study Hub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {activeCount} active • {completedCount} completed
          </p>
        </div>

        <motion.button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-xl">+</span>
          <span className="hidden sm:inline">New Assignment</span>
          <span className="sm:hidden">New</span>
        </motion.button>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <motion.button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            All ({assignments.length})
          </motion.button>
          <motion.button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              filter === 'active'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            Active ({activeCount})
          </motion.button>
          <motion.button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            Completed ({completedCount})
          </motion.button>
        </div>

        {/* Custom Sort Dropdown */}
        <div ref={dropdownRef} className="relative">
          <motion.button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <span>Sort: {sortOptions.find(o => o.value === sortBy)?.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* Dropdown Menu - Opens upward on mobile */}
          <AnimatePresence>
            {showSortDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full sm:bottom-auto sm:top-full left-0 right-0 mb-2 sm:mt-2 sm:mb-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value as any);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      sortBy === option.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {sortedAssignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">No assignments found</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
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
