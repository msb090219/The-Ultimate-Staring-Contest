# Tech Stack: Do Not Blink

> A minimal, high-performance webcam-based reaction game.

**Related Documentation:** See `prd.md` for complete product requirements and feature specifications.

---

## Summary

| Layer | Technology | Cost | Purpose |
|-------|-----------|------|---------|
| **Frontend Framework** | Svelte 4 | $0 | Reactive UI, small bundle |
| **Build Tool** | Vite 5 | $0 | Fast dev server, optimized builds |
| **Computer Vision** | MediaPipe Face Landmarker | $0 | Client-side blink detection |
| **Backend Database** | Supabase (PostgreSQL) | $0 | Global leaderboard storage |
| **Hosting** | Vercel | $0 | Static site deployment |
| **Styling** | Vanilla CSS | $0 | Minimal, custom design |

**Total Monthly Cost: $0**

---

## 1. Frontend: Svelte 4

**What:** A reactive JavaScript framework that compiles to vanilla JS at build time.

**Why:**
- Smallest runtime of any major framework (~2KB after compile)
- Built-in reactivity (`$:` syntax for derived values)
- Clean, readable syntax
- No virtual DOM overhead
- Fast to develop with

**Key Features Used:**
- Reactive stores for game state
- `{#if}` blocks for UI state management
- `$:` for timer updates and derived calculations
- Built-in transitions for polished feel

**Official:** https://svelte.dev/

---

## 2. Build Tool: Vite 5

**What:** Next-gen frontend tooling with instant hot module replacement (HMR).

**Why:**
- Near-instant server start
- Lightning-fast HMR during development
- Optimized production builds
- Native ES module support
- Works seamlessly with Svelte

**Key Benefits:**
- See changes instantly while developing
- Optimized bundle splitting
- Automatic minification
- Dead code elimination

**Official:** https://vitejs.dev/

---

## 3. Computer Vision: MediaPipe Face Landmarker

**What:** Google's ML solution for face detection and facial landmark tracking, running entirely in the browser via WebAssembly.

**Why:**
- Client-side processing (no server costs)
- Real-time performance
- Accurate blendshape detection (`eyeBlinkLeft`, `eyeBlinkRight`)
- Free, no API keys needed
- Works on modern browsers

**Key Capabilities:**
- Detect 478 facial landmarks
- Track eye openness via blendshapes
- Run at 24+ FPS on most devices
- No data leaves the browser

**Import:**
```javascript
import { FaceLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/face_landmarker';
```

**Official:** https://developers.google.com/mediapipe/solutions/vision/face_landmarker

---

## 4. Backend: Supabase

**What:** Open-source Firebase alternative built on PostgreSQL.

**Why:**
- Generous free tier (500MB DB, 1GB bandwidth)
- Real-time capabilities (built-in subscriptions)
- Simple REST and JS SDK
- Row Level Security (RLS) for data safety
- Easy dashboard for data management

**Used For:**
- Storing leaderboard scores
- Fetching top scores sorted by time
- Global ranking across all players

**Free Tier Limits:**
- 500MB database storage
- 1GB bandwidth/month
- 2 concurrent connections
- 50MB file storage

**Schema:**
```sql
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  time_seconds FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Official:** https://supabase.com/

---

## 5. Hosting: Vercel

**What:** Cloud platform for static sites and serverless functions.

**Why:**
- Zero configuration deployment
- Automatic HTTPS
- Global CDN (fast loading worldwide)
- GitHub integration (auto-deploy on push)
- Generous free tier

**Free Tier:**
- 100GB bandwidth/month
- Unlimited sites
- Automatic SSL certificates
- Edge network caching

**Official:** https://vercel.com/

---

## 6. Styling: Vanilla CSS

**What:** Plain CSS with no preprocessor or framework.

**Why:**
- No build step required for styles
- Full control over design
- Minimal overhead
- Easy to iterate quickly

**Approach:**
- Dark theme default
- Centered, minimal layout
- Mobile-responsive
- Custom CSS for transitions

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐     ┌──────────────┐     ┌──────────────┐  │
│  │   Svelte    │────▶│    Video     │────▶│   MediaPipe  │  │
│  │   App       │     │   Element    │     │ Face Landmark│  │
│  └─────────────┘     └──────────────┘     └──────────────┘  │
│         │                                          │         │
│         │         (blendshapes)                    │         │
│         ▼                                          ▼         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              GAME LOGIC (Svelte)                      │  │
│  │  • State management (phase, timer, score)            │  │
│  │  • Blink detection (threshold comparison)            │  │
│  │  • Timer updates (requestAnimationFrame)             │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                                       │
│         │ (REST API)                                           │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SUPABASE (Cloud)                         │  │
│  │  • scores table (PostgreSQL)                          │  │
│  │  • Leaderboard queries                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
stare/
├── src/
│   ├── App.svelte           # Main app component
│   ├── components/
│   │   ├── Webcam.svelte    # Video + MediaPipe integration
│   │   ├── StartScreen.svelte    # Name input + start button
│   │   ├── Countdown.svelte      # 3-2-1-STARE overlay
│   │   ├── Timer.svelte          # Live timer display
│   │   ├── Results.svelte        # Game over screen
│   │   └── Leaderboard.svelte    # Top scores display
│   ├── stores.js            # Svelte stores for game state
│   ├── lib/
│   │   ├── mediapipe.js     # FaceLandmarker setup
│   │   └── supabase.js      # Supabase client config
│   └── app.css              # Global styles
├── static/
│   └── favicon.png
├── index.html               # Entry point
├── vite.config.js           # Vite configuration
├── svelte.config.js         # Svelte configuration
├── package.json             # Dependencies
├── .env                     # Supabase credentials (not committed)
├── stack.md                 # This file
├── CLAUDE.md                # Project guidance for Claude
└── prd.md                   # Product requirements
```

---

## Game Mechanics Implementation

### How Each Technology Supports PRD Requirements

**Svelte 4 + Vite 5:**
- *Reactive stores* enable real-time timer updates and game state management
- *Component architecture* supports clean separation of start screen, countdown, game loop, and results
- *Fast HMR* allows rapid iteration on UI/UX design

**MediaPipe Face Landmarker:**
- *Blendshape detection* (`eyeBlinkLeft`, `eyeBlinkRight`) directly implements blink detection logic
- *Real-time processing* supports the continuous game loop requirement
- *Face visibility tracking* handles the "face not detected" game over condition

**Supabase:**
- *PostgreSQL database* stores scores with name, time, and date fields as specified in data model
- *Simple REST API* enables quick score submission and leaderboard fetching
- *Row Level Security* ensures data safety without requiring user authentication

**Vercel:**
- *Static site hosting* delivers the single-page application globally
- *Automatic deployments* support rapid development and testing cycles

---

## Core Dependencies

```json
{
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "svelte": "^4.2.0",
    "vite": "^5.0.0"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

**Note:** MediaPipe is loaded via CDN in the app, not npm.

---

## Development Workflow

1. **Setup:**
   ```bash
   npm create vite@latest stare -- --template svelte
   cd stare
   npm install
   npm install @supabase/supabase-js
   ```

2. **Development:**
   ```bash
   npm run dev          # Start dev server (http://localhost:5173)
   ```

3. **Build:**
   ```bash
   npm run build        # Create production bundle in /dist
   ```

4. **Deploy:**
   - Push to GitHub
   - Connect repo to Vercel
   - Auto-deploys on push

---

## Environment Variables

Create `.env` in project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Never commit `.env`** — already in `.gitignore`.

---

## Key Technical Decisions

### Technology Stack Alignment with PRD
This stack directly supports the core objectives outlined in `prd.md`:
- **Real-time performance**: MediaPipe + Svelte reactivity enables smooth 24+ FPS blink detection
- **Rapid development**: Svelte's clean syntax and Vite's fast HMR accelerate the 4-phase development plan
- **Zero cost infrastructure**: All technologies have generous free tiers, supporting the MVP success criteria
- **Global leaderboard**: Supabase provides the required cloud database functionality without complexity
- **Quick user onboarding**: Fast load times (<3s target) ensure users can start within the 5-second goal

### Why Svelte over React/Vue?
- Smaller bundle → faster load, crucial for casual game
- Simpler mental model → easier AI implementation
- Compiles away → no runtime overhead

### Why MediaPipe over TensorFlow.js?
- Higher-level API → less boilerplate
- Better face/eye-specific models
- Google-maintained for browser

### Why Supabase over Firebase?
- PostgreSQL → proper SQL queries
- RLS → built-in security
- Simpler pricing → free tier is generous

### Why Vercel over Netlify?
- Edge caching → faster global load
- GitHub preview deployments
- Slightly faster build times

---

## Performance Targets

| Metric | Target | Why | PRD Alignment |
|--------|--------|-----|----------------|
| Initial load | <3s | User attention span | Supports "Start within 5 seconds" success criteria |
| Time to first interaction | <5s | Game must start quickly | Direct PRD requirement for rapid user onboarding |
| Webcam FPS | ≥24 | Smooth face tracking | Enables reliable real-time blink detection |
| Blink detection latency | <50ms | Responsive game feel | Ensures accurate game over conditions |
| Bundle size | <100KB | Fast mobile loading | Supports broad accessibility across devices |

---

## Security Considerations

1. **Input Sanitization:** Escape name input before DB insert
2. **Row Level Security:** Supabase RLS policies on `scores` table
3. **No Auth Required:** Public leaderboard, no user accounts
4. **Rate Limiting:** Consider Supabase rate limits if viral

---

## Future Scaling (If Viral)

| Threshold | Action | Cost |
|-----------|--------|------|
| >1GB DB storage | Upgrade Supabase Pro | $25/mo |
| >100GB bandwidth | Upgrade Vercel Pro | $20/mo |
| >10k concurrent users | Add CDN, consider edge functions | $40/mo |

---

## Alternatives Considered & Rejected

| Option | Rejected Because |
|--------|------------------|
| Next.js | Overkill for static game, adds server complexity |
| TensorFlow.js | Lower-level API, more code required |
| Firebase Realtime DB | NoSQL is less flexible for leaderboard queries |
| AWS Lambda | Unnecessary complexity for simple leaderboard |

---

## Summary

This stack prioritizes:
1. **Zero cost** at all layers
2. **Minimal complexity** for fast AI development
3. **Client-side processing** to avoid server costs
4. **Fast iteration** through excellent dev tools
5. **Production-ready** with proven, scalable services

The result: a fun, performant game that can go viral without breaking the bank.
