# Job List For RemoteRocketShip

## Plan
### ● Job Platform Optimization with Zustand (1h/day focus)

#### ➥ Day 1 (Complete)
- Migrated state to Zustand + TypeScript types
- Added persist + devtools + immer middleware

#### ➥ Day 2 (Cross-Tab Sync & History)
- Implement tab sync for filters/pagination
- Basic undo/redo for job selection history

#### ➥ Day 3 (Optimistic Updates)
- Add optimistic UI for job applications
- Cache applied jobs in Zustand store

#### ➥ Day 4 (Performance Boost)
- Atomic selectors for job list rendering
- Memoized job detail subscriptions

#### ➥ Day 5 (Realtime Features)
- WebSocket for new job notifications
- Shared application status indicators

## Features

- **Job Browsing**: View software developer jobs with key details
- **Instant Details**: Click any listing to see full job description
- **Smart Pagination**: Navigate through job listings seamlessly
- **Quick Apply**: One-click access to application pages
- **Real-time Feedback**: Clear loading states and error handling
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Tech Stack

**Frontend:**
- React (v18+) - UI framework
- TypeScript - Type safety
- styled-components - CSS-in-JS styling
- Axios - HTTP client

## Setup
1. Prerequisites
- Node.js v18+ (v20)
- npm v9+

2. Server Setup
```
cd backend-server
npm install
node server.js
```

3. Client Setup
```
npm install
cp .env.example .env
# Set API base URL in .env
npm run dev
```
