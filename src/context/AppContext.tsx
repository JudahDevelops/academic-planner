import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Assignment, Subject, Note, Quiz, ChatMessage } from '../types';

interface AppContextType {
  // Subjects
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  deleteSubject: (id: string) => void;

  // Assignments
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id'>) => void;
  deleteNote: (id: string) => void;
  getSubjectNotes: (subjectId: string) => Note[];

  // Quizzes
  quizzes: Quiz[];
  addQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  updateQuiz: (id: string, quiz: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  getSubjectQuizzes: (subjectId: string) => Quiz[];

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => void;
  getSubjectChatHistory: (subjectId: string) => ChatMessage[];
  clearSubjectChat: (subjectId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SUBJECTS: 'academic-hub-subjects',
  ASSIGNMENTS: 'academic-hub-assignments',
  NOTES: 'academic-hub-notes',
  QUIZZES: 'academic-hub-quizzes',
  CHAT: 'academic-hub-chat',
};

const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Software Engineering', color: '#3b82f6' },
  { id: '2', name: 'Data Structures', color: '#10b981' },
  { id: '3', name: 'Web Development', color: '#f59e0b' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  // Subjects
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return stored ? JSON.parse(stored) : DEFAULT_SUBJECTS;
  });

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return stored ? JSON.parse(stored) : [];
  });

  // Notes
  const [notes, setNotes] = useState<Note[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
    return stored ? JSON.parse(stored) : [];
  });

  // Quizzes
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    return stored ? JSON.parse(stored) : [];
  });

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT);
    return stored ? JSON.parse(stored) : [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Subject functions
  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString(),
    };
    setSubjects([...subjects, newSubject]);
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    // Cascade delete
    setAssignments(assignments.filter(a => a.subjectId !== id));
    setNotes(notes.filter(n => n.subjectId !== id));
    setQuizzes(quizzes.filter(q => q.subjectId !== id));
    setChatMessages(chatMessages.filter(m => m.subjectId !== id));
  };

  // Assignment functions
  const addAssignment = (assignment: Omit<Assignment, 'id'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: Date.now().toString(),
    };
    setAssignments([...assignments, newAssignment]);
  };

  const updateAssignment = (id: string, updatedFields: Partial<Assignment>) => {
    setAssignments(assignments.map(a =>
      a.id === id ? { ...a, ...updatedFields } : a
    ));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  // Note functions
  const addNote = (note: Omit<Note, 'id'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
    };
    setNotes([...notes, newNote]);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    // Remove note references from quizzes
    setQuizzes(quizzes.map(q => ({
      ...q,
      noteIds: q.noteIds.filter(nId => nId !== id),
    })));
  };

  const getSubjectNotes = (subjectId: string) => {
    return notes.filter(n => n.subjectId === subjectId);
  };

  // Quiz functions
  const addQuiz = (quiz: Omit<Quiz, 'id'>) => {
    const newQuiz: Quiz = {
      ...quiz,
      id: Date.now().toString(),
    };
    setQuizzes([...quizzes, newQuiz]);
  };

  const updateQuiz = (id: string, updatedFields: Partial<Quiz>) => {
    setQuizzes(quizzes.map(q =>
      q.id === id ? { ...q, ...updatedFields } : q
    ));
  };

  const deleteQuiz = (id: string) => {
    setQuizzes(quizzes.filter(q => q.id !== id));
  };

  const getSubjectQuizzes = (subjectId: string) => {
    return quizzes.filter(q => q.subjectId === subjectId);
  };

  // Chat functions
  const addChatMessage = (message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  const getSubjectChatHistory = (subjectId: string) => {
    return chatMessages.filter(m => m.subjectId === subjectId);
  };

  const clearSubjectChat = (subjectId: string) => {
    setChatMessages(chatMessages.filter(m => m.subjectId !== subjectId));
  };

  return (
    <AppContext.Provider value={{
      subjects,
      addSubject,
      deleteSubject,
      assignments,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      notes,
      addNote,
      deleteNote,
      getSubjectNotes,
      quizzes,
      addQuiz,
      updateQuiz,
      deleteQuiz,
      getSubjectQuizzes,
      chatMessages,
      addChatMessage,
      getSubjectChatHistory,
      clearSubjectChat,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
