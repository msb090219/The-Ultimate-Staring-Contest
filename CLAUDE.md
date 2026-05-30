# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Do Not Blink" - a web-based reaction game where users maintain eye contact with their webcam without blinking. Real-time blink detection via MediaPipe Face Landmarker.

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (no framework)
- **Computer Vision:** MediaPipe Face Landmarker (browser-based, client-side)
- **Backend:** Supabase (PostgreSQL) for global leaderboard
- **Hosting:** Vercel or Netlify

## Architecture

```
User → Browser App → MediaPipe (client-side blink detection)
                    ↓
               Game Logic (JavaScript)
                    ↓
            Supabase (scores table: id, name, time_seconds, created_at)
```

## Blink Detection Logic

Uses MediaPipe blendshape values:
- `eyeBlinkLeft` and `eyeBlinkRight`
- Threshold-based: if either > threshold → game over

## Game States

1. **Start Screen** - name input, leaderboard preview, start button
2. **Countdown** - 3 → 2 → 1 → STARE (~1s intervals)
3. **Staring Phase** - live timer (0.00s), face tracking active
4. **Game Over** - displays final time, rank title, loss reason

## Ranking Tiers (Time-based)

| Time (s) | Rank |
|--------|------|
| 0-3    | NPC Blink Speed |
| 3-8    | Weak but Respectable |
| 8-15   | Suspiciously Focused |
| 15-25  | Villain Energy |
| 25+    | Probably Not Human |

## Leaderboard

- Stores: name, time_seconds, created_at
- Sorted descending by time
- Top 5-10 displayed on start screen
- Global (not per-user)
