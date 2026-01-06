# StudyFlow

**Your AI Study Companion** - A modern academic planner with AI-powered study tools to help students ace their semester.

## Features

### 🎓 Study Hub
- **AI Study Assistant**: Chat with your notes using DeepSeek AI
- **Smart Notes Management**: Upload and organize study materials (PDF, DOCX, TXT)
- **AI Quizzes**: Generate practice questions from your notes
- Subject-based organization with color coding

### 📅 Timetable
- Visual weekly class schedule
- Interactive time grid with drag-and-drop support
- Mobile-friendly list view
- Location and notes for each class

### 📋 Assignments
- Multiple views: List, Calendar, and Timeline
- Smart filtering and sorting
- Priority levels and status tracking
- Weight-based grading system
- Due date notifications and overdue alerts

### 📊 Overview (Analytics)
- Completion rate tracking
- Priority distribution analysis
- Course-wise assignment breakdown
- Workload insights and time estimates
- Visual progress indicators

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Authentication**: Clerk
- **Backend**: Sanity CMS
- **AI**: DeepSeek API
- **Features**: Dark mode, responsive design, offline support

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file with:

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_SANITY_PROJECT_ID=your_sanity_project_id
VITE_SANITY_DATASET=production
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
```

## Project Structure

```
src/
├── components/       # React components
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## License

Private project for academic use.
