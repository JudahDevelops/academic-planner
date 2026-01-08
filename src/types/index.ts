// Subject (formerly Course) - Universal organizing unit
export interface Subject {
  id: string;
  userId: string; // Clerk user ID for security
  name: string;
  color: string;
}

// Legacy type alias for backward compatibility during refactor
export type Course = Subject;

export interface Assignment {
  id: string;
  userId: string; // Clerk user ID for security
  title: string;
  subjectId: string; // renamed from courseId
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed';
  weight: number; // percentage weight in final grade
  description: string;
  estimatedHours?: number;
}

// Note/Document uploaded by user
export interface Note {
  id: string;
  userId: string; // Clerk user ID for security
  subjectId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'txt' | 'docx' | 'md' | 'image';
  content: string; // extracted text content
  uploadDate: string;
  fileSize: number; // in bytes
  fileUrl?: string; // Supabase Storage public URL
  processingStatus?: 'uploading' | 'processing' | 'completed' | 'error';
  processingError?: string;
}

// Multiple choice question
export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string]; // exactly 4 options
  correctAnswer: 0 | 1 | 2 | 3; // index of correct option
  explanation?: string; // AI-generated explanation
  userAnswer?: number; // user's selected answer (for quiz results)
}

// Quiz generated from notes
export interface Quiz {
  id: string;
  userId: string; // Clerk user ID for security
  subjectId: string;
  noteIds: string[]; // which notes were used to generate
  title: string;
  questions: Question[];
  createdAt: string;
  settings: {
    questionCount: number; // 10-50
    timeLimit?: number; // in minutes (optional timer)
    showInstantFeedback?: boolean; // show if answer is correct immediately
  };
  completedAt?: string;
  score?: number; // percentage (0-100)
  timeTaken?: number; // time taken in seconds
}

// Chat message for NotebookLM-style interface
export interface ChatMessage {
  id: string;
  userId: string; // Clerk user ID for security
  subjectId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Timetable entry for class schedule
export interface TimetableEntry {
  id: string;
  userId: string; // Clerk user ID for security
  subjectId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // HH:MM format (24-hour)
  endTime: string; // HH:MM format (24-hour)
  location?: string; // classroom, building, room number
  notes?: string; // additional notes (e.g., "Lab session", "Lecture")
}

export type ViewMode = 'assignments' | 'study-hub' | 'timetable' | 'analytics';

// Gamification types for UI
export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  completedAssignments: number;
  quizzesTaken: number;
  studyTimeMinutes: number;
  lastActiveDate: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number; // 0-100 for partially unlocked achievements
}
