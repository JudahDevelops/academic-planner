// Subject (formerly Course) - Universal organizing unit
export interface Subject {
  id: string;
  name: string;
  color: string;
}

// Legacy type alias for backward compatibility during refactor
export type Course = Subject;

export interface Assignment {
  id: string;
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
  subjectId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'txt' | 'docx' | 'md' | 'image';
  content: string; // extracted text content
  uploadDate: string;
  fileSize: number; // in bytes
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
  subjectId: string;
  noteIds: string[]; // which notes were used to generate
  title: string;
  questions: Question[];
  createdAt: string;
  settings: {
    questionCount: number; // 10-50
  };
  completedAt?: string;
  score?: number; // percentage (0-100)
}

// Chat message for NotebookLM-style interface
export interface ChatMessage {
  id: string;
  subjectId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type ViewMode = 'assignments' | 'study-hub' | 'analytics';
