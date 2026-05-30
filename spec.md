# Specification: Do Not Blink

> A comprehensive specification document based on product requirements and technical decisions.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-08 | Initial specification based on product interview |

---

## 1. Product Philosophy

### Core Vision

"Do Not Blink" is a desktop browser game where users maintain eye contact with their webcam for as long as possible without blinking. The application uses real-time face tracking to detect blinks and ends the game when a blink occurs.

### Two-Tier Experience Model

**Significant Update from Original PRD:**

The game operates on a two-tier model:

1. **Anonymous Play (Free):** Users can play the game and time themselves without any account. They can view the leaderboard but cannot submit scores.

2. **Account-Based Play (Leaderboard):** Users who want to appear on the leaderboard must create an account via OAuth (Google, GitHub). This ensures leaderboard integrity while maintaining zero friction for casual play.

**Rationale:** This balances accessibility (anyone can try instantly) with competition quality (leaderboard requires verified identity).

---

## 2. Technical Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend Framework | Svelte 4 | Reactive UI, minimal runtime |
| Build Tool | Vite 5 | Fast dev server, optimized builds |
| Computer Vision | MediaPipe Face Landmarker | Client-side blink detection |
| Backend Database | Supabase (PostgreSQL) | User accounts, scores, leaderboard |
| Authentication | Supabase Auth + OAuth | Google, GitHub sign-in |
| Hosting | Vercel | Static site deployment |
| Styling | Vanilla CSS | Minimal, custom design |
| Platform | Desktop browsers only | Chrome, Firefox, Safari, Edge |

---

## 3. Game Flow

### 3.1 User Journey

```
1. Landing (Start Screen)
   ├─ Anonymous: Enter name (optional) → Calibration
   └─ Account: Sign in with OAuth → Set game name (optional) → Calibration

2. Calibration Phase
   ├─ Real-time video feedback
   ├─ Color-coded bounding box (red = invalid, green = valid)
   ├─ Text instructions for positioning
   └─ All criteria must pass → Countdown

3. Countdown
   ├─ Dynamic threshold calibration (measure baseline)
   └─ 3 → 2 → 1 → STARE (text only, no audio)

4. Gameplay
   ├─ Timer: Visible but subtle (X.XXs format)
   ├─ Real-time blink detection
   ├─ Position monitoring (immediate DQ if lost)
   └─ Game ends on: blink detected OR position lost

5. Results
   ├─ Anonymous: Time shown, leaderboard viewable, no submission
   ├─ Account: Time → Rank → Reason (hierarchy), score submitted
   ├─ Disqualified: Distinct visual style, time shown but not submitted
   └─ Share: Text template only ("I lasted X.XXs")

6. Return to Start Screen
   └─ Name/account persists for session
```

### 3.2 State Machine

```
IDLE → CALIBRATION → COUNTDOWN → PLAYING → RESULTS → IDLE
                    ↓                      ↓
                    (baseline)        (blink/position)
                                         ↓
                                    DISQUALIFIED → RESULTS
```

---

## 4. Authentication & Accounts

### 4.1 Account System

**Provider:** Supabase Auth with OAuth adapters

**Supported Providers:**
- Google OAuth
- GitHub OAuth

**Information Requested:**
- Email (for identity)
- OAuth provider (for sign-in method)
- Game name (optional, defaults to "Anonymous")

### 4.2 Game Name Handling

- **Default:** "Anonymous" if no game name set
- **Optional:** Players can set a custom game name at any time
- **Persistence:** Game name stored in Supabase user profile
- **Display:** Game name shown on leaderboard, not email

### 4.3 Anonymous vs. Account Experience

| Feature | Anonymous | Account |
|---------|-----------|---------|
| Play game | ✅ Yes | ✅ Yes |
| View leaderboard | ✅ Yes | ✅ Yes |
| Submit to leaderboard | ❌ No | ✅ Yes |
| Track personal best | ❌ No | ✅ Yes (server-side) |
| Calibrate threshold | ✅ Per-session | ✅ Persistent (optional) |

---

## 5. Calibration System

### 5.1 Calibration Criteria (All Must Pass)

1. **Face Detection Confidence:** > 0.7
2. **Face Position:** Centered within frame (20% margin from edges)
3. **Face Size:** Minimum 30% of frame height
4. **Eye Visibility:** Both eyes visible and detectable
5. **Lighting:** Sufficient brightness for blendshape detection

### 5.2 Calibration UI

**Location:** Start screen (progressive disclosure - name entry first, then video activates)

**Visual Feedback:**
- **Color-coded bounding box:**
  - 🔴 Red: One or more criteria failing
  - 🟢 Green: All criteria passing
- **Text instructions:** Dynamic based on failing criteria:
  - "Move closer to the camera"
  - "Center your face in the frame"
  - "Improve lighting"
  - "Remove glasses if detection fails"

**Behavior:**
- Real-time feedback as user adjusts position
- "Start Game" button disabled until all criteria pass
- Video feed mirrored horizontally (natural selfie feel)

### 5.3 Failed Calibration

**Error Handling:**
- Helpful error messages explaining what failed
- No escape hatch - all criteria must pass
- No "skip calibration" option
- Practice mode not available (quality-first approach)

**Rationale:** Ensures consistent gameplay experience and prevents frustration from poor detection during actual gameplay.

---

## 6. Dynamic Threshold Calibration

### 6.1 Calibration Timing

**Phase:** During countdown (3-2-1-STARE sequence)

**Process:**
1. When all positioning criteria pass, begin countdown
2. During countdown seconds, capture baseline eye state
3. Measure resting blink values for both eyes
4. Calculate threshold as: `baseline + margin` (margin = 0.3)
5. Game starts when countdown completes and threshold is set

### 6.2 Edge Case Handling

**User starts with eyes half-closed:**
- System detects abnormal baseline
- Prompts: "Please open your eyes normally"
- Countdown pauses until normal eye state detected
- Prevents gaming the system by starting with closed eyes

**Lighting changes mid-game:**
- Threshold remains fixed from calibration
- If lighting degrades significantly, game may end prematurely
- Trade-off: Consistency vs. adaptability

---

## 7. Gameplay Mechanics

### 7.1 Timer System

**Precision:** Hundredths of a second (X.XXs format)
**Example:** 12.48s, 25.03s, 8.91s

**Display:** Visible but subtle during gameplay
- Not the dominant UI element
- Reduces timer anxiety that could cause blinking
- Prominent enough to track progress

**Update Rate:** Every frame (synchronized with requestAnimationFrame)

### 7.2 Blink Detection

**Detection Method:** MediaPipe Face Landmarker blendshapes
- `eyeBlinkLeft`
- `eyeBlinkRight`

**Threshold:** Dynamic (calibrated per player during countdown)
- Formula: `player_baseline + 0.3`
- Rationale: Accounts for individual facial anatomy

**Trigger:** Game ends immediately if either eye exceeds threshold

### 7.3 Position Monitoring

**Continuous Monitoring:** During gameplay, system tracks:
- Face detection confidence
- Face position within frame
- Face size relative to frame

**Violation:** Immediate disqualification if any criterion fails
- No grace period
- No warning during gameplay
- Distinct "disqualified" result state

**Rationale:** Prevents players from exploiting by moving away from camera

---

## 8. Game Over States

### 8.1 Result Types

**Normal Game Over:**
- Trigger: Blink detected
- Display: Time → Rank → Reason (hierarchy)
- Action: Score submitted to leaderboard (account holders)
- Style: Standard result screen

**Disqualified:**
- Trigger: Position lost, face not detected
- Display: Time shown but "Round forfeited" message
- Action: Score NOT submitted, time shown for personal reference
- Style: Distinct visual style (different color scheme)

### 8.2 Results Screen Hierarchy

**Primary:** Time (e.g., "12.48s")
**Secondary:** Rank (e.g., "Suspiciously Focused")
**Tertiary:** Reason (e.g., "You blinked" or "Position lost")

**Rationale:** Achievement-oriented - competitive players care most about their time.

### 8.3 Ranking System

| Time (s) | Rank |
|--------|------|
| 0-3    | NPC Blink Speed |
| 3-8    | Weak but Respectable |
| 8-15   | Suspiciously Focused |
| 15-25  | Villain Energy |
| 25+    | Probably Not Human |

**Note:** These ranks are displayed for context but not stored in database.

### 8.4 Messaging Tone

**Disqualification:** Neutral & factual
- "Position lost. Round forfeited."
- "Face tracking lost. Round forfeited."
- No emoji, no sympathy, no harshness

**Normal Game Over:** Neutral & informative
- "You lasted 12.48 seconds."
- "Rank: Suspiciously Focused"
- "Reason: You blinked"

---

## 9. Leaderboard

### 9.1 Leaderboard Display

**Information per Entry:**
1. Player name (game name from account)
2. Time (X.XXs format, descending order)
3. Date (international format: "8 May 2026")

**Visual Hierarchy:**
- Name: Primary
- Time: Secondary (highlighted)
- Date: Tertiary

**Scope:** Top 10 scores globally
- No pagination
- No filtering
- Single global leaderboard

### 9.2 Leaderboard Locations

**Start Screen:**
- Preview of top 5 scores
- Visible before account creation
- Creates FOMO and competition motivation

**Results Screen:**
- Full top 10 leaderboard
- Player's score highlighted if in top 10
- Otherwise, show top 10 with indication of where player would rank

### 9.3 Data Model

**Table: `scores`**
```sql
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- Supabase Auth
  game_name TEXT NOT NULL,
  time_seconds FLOAT NOT NULL CHECK (time_seconds >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scores_time ON scores(time_seconds DESC);
CREATE INDEX idx_scores_user ON scores(user_id);
```

**Table: `user_profiles`**
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  game_name TEXT DEFAULT 'Anonymous',
  best_time FLOAT,
  games_played INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 9.4 Submission Rules

**Per User:**
- Only best score stored on leaderboard
- If new score > best score, update entry
- If new score < best score, ignore

**Anti-Spam:**
- Rate limiting: 5 submissions per hour per user
- Basic pattern analysis: detect abnormal submission patterns

**Integrity:**
- Server-side validation of all scores
- Client-side authority not trusted
- Basic anti-cheat: pattern analysis for:
  - Multiple faces in frame
  - No face movement variance (possible photo feed)
  - Unnatural blink patterns

---

## 10. Sharing System

### 10.1 Share Mechanism

**Type:** Text template only

**Template:**
```
"I lasted 12.48s in Do Not Blink - can you beat me?
Play now: https://donotblink.game"
```

**Format:**
- Copy to clipboard
- Pre-populated with user's actual time
- No auto-generated image cards
- No challenge URLs with embedded scores

**Rationale:** Simplest implementation, works across all platforms.

---

## 11. Countdown System

### 11.1 Countdown Design

**Style:** Minimal (text only)
- No audio
- No visual buildup effects
- No heartbeat animations

**Sequence:**
```
3
2
1
STARE
```

**Timing:**
- Each number: 1 second
- "STARE": 0.5 seconds
- Total: 3.5 seconds

**Rationale:** Clean, uncluttered, focuses attention rather than creating unnecessary tension.

### 11.2 Integration with Calibration

**Flow:**
1. User achieves valid calibration (green bounding box)
2. "Start Game" button becomes enabled
3. User clicks "Start Game"
4. Dynamic threshold calibration occurs during countdown
5. At "STARE," game begins immediately

---

## 12. Post-Game Flow

### 12.1 Return to Start Screen

**Behavior:** After viewing results, user returns to start screen

**Persistence:**
- Account status persists (if signed in)
- Game name persists
- No need to re-enter information

**Replay Flow:**
1. Results screen → "Play Again" button
2. Return to start screen (not immediate replay)
3. Calibration must be repeated (position may have changed)
4. New game begins

**Rationale:** Return to start screen creates a natural pause and allows for calibration reset.

---

## 13. Mobile Strategy

### 13.1 Platform Scope

**Target:** Desktop browsers only
- Chrome (primary)
- Firefox
- Safari
- Edge

**Mobile:** Explicitly excluded for MVP
- No mobile optimization
- No responsive design for small screens
- "Best experienced on desktop" message acceptable

**Rationale:** Desktop-first allows for more reliable webcam access, consistent UI, and simpler implementation.

---

## 14. Performance Requirements

### 14.1 Core Metrics

| Metric | Target | Why |
|--------|--------|-----|
| Initial load | <3 seconds | User attention span |
| Time to first game | <5 seconds | Minimize abandonment |
| Webcam FPS | ≥24 FPS | Smooth face tracking |
| Blink detection latency | <50ms | Responsive game feel |
| Leaderboard query | <500ms | Fast feedback |

### 14.2 Performance Strategies

**Frame Rate Limiting:**
- Cap MediaPipe processing at 30 FPS
- Prevents CPU overload on lower-end devices

**Lazy Loading:**
- MediaPipe loads only when user clicks "Start Game"
- Leaderboard fetches on app load, cached for session
- OAuth loads only when user clicks "Sign in"

**Caching:**
- Leaderboard cached for session
- Refreshes on game completion
- Reduces database load

---

## 15. Error Handling

### 15.1 Camera Access Errors

| Error | Message |
|-------|---------|
| Permission denied | "Please allow camera access to play" |
| No camera found | "No camera found on this device" |
| Camera in use | "Camera is being used by another application" |
| Generic error | "Camera access failed. Please try again" |

### 15.2 Face Detection Errors

| Situation | Handling |
|-----------|----------|
| Face not detected during calibration | Real-time guidance, no game start |
| Face lost during gameplay | Immediate disqualification |
| Poor lighting | Guidance to improve lighting |
| Multiple faces | Prompt: "Only one person at a time" |

### 15.3 Authentication Errors

| Error | Message |
|-------|---------|
| OAuth failed | "Sign in failed. Please try again" |
| Session expired | "Please sign in again" |
| Network error | "Connection failed. Check your internet" |

---

## 16. Security & Privacy

### 16.1 Privacy Commitments

**No Image Storage:**
- Webcam frames never stored or transmitted
- Only blendshape values processed locally
- No facial data retention

**No Location Tracking:**
- No geolocation requests
- No IP-based location inference

**Minimal Data Collection:**
- Email (for auth only)
- Game name (for leaderboard display)
- Score data (time, date)

### 16.2 Authentication Security

**Provider:** Supabase Auth
- Industry-standard OAuth implementation
- Secure token handling
- Row-Level Security (RLS) on all tables

**Passwordless:**
- No password storage
- OAuth tokens managed by Supabase
- No sensitive data in application database

### 16.3 Input Sanitization

**Game Name:**
- Max length: 20 characters
- Allowed: Letters, numbers, spaces, hyphens
- Stripped: HTML tags, special characters
- Default: "Anonymous" if empty or invalid

---

## 17. Anti-Cheat System

### 17.1 Detection Methods

**Basic Pattern Analysis:**
1. **Multiple faces:** Flag if >1 face detected during gameplay
2. **No movement variance:** Flag if face position is static (possible photo)
3. **Unnatural blink patterns:** Flag if blink values are unnaturally consistent

### 17.2 Enforcement

**Suspicious Scores:**
- Flagged for manual review
- Not displayed on leaderboard initially
- Reviewed by admin (if implemented)

**Confirmed Cheating:**
- Score removed from leaderboard
- User account flagged (not banned, but monitored)

### 17.3 Limitations

**Acknowledged Gaps:**
- Tape on eyelids: Cannot detect
- Pre-recorded video: Basic detection only
- Deepfake-style manipulation: Not addressed

**Philosophy:** Basic detection is sufficient for MVP. Sophisticated anti-cheat is not cost-effective for a casual game.

---

## 18. Database Schema

### 18.1 Complete Schema

```sql
-- Users (managed by Supabase Auth)
-- auth.users table exists automatically

-- User Profiles
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  game_name TEXT DEFAULT 'Anonymous',
  best_time FLOAT,
  games_played INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scores
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  game_name TEXT NOT NULL,
  time_seconds FLOAT NOT NULL CHECK (time_seconds >= 0),
  is_disqualified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_scores_time ON scores(time_seconds DESC) WHERE is_disqualified = FALSE;
CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_scores_created ON scores(created_at DESC);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Scores: Public can view scores
CREATE POLICY "Public can view scores"
  ON scores FOR SELECT
  USING (TRUE);

-- Scores: Authenticated users can insert scores
CREATE POLICY "Authenticated users can insert scores"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Scores: Users cannot update or delete scores (immutable)
```

---

## 19. File Structure

```
stare/
├── src/
│   ├── App.svelte                    # Root component
│   ├── main.js                       # Entry point
│   ├── app.css                       # Global styles
│   │
│   ├── components/
│   │   ├── start/
│   │   │   ├── StartScreen.svelte          # Start screen container
│   │   │   ├── NameInput.svelte            # Name entry
│   │   │   ├── OAuthButton.svelte          # Sign in button
│   │   │   ├── CalibrationView.svelte      # Video + calibration overlay
│   │   │   └── StartButton.svelte          # Start game button
│   │   │
│   │   ├── game/
│   │   │   ├── Countdown.svelte            # 3-2-1-STARE
│   │   │   ├── GamePhase.svelte            # Active game container
│   │   │   ├── WebcamFeed.svelte           # Video element
│   │   │   ├── BoundingBox.svelte          # Calibration feedback
│   │   │   ├── TimerDisplay.svelte         # Live timer
│   │   │   └── PositionIndicator.svelte    # Status indicator
│   │   │
│   │   ├── results/
│   │   │   ├── Results.svelte              # Results screen
│   │   │   ├── ScoreDisplay.svelte         # Time display
│   │   │   ├── RankDisplay.svelte          # Rank title
│   │   │   ├── ReasonDisplay.svelte        # Loss reason
│   │   │   ├── ShareButton.svelte          # Share button
│   │   │   ├── PlayAgainButton.svelte      # Restart button
│   │   │   └── DisqualifiedBanner.svelte   # DQ notice
│   │   │
│   │   └── leaderboard/
│   │       ├── LeaderboardPreview.svelte   # Top 5 on start
│   │       ├── LeaderboardFull.svelte      # Top 10 on results
│   │       └── LeaderboardEntry.svelte     # Single entry
│   │
│   ├── stores/
│   │   ├── gameState.js                    # Game phase, timer, player info
│   │   ├── faceState.js                    # Detection status, blink values
│   │   ├── leaderboard.js                  # Score data
│   │   ├── authState.js                    # Authentication state
│   │   └── settings.js                     # Configurable thresholds
│   │
│   ├── services/
│   │   ├── mediapipe.js                    # MediaPipe wrapper
│   │   ├── camera.js                       # Camera management
│   │   ├── supabase.js                     # Database operations
│   │   ├── auth.js                         # OAuth handling
│   │   └── gameEngine.js                   # Core game logic
│   │
│   └── lib/
│       ├── utils/
│       │   ├── validation.js               # Input sanitization
│       │   ├── rank.js                     # Rank calculation
│       │   ├── time.js                     # Time formatting
│       │   └── performance.js              # FPS tracking
│       │
│       └── constants/
│           ├── ranks.js                    # Rank definitions
│           ├── calibration.js              # Calibration thresholds
│           └── messages.js                 # UI text
│
├── static/
│   └── favicon.png
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── policies/
│       └── 001_rls_policies.sql
│
├── .env.example
├── .env.local
├── .gitignore
├── index.html
├── vite.config.js
├── svelte.config.js
├── package.json
├── prd.md
├── stack.md
├── CLAUDE.md
├── architecture.md
└── spec.md
```

---

## 20. Implementation Phases

### Phase 1: Foundation (Week 1)

**Setup:**
- Initialize Svelte + Vite project
- Set up Supabase project
- Configure OAuth providers (Google, GitHub)
- Run database migrations

**Core Services:**
- Camera service implementation
- MediaPipe integration
- Authentication service
- Game engine skeleton

**Milestone:** Camera access working, MediaPipe detecting faces

### Phase 2: Calibration & Game Loop (Week 2)

**Calibration System:**
- Implement calibration criteria checks
- Build bounding box visualization
- Add text guidance system
- Create start screen UI

**Game Loop:**
- Implement countdown with baseline calibration
- Build timer system
- Add blink detection with dynamic threshold
- Implement position monitoring

**Milestone:** Playable game with calibration and detection

### Phase 3: Results & Leaderboard (Week 3)

**Results System:**
- Build results screen
- Implement ranking system
- Add disqualified state handling
- Create share functionality

**Leaderboard:**
- Implement score submission
- Build leaderboard display components
- Add caching logic
- Create user profile system

**Milestone:** Complete game loop with leaderboard integration

### Phase 4: Polish & Launch (Week 4)

**Polish:**
- Refine UI/UX based on testing
- Add error handling for all edge cases
- Implement loading states
- Optimize performance

**Testing:**
- Alpha testing with 5-10 users
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Calibration threshold tuning
- Bug fixes

**Launch:**
- Deploy to Vercel
- Soft launch with 50-100 users
- Monitor for 48 hours
- Public launch (Product Hunt, Reddit)

**Milestone:** Publicly launched game

---

## 21. Success Metrics

### MVP Success (First 2 Weeks)

- 100+ unique users
- 50%+ game completion rate
- 10%+ account creation rate
- <5% technical error rate

### Product-Market Fit (First 2 Months)

- 1,000+ unique users
- 25%+ return rate (play again within 7 days)
- 15%+ account creation rate
- 50+ daily leaderboard entries

### Viral Success (First 6 Months)

- 10,000+ unique users
- Viral coefficient >1.0
- Organic press coverage
- Clone attempts by others

---

## 22. Open Questions & Future Considerations

### Future Enhancements (Post-MVP)

**Phase 2 Features:**
- Result screen freeze frame (capture loss moment)
- Daily leaderboard (resets every 24h)
- Personal best tracking
- Hard mode (no smiling, head movement detection)
- Sound effects (optional, on by default)

**Phase 3 Features (If Metrics Justify):**
- User accounts with full profile pages
- Async multiplayer challenges
- Training mode with blink strength analysis
- Achievement system
- Regional leaderboards

### Technical Debt

**Known Limitations:**
- Desktop-only (mobile not addressed)
- Basic anti-cheat (sophisticated cheating not prevented)
- Single global leaderboard (no segmentation)
- No replay system (can't review disqualifications)

**Monitoring Needs:**
- Frame rate performance across devices
- Calibration success rate
- Disqualification reasons breakdown
- Account creation funnel drop-offs

---

## 23. PRD Updates Required

This specification modifies the original PRD in the following ways:

### Core Philosophy Changes

**Original:** "No authentication required"

**Updated:** Two-tier model:
- Anonymous play: Full game access, leaderboard view only
- Account play: OAuth required for leaderboard submission

### Rationale

This change:
1. Maintains zero friction for casual play
2. Ensures leaderboard integrity through verified identity
3. Enables persistent player profiles
4. Prevents leaderboard spam without CAPTCHAs
5. Creates clear value proposition for account creation

### Implementation Notes

- Anonymous players can still experience the full game
- Leaderboard visibility creates FOMO for accounts
- OAuth (Google, GitHub) minimizes signup friction
- Game name system allows privacy despite authentication
- Server-backed identity enables cross-device persistence

---

## Appendix A: Calibration Threshold Values

```javascript
// Calibration thresholds
const CALIBRATION = {
  faceDetection: {
    minConfidence: 0.7,
    minSizeRatio: 0.3,  // Face must be 30% of frame height
    centerMargin: 0.2   // 20% margin from edges
  },
  
  eyeDetection: {
    minConfidence: 0.5,
    bothEyesRequired: true
  },
  
  lighting: {
    minBrightness: 50,   // 0-255 scale
    maxBrightness: 230
  },
  
  blinkThreshold: {
    baselineMargin: 0.3,  // Threshold = baseline + 0.3
    debounceMs: 100       // Ignore blinks <100ms
  },
  
  positionMonitoring: {
    gracePeriod: 0,       // No grace period
    checkInterval: 100    // Check every 100ms
  }
};
```

---

## Appendix B: Rank Definitions

```javascript
const RANKS = [
  { maxTime: 3, title: "NPC Blink Speed" },
  { maxTime: 8, title: "Weak but Respectable" },
  { maxTime: 15, title: "Suspiciously Focused" },
  { maxTime: 25, title: "Villain Energy" },
  { maxTime: Infinity, title: "Probably Not Human" }
];
```

---

## Appendix C: Error Messages

```javascript
const MESSAGES = {
  camera: {
    denied: "Please allow camera access to play",
    notFound: "No camera found on this device",
    inUse: "Camera is being used by another application",
    failed: "Camera access failed. Please try again"
  },
  
  calibration: {
    moveCloser: "Move closer to the camera",
    centerFace: "Center your face in the frame",
    improveLighting: "Improve lighting for better detection",
    removeGlasses: "Try removing glasses for better detection",
    openEyes: "Please open your eyes normally for calibration",
    multipleFaces: "Only one person at a time, please"
  },
  
  game: {
    disqualifiedPosition: "Position lost. Round forfeited.",
    disqualifiedFace: "Face tracking lost. Round forfeited.",
    blinked: "You blinked"
  },
  
  auth: {
    oauthFailed: "Sign in failed. Please try again",
    sessionExpired: "Please sign in again",
    networkError: "Connection failed. Check your internet"
  }
};
```

---

**End of Specification**

This specification is based on comprehensive product interview conducted on 2026-05-08. All decisions reflect product requirements, technical constraints, and user experience considerations discussed during the interview process.

---

*Document prepared for: Do Not Blink Project*
*Tech Stack: Svelte 4 + Vite 5 + MediaPipe + Supabase + Vercel*
*Platform: Desktop Browsers Only*
*Target Launch: Q2 2026*
