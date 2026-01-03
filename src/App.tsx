import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { AssignmentsView } from './components/AssignmentsView';
import { StudyHubView } from './components/StudyHubView';
import { AnalyticsView } from './components/AnalyticsView';
import { ViewMode } from './types';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>('assignments');

  const renderView = () => {
    switch (currentView) {
      case 'assignments':
        return <AssignmentsView />;
      case 'study-hub':
        return <StudyHubView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <AssignmentsView />;
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
