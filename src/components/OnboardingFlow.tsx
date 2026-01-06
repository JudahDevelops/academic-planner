import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { AssignmentsIcon, StudyIcon, AnalyticsIcon, CalendarIcon } from './icons';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const { user } = useUser();
  const { addSubject, addAssignment, subjects } = useApp();

  // Form state for subject creation
  const [subjectName, setSubjectName] = useState('');
  const [subjectColor, setSubjectColor] = useState('#3B82F6');

  // Form state for assignment creation
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentPriority, setAssignmentPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const colorOptions = [
    { color: '#3B82F6', name: 'Blue' },
    { color: '#10B981', name: 'Green' },
    { color: '#F59E0B', name: 'Orange' },
    { color: '#EF4444', name: 'Red' },
    { color: '#8B5CF6', name: 'Purple' },
    { color: '#EC4899', name: 'Pink' },
  ];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    addSubject({
      name: subjectName,
      color: subjectColor,
    });

    setStep(2);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle.trim() || !assignmentDueDate || subjects.length === 0) return;

    // Use the first subject (the one we just created)
    const firstSubject = subjects[0];

    addAssignment({
      title: assignmentTitle,
      subjectId: firstSubject.id,
      dueDate: assignmentDueDate,
      priority: assignmentPriority,
      status: 'not-started',
      weight: 0,
      description: '',
    });

    setStep(3);
  };

  const handleComplete = () => {
    markOnboardingComplete(user?.id);
    onComplete();
  };

  const handleSkip = () => {
    markOnboardingComplete(user?.id);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Welcome Screen */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center"
              >
                <div className="mb-6">
                  <motion.div
                    className="flex justify-center mb-6"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <Logo variant="full" size={70} />
                  </motion.div>
                  <motion.h1
                    className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Welcome to StudyFlow
                  </motion.h1>
                  <motion.p
                    className="text-lg text-gray-600 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Your all-in-one platform for managing assignments, studying smarter with AI, and staying organized.
                  </motion.p>
                </div>

                <div className="space-y-4 my-8">
                  {[
                    { Icon: AssignmentsIcon, title: 'Track Assignments', desc: 'Never miss a deadline with calendar and timeline views', bg: 'blue' },
                    { Icon: StudyIcon, title: 'AI Study Tools', desc: 'Generate quizzes and chat with your notes', bg: 'purple' },
                    { Icon: AnalyticsIcon, title: 'Performance Insights', desc: 'Visualize your progress and workload', bg: 'green' },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      className={`flex items-start gap-4 text-left p-4 bg-${feature.bg}-50 rounded-lg`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex-shrink-0">
                        <feature.Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.button
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </motion.button>
                  <button
                    onClick={handleSkip}
                    className="ml-4 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                  >
                    Skip tutorial
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Create First Subject */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-white rounded-2xl shadow-xl p-8 sm:p-12"
              >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">Step 1 of 2</span>
                  <button onClick={handleSkip} className="text-sm text-gray-500 hover:text-gray-700">
                    Skip
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your First Subject</h2>
                <p className="text-gray-600">
                  Subjects help organize your assignments, notes, and study materials. Add your first class.
                </p>
              </div>

              <form onSubmit={handleCreateSubject} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g., Software Engineering, Calculus, Biology..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a Color
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {colorOptions.map((option) => (
                      <button
                        key={option.color}
                        type="button"
                        onClick={() => setSubjectColor(option.color)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          subjectColor === option.color
                            ? 'border-gray-900 scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: option.color + '20' }}
                      >
                        <div
                          className="w-8 h-8 rounded-full mx-auto"
                          style={{ backgroundColor: option.color }}
                        />
                        <p className="text-xs text-gray-600 mt-2">{option.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={!subjectName.trim()}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={!subjectName.trim() ? {} : { scale: 1.02 }}
                  whileTap={!subjectName.trim() ? {} : { scale: 0.98 }}
                >
                  Continue
                </motion.button>
              </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Create First Assignment */}
          <AnimatePresence mode="wait">
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-white rounded-2xl shadow-xl p-8 sm:p-12"
              >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">Step 2 of 2</span>
                  <button onClick={handleSkip} className="text-sm text-gray-500 hover:text-gray-700">
                    Skip
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Your First Assignment</h2>
                <p className="text-gray-600">
                  Track upcoming deadlines and never miss a submission. Add your first assignment.
                </p>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    placeholder="e.g., Project Proposal, Midterm Exam, Lab Report..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAssignmentPriority('low')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        assignmentPriority === 'low'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        <div className="w-6 h-6 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-sm font-medium">Low</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignmentPriority('medium')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        assignmentPriority === 'medium'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                      </div>
                      <div className="text-sm font-medium">Medium</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignmentPriority('high')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        assignmentPriority === 'high'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        <div className="w-6 h-6 rounded-full bg-red-500"></div>
                      </div>
                      <div className="text-sm font-medium">High</div>
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={!assignmentTitle.trim() || !assignmentDueDate}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={(!assignmentTitle.trim() || !assignmentDueDate) ? {} : { scale: 1.02 }}
                  whileTap={(!assignmentTitle.trim() || !assignmentDueDate) ? {} : { scale: 0.98 }}
                >
                  Continue
                </motion.button>
              </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Success & Feature Overview */}
          <AnimatePresence mode="wait">
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center"
              >
                <div className="mb-6">
                  <motion.div
                    className="flex justify-center mb-6"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <div className="text-7xl">🎉</div>
                  </motion.div>
                  <motion.h2
                    className="text-3xl font-bold text-gray-900 mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    You're All Set!
                  </motion.h2>
                  <motion.p
                    className="text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Your academic planner is ready. Here's what you can do next:
                  </motion.p>
                </div>

              <div className="space-y-4 my-8 text-left">
                <div className="p-4 border-2 border-blue-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <AssignmentsIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Assignments View</h3>
                      <p className="text-sm text-gray-600">
                        View your assignments in List, Calendar, or Timeline format. Track progress and update status.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-2 border-purple-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <StudyIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Study Hub</h3>
                      <p className="text-sm text-gray-600">
                        Upload your notes to generate AI quizzes or chat with an AI tutor about your materials.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-2 border-green-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <CalendarIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Timetable</h3>
                      <p className="text-sm text-gray-600">
                        Create your weekly class schedule to see when you have lectures and free time for studying.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-2 border-orange-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <AnalyticsIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Analytics</h3>
                      <p className="text-sm text-gray-600">
                        Get insights into your completion rates, workload distribution, and identify busy weeks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleComplete}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Using StudyFlow
              </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Helper function to check if onboarding should be shown for a specific user
export function shouldShowOnboarding(userId: string | undefined): boolean {
  if (!userId) return false;
  const onboardingKey = `studyflow-onboarding-${userId}`;
  return !localStorage.getItem(onboardingKey);
}

// Helper function to mark onboarding as complete for a user
export function markOnboardingComplete(userId: string | undefined): void {
  if (!userId) return;
  const onboardingKey = `studyflow-onboarding-${userId}`;
  localStorage.setItem(onboardingKey, 'true');
}
