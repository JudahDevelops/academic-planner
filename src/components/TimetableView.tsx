import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TimetableEntry } from '../types';

export function TimetableView() {
  const { subjects, timetableEntries, deleteTimetableEntry } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

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
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculatePosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = (startHour - 7) * 60 + startMin;
    const endMinutes = (endHour - 7) * 60 + endMin;
    const duration = endMinutes - startMinutes;

    const top = (startMinutes / 60) * 80; // 80px per hour
    const height = (duration / 60) * 80;

    return { top, height };
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this timetable entry?')) {
      deleteTimetableEntry(id);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingEntry(null);
  };

  if (subjects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Subjects Available</h2>
          <p className="text-gray-600">Create subjects first to build your timetable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Timetable</h1>
          <p className="text-gray-600 mt-1">Organize your weekly class schedule</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
        >
          + Add Class
        </button>
      </div>

      {/* Weekly Grid View */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header Row */}
            <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
              <div className="p-4 text-sm font-medium text-gray-500">Time</div>
              {days.map((day) => (
                <div key={day.id} className="p-4 text-center border-l border-gray-200">
                  <div className="font-semibold text-gray-900">{day.short}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">{day.name}</div>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="grid grid-cols-8">
              {/* Time Labels Column */}
              <div className="border-r border-gray-200">
                {timeSlots.map((time, index) => (
                  <div
                    key={time}
                    className="h-20 px-3 py-2 text-xs text-gray-500 border-b border-gray-200"
                  >
                    {formatTime(time)}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {days.map((day) => (
                <div key={day.id} className="border-l border-gray-200 relative">
                  {/* Time slot backgrounds */}
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="h-20 border-b border-gray-100 hover:bg-gray-50"
                    />
                  ))}

                  {/* Class entries (absolutely positioned) */}
                  <div className="absolute inset-0 pointer-events-none">
                    {getEntriesForDay(day.id).map((entry) => {
                      const { top, height } = calculatePosition(entry.startTime, entry.endTime);
                      const color = getSubjectColor(entry.subjectId);

                      return (
                        <div
                          key={entry.id}
                          className="absolute left-1 right-1 rounded-md shadow-sm overflow-hidden pointer-events-auto cursor-pointer hover:shadow-md transition-shadow"
                          style={{
                            top: `${top}px`,
                            height: `${Math.max(height, 40)}px`,
                            backgroundColor: color,
                          }}
                          onClick={() => handleEdit(entry)}
                        >
                          <div className="p-2 h-full flex flex-col text-white">
                            <div className="font-semibold text-sm leading-tight">
                              {getSubjectName(entry.subjectId)}
                            </div>
                            <div className="text-xs opacity-90 mt-0.5">
                              {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                            </div>
                            {entry.location && (
                              <div className="text-xs opacity-75 mt-1 truncate">
                                📍 {entry.location}
                              </div>
                            )}
                            {entry.notes && height > 60 && (
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* List View (Mobile-friendly alternative) */}
      <div className="mt-8 lg:hidden">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule by Day</h2>
        <div className="space-y-4">
          {days.map((day) => {
            const dayEntries = getEntriesForDay(day.id);

            if (dayEntries.length === 0) return null;

            return (
              <div key={day.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{day.name}</h3>
                <div className="space-y-2">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg border-l-4 bg-gray-50"
                      style={{ borderLeftColor: getSubjectColor(entry.subjectId) }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {getSubjectName(entry.subjectId)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                          </div>
                          {entry.location && (
                            <div className="text-sm text-gray-500 mt-1">
                              📍 {entry.location}
                            </div>
                          )}
                          {entry.notes && (
                            <div className="text-sm text-gray-500 mt-1">
                              {entry.notes}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="ml-2 text-red-600 hover:text-red-800 text-sm"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subjectId) {
      alert('Please select a subject');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      alert('End time must be after start time');
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

    if (entry) {
      updateTimetableEntry(entry.id, timetableData);
    } else {
      addTimetableEntry(timetableData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (entry && confirm('Delete this class from your timetable?')) {
      deleteTimetableEntry(entry.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {entry ? 'Edit Class' : 'Add Class'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Room 204, Building A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g., Lab session, Bring laptop"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              {entry ? (
                <>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Update
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Add Class
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
