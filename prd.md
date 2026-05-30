Below is a **clean, implementation-ready PRD (Product Requirements Document)** in Markdown format for your project.

You can copy this directly into a `.md` file (e.g., `PRD_Do_Not_Blink.md`).

---

```md
# PRD: Do Not Blink

## 1. Overview

**Do Not Blink** is a minimal, web-based reaction game where users attempt to maintain eye contact with their webcam for as long as possible without blinking.

The application uses real-time face tracking to detect blinks and ends the game when a blink occurs. Users receive a score (time survived) and are ranked on a global leaderboard.

---

## 2. Objectives

### Primary Goals
- Build a simple, functional MediaPipe-based web app
- Implement real-time face + blink detection
- Create a competitive, shareable leaderboard system
- Keep scope minimal and execution fast

### Success Criteria
- Users can start a game within 5 seconds
- Blink detection works reliably in real time
- Scores are stored and displayed globally
- App is deployable and accessible via URL

---

## 3. Target Users

- Students (primary)
- Friends/social groups
- Casual users looking for quick entertainment

---

## 4. Core Features (MVP)

### 4.1 Start Screen

**Components:**
- Game title: *Do Not Blink*
- Short instructions
- Name input field
- Start button
- Leaderboard preview (top 5–10)

**Behavior:**
- User enters name
- Clicks "Start"
- Transitions to countdown

---

### 4.2 Countdown System

**Flow:**
```

3 → 2 → 1 → STARE

```

**Requirements:**
- Visual countdown
- ~1 second intervals
- Automatically transitions to game state

---

### 4.3 Webcam + Face Tracking

**Requirements:**
- Access user webcam
- Detect face presence
- Track facial landmarks in real time

**Tracking Goals:**
- Face visibility
- Eye openness (blink detection)

---

### 4.4 Game Loop

**Behavior:**
- Timer starts after countdown
- Runs continuously while:
  - Face is visible
  - No blink detected

**Timer Format:**
```

0.00 seconds (live updating)

```

---

### 4.5 Game Over Conditions

Game ends when:

- Blink detected
- Face not detected (lost tracking)

**Optional (future):**
- Looking away
- Smiling

---

### 4.6 Result Screen

**Displays:**
- Final time (e.g. 12.48s)
- Reason for loss
- Rank/title

**Example:**
```

You lasted 12.48 seconds
Rank: Suspiciously Focused
Reason: You blinked

````

---

### 4.7 Ranking System

**Time-based tiers:**

| Time (s) | Rank |
|--------|------|
| 0–3    | NPC Blink Speed |
| 3–8    | Weak but Respectable |
| 8–15   | Suspiciously Focused |
| 15–25  | Villain Energy |
| 25+    | Probably Not Human |

---

### 4.8 Leaderboard (Cloud)

**Requirements:**
- Store scores globally
- Sort by highest time
- Display top scores

**Fields:**
- Name
- Time (seconds)
- Date

---

## 5. Tech Stack

**Detailed technical specifications available in `stack.md`**

### Frontend Framework

### Frontend Framework
- **Svelte 4** - Reactive UI framework with minimal runtime overhead
  - Built-in reactivity for real-time updates
  - Component-based architecture
  - Compiles to vanilla JavaScript for optimal performance

### Build Tool
- **Vite 5** - Fast development server and optimized production builds
  - Instant hot module replacement during development
  - Optimized bundling and minification
  - Native ES module support

### Styling
- **Vanilla CSS** - No preprocessing framework for maximum control and minimal overhead

### Computer Vision
- **MediaPipe Face Landmarker (browser)** - Google's client-side face tracking solution
  - Real-time blink detection via blendshape values
  - 478 facial landmark tracking
  - Runs entirely in the browser via WebAssembly
  - No server-side processing costs

### Backend (Cloud)
- **Supabase (PostgreSQL database)** - Open-source Firebase alternative
  - Global leaderboard storage
  - Real-time score fetching
  - Row Level Security for data safety
  - Generous free tier for MVP

### Hosting
- **Vercel** - Static site deployment platform
  - Zero-configuration deployment from GitHub
  - Automatic HTTPS and global CDN
  - Preview deployments for testing
  - Generous free tier

---

## 6. Data Model

### Table: `scores`

```sql
id (uuid, primary key)
name (text)
time_seconds (float)
created_at (timestamp)
````

---

## 7. System Architecture

```
User → Svelte App → Video Element → MediaPipe Face Landmarker
                          ↓                    ↓
                    Game Logic          Blendshape Data
                    (Svelte Stores)          ↓
                          ↓              Blink Detection
                          ↓                    ↓
                    UI Updates          Game State Changes
                          ↓                    ↓
                    Supabase (Leaderboard Database)
```

### Component Flow
- **Svelte Components** manage UI state and user interactions
- **MediaPipe** processes webcam feed and outputs facial blendshapes
- **Game Logic** (in Svelte stores) evaluates blink detection and timing
- **Supabase** stores and retrieves leaderboard data

---

## 8. Core Logic

### Blink Detection (Simplified)

Use blendshape values:

```
eyeBlinkLeft
eyeBlinkRight
```

**Logic:**

```
IF eyeBlinkLeft > threshold OR eyeBlinkRight > threshold
    → Game Over
```

---

### Timer Logic

```
startTime = current time

loop:
    elapsed = now - startTime
    display elapsed
```

---

### Leaderboard Logic

```
1. Fetch scores from Supabase
2. Sort descending by time
3. Display top N entries
```

---

## 9. UI/UX Guidelines

### Design Principles

* Minimal
* Fast
* Clear feedback
* Slight humour

### Layout

```
[ Title ]

[ Webcam Feed ]

[ Timer ]

[ Start Button / Countdown ]

[ Leaderboard ]
```

---

## 10. User Flow

```
Landing Page
    ↓
Enter Name
    ↓
Start Game
    ↓
Countdown
    ↓
Staring Phase (timer running)
    ↓
Blink detected
    ↓
Game Over Screen
    ↓
Submit Score
    ↓
Leaderboard Update
```

---

## 11. Non-Functional Requirements

### Performance

* Smooth webcam rendering (≥ 24 FPS)
* Low latency detection

### Reliability

* Must handle:

  * No camera access
  * Face not detected

### Security

* Basic input sanitisation (name field)
* No authentication required

---

## 12. Out of Scope (MVP)

* User accounts
* Multiplayer
* Real-time competitions
* Advanced analytics
* Mobile app version

---

## 13. Future Enhancements

### Phase 2 Ideas

* Sound effects
* Shareable score card
* Daily leaderboard
* “Hard mode” (no smiling)
* Face filters on loss

---

## 14. Development Plan

### Phase 1 (Project Setup & Core Build)

* Initialize Svelte + Vite project
* Webcam + MediaPipe integration
* Blink detection logic
* Timer system
* Game state handling with Svelte stores

### Phase 2 (UI + UX)

* Svelte component architecture
* Start screen component
* Countdown component
* Result screen component
* Ranking labels and styling

### Phase 3 (Backend)

* Supabase project setup
* Database schema creation
* Score submission integration
* Leaderboard display component

### Phase 4 (Deployment)

* Configure Vite for production build
* Deploy to Vercel
* Connect live database
* End-to-end testing with users

---

## 15. Risks

| Risk                       | Mitigation                      |
| -------------------------- | ------------------------------- |
| Blink detection inaccurate | Tune threshold values           |
| Lighting issues            | Add “good lighting” instruction |
| Face not detected          | Add retry / reposition message  |

---

## 16. Project Summary

A minimal, high-impact web app leveraging real-time face tracking to create a competitive and humorous experience. Designed for rapid development, social sharing, and strong engagement despite simple mechanics.

---

```

---

If you want next, I can give you:

- a **step-by-step implementation plan (day-by-day build guide)**  
- or **starter code (MediaPipe + webcam + blink detection wired up immediately)**
```
