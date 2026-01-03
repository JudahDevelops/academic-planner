import { useState } from 'react';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';
import { TimelineView } from './TimelineView';

type AssignmentViewMode = 'list' | 'calendar' | 'timeline';

export function AssignmentsView() {
  const [viewMode, setViewMode] = useState<AssignmentViewMode>('list');

  const views: { id: AssignmentViewMode; label: string; icon: string }[] = [
    { id: 'list', label: 'List', icon: '📋' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'timeline', label: 'Timeline', icon: '⏱️' },
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
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setViewMode(view.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  viewMode === view.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{view.icon}</span>
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Render the selected view */}
      {renderView()}
    </div>
  );
}
