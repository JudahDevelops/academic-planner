import { useApp } from '../context/AppContext';
import { CalendarIcon } from './icons';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics & Insights</h2>

      {/* Overview Cards - Visual Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Primary Alert: Overdue (Hero Card) */}
        <div className={`lg:col-span-2 rounded-xl shadow-lg p-8 ${
          overdueAssignments > 0
            ? 'bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 border-2 border-red-400 dark:border-red-500'
            : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-300 dark:border-gray-600'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {overdueAssignments > 0 ? (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-green-600 dark:text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <h3 className={`text-lg font-semibold ${
                  overdueAssignments > 0 ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {overdueAssignments > 0 ? 'Overdue Assignments' : 'No Overdue Work'}
                </h3>
              </div>
              <div className={`text-6xl font-black mb-3 ${
                overdueAssignments > 0 ? 'text-white' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {overdueAssignments}
              </div>
              <p className={`text-sm ${
                overdueAssignments > 0 ? 'text-red-100 dark:text-red-200' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {overdueAssignments > 0
                  ? `${overdueAssignments} ${overdueAssignments === 1 ? 'assignment needs' : 'assignments need'} immediate attention`
                  : 'Great job staying on track with deadlines!'}
              </p>
            </div>
            {overdueAssignments > 0 && (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 text-white font-semibold text-sm">
                URGENT
              </div>
            )}
          </div>
        </div>

        {/* Secondary Alert: Due This Week */}
        <div className={`rounded-xl shadow-md p-6 ${
          upcomingWeekAssignments > 0
            ? 'bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 border-2 border-orange-200 dark:border-orange-700'
            : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon size={28} />
            <h3 className={`font-semibold ${
              upcomingWeekAssignments > 0 ? 'text-orange-900 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
            }`}>
              Due This Week
            </h3>
          </div>
          <div className={`text-4xl font-bold mb-2 ${
            upcomingWeekAssignments > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'
          }`}>
            {upcomingWeekAssignments}
          </div>
          <p className={`text-xs ${
            upcomingWeekAssignments > 0 ? 'text-orange-700 dark:text-orange-500' : 'text-gray-500 dark:text-gray-500'
          }`}>
            {upcomingWeekAssignments > 0
              ? 'Upcoming deadlines'
              : 'No deadlines this week'}
          </p>
        </div>
      </div>

      {/* Tertiary Stats: Informational Only */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalAssignments}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedAssignments}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressAssignments}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Not Started</div>
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{notStartedAssignments}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{completedAssignments}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 dark:bg-green-400 h-2 rounded-full"
                  style={{ width: `${totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{inProgressAssignments}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full"
                  style={{ width: `${totalAssignments > 0 ? (inProgressAssignments / totalAssignments) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Not Started</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{notStartedAssignments}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gray-400 dark:bg-gray-500 h-2 rounded-full"
                  style={{ width: `${totalAssignments > 0 ? (notStartedAssignments / totalAssignments) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active by Priority</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="font-medium text-red-800 dark:text-red-400">High Priority</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">{assignmentsByPriority.high}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span className="font-medium text-yellow-800 dark:text-yellow-400">Medium Priority</span>
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{assignmentsByPriority.medium}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="font-medium text-green-800 dark:text-green-400">Low Priority</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{assignmentsByPriority.low}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assignments by Course</h3>
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
                    <span className="font-medium text-gray-900 dark:text-white">{course.name}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {completed}/{total} completed • {active} active
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
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
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No assignments yet</p>
        )}
      </div>

      {/* Workload Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Heaviest Weeks</h3>
          {heaviestWeeks.length > 0 ? (
            <div className="space-y-3">
              {heaviestWeeks.map((week, index) => (
                <div key={week.week} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Week of {week.week}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{week.count} assignments</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{week.weight}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">total weight</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming assignments</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Estimate</h3>
          {totalEstimatedHours > 0 ? (
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {totalEstimatedHours}
              </div>
              <div className="text-gray-600 dark:text-gray-400">estimated hours remaining</div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Based on assignments with time estimates
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">No time estimates provided</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Add estimated hours to your assignments for better planning
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
