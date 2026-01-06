import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Trophy, Star, Zap, Award } from 'lucide-react';

interface CelebrationProps {
  show: boolean;
  message: string;
  type?: 'completion' | 'streak' | 'level-up' | 'achievement';
  xpGained?: number;
  onComplete?: () => void;
}

export function Celebration({ show, message, type = 'completion', xpGained, onComplete }: CelebrationProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; rotation: number; delay: number }[]>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -100 - 50,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.3,
      }));
      setConfetti(particles);

      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'streak':
        return <Star className="w-12 h-12 text-yellow-500" />;
      case 'level-up':
        return <Zap className="w-12 h-12 text-purple-500" />;
      case 'achievement':
        return <Award className="w-12 h-12 text-blue-500" />;
      default:
        return <Trophy className="w-12 h-12 text-green-500" />;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onComplete}
        >
          {/* Confetti */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                background: `hsl(${Math.random() * 360}, 70%, 60%)`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: particle.x * 4,
                y: particle.y * 4,
                opacity: 0,
                rotate: particle.rotation,
              }}
              transition={{
                duration: 1.5,
                delay: particle.delay,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Main Card */}
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 text-center"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            {/* Icon */}
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {getIcon()}
            </motion.div>

            {/* Message */}
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.h2>

            {/* XP Gained */}
            {xpGained && (
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-lg font-bold text-purple-600">
                  +{xpGained} XP
                </span>
              </motion.div>
            )}

            {/* Tap to continue */}
            <motion.p
              className="text-sm text-gray-500 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
