import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { TimetableEntry } from '../types';
import { CalendarIcon, StudyIcon } from './icons';
import { ConfirmDialog } from './ConfirmDialog';

export function TimetableView() {
  const { subjects, timetableEntries, deleteTimetableEntry } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const days = [
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
    { id: 0, name: 'Sunday', short: 'Sun' },
  ];

  // Generate time slots from 7 AM to 9 PM (14 hours)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getEntriesForDay = (dayOfWeek: number) => {
    return timetableEntries
      .filter(e => e.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getSubjectColor = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.color || '#6b7280';
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown';
  };

  const formatTime = (time: string) => {
    // Just return the hour number for 24-hour format display
    const [hours] = time.split(':');
    return parseInt(hours).toString();
  };

  const formatTimeWithMinutes = (time: string) => {
    // For entry times, show full 24-hour time
    return time;
  };

  const calculatePosition = (startTime: string, endTime: string, hourHeight: number) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = (startHour - 7) * 60 + startMin;
    const endMinutes = (endHour - 7) * 60 + endMin;
    const duration = endMinutes - startMinutes;

    const top = (startMinutes / 60) * hourHeight;
    const height = (duration / 60) * hourHeight;

    return { top, height };
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setEntryToDelete(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;

    setDeletingId(entryToDelete);
    try {
      await deleteTimetableEntry(entryToDelete);
      setShowConfirm(false);
      setEntryToDelete(null);
    } catch (err) {
      console.error('Error deleting timetable entry:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete timetable entry');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingEntry(null);
  };

  if (subjects.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-12 border-2 border-dashed border-blue-300 dark:border-blue-700 max-w-2xl mx-auto">
            <div className="flex justify-center mb-6 animate-bounce">
              <CalendarIcon size={64} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Create a Subject First!</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">You need subjects before creating your timetable</p>
            <p className="text-gray-500 dark:text-gray-500 mb-8 max-w-md mx-auto">
              Go to Study Hub to create your first subject, then come back here to schedule your classes.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigate-to-study-hub'));
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:scale-105"
            >
              <StudyIcon size={20} variant="white" />
              Go to Study Hub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Class Timetable</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Organize your weekly class schedule</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
        >
          + Add Class
        </button>
      </div>

      {/* Weekly Grid View */}
      <div className="bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header Row */}
            <div className="grid border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 [grid-template-columns:2rem_repeat(7,1fr)] sm:[grid-template-columns:3.5rem_repeat(7,1fr)]">
              <div className="p-1 sm:p-4"></div>
              {days.map((day) => (
                <div key={day.id} className="p-2 sm:p-4 text-center border-l border-gray-200 dark:border-gray-700">
                  <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{day.short}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{day.name}</div>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="grid [grid-template-columns:2rem_repeat(7,1fr)] sm:[grid-template-columns:3.5rem_repeat(7,1fr)]">
              {/* Time Labels Column */}
              <div className="border-r border-gray-200 dark:border-gray-700">
                {timeSlots.map((time, index) => (
                  <div
                    key={time}
                    className="py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 h-[60px] sm:h-[80px] flex items-center justify-center"
                  >
                    {formatTime(time)}
                  </div>
                ))}
              </div>

              {/* Day Columns - Mobile (60px) */}
              <div className="sm:hidden contents">
                {days.map((day) => {
                  const hourHeight = 60; // Mobile height

                  return (
                    <div key={day.id} className="border-l border-gray-200 dark:border-gray-700 relative">
                      {/* Time slot backgrounds */}
                      {timeSlots.map((time) => (
                        <div
                          key={time}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:bg-opacity-30 transition-colors h-[60px]"
                        />
                      ))}

                      {/* Class entries (absolutely positioned) */}
                      <div className="absolute inset-0 pointer-events-none">
                        {getEntriesForDay(day.id).map((entry) => {
                          const { top, height } = calculatePosition(entry.startTime, entry.endTime, hourHeight);
                          const color = getSubjectColor(entry.subjectId);

                          return (
                            <div
                              key={entry.id}
                              className="absolute left-0 right-0 rounded-none shadow-md overflow-hidden pointer-events-auto cursor-pointer hover:shadow-lg transition-all border border-white border-opacity-20"
                              style={{
                                top: `${top}px`,
                                height: `${Math.max(height, 40)}px`,
                                backgroundColor: color,
                              }}
                              onClick={() => handleEdit(entry)}
                            >
                              <div className="pr-1 pt-1 pb-1 h-full flex flex-col text-white">
                                <div className="font-semibold text-xs leading-tight mb-0.5">
                                  {getSubjectName(entry.subjectId)}
                                </div>
                                <div className="text-[10px] opacity-95 font-medium">
                                  {formatTimeWithMinutes(entry.startTime)} - {formatTimeWithMinutes(entry.endTime)}
                                </div>
                                {entry.location && height > 50 && (
                                  <div className="text-[10px] opacity-85 mt-0.5 truncate flex items-center gap-0.5">
                                    <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {entry.location}
                                  </div>
                                )}
                                {entry.notes && height > 70 && (
                                  <div className="text-[10px] opacity-75 mt-0.5 truncate">
                                    {entry.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day Columns - Desktop (80px) */}
              <div className="hidden sm:contents">
                {days.map((day) => {
                  const hourHeight = 80; // Desktop height

                  return (
                    <div key={day.id} className="border-l border-gray-200 dark:border-gray-700 relative">
                      {/* Time slot backgrounds */}
                      {timeSlots.map((time) => (
                        <div
                          key={time}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:bg-opacity-30 transition-colors h-[80px]"
                        />
                      ))}

                      {/* Class entries (absolutely positioned) */}
                      <div className="absolute inset-0 pointer-events-none">
                        {getEntriesForDay(day.id).map((entry) => {
                          const { top, height } = calculatePosition(entry.startTime, entry.endTime, hourHeight);
                          const color = getSubjectColor(entry.subjectId);

                          return (
                            <div
                              key={entry.id}
                              className="absolute left-2 right-2 rounded-lg shadow-md overflow-hidden pointer-events-auto cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all border border-white border-opacity-20"
                              style={{
                                top: `${top}px`,
                                height: `${Math.max(height, 40)}px`,
                                backgroundColor: color,
                              }}
                              onClick={() => handleEdit(entry)}
                            >
                              <div className="p-3 h-full flex flex-col text-white">
                                <div className="font-semibold text-sm leading-tight mb-1">
                                  {getSubjectName(entry.subjectId)}
                                </div>
                                <div className="text-xs opacity-95 font-medium">
                                  {formatTimeWithMinutes(entry.startTime)} - {formatTimeWithMinutes(entry.endTime)}
                                </div>
                                {entry.location && height > 50 && (
                                  <div className="text-xs opacity-85 mt-1.5 truncate flex items-center gap-1">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {entry.location}
                                  </div>
                                )}
                                {entry.notes && height > 70 && (
                                  <div className="text-xs opacity-75 mt-1 truncate">
                                    {entry.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List View (Mobile-friendly alternative) */}
      <div className="mt-8 lg:hidden px-4 sm:px-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule by Day</h2>
        <div className="space-y-4">
          {days.map((day) => {
            const dayEntries = getEntriesForDay(day.id);

            if (dayEntries.length === 0) return null;

            return (
              <div key={day.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{day.name}</h3>
                <div className="space-y-2">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-700"
                      style={{ borderLeftColor: getSubjectColor(entry.subjectId) }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {getSubjectName(entry.subjectId)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {formatTimeWithMinutes(entry.startTime)} - {formatTimeWithMinutes(entry.endTime)}
                          </div>
                          {entry.location && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {entry.location}
                            </div>
                          )}
                          {entry.notes && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {entry.notes}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteClick(entry.id)}
                          disabled={deletingId === entry.id}
                          className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <TimetableEntryModal
          entry={editingEntry}
          onClose={handleCloseModal}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Timetable Entry?"
        message="Are you sure you want to delete this class from your timetable? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirm(false);
          setEntryToDelete(null);
        }}
        isLoading={deletingId !== null}
      />
    </div>
  );
}

// Modal Component for Adding/Editing Timetable Entries
function TimetableEntryModal({
  entry,
  onClose,
}: {
  entry: TimetableEntry | null;
  onClose: () => void;
}) {
  const { subjects, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } = useApp();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: entry?.subjectId || subjects[0]?.id || '',
    dayOfWeek: entry?.dayOfWeek ?? 1,
    startTime: entry?.startTime || '09:00',
    endTime: entry?.endTime || '10:00',
    location: entry?.location || '',
    notes: entry?.notes || '',
  });

  const days = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subjectId) {
      showToast('Please select a subject', 'error');
      return;
    }

    // Validate times are within timetable range (7 AM to 9 PM)
    const startHour = parseInt(formData.startTime.split(':')[0]);
    const endHour = parseInt(formData.endTime.split(':')[0]);

    if (startHour < 7 || startHour > 21) {
      showToast('Start time must be between 7:00 AM and 9:00 PM', 'error');
      return;
    }

    if (endHour < 7 || endHour > 21) {
      showToast('End time must be between 7:00 AM and 9:00 PM', 'error');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      showToast('End time must be after start time', 'error');
      return;
    }

    const timetableData = {
      subjectId: formData.subjectId,
      dayOfWeek: formData.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location || undefined,
      notes: formData.notes || undefined,
    };

    try {
      if (entry) {
        await updateTimetableEntry(entry.id, timetableData);
        showToast('Timetable entry updated successfully', 'success');
      } else {
        await addTimetableEntry(timetableData);
        showToast('Timetable entry added successfully', 'success');
      }
      onClose();
    } catch (error) {
      console.error('Error saving timetable entry:', error);
      showToast(error instanceof Error ? error.message : 'Failed to save timetable entry', 'error');
    }
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!entry) return;

    setIsDeleting(true);
    try {
      await deleteTimetableEntry(entry.id);
      setShowConfirm(false);
      onClose();
    } catch (err) {
      console.error('Error deleting timetable entry:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete timetable entry');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {entry ? 'Edit Class' : 'Add Class'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Subject
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Day
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 | 6 })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                {days.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  min="07:00"
                  max="21:00"
                  className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  min="07:00"
                  max="21:00"
                  className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Location (optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Room 204"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Notes (optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g., Lab session"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              {entry ? (
                <>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="px-3 sm:px-4 py-2 text-sm border border-red-600 dark:border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Update
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Add Class
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Class?"
        message="Are you sure you want to delete this class from your timetable? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
