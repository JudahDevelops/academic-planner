import { motion } from 'framer-motion';
import { Flame, Zap, Trophy } from 'lucide-react';
import { UserStats } from '../types';

interface GamificationBarProps {
  stats: UserStats;
}

export function GamificationBar({ stats }: GamificationBarProps) {
  const xpForNextLevel = stats.level * 100;
  const xpInCurrentLevel = stats.totalXP % xpForNextLevel;
  const xpProgress = (xpInCurrentLevel / xpForNextLevel) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-6">
        {/* Streak Counter */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 rounded-full">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-700">
              {stats.currentStreak}
            </span>
            <span className="text-xs text-orange-600">day streak</span>
          </div>
        </motion.div>

        {/* XP and Level */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-full">
                <Trophy className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-bold text-purple-700">
                  Level {stats.level}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                <span className="font-medium">{stats.totalXP} XP</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {xpInCurrentLevel}/{xpForNextLevel} XP
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {stats.completedAssignments}
          </div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {stats.quizzesTaken}
          </div>
          <div className="text-xs text-gray-500">Quizzes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {Math.round(stats.studyTimeMinutes / 60)}h
          </div>
          <div className="text-xs text-gray-500">Study Time</div>
        </div>
      </div>
    </div>
  );
}
