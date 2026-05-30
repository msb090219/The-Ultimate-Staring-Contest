# The Ultimate Staring Competition

> How long can you maintain eye contact without blinking? Compete for the top spot on the global leaderboard.

## Overview

The Ultimate Staring Competition is a web-based game where users attempt to maintain eye contact with their webcam for as long as possible without blinking. The application uses real-time face tracking to detect blinks and ends the game when a blink occurs.

## Features

- **Real-time Face Tracking**: Uses MediaPipe Face Landmarker for accurate blink detection
- **Dynamic Calibration**: Adapts to individual facial characteristics
- **Global Leaderboard**: Compete against players worldwide (requires account)
- **OAuth Authentication**: Sign in with Google or GitHub
- **Strict Position Monitoring**: Ensures fair play through position tracking
- **Immediate Disqualification**: Maintains game integrity

## Tech Stack

- **Frontend**: Svelte 4 (reactive UI framework)
- **Build Tool**: Vite 5 (fast development server)
- **Computer Vision**: MediaPipe Face Landmarker (client-side)
- **Backend**: Supabase (PostgreSQL database + OAuth)
- **Hosting**: Vercel (static site deployment)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with webcam support
- Supabase account (for backend)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stare
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Run development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration SQL in `supabase/migrations/001_initial_schema.sql`
3. Enable OAuth providers (Google, GitHub) in your Supabase dashboard
4. Copy your project URL and anon key to `.env.local`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Project Structure

```
stare/
├── src/
│   ├── components/      # Svelte components
│   ├── stores/          # State management
│   ├── services/        # Business logic
│   ├── lib/             # Utilities and constants
│   ├── App.svelte       # Root component
│   ├── main.js          # Entry point
│   └── app.css          # Global styles
├── supabase/
│   └── migrations/      # Database migrations
├── .env.local           # Environment variables (gitignored)
└── package.json
```

## Game Mechanics

### Calibration Phase

Before each game, players must complete a calibration phase that ensures:
- Face is clearly visible
- Positioned within the frame
- Proper lighting conditions
- Eye detection is working

### Gameplay

- Timer starts after countdown
- Dynamic threshold calibrated per player
- Position monitoring throughout game
- Immediate disqualification for position loss
- Game ends on blink detection

### Ranking System

| Time (s) | Rank |
|----------|------|
| 0-3      | NPC Blink Speed |
| 3-8      | Weak but Respectable |
| 8-15     | Suspiciously Focused |
| 15-25    | Villain Energy |
| 25+      | Probably Not Human |

## Deployment

### Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables

Add these in your Vercel project settings:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- MediaPipe for face tracking technology
- Supabase for backend infrastructure
- Svelte and Vite for the development experience
- Claude Code

