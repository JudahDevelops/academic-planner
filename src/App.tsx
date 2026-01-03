import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { TimelineView } from './components/TimelineView';
import { AnalyticsView } from './components/AnalyticsView';
import { ViewMode } from './types';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>('list');

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return <ListView />;
      case 'calendar':
        return <CalendarView />;
      case 'timeline':
        return <TimelineView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <ListView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main>{renderView()}</main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
