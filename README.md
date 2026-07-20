# GodsEye — WordPress AI Agent

Connect your WordPress site to an AI-powered Telegram bot and manage it in plain English. Stop logging into wp-admin for routine tasks.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   `npm run dev`

## Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- React 19 + Vite 6 + TypeScript
- Tailwind CSS v4
- Express (dev server)
- Gemini AI API (playground)

## Project Structure

- `src/App.tsx` — Main application with routing
- `src/components/` — React components (WordPressDashboard, LivePlayground)
- `server.ts` — Express dev server with AI playground API
- `dist/` — Production build output

## License

Private project.
