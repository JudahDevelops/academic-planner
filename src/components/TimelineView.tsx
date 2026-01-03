import { useApp } from '../context/AppContext';

export function TimelineView() {
  const { assignments, subjects } = useApp();

  const sortedAssignments = [...assignments]
    .filter(a => a.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const now = new Date();
  const upcoming = sortedAssignments.filter(a => new Date(a.dueDate) > now);
  const overdue = sortedAssignments.filter(a => new Date(a.dueDate) <= now);

  const groupByWeek = (assignments: typeof sortedAssignments) => {
    const groups: { [key: string]: typeof sortedAssignments } = {};

    assignments.forEach(assignment => {
      const dueDate = new Date(assignment.dueDate);
      const startOfWeek = new Date(dueDate);
      startOfWeek.setDate(dueDate.getDate() - dueDate.getDay());
      const weekKey = startOfWeek.toISOString().split('T')[0];

      if (!groups[weekKey]) groups[weekKey] = [];
      groups[weekKey].push(assignment);
    });

    return groups;
  };

  const upcomingByWeek = groupByWeek(upcoming);
  const overdueByWeek = groupByWeek(overdue);

  const formatWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderAssignmentGroup = (weekKey: string, assignments: typeof sortedAssignments, isOverdue: boolean) => (
    <div key={weekKey} className="mb-8">
      <h3 className={`text-lg font-semibold mb-4 ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
        {isOverdue ? '⚠️ ' : '📅 '}
        {formatWeekRange(weekKey)}
      </h3>
      <div className="space-y-3">
        {assignments.map(assignment => {
          const course = subjects.find(c => c.id === assignment.subjectId);
          return (
            <div
              key={assignment.id}
              className="flex items-start gap-4 pl-8 relative"
            >
              <div
                className="absolute left-0 top-2 w-4 h-4 rounded-full border-4 border-white shadow-sm"
                style={{ backgroundColor: course?.color }}
              />
              <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                    {course && (
                      <p className="text-sm text-gray-600 mt-1">{course.name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                      {formatDate(assignment.dueDate)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {assignment.weight}% • {assignment.priority}
                    </div>
                  </div>
                </div>
                {assignment.description && (
                  <p className="text-sm text-gray-600 mt-2">{assignment.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline</h2>

      {overdue.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold text-red-600 mb-4">Overdue</h3>
          {Object.entries(overdueByWeek).map(([weekKey, assignments]) =>
            renderAssignmentGroup(weekKey, assignments, true)
          )}
        </div>
      )}

      {upcoming.length > 0 ? (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming</h3>
          {Object.entries(upcomingByWeek).map(([weekKey, assignments]) =>
            renderAssignmentGroup(weekKey, assignments, false)
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No upcoming assignments</p>
          <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
        </div>
      )}
    </div>
  );
}
