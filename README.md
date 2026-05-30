# 👁️ Do Not Blink

**A web-based staring competition game with real-time blink detection**

> How long can you maintain eye contact without blinking? Compete for the top spot on the global leaderboard.

![MIT License](https://img.shields.io/badge/license-MIT-blue)
![Svelte](https://img.shields.io/badge/Svelte-5-orange)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Face%20Landmarker-green)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## ✨ Features

- **🎯 Real-time Face Tracking** - Uses MediaPipe Face Landmarker for accurate blink detection
- **🔧 Dynamic Calibration** - Adapts to individual facial characteristics
- **🏆 Global Leaderboard** - Compete against players worldwide (requires account)
- **🔐 OAuth Authentication** - Sign in with Google or GitHub
- **👮 Strict Position Monitoring** - Ensures fair play through position tracking
- **⚡ Instant Feedback** - Blink warnings and visual tension indicators
- **🎨 Polished UI** - Smooth animations, loading states, and celebration effects

## 🎮 How to Play

1. **Enter your name** or sign in with your Google/GitHub account
2. **Complete calibration** - Position your face in the frame and wait for the green checkmark
3. **Survive the countdown** - Get ready as the timer counts down from 3
4. **Don't blink!** - Maintain eye contact as long as possible
5. **Check your rank** - See where you stand on the global leaderboard

### Ranking System

| Time (s) | Rank |
|----------|------|
| 0-3      | NPC Blink Speed 😴 |
| 3-8      | Weak but Respectable 🙂 |
| 8-15     | Suspiciously Focused 🤨 |
| 15-25    | Villain Energy 😈 |
| 25+      | Probably Not Human 🤖 |

## 🛠️ Tech Stack

- **Frontend**: Svelte 5 + SvelteKit (reactive UI framework)
- **Build Tool**: Vite 5 (fast development server)
- **Computer Vision**: MediaPipe Face Landmarker (client-side)
- **Backend**: Supabase (PostgreSQL database + OAuth)
- **Hosting**: Vercel (static site deployment)

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

## 🚀 Getting Started

### Quick Start (Play Online)

Visit [do-not-blink.com](https://do-not-blink.com) to play instantly without any setup!

### Local Development

#### Prerequisites

- **Node.js** 18+ and npm
- **Modern web browser** with webcam support (Chrome recommended)
- **Supabase account** (for leaderboard functionality - free tier works)

#### Installation

1. **Clone the repository**
```bash
git clone https://github.com/msb090219/do-not-blink.git
cd do-not-blink
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173` and allow camera permissions when prompted

### Supabase Setup

The leaderboard requires a Supabase project (free tier works great):

1. **Create a project** at [supabase.com](https://supabase.com)
2. **Run the migration** SQL in your Supabase SQL Editor:
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Run all migration files in order (001 through 005)
3. **Enable OAuth providers** (optional):
   - Go to Authentication → Providers
   - Enable Google and/or GitHub
   - Add your callback URL: `http://localhost:5173`
4. **Copy credentials** to `.env`:
   - Project Settings → API
   - Copy URL and `anon` key

**Note**: The game works without Supabase for testing, but the leaderboard won't function.

## 📁 Project Structure

```
do-not-blink/
├── src/
│   ├── components/          # Svelte components
│   │   ├── game/            # Game phase components
│   │   ├── start/           # Start screen & calibration
│   │   ├── results/         # Results screen
│   │   ├── leaderboard/     # Leaderboard components
│   │   ├── shared/          # Shared components
│   │   ├── landing/         # Landing page
│   │   ├── profile/         # User profile
│   │   └── settings/        # Settings page
│   ├── stores/              # State management (Svelte stores)
│   ├── services/            # Business logic & external services
│   ├── lib/                 # Utilities, helpers, constants
│   ├── App.svelte           # Root component
│   ├── main.js              # Entry point
│   └── app.css              # Global styles & CSS variables
├── supabase/
│   └── migrations/          # Database schema migrations
├── public/                  # Static assets
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment variables template
└── package.json
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run check        # Run Svelte checks
npm run check:watch  # Watch mode for Svelte checks
```

### Key Components

- **GameEngine** (`services/gameEngine.js`) - Core game logic and blink detection
- **MediaPipeService** (`services/mediapipe.js`) - Face tracking integration
- **FaceState** (`stores/faceState.js`) - Real-time face tracking state
- **GameState** (`stores/gameState.js`) - Game phase and timing management

### Adding Features

1. Create components in appropriate `src/components/` subdirectory
2. Add business logic to `services/` or utilities to `lib/`
3. Use existing stores for state management
4. Follow the established CSS variable system for styling
5. Test on Chrome, Firefox, and Safari

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

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/msb090219/do-not-blink)

**Manual deployment:**

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Deploy automatically on push to main branch

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard

### Environment Variables

Required for leaderboard functionality:
```
VITE_SUPABASE_URL          # Your Supabase project URL
VITE_SUPABASE_ANON_KEY     # Your Supabase anonymous key
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

**Quick start:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution

- 🎨 UI/UX improvements
- 🎮 New game modes
- 🏆 Additional ranking tiers
- 🌍 Internationalization
- 📱 Mobile responsiveness
- 🐛 Bug fixes
- 📝 Documentation

## 📄 License

This project is open source under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **MediaPipe** for face tracking technology
- **Supabase** for backend infrastructure
- **Svelte & Vite** for the amazing developer experience
- **canvas-confetti** for celebration effects
- All contributors and players! 👁️

## 📮 Support

- 📋 [Issue Tracker](https://github.com/msb090219/do-not-blink/issues) - Bug reports and feature requests
- 💬 [Discussions](https://github.com/msb090219/do-not-blink/discussions) - Questions and ideas
- 📧 Email: Create a GitHub issue for sensitive matters

---

**Built with ❤️ for the ultimate staring competition**

⭐ Star us on GitHub — it helps more people discover the game!

## License

This project is open source and available under the MIT License.

## Acknowledgments

- MediaPipe for face tracking technology
- Supabase for backend infrastructure
- Svelte and Vite for the development experience
- Claude Code

