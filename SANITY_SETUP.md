# Sanity CMS + Clerk Authentication Setup Guide

## Overview

The Academic Planner now uses:
- **Clerk** for user authentication
- **Sanity CMS** for data storage (instead of localStorage)

All user data (subjects, assignments, notes, quizzes, etc.) will be stored in Sanity and scoped to each authenticated user.

## ✅ What's Already Done

1. ✅ Sanity client configured with your project ID: `7ibfgxgw`
2. ✅ All data models (schemas) created:
   - User
   - Subject
   - Assignment
   - Note
   - Quiz
   - Chat Message
   - Timetable Entry
3. ✅ Sanity and Clerk packages installed

## 🚀 Next Steps

### Step 1: Deploy Schemas to Sanity

Run this command to start Sanity Studio and deploy your schemas:

```bash
npm run sanity
```

This will:
1. Start Sanity Studio at http://localhost:3333
2. Prompt you to log in to your Sanity account
3. Deploy the schemas to your project

**Note:** You'll need to authenticate with Sanity using the account associated with project ID `7ibfgxgw`.

### Step 2: Set Up Clerk Authentication

1. Go to https://clerk.com and create a free account
2. Create a new application
3. Choose authentication providers (Email, Google, GitHub, etc.)
4. Copy your **Publishable Key** from the Clerk dashboard
5. Update `.env.local` file:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
   ```

### Step 3: Configure Sanity CORS

1. Go to https://sanity.io/manage
2. Select your project (7ibfgxgw)
3. Navigate to **Settings** → **API**
4. Add CORS origin:
   - **Origin**: `http://localhost:5174` (for development)
   - **Allow credentials**: ✅ Yes

For production, add your deployment URL (e.g., `https://yourdomain.com`)

## 📁 Project Structure

```
academic-planner/
├── sanity/
│   └── schemas/
│       ├── user.ts              # User profile schema
│       ├── subject.ts           # Subject/Course schema
│       ├── assignment.ts        # Assignment schema
│       ├── note.ts             # Note/Document schema
│       ├── quiz.ts             # Quiz schema
│       ├── chatMessage.ts      # Chat message schema
│       ├── timetableEntry.ts   # Timetable entry schema
│       └── index.ts            # Schema exports
├── src/
│   └── lib/
│       └── sanity.ts           # Sanity client configuration
├── sanity.config.ts            # Sanity Studio config
└── .env.local                  # Environment variables
```

## 🔐 Security Notes

### API Token Warning

The API token in `.env.local` has **write permissions**. For production:

1. Create a **read-only token** in Sanity dashboard
2. Handle all writes through a secure backend API
3. Never expose write tokens in client-side code

Currently using the write token for development convenience, but this should be changed for production.

## 🧪 Testing the Setup

After completing steps 1-3, you can test:

1. Start Sanity Studio:
   ```bash
   npm run sanity
   ```
   Visit http://localhost:3333

2. Start the app:
   ```bash
   npm run dev
   ```
   Visit http://localhost:5174

## 📚 Documentation

- [Sanity Documentation](https://www.sanity.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Sanity + Clerk Integration Guide](https://dev.to/julimancan/how-to-add-user-auth-with-clerk-to-nextjs-app-directory-and-store-it-in-embedded-sanity-cms-f0)

## ⚠️ Important

Your existing localStorage data will **not** be automatically migrated. Users will start fresh when the Sanity integration is complete. If you want to preserve existing data, you'll need to create a migration script.
