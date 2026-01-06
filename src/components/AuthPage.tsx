import { SignIn, SignUp } from '@clerk/clerk-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingPage } from './LandingPage';
import { Logo } from './Logo';

export function AuthPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  if (!showAuth) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          className="w-full flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          {/* Branding */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <Logo variant="full" size={60} />
          </motion.div>

          {/* Auth Component */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-center">
              {isSignUp ? (
                <SignUp
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'shadow-none',
                    },
                  }}
                  routing="hash"
                />
              ) : (
                <SignIn
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'shadow-none',
                    },
                  }}
                  routing="hash"
                />
              )}
            </div>

            {/* Toggle between sign in and sign up */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </motion.div>

          {/* Back to landing */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => setShowAuth(false)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to home
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
