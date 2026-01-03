import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Assignment } from '../types';

export function CalendarView() {
  const { assignments, courses } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getAssignmentsForDate = (day: number): Assignment[] => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate.toDateString() === dateStr;
    });
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayAssignments = getAssignmentsForDate(day);
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

    days.push(
      <div
        key={day}
        className={`h-32 border border-gray-200 p-2 ${
          isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
        }`}
      >
        <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
          {day}
          {isToday && <span className="ml-1 text-xs">(Today)</span>}
        </div>
        <div className="space-y-1 overflow-y-auto max-h-20">
          {dayAssignments.map(assignment => {
            const course = courses.find(c => c.id === assignment.courseId);
            return (
              <div
                key={assignment.id}
                className="text-xs p-1 rounded truncate"
                style={{ backgroundColor: course?.color + '20', borderLeft: `3px solid ${course?.color}` }}
                title={assignment.title}
              >
                {assignment.title}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            ← Previous
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center font-semibold text-gray-700 text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    </div>
  );
}
