import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AssignmentsView } from './components/AssignmentsView';
import { StudyHubView } from './components/StudyHubView';
import { TimetableView } from './components/TimetableView';
import { AnalyticsView } from './components/AnalyticsView';
import { OnboardingFlow, shouldShowOnboarding } from './components/OnboardingFlow';
import { AuthPage } from './components/AuthPage';
import { ViewMode } from './types';

function AppContent() {
  const { user } = useUser();
  const { subjects, assignments, loading } = useApp();
  const [currentView, setCurrentView] = useState<ViewMode>('study-hub');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check onboarding status when user loads
  // Only show onboarding if user has never completed/skipped it
  // Once dismissed, never show again - even if they delete all subjects
  useEffect(() => {
    if (user?.id && !loading) {
      const hasCompletedOnboarding = !shouldShowOnboarding(user.id);

      // Only show onboarding for truly new users who haven't seen it before
      setShowOnboarding(!hasCompletedOnboarding);
    }
  }, [user?.id, loading]);

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
