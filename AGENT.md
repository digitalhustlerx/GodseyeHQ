# GodsEye Project Context

GodsEye is an AI-powered WordPress management interface connecting WordPress instances (cPanel/standard hosting) to Telegram for conversational site administration.

## Core Architecture
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion.
- **Routing**: Centralized state management in `App.tsx` using `activeView` (e.g., 'landing', 'dashboard', 'playground', 'download', 'buy', 'waitlist').
- **Styling**: "Sophisticated Dark" theme (bg: #0A0A0A, accent: #C4A484, text: #F2F2F2).

## Key Components
- `/src/App.tsx`: Main application wrapper, routing, and shared state (`wpState`, `activeView`).
- `/src/components/WordPressDashboard.tsx`: WordPress control center.
- `/src/components/LivePlayground.tsx`: Interactive AI chat interface for managing WP instance.
- `/src/components/Waitlist.tsx`: Coming soon / waitlist registration.
- `/src/types.ts`: TypeScript interfaces for `MockWPState`.
- `/src/mockData.ts`: Initial state and sample commands.

## Implementation Guidelines
- **Responsive Design**: Always check mobile layouts (Tailwind `sm:`, `md:` prefixes).
- **Tone**: Approachable, non-technical, digestible.
- **Documentation**: All new features or structural changes should be noted here.
