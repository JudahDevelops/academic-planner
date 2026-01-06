import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { AssignmentsView } from './components/AssignmentsView';
import { StudyHubView } from './components/StudyHubView';
import { TimetableView } from './components/TimetableView';
import { AnalyticsView } from './components/AnalyticsView';
import { OnboardingFlow, shouldShowOnboarding } from './components/OnboardingFlow';
import { AuthPage } from './components/AuthPage';
import { useSyncUser } from './hooks/useSyncUser';
import { ViewMode } from './types';

function AppContent() {
  const { user } = useUser();
  const [currentView, setCurrentView] = useState<ViewMode>('study-hub');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Sync Clerk user to Sanity on first login
  useSyncUser();

  // Check onboarding status when user loads
  useEffect(() => {
    if (user?.id) {
      setShowOnboarding(shouldShowOnboarding(user.id));
    }
  }, [user?.id]);

  // Listen for custom navigation events
  useEffect(() => {
    const handleNavigateToStudyHub = () => {
      setCurrentView('study-hub');
    };
    window.addEventListener('navigate-to-study-hub', handleNavigateToStudyHub);
    return () => window.removeEventListener('navigate-to-study-hub', handleNavigateToStudyHub);
  }, []);

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'assignments':
        return <AssignmentsView />;
      case 'study-hub':
        return <StudyHubView />;
      case 'timetable':
        return <TimetableView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <AssignmentsView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      {/* Add bottom padding on mobile/tablet for bottom navigation (h-16 = 64px) */}
      <main className="pb-16 lg:pb-0">{renderView()}</main>
    </div>
  );
}

function App() {
  return (
    <>
      <SignedOut>
        <AuthPage />
      </SignedOut>
      <SignedIn>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </SignedIn>
    </>
  );
}

export default App;
