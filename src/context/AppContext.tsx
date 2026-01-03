import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Assignment, Course } from '../types';

interface AppContextType {
  assignments: Assignment[];
  courses: Course[];
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  deleteCourse: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ASSIGNMENTS: 'academic-planner-assignments',
  COURSES: 'academic-planner-courses',
};

const DEFAULT_COURSES: Course[] = [
  { id: '1', name: 'Software Engineering', color: '#3b82f6' },
  { id: '2', name: 'Data Structures', color: '#10b981' },
  { id: '3', name: 'Web Development', color: '#f59e0b' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return stored ? JSON.parse(stored) : [];
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
    return stored ? JSON.parse(stored) : DEFAULT_COURSES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

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

  const addCourse = (course: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...course,
      id: Date.now().toString(),
    };
    setCourses([...courses, newCourse]);
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    // Also delete assignments for this course
    setAssignments(assignments.filter(a => a.courseId !== id));
  };

  return (
    <AppContext.Provider value={{
      assignments,
      courses,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      addCourse,
      deleteCourse,
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
