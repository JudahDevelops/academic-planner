# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StudyFlow is a React TypeScript application for student assignment tracking and AI-powered study management. It features multiple view modes (Study Hub, Timetable, Assignments, Overview) with Sanity CMS for data persistence and DeepSeek AI integration for study assistance.

## Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Architecture

### State Management

The application uses React Context API for global state management. All state is centralized in `src/context/AppContext.tsx`:

- **AppProvider**: Context provider wrapping the entire app in `App.tsx`
- **useApp()**: Custom hook to access assignments and courses state
- **LocalStorage Sync**: State automatically persists to localStorage with keys:
  - `academic-planner-assignments`
  - `academic-planner-courses`

### Data Models

Core types defined in `src/types/index.ts`:

- **Assignment**: Contains `id`, `title`, `courseId`, `dueDate`, `priority`, `status`, `weight`, `description`, `estimatedHours`
- **Course**: Contains `id`, `name`, `color` (hex color for visual coding)
- **ViewMode**: Union type for navigation (`'list' | 'calendar' | 'timeline' | 'analytics'`)

### View Architecture

`App.tsx` contains the main routing logic with `AppContent` component handling view switching:

1. **ListView**: Filterable/sortable list with CRUD operations
2. **CalendarView**: Monthly calendar grid showing assignments by due date
3. **TimelineView**: Chronological view grouped by weeks, separates overdue/upcoming
4. **AnalyticsView**: Dashboard with completion rates, workload distribution, and course analytics

All views consume state via the `useApp()` hook.

### Component Structure

- **Header**: Top navigation with view mode switching
- **AssignmentForm**: Modal form for creating/editing assignments (accepts optional `editingAssignment` prop)
- **AssignmentCard**: Individual assignment display with inline status updates
- **View components**: Each view is self-contained and directly accesses context

### Styling

- **Tailwind CSS v4**: Uses `@import "tailwindcss"` in `src/index.css`
- **Color Coding**: Courses have hex colors used throughout UI for visual distinction
- **Responsive Design**: Mobile-first with Tailwind responsive utilities

## Key Implementation Details

### ID Generation
IDs are generated using `Date.now().toString()` - this is a simple approach suitable for single-user client-side apps but should be replaced with UUIDs if multi-user or backend integration is added.

### Date Handling
Assignments use ISO datetime strings (`dueDate` field). Views calculate "today", "tomorrow", "overdue", and "due soon" states by comparing with `new Date()`.

### Course-Assignment Relationship
- Deleting a course cascades to delete all associated assignments (see `deleteCourse` in `AppContext.tsx`)
- Default courses are seeded on first load if localStorage is empty

### Analytics Calculations
`AnalyticsView.tsx` performs client-side aggregations:
- Groups assignments by week using `startOfWeek` calculation
- Calculates completion rates, workload distribution
- Identifies "heaviest weeks" by assignment count and total weight

## Development Philosophy & Standards

### Design Principles

This application prioritizes **visual clarity, elegance, and simplicity** to create a premium student experience. When extending or modifying the UI:

- Maintain **strong visual hierarchy** with generous whitespace
- Use **soft shadows, rounded corners, subtle borders** (already established in Tailwind classes)
- Keep **typography readable** with proper scale (current system uses Tailwind's default scale)
- Preserve the **minimal, harmonious color palette** (blues, greens, grays with semantic colors for priority/status)
- Add **subtle, purposeful animations** only where they enhance UX (avoid gratuitous motion)

Target design quality: Modern SaaS applications (Linear, Notion, Vercel) - calm, intentional, polished.

### Component & Code Quality

- **Reusable components**: Extract repeated UI patterns into composable components
- **Mobile-first responsive**: All new features must work seamlessly on mobile (use Tailwind's responsive utilities)
- **Tactile interactions**: Buttons, forms, and inputs should feel responsive (hover states, focus rings, transitions)
- **Production-ready code**: Clean, readable, well-structured TypeScript following React best practices

### Library & Tool Selection

When adding new features, **research and use established libraries** rather than building from scratch:

- **UI components**: Consider shadcn/ui, Radix UI, or Headless UI for complex components
- **Animations**: Use Framer Motion or React Spring for advanced animations
- **Forms & validation**: Consider React Hook Form + Zod for complex forms
- **Date/time**: Use date-fns or day.js for date manipulation (avoid moment.js)
- **Charts**: Use Recharts, Chart.js, or similar for data visualization
- **Icons**: Lucide React, Heroicons, or React Icons for consistent iconography

Always choose libraries that are:
- Actively maintained (recent commits, active issues)
- Well-documented
- TypeScript-first or have good TS support
- Production-proven (high npm downloads, used by real products)

### User Experience Requirements

Every feature must include:

- **Loading states**: Show feedback during async operations
- **Empty states**: Guide users when no data exists (e.g., "No assignments yet - create your first one!")
- **Error states**: Handle and display errors gracefully
- **Edge cases**: Consider overdue assignments, missing data, long text overflow, etc.

The UI should **never feel broken or unfinished**.

### Design-Driven Development

Before implementing features:
1. **Think about the user journey** - how will students actually use this?
2. **Anticipate friction points** - what could confuse or frustrate users?
3. **Apply UX improvements proactively** - if you see an opportunity to improve usability, do it

### Output Standards

- Default to **production-ready solutions**
- **Proactively improve** design and UX when modifying code
- When choosing between options, prefer what **looks and feels better**
- Focus on **clarity over cleverness** - code should be maintainable

**Mindset**: This is a portfolio-worthy student project. Every change should make it more polished, more delightful, and more professional.
