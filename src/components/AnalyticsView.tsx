import { useApp } from '../context/AppContext';

export function AnalyticsView() {
  const { assignments, subjects } = useApp();

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const inProgressAssignments = assignments.filter(a => a.status === 'in-progress').length;
  const notStartedAssignments = assignments.filter(a => a.status === 'not-started').length;

  const completionRate = totalAssignments > 0
    ? Math.round((completedAssignments / totalAssignments) * 100)
    : 0;

  const overdueAssignments = assignments.filter(a =>
    a.status !== 'completed' && new Date(a.dueDate) < new Date()
  ).length;

  const upcomingWeekAssignments = assignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return a.status !== 'completed' && dueDate >= now && dueDate <= weekFromNow;
  }).length;

  const assignmentsByCourse = subjects.map(course => ({
    course,
    total: assignments.filter(a => a.subjectId === course.id).length,
    completed: assignments.filter(a => a.subjectId === course.id && a.status === 'completed').length,
    active: assignments.filter(a => a.subjectId === course.id && a.status !== 'completed').length,
  })).filter(c => c.total > 0);

  const assignmentsByPriority = {
    high: assignments.filter(a => a.priority === 'high' && a.status !== 'completed').length,
    medium: assignments.filter(a => a.priority === 'medium' && a.status !== 'completed').length,
    low: assignments.filter(a => a.priority === 'low' && a.status !== 'completed').length,
  };

  const totalEstimatedHours = assignments
    .filter(a => a.status !== 'completed' && a.estimatedHours)
    .reduce((sum, a) => sum + (a.estimatedHours || 0), 0);

  const heaviestWeeks = (() => {
    const weekMap: { [key: string]: { count: number; weight: number } } = {};

    assignments.filter(a => a.status !== 'completed').forEach(assignment => {
      const dueDate = new Date(assignment.dueDate);
      const startOfWeek = new Date(dueDate);
      startOfWeek.setDate(dueDate.getDate() - dueDate.getDay());
      const weekKey = startOfWeek.toISOString().split('T')[0];

      if (!weekMap[weekKey]) {
        weekMap[weekKey] = { count: 0, weight: 0 };
      }
      weekMap[weekKey].count++;
      weekMap[weekKey].weight += assignment.weight;
    });

    return Object.entries(weekMap)
      .map(([week, data]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...data,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Insights</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-blue-600 mb-1">{totalAssignments}</div>
          <div className="text-sm text-gray-600">Total Assignments</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-green-600 mb-1">{completionRate}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-orange-600 mb-1">{upcomingWeekAssignments}</div>
          <div className="text-sm text-gray-600">Due This Week</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-red-600 mb-1">{overdueAssignments}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-semibold text-gray-900">{completedAssignments}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-semibold text-gray-900">{inProgressAssignments}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${totalAssignments > 0 ? (inProgressAssignments / totalAssignments) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Not Started</span>
                <span className="text-sm font-semibold text-gray-900">{notStartedAssignments}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${totalAssignments > 0 ? (notStartedAssignments / totalAssignments) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active by Priority</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-red-800">High Priority</span>
              <span className="text-2xl font-bold text-red-600">{assignmentsByPriority.high}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium text-yellow-800">Medium Priority</span>
              <span className="text-2xl font-bold text-yellow-600">{assignmentsByPriority.medium}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-800">Low Priority</span>
              <span className="text-2xl font-bold text-green-600">{assignmentsByPriority.low}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignments by Course</h3>
        {assignmentsByCourse.length > 0 ? (
          <div className="space-y-4">
            {assignmentsByCourse.map(({ course, total, completed, active }) => (
              <div key={course.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <span className="font-medium text-gray-900">{course.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {completed}/{total} completed • {active} active
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                      backgroundColor: course.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No assignments yet</p>
        )}
      </div>

      {/* Workload Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Heaviest Weeks</h3>
          {heaviestWeeks.length > 0 ? (
            <div className="space-y-3">
              {heaviestWeeks.map((week, index) => (
                <div key={week.week} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Week of {week.week}</div>
                    <div className="text-sm text-gray-600">{week.count} assignments</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{week.weight}%</div>
                    <div className="text-xs text-gray-500">total weight</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming assignments</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Estimate</h3>
          {totalEstimatedHours > 0 ? (
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {totalEstimatedHours}
              </div>
              <div className="text-gray-600">estimated hours remaining</div>
              <div className="mt-4 text-sm text-gray-500">
                Based on assignments with time estimates
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No time estimates provided</p>
              <p className="text-sm text-gray-400 mt-2">
                Add estimated hours to your assignments for better planning
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
