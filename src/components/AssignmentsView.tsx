import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';
import { TimelineView } from './TimelineView';
import { AssignmentsIcon, CalendarIcon } from './icons';

type AssignmentViewMode = 'list' | 'calendar' | 'timeline';

export function AssignmentsView() {
  const [viewMode, setViewMode] = useState<AssignmentViewMode>('list');

  const views: { id: AssignmentViewMode; label: string; Icon: React.ComponentType<{ size?: number }>; description: string }[] = [
    { id: 'list', label: 'List', Icon: AssignmentsIcon, description: 'Sortable table with filters and status updates' },
    { id: 'calendar', label: 'Calendar', Icon: CalendarIcon, description: 'Monthly grid showing due dates at a glance' },
    { id: 'timeline', label: 'Timeline', Icon: CalendarIcon, description: 'Chronological view grouped by week' },
  ];

  const renderView = () => {
    switch (viewMode) {
      case 'list':
        return <ListView />;
      case 'calendar':
        return <CalendarView />;
      case 'timeline':
        return <TimelineView />;
      default:
        return <ListView />;
    }
  };

  return (
    <div>
      {/* Sub-navigation for assignment views */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3">
            {views.map((view) => (
              <div key={view.id} className="relative group">
                <motion.button
                  onClick={() => setViewMode(view.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                    viewMode === view.id
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  title={view.description}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <view.Icon size={18} />
                  {view.label}
                </motion.button>

                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 hidden sm:block">
                  {view.description}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Render the selected view with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
