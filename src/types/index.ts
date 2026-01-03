export interface Course {
  id: string;
  name: string;
  color: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed';
  weight: number; // percentage weight in final grade
  description: string;
  estimatedHours?: number;
}

export type ViewMode = 'list' | 'calendar' | 'timeline' | 'analytics';
