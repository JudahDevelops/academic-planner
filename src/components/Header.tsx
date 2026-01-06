import { motion } from 'framer-motion';
import { UserButton } from '@clerk/clerk-react';
import { ViewMode } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { StudyIcon, CalendarIcon, AssignmentsIcon, AnalyticsIcon } from './icons';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const views: { id: ViewMode; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'study-hub', label: 'Study Hub', icon: <StudyIcon size={20} />, description: 'AI-powered learning tools' },
    { id: 'timetable', label: 'Timetable', icon: <CalendarIcon size={20} />, description: 'Weekly class schedule' },
    { id: 'assignments', label: 'Assignments', icon: <AssignmentsIcon size={20} />, description: 'Track deadlines and progress' },
    { id: 'analytics', label: 'Overview', icon: <AnalyticsIcon size={20} />, description: 'Performance insights' },
  ];

  return (
    <>
      {/* Desktop-only header - hidden on mobile/tablet since we have bottom nav */}
      <header className="hidden lg:block bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex-shrink-0">
              <Logo variant="full" size={40} />
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-3">
              <nav className="flex gap-2">
                {views.map((view) => (
                  <motion.button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === view.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title={view.description}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mr-2">{view.icon}</span>
                    {view.label}
                  </motion.button>
                ))}
              </nav>
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet header */}
      <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Logo variant="icon" size={36} className="flex-shrink-0" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 lg:hidden z-30">
        <div className="grid grid-cols-4 h-16">
          {views.map((view) => (
            <motion.button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                currentView === view.id
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span
                className="text-xl"
                animate={currentView === view.id ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {view.icon}
              </motion.span>
              <span className="text-xs font-medium truncate w-full text-center px-1">
                {view.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
}
