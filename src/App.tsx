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
import { debugFirebaseAccess } from './utils/firebaseDebug';
import { signIntoFirebaseWithClerk } from './lib/firebase';
import { migrateUserIds } from './utils/migrateUserIds';

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

      {/* Temporary Debug & Migration Buttons */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={async () => {
            console.log('Running Firebase debug check...');
            const result = await debugFirebaseAccess();
            if (result.success) {
              alert(`✅ Firebase Connected!\n\nSubjects: ${result.subjects}\nTimetable: ${result.timetable}\nAssignments: ${result.assignments}\n\nCheck browser console for details.`);
            } else {
              alert(`❌ Firebase Error!\n\n${result.error}\n\nError code: ${result.code}\n\nCheck browser console for details.`);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm"
        >
          Debug Firebase
        </button>
        <button
          onClick={async () => {
            if (!user?.id) {
              alert('❌ You must be signed in to run migration');
              return;
            }
            const confirmed = confirm('This will add your userId to all existing documents. Run this once. Continue?');
            if (!confirmed) return;

            console.log('🔄 Starting migration...');
            const result = await migrateUserIds(user.id);
            alert(`✅ Migration Complete!\n\nUpdated: ${result.totalUpdated} documents\nSkipped: ${result.totalSkipped} documents\n\nRefresh the page to see your data.`);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm"
        >
          Migrate Data
        </button>
      </div>

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
