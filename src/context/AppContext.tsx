import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { Assignment, Subject, Note, Quiz, ChatMessage, TimetableEntry } from '../types';
import {
  useSubjects,
  useAssignments,
  useNotes,
  useQuizzes,
  useChatMessages,
  useTimetableEntries,
} from '../hooks/useFirestoreData';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AppContextType {
  loading: boolean;

  // Subjects
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Assignments
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id'>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getSubjectNotes: (subjectId: string) => Note[];

  // Quizzes
  quizzes: Quiz[];
  addQuiz: (quiz: Omit<Quiz, 'id'>) => Promise<void>;
  updateQuiz: (id: string, quiz: Partial<Quiz>) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  getSubjectQuizzes: (subjectId: string) => Quiz[];

  // Chat Messages
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => Promise<void>;
  getSubjectMessages: (subjectId: string) => ChatMessage[];
  clearSubjectChat: (subjectId: string) => Promise<void>;

  // Timetable
  timetableEntries: TimetableEntry[];
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => Promise<void>;
  updateTimetableEntry: (id: string, entry: Partial<TimetableEntry>) => Promise<void>;
  deleteTimetableEntry: (id: string) => Promise<void>;
  getTimetableByDay: (dayOfWeek: number) => TimetableEntry[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Use Sanity hooks for data
  const subjectsHook = useSubjects();
  const assignmentsHook = useAssignments();
  const notesHook = useNotes();
  const quizzesHook = useQuizzes();
  const chatMessagesHook = useChatMessages();
  const timetableEntriesHook = useTimetableEntries();

  // Subject functions
  const addSubject = useCallback(async (subject: Omit<Subject, 'id'>) => {
    await subjectsHook.addDocument(subject);
  }, [subjectsHook]);

  const deleteSubject = useCallback(async (id: string) => {
    // Cascade delete related documents
    const relatedAssignments = assignmentsHook.data.filter(a => a.subjectId === id);
    const relatedNotes = notesHook.data.filter(n => n.subjectId === id);
    const relatedQuizzes = quizzesHook.data.filter(q => q.subjectId === id);
    const relatedMessages = chatMessagesHook.data.filter(m => m.subjectId === id);
    const relatedTimetable = timetableEntriesHook.data.filter(e => e.subjectId === id);

    // Delete related documents first, then the subject
    // With Firebase, we can delete in any order (no reference integrity issues)
    await Promise.all([
      ...relatedAssignments.map(a => deleteDoc(doc(db, 'assignments', a.id))),
      ...relatedNotes.map(n => deleteDoc(doc(db, 'notes', n.id))),
      ...relatedQuizzes.map(q => deleteDoc(doc(db, 'quizzes', q.id))),
      ...relatedMessages.map(m => deleteDoc(doc(db, 'chatMessages', m.id))),
      ...relatedTimetable.map(e => deleteDoc(doc(db, 'timetableEntries', e.id))),
    ]);

    // Delete the subject
    await subjectsHook.deleteDocument(id);
  }, [subjectsHook, assignmentsHook, notesHook, quizzesHook, chatMessagesHook, timetableEntriesHook]);

  // Assignment functions
  const addAssignment = useCallback(async (assignment: Omit<Assignment, 'id'>) => {
    await assignmentsHook.addDocument(assignment);
  }, [assignmentsHook]);

  const updateAssignment = useCallback(async (id: string, updates: Partial<Assignment>) => {
    await assignmentsHook.updateDocument(id, updates);
  }, [assignmentsHook]);

  const deleteAssignment = useCallback(async (id: string) => {
    await assignmentsHook.deleteDocument(id);
  }, [assignmentsHook]);

  // Note functions
  const addNote = useCallback(async (note: Omit<Note, 'id'>) => {
    await notesHook.addDocument(note);
  }, [notesHook]);

  const deleteNote = useCallback(async (id: string) => {
    // Update quizzes that reference this note
    const quizzesWithNote = quizzesHook.data.filter(q => q.noteIds.includes(id));
    await Promise.all(
      quizzesWithNote.map(quiz =>
        quizzesHook.updateDocument(quiz.id, {
          noteIds: quiz.noteIds.filter((nId: string) => nId !== id),
        })
      )
    );
    await notesHook.deleteDocument(id);
  }, [notesHook, quizzesHook]);

  const getSubjectNotes = useCallback((subjectId: string) => {
    return notesHook.data.filter(n => n.subjectId === subjectId);
  }, [notesHook.data]);

  // Quiz functions
  const addQuiz = useCallback(async (quiz: Omit<Quiz, 'id'>) => {
    await quizzesHook.addDocument(quiz);
  }, [quizzesHook]);

  const updateQuiz = useCallback(async (id: string, updates: Partial<Quiz>) => {
    await quizzesHook.updateDocument(id, updates);
  }, [quizzesHook]);

  const deleteQuiz = useCallback(async (id: string) => {
    await quizzesHook.deleteDocument(id);
  }, [quizzesHook]);

  const getSubjectQuizzes = useCallback((subjectId: string) => {
    return quizzesHook.data.filter(q => q.subjectId === subjectId);
  }, [quizzesHook.data]);

  // Chat message functions
  const addChatMessage = useCallback(async (message: Omit<ChatMessage, 'id'>) => {
    await chatMessagesHook.addDocument(message);
  }, [chatMessagesHook]);

  const getSubjectMessages = useCallback((subjectId: string) => {
    return chatMessagesHook.data.filter(m => m.subjectId === subjectId);
  }, [chatMessagesHook.data]);

  const clearSubjectChat = useCallback(async (subjectId: string) => {
    const messages = chatMessagesHook.data.filter(m => m.subjectId === subjectId);
    await Promise.all(messages.map(m => deleteDoc(doc(db, 'chatMessages', m.id))));
  }, [chatMessagesHook]);

  // Timetable functions
  const addTimetableEntry = useCallback(async (entry: Omit<TimetableEntry, 'id'>) => {
    await timetableEntriesHook.addDocument(entry);
  }, [timetableEntriesHook]);

  const updateTimetableEntry = useCallback(async (id: string, updates: Partial<TimetableEntry>) => {
    await timetableEntriesHook.updateDocument(id, updates);
  }, [timetableEntriesHook]);

  const deleteTimetableEntry = useCallback(async (id: string) => {
    await timetableEntriesHook.deleteDocument(id);
  }, [timetableEntriesHook]);

  const getTimetableByDay = useCallback((dayOfWeek: number) => {
    return timetableEntriesHook.data
      .filter(e => e.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timetableEntriesHook.data]);

  const loading =
    subjectsHook.loading ||
    assignmentsHook.loading ||
    notesHook.loading ||
    quizzesHook.loading ||
    chatMessagesHook.loading ||
    timetableEntriesHook.loading;

  const contextValue = useMemo(
    () => ({
      loading,
      subjects: subjectsHook.data,
      addSubject,
      deleteSubject,
      assignments: assignmentsHook.data,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      notes: notesHook.data,
      addNote,
      deleteNote,
      getSubjectNotes,
      quizzes: quizzesHook.data,
      addQuiz,
      updateQuiz,
      deleteQuiz,
      getSubjectQuizzes,
      chatMessages: chatMessagesHook.data,
      addChatMessage,
      getSubjectMessages,
      clearSubjectChat,
      timetableEntries: timetableEntriesHook.data,
      addTimetableEntry,
      updateTimetableEntry,
      deleteTimetableEntry,
      getTimetableByDay,
    }),
    [
      loading,
      subjectsHook.data,
      addSubject,
      deleteSubject,
      assignmentsHook.data,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      notesHook.data,
      addNote,
      deleteNote,
      getSubjectNotes,
      quizzesHook.data,
      addQuiz,
      updateQuiz,
      deleteQuiz,
      getSubjectQuizzes,
      chatMessagesHook.data,
      addChatMessage,
      getSubjectMessages,
      clearSubjectChat,
      timetableEntriesHook.data,
      addTimetableEntry,
      updateTimetableEntry,
      deleteTimetableEntry,
      getTimetableByDay,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
