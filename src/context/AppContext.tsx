import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { Assignment, Subject, Note, Quiz, ChatSession, ChatMessage, TimetableEntry } from '../types';
import {
  useSubjects,
  useAssignments,
  useNotes,
  useQuizzes,
  useChatSessions,
  useChatMessages,
  useTimetableEntries,
} from '../hooks/useSanityData';
import { sanityClient } from '../lib/sanity';

interface AppContextType {
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

  // Chat Sessions
  chatSessions: ChatSession[];
  addChatSession: (session: Omit<ChatSession, 'id'>) => Promise<ChatSession | undefined>;
  updateChatSession: (id: string, session: Partial<ChatSession>) => Promise<void>;
  deleteChatSession: (id: string) => Promise<void>;
  getSubjectSessions: (subjectId: string) => ChatSession[];

  // Chat Messages
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => Promise<void>;
  getSessionMessages: (sessionId: string) => ChatMessage[];
  clearSessionChat: (sessionId: string) => Promise<void>;

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
  const chatSessionsHook = useChatSessions();
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

    await Promise.all([
      ...relatedAssignments.map(a => sanityClient.delete(a.id)),
      ...relatedNotes.map(n => sanityClient.delete(n.id)),
      ...relatedQuizzes.map(q => sanityClient.delete(q.id)),
      ...relatedMessages.map(m => sanityClient.delete(m.id)),
      ...relatedTimetable.map(e => sanityClient.delete(e.id)),
      subjectsHook.deleteDocument(id),
    ]);

    // Refresh all data
    await Promise.all([
      subjectsHook.refresh(),
      assignmentsHook.refresh(),
      notesHook.refresh(),
      quizzesHook.refresh(),
      chatMessagesHook.refresh(),
      timetableEntriesHook.refresh(),
    ]);
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
          noteIds: quiz.noteIds.filter(nId => nId !== id),
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

  // Chat session functions
  const addChatSession = useCallback(async (session: Omit<ChatSession, 'id'>) => {
    return await chatSessionsHook.addDocument(session);
  }, [chatSessionsHook]);

  const updateChatSession = useCallback(async (id: string, updates: Partial<ChatSession>) => {
    await chatSessionsHook.updateDocument(id, updates);
  }, [chatSessionsHook]);

  const deleteChatSession = useCallback(async (id: string) => {
    // Cascade delete all messages in this session
    const sessionMessages = chatMessagesHook.data.filter(m => m.sessionId === id);
    await Promise.all([
      ...sessionMessages.map(m => sanityClient.delete(m.id)),
      sanityClient.delete(id),
    ]);
    await chatSessionsHook.refresh();
    await chatMessagesHook.refresh();
  }, [chatSessionsHook, chatMessagesHook]);

  const getSubjectSessions = useCallback((subjectId: string) => {
    return chatSessionsHook.data
      .filter(s => s.subjectId === subjectId)
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [chatSessionsHook.data]);

  // Chat message functions
  const addChatMessage = useCallback(async (message: Omit<ChatMessage, 'id'>) => {
    await chatMessagesHook.addDocument(message);
    // Update session's lastMessageAt
    if (message.sessionId) {
      await chatSessionsHook.updateDocument(message.sessionId, {
        lastMessageAt: new Date().toISOString(),
      });
    }
  }, [chatMessagesHook, chatSessionsHook]);

  const getSessionMessages = useCallback((sessionId: string) => {
    return chatMessagesHook.data.filter(m => m.sessionId === sessionId);
  }, [chatMessagesHook.data]);

  const clearSessionChat = useCallback(async (sessionId: string) => {
    const messages = chatMessagesHook.data.filter(m => m.sessionId === sessionId);
    await Promise.all(messages.map(m => sanityClient.delete(m.id)));
    await chatMessagesHook.refresh();
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

  const contextValue = useMemo(
    () => ({
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
      chatSessions: chatSessionsHook.data,
      addChatSession,
      updateChatSession,
      deleteChatSession,
      getSubjectSessions,
      chatMessages: chatMessagesHook.data,
      addChatMessage,
      getSessionMessages,
      clearSessionChat,
      timetableEntries: timetableEntriesHook.data,
      addTimetableEntry,
      updateTimetableEntry,
      deleteTimetableEntry,
      getTimetableByDay,
    }),
    [
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
      chatSessionsHook.data,
      addChatSession,
      updateChatSession,
      deleteChatSession,
      getSubjectSessions,
      chatMessagesHook.data,
      addChatMessage,
      getSessionMessages,
      clearSessionChat,
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
