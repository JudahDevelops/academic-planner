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
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { ViewMode } from './types';
import { signIntoFirebaseWithClerk } from './lib/firebase';

function AppContent() {
  const { user, getToken } = useUser();
  const { subjects, assignments, loading } = useApp();
  const [currentView, setCurrentView] = useState<ViewMode>('study-hub');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [firebaseAuthLoading, setFirebaseAuthLoading] = useState(true);

  // Sign into Firebase with Clerk token
  useEffect(() => {
    if (!user?.id || !getToken) {
      setFirebaseAuthLoading(false);
      return;
    }

    signIntoFirebaseWithClerk(getToken)
      .then(() => {
        console.log('✅ Firebase authentication successful');
        setFirebaseAuthLoading(false);
      })
      .catch((error) => {
        console.error('❌ Firebase authentication failed:', error);
        setFirebaseAuthLoading(false);
      });
  }, [user?.id, getToken]);

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
          <PWAInstallPrompt />
        </AppProvider>
      </SignedIn>
    </>
  );
}

export default App;
