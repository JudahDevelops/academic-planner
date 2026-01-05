import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const views: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'assignments', label: 'Assignments', icon: '📋' },
    { id: 'study-hub', label: 'Study Hub', icon: '🎓' },
    { id: 'timetable', label: 'Timetable', icon: '📅' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Planner</h1>
            <p className="text-sm text-gray-500">Smart Assignment Tracking</p>
          </div>

          <nav className="flex gap-2">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === view.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{view.icon}</span>
                {view.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
