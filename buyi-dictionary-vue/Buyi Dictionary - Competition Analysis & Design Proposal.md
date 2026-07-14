# Buyi Dictionary — Competition Analysis & Design Proposal

> This document enables AI, developers, and competition judges to quickly understand the project overview. It integrates core information from README, ARCHITECTURE, UI evaluation, deployment documentation, and other project documents.
>
> Last Updated: 2026-07-14

---

## I. Project Overview

### 1.1 Project Objectives

The Buyi Dictionary is a digital media application for preserving Buyi ethnic language and culture, providing vocabulary lookup, phrase learning, proverb inheritance, folk song appreciation, cultural exploration, and other features. The project includes both a Web frontend (Vue 3 SPA) and WeChat Mini Program, with a NestJS backend.

**Competition Goal**: Category B (Internet Application & Multimedia Works Application) at the 2026 Beijing University Student Digital Media Design Competition.

### 1.2 Tech Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| Web Frontend | Vue 3.4 + Vite 5.4 | Composition API + `<script setup>` |
| State Management | Pinia 2.1 | Combined and options API |
| Routing | Vue Router 4.2 | History mode + authentication guard |
| HTTP | Axios 1.6 | Interceptors + 401 auto token refresh |
| Styling | Native CSS Variables | No UI framework, Liquid Glass design system |
| Mini Program | Native WeChat Mini Program | pages/components/utils structure |
| Backend | NestJS + TypeORM | SQLite(development) / MySQL(production) |
| Database | SQLite / MySQL | sqljs for development, MySQL for production |

### 1.3 Existing Feature List

| Feature | Web | Mini Program | Status |
|---------|-----|-------------|--------|
| Home Portal | ✅ | ✅ | Complete, 7-block structure |
| Dictionary Search | ✅ | ✅ | Complete, supports Pinyin/Chinese/Buyi script |
| Phrase Query | ✅ | ✅ | Complete |
| Proverb Query | ✅ | ✅ | Complete |
| Folk Song List | ✅ | ✅ | Complete, but player is simulated |
| Folk Song Playback | ⚠️ | ⚠️ | **Simulated implementation**, no real audio |
| Cultural Exploration | ✅ | ✅ | Complete, but content is static |
| Learning Cards | ✅ | ✅ | Complete, 3D flip card interaction |
| Favorites Management | ✅ | ✅ | Complete |
| User Login | ✅ | ✅ | Complete, dual-token authentication |
| Learning Records | ✅ | ✅ | Complete |
| Dark Mode | ✅ | ❌ | Complete, light/dark/auto |
| AI Assistant | ✅ | ❌ | SSE streaming, backend-dependent |
| Accessibility | ✅ | ❌ | ARIA + keyboard navigation + reduced-motion |
| Admin Panel | ✅ | — | NestJS mounted at /admin-web |

### 1.4 Project Structure

```
BuyiDictionaryWeb/
├── buyi-dictionary-vue/          # Web Frontend (Vue 3 SPA)
│   ├── src/
│   │   ├── assets/               # Images + Style Tokens
│   │   │   ├── styles/
│   │   │   │   ├── variables.css       # Design tokens (color/font/shadow/dark mode)
│   │   │   │   ├── liquid-glass.css    # Liquid glass materials (hero/content/quiet levels)
│   │   │   │   └── main.css            # Base typography + skip-link
│   │   ├── components/
│   │   │   ├── layout/           # AppHeader, AppFooter
│   │   │   ├── common/           # PageShell, SearchBar, SearchModal, CursorGlow, FloatingParticles
│   │   │   └── specific/         # AudioPlayer, AgentPanel, ToneChart, BarChart, PatternDecoration
│   │   ├── views/                # 10 page views
│   │   ├── stores/               # 6 Pinia stores
│   │   ├── router/index.js       # Routing + auth guard
│   │   └── utils/api.js          # Axios wrapper + API object
│   └── vite.config.js            # Vite proxy /api → 127.0.0.1:3000
├── BuyiDictionaryApp-main/       # WeChat Mini Program + Backend
│   └── BuyiDictionaryApp-main/
│       ├── pages/                # Mini Program pages
│       ├── components/           # Mini Program components
│       ├── backend/              # NestJS Backend
│       │   ├── src/
│       │   │   ├── entities/     # TypeORM entities
│       │   │   ├── modules/      # Business modules
│       │   │   └── main.ts       # Entry point
│       │   └── uploads/buyi_audio/  # Real audio files
│       └── buyidict-api/         # Cloud Functions
└── buyi-dictionary-web-draft/    # Early HTML prototype
```

### 1.5 Route Table

| Path | View | Auth | Description |
|------|------|------|-------------|
| `/` | Home | Public | Brand entry + cultural museum landing |
| `/login` | Login | Public | Login/Register |
| `/dictionary` | Dictionary | Public | Comprehensive search + dual-column reading |
| `/culture` | Culture | Public | Static cultural showcase |
| `/songs` | Songs | Public | Folk song list + playback |
| `/learn` | Learn | Required | Flip card learning |
| `/profile` | Profile | Required | User dashboard |
| `/favorites` | Favorites | Required | Favorites list |
| `/record` | Record | Required | Learning records |
| `/settings` | Settings | Required | Settings |

---

## II. Competition Requirements Analysis

### 2.1 Basic Competition Information

| Item | Content |
|------|---------|
| Competition Name | 2026 Beijing University Student Digital Media Design Competition |
| Theme | Digital Creativity, Collaborative Innovation |
| Category | **Category B: Internet Application & Multimedia Works Application** |
| Organizer / Secretariat | Beijing Municipal Education Commission (organizer); Beijing Institute of Graphic Communication (undertaker and secretariat) |
| Registration Period | July 1 — September 20 |
| Submission Deadline | September 20 |
| Evaluation Period | October 15 — October 30 |

### 2.2 Core Requirements for Category B

1. **Must submit executable application** (Category A only requires video demonstration, Category B requires actual working software)
2. **Must submit screen demonstration video** (*.mov or *.avi, resolution 1920×1080 or higher)
3. **Application must run smoothly on Windows platform**
4. Works stored on USB flash drive or CD/DVD, with work name, content, contestant information clearly marked

### 2.3 Evaluation Dimensions

The competition evaluates works from three aspects: **Design Concept, Design Effect, Design Value**:

| Dimension | Evaluation Points | Project Alignment |
|-----------|-------------------|-------------------|
| Design Concept | Theme relevance, cultural value, social significance | Buyi language digital preservation, aligns with "Digital Creativity" theme |
| Design Effect | UI visuals, interaction experience, motion effects, multimedia presentation | Liquid Glass + indigo batik color scheme, but suffers from over-layered visuals |
| Design Value | Practicality, innovation, feasibility | Dictionary search is practical, but lacks content depth and innovation |

### 2.4 Award Ratios

| Award | Ratio |
|-------|-------|
| First Prize | Top 10% (or top 10 entries) |
| Second Prize | 11%-25% (or entries 11-25) |
| Third Prize | 26%-50% (or entries 26-50) |
| Excellence Award | 51%-70% (or entries 51-70) |

### 2.5 Key Participation Requirements

- Participants: Full-time students from Beijing area universities
- Encouraged inter-disciplinary, inter-major team formation
- Maximum 5 authors per team, listed in order
- Each school designates 1-2 competition contacts
- Registration form must be printed and stamped with department seal

---

## III. Project Defect Diagnosis

### 3.1 Surface Defects (Known Issues)

#### Defect 1: Simulated Audio Player (Critical)

**Status**: [player.js](src/stores/player.js) uses `requestAnimationFrame` to simulate progress, with hardcoded duration of 222 seconds (3:42). Real audio files are not connected.

**Impact**: Category B requires "executable application". Simulated playback will be considered incomplete by judges. Real audio files exist in backend `/uploads/buyi_audio/` (fenshoudiao.MP3, huiyouge.MP3, yushuiqing.MP3, etc.), but not connected to frontend.

**Severity**: Fatal

#### Defect 2: Uncompressed Image Assets (Performance)

**Status**:

| File | Size | Impact |
|------|------|--------|
| bg-vocabulary.jpg | 1,437 KB | Dictionary page load delay |
| bg-profile.png | 916 KB | Profile page load delay |
| bg-phrases.jpg | 616 KB | Phrases page load delay |
| bouyei-nature.jpg | 365 KB | Culture page oversized |
| bouyei-textile.jpg | 356 KB | Culture page oversized |

**Impact**: Affects page loading speed and live demonstration fluency.

**Severity**: High

#### Defect 3: Insufficient Content (Core Deduction)

**Status**: Project only provides word lookup, phrases, proverbs, and folk song list. Insufficient content for "digital media" competition requirements.

**Impact**: The "Design Value" evaluation dimension examines practicality and innovation. Insufficient content directly lowers scores.

**Severity**: High

#### Defect 4: Missing Supporting Documentation

**Status**: No work description document, no demo video script, and no project background research document. The official notice explicitly requires the runnable application and real screen demonstration video; it does not list a separate work description as a mandatory submission item, but the document is strongly recommended to make the design concept and cultural value legible to judges.

**Impact**: While not a separately listed mandatory file in the official notice, missing explanatory material makes it harder for judges to understand creative intent, cultural provenance, and technical innovation.

**Severity**: Medium

#### Defect 5: Unverified Windows Compatibility

**Status**: Build artifacts have not been tested on Windows Chrome/Edge browsers locally. SPA route fallback may fail under local file protocol.

**Impact**: Competition mandates "smooth operation on Windows platform".

**Severity**: High

### 3.2 Deeper Shortcomings (Structural Issues)

#### Shortcoming A: Lack of "Digital Media" Technical Innovation

**Problem**: This is a "Digital Media Design Competition", not an ordinary web development competition. The current project is essentially a "CRUD app with beautiful UI", lacking digital media technical innovations.

**Specific Manifestations**:
- No audio visualization (spectrum, waveform)
- No 3D/VR/AR elements
- No AI-driven intelligent features (only SSE chat, not highlighted)
- No interactive data visualization (only static tone curve and bar charts)
- No animation/motion narrative

**Improvement Directions**:
- Add real-time audio spectrum visualization to folk song playback (Web Audio API + Canvas)
- Add interactive 3D pattern rotation to cultural exploration (CSS 3D or Three.js)
- Add playable interactive piano keyboard for tone system
- Add speech synthesis to AI assistant (Buyi language pronunciation)
- Add loading sequence animation (Buyi pattern SVG path animation)

#### Shortcoming B: Cultural Content Stays at "Display" Level, Not "Experience"

**Problem**: The Cultural Exploration page ([Culture.vue](src/views/Culture.vue)) currently presents static text and images. Users can only passively read, without immersive cultural experience.

**Specific Manifestations**:
- Intangible cultural heritage content (batik, brocade, bronze drum) only has text description + one image
- Tone system has charts but not interactive
- Pattern symbols have SVG but not explorable
- No story narrative
- No audio/video multimedia content

**Improvement Directions**:
- Upgrade culture page from "information display" to "digital cultural museum"
- Add Buyi folk story module (text + images + reading audio)
- Add digital science popularization section (interactive cards for costumes, festivals, customs)
- Add click-to-expand details for pattern symbols (enlarged image + cultural origin + historical evolution)
- Add bilingual comparison learning module

#### Shortcoming C: Blurred Boundary Between Tool Pages and Narrative Pages

**Problem**: All pages use similar visual syntax, making the product feel like uniform template copies rather than pages with distinct personalities.

**Specific Manifestations**:
- Tool pages (dictionary, settings, login) also have "performative" elements
- Narrative pages (home, culture, songs) are not immersive enough
- Glass effects used with equal weight across site, no hierarchical distinction

**Improvement Directions**:
- Narrative pages (home/culture/songs): Preserve visual atmosphere, increase immersion
- Tool pages (dictionary/settings/favorites/records): Return to clarity and readability, weaken glass effect
- Strictly implement hero/content/quiet three-level material semantics

#### Shortcoming D: Lack of Motion Design Rhythm

**Problem**: Current motion effects are "everywhere but mediocre", lacking memorable motion design.

**Specific Manifestations**:
- All cards float on hover uniformly
- All glass elements follow mouse cursor
- All titles breathe and fade in
- No page transition animations
- No loading sequence

**Improvement Directions**:
- Keep motion effects only at key nodes (home Hero entrance, search pop-up, player expand)
- Add page transition animations (View Transitions API or CSS transitions)
- Add loading sequence animation
- Reduce motion density in non-critical areas

#### Shortcoming E: Lack of "Collaborative Innovation" Expression

**Problem**: Competition theme is "Digital Creativity, Collaborative Innovation", but the project lacks expression of the "collaborative" dimension.

**Improvement Directions**:
- Add fun quiz leaderboard (collaborative competition among users)
- Add learning community or sharing functions
- Emphasize inter-disciplinary collaboration process in work description document

---

## IV. To-Do List (Priority Ordered)

### P0: Critical Issues (Must Fix to Participate)

| # | Item | Reason |
|---|------|--------|
| 1 | Rewrite player with real audio playback | Simulated playback does not meet Category B "executable" requirement |
| 2 | Windows Chrome/Edge compatibility testing | Mandatory competition requirement |
| 3 | Record 1920×1080 screen demonstration video | Required submission material |

### P1: High Priority (Directly Affects Score)

| # | Item | Reason |
|---|------|--------|
| 4 | Compress all images to under 200KB | Affects loading speed and demo fluency |
| 5 | Add "Folk Stories" module | Solve insufficient content problem |
| 6 | Add "Fun Quiz" module | Increase interactivity and "collaborative innovation" |
| 7 | Enhance "Cultural Exploration" interactivity | Solve "display vs experience" issue |
| 8 | Write work description document | Assist judges in understanding creative intent |

### P2: Medium Priority (Enhance Competitiveness)

| # | Item | Reason |
|---|------|--------|
| 9 | Add "Bilingual Comparison Learning" module | Enrich learning features |
| 10 | Add "Digital Science Popularization" section | Increase cultural content volume |
| 11 | Add audio spectrum visualization to folk song playback | Digital media technical innovation highlight |
| 12 | Add interactive piano keyboard to tone system | Interactive data visualization |
| 13 | Add loading sequence animation to home page | Enhance first-impression memorability |
| 14 | Strengthen visual hierarchy between tool and narrative pages | Solve page personality differentiation |

### P3: Low Priority (Polishing)

| # | Item | Reason |
|---|------|--------|
| 15 | 3D rotation view for pattern symbols | Add 3D interaction element |
| 16 | Page transition animations | Improve overall smoothness |
| 17 | Add speech synthesis to AI assistant | Buyi language pronunciation |
| 18 | Clean up hardcoded colors in dark mode | Code quality |
| 19 | Fun quiz leaderboard system | "Collaborative innovation" expression |

---

## V. UI Design Proposal

### 5.1 Style Positioning

**Core Positioning: Digital Cultural Museum**

The project should not be a "glittering tech site", but a "Buyi Digital Cultural Museum". Visual language shifts from "special effects" to "materiality", from "everything glowing" to "few places having weight".

**Design Keywords**:

- Museum feel: Like museum exhibition, ordered, layered, breathing space
- Ethnicity: Indigo batik, brocade warm orange, silver ornament white, cultural symbols integrated into system
- Restrained beauty: Smaller highlight areas = higher quality, less glass = more importance
- Information first: Decoration should not overpower search, reading, learning tasks

**Brand Color System**:

| Token | Value | Semantic |
|-------|-------|----------|
| `--c-brand` | `#3A6B8C` | Indigo batik, primary brand color |
| `--c-accent` | `#D4883A` | Brocade warm orange, accent color |
| `--c-bg-warm` | Off-white | Warm background |
| `--c-bg-silver` | Silver-white | Cool background |
| `--c-text` | `#1B3A5C` | Deep indigo text |
| Dark mode background | `#0f1419` | Dark background |
| Dark mode brand | `#6BA3BE` | Lightened brand color |

**Typography System**:

| Token | Font | Usage |
|-------|------|-------|
| `--font-serif` | Noto Serif SC | Headings, cultural narrative |
| `--font-sans` | DM Sans | Body text, UI copy |
| `--font-mono` | JetBrains Mono | Data, tags, numbers |

### 5.2 Page Architecture & Personality Differences

Project pages are categorized into three types, each with distinct visual temperament:

#### Narrative Pages (Atmosphere Priority)

| Page | Position | Design Keywords |
|------|----------|-----------------|
| Home | Brand entry + cultural museum landing | Large images, whitespace, single search action, loading sequence |
| Culture | Content exhibition | Image narrative, pattern interaction, playable tones, science cards |
| Songs | Immersive content entry | Cover anchors, spectrum visualization, clear list |
| Stories (New) | Text-image narrative + reading | Magazine layout, immersive reading, audio embedded |

#### Tool Pages (Clarity Priority)

| Page | Position | Design Keywords |
|------|----------|-----------------|
| Dictionary | Reading-type workspace | Flat list, focused details, clear interaction |
| Learn | Single-task learning interface | Learning card centered, statistics secondary |
| Bilingual (New) | Comparison learning tool | Sentence-by-sentence cards, pronunciation buttons, progress tracking |
| Quiz (New) | Interactive quiz | Instant feedback, scoring animation, results display |

#### Management Pages (Lightweight Priority)

| Page | Position | Design Keywords |
|------|----------|-----------------|
| Profile | Information dashboard | Light glass, chart cards, badge wall |
| Favorites | Favorites list | Flat list, quick scanning |
| Record | Learning records | Timeline, statistical overview |
| Settings | Tool settings | Grouped cards, toggle switches |
| Login | Form | Hero glass, form focus |

### 5.3 Home Page Restructuring Proposal

Current home page is a 7-block linear structure. Improved as "Digital Cultural Museum" immersive narrative:

```
┌─────────────────────────────────┐
│  Loading Sequence               │
│  (Buyi Pattern SVG Path Anim)   │
│  → Transition to Hero           │
├─────────────────────────────────┤
│  Hero Cover                     │
│  Full-screen terrace background │
│  + indigo overlay               │
│  Title: Buyi Dictionary         │
│  (Noto Serif SC)                │
│  Single search entry (⌘K)       │
│  Particles reduced to 8         │
├─────────────────────────────────┤
│  EXHIBIT 01 · Word Lookup       │
│  Vertical entry list            │
│  Today's recommended entry      │
├─────────────────────────────────┤
│  EXHIBIT 02 · Patterns & Crafts │
│  Triple cultural cards          │
│  (Batik/Brocade/Silver)         │
│  Image-led, light framing       │
├─────────────────────────────────┤
│  EXHIBIT 03 · Buyi Folk Songs   │
│  Full-screen background         │
│  + indigo overlay               │
│  CTA: Listen to Buyi Melodies   │
├─────────────────────────────────┤
│  Breathing Space (whitespace)   │
├─────────────────────────────────┤
│  EXHIBIT 04 · Learning Progress │
│  Logged-in: stats + badges      │
│  Not logged-in: login prompt    │
├─────────────────────────────────┤
│  EXHIBIT 05 · Platform Stats    │
│  Four-grid statistics           │
│  (number counting animation)    │
├─────────────────────────────────┤
│  New Entry Zone                 │
│  Folk Stories / Fun Quiz        │
│  / Bilingual Learning           │
├─────────────────────────────────┤
│  Closing CTA                    │
│  Enter Dictionary               │
└─────────────────────────────────┘
```

### 5.4 Material Layer System

Liquid Glass has established three-level semantics, which must be strictly implemented:

| Level | Class | Usage | Visual Characteristics |
|-------|-------|-------|------------------------|
| Hero | `liquid-glass-hero` | Hero sections, search modals, login cards | Thicker, brighter, more depth |
| Content | `liquid-glass-content` | Detail panels, learning cards, cultural descriptions | Slight blur, emphasis on readability |
| Quiet | `liquid-glass-quiet` | Stat cards, settings groups, list items | Almost no glow, boundary only |

**Implementation Principles**:
1. Keep only one "brightest" visual focus per screen
2. Not all cards need glass; secondary content should be flatter
3. Smaller highlight area = higher quality feel
4. Less glass = more importance

### 5.5 Motion Design Strategy

Converge from "motion everywhere" to "orchestrated motion at key nodes":

**Retained Motions**:
- Home Hero entrance (staggered reveal, increasing animation-delay)
- Search modal pop-up (scale + opacity transition)
- Player expand/collapse (height transition)
- Folk song cover breathing (4s cycle when playing)
- Scroll-triggered entrance (IntersectionObserver, threshold 0.15)
- Stat number counting animation (cubic easing)

**Reduced Motions**:
- All cards floating on hover → only interactive cards
- All glass following mouse → only Hero area
- All titles breathing → removed
- Multiple layer particles → reduced to 6-8

**New Motions**:
- Loading sequence (SVG path animation, Buyi pattern unfolds)
- Page transitions (View Transitions API or CSS fade)
- Quiz correct/wrong feedback (scale bounce + color flash)
- Audio spectrum visualization (Web Audio API + Canvas real-time)

**Motion Specifications**:
- All motions respect `prefers-reduced-motion`
- Animate only `transform` / `opacity`
- Hover effects limited with `@media (hover: hover)` to avoid touch stickiness
- Unified easing function: `cubic-bezier(0.32, 0.72, 0, 1)`

### 5.6 Ethnic特色 Expression Strategy

Cultural elements should not stay at "decorative symbol" level; they should integrate into typographic order, grid structure, illustration language, and page rhythm:

| Level | Expression | Current State | Improvement |
|-------|------------|---------------|-------------|
| Color | Indigo batik + brocade orange + silver white | ✅ Existing | Maintain |
| Typography | Noto Serif SC for cultural headings | ✅ Existing | Maintain |
| Patterns | PatternDecoration SVG decoration | ⚠️ Decorative only | Convert to loading animation, dividers, button textures |
| Layout | Exhibition numbering (EXHIBIT 01/02/03) | ✅ Existing | Extend to new pages |
| Content | Batik/Brocade/Bronze drum/Folk songs | ⚠️ Superficial | Add folk stories, science sections, bilingual comparison |
| Interaction | Tone curve chart | ⚠️ Static | Add playable piano keyboard |
| Audio | Folk song playback | ⚠️ Simulated | Connect real audio + spectrum visualization |

---

## VI. Logic Design Proposal

### 6.1 Functional Architecture

```
Buyi Dictionary
├── Knowledge Query
│   ├── Dictionary Search (Pinyin/Chinese/Buyi)
│   ├── Phrase Query
│   ├── Proverb Query
│   └── Comprehensive Search (searchApi.search)
├── Cultural Exploration
│   ├── Language Features (distribution/tone/writing)
│   ├── Intangible Heritage (batik/brocade/bronze drum)
│   ├── Pattern Symbols (interactive expand)
│   ├── Tone System (playable piano) [NEW]
│   ├── Digital Science (costumes/festivals/customs) [NEW]
│   └── Folk Stories (text+images+reading) [NEW]
├── Folk Song Appreciation
│   ├── Folk Song List
│   ├── Real Audio Playback [FIX]
│   ├── Audio Spectrum Visualization [NEW]
│   └── Playlist/Loop/Volume [NEW]
├── Learning Center
│   ├── Flip Card Learning
│   ├── Bilingual Comparison [NEW]
│   ├── Fun Quiz [NEW]
│   ├── Learning Records
│   └── Achievement Badges
├── User System
│   ├── Login/Register (dual-token)
│   ├── Profile
│   ├── Favorites Management
│   └── Settings (theme/preferences)
└── AI Assistant
    └── SSE Streaming Q&A
```

### 6.2 Data Flow

```
User Action → Vue Component → Pinia Store → Axios → NestJS Backend → TypeORM → Database
                ↑                                    ↓
                └────── Response Data ←──────────────┘

Audio Playback Flow:
User clicks play → playerStore.playSong(song) → Audio element loads file
  → audio.play() → timeupdate event → update currentTime/duration
  → progress bar responds → on drag: audio.currentTime = newTime

SSE Streaming:
User asks question → agentStore.ask(question) → fetch POST /miniapp/agent/ask
  → ReadableStream reader → parse data: JSON chunks → append to messages
```

### 6.3 Route Planning (Including New Pages)

| Path | View | Auth | Status | Description |
|------|------|------|--------|-------------|
| `/` | Home | Public | Refactor | Digital cultural museum entrance |
| `/login` | Login | Public | Existing | Login/Register |
| `/dictionary` | Dictionary | Public | Existing | Dictionary search |
| `/culture` | Culture | Public | Refactor | Interactive cultural exploration |
| `/songs` | Songs | Public | Fix | Folk songs + real playback |
| `/stories` | Story | Public | **NEW** | Folk stories |
| `/quiz` | Quiz | Public | **NEW** | Fun quiz |
| `/bilingual` | Bilingual | Required | **NEW** | Bilingual comparison |
| `/learn` | Learn | Required | Existing | Flip card learning |
| `/profile` | Profile | Required | Existing | User dashboard |
| `/favorites` | Favorites | Required | Existing | Favorites |
| `/record` | Record | Required | Existing | Learning records |
| `/settings` | Settings | Required | Existing | Settings |

### 6.4 State Management (Pinia Stores)

| Store | State | Changes |
|-------|-------|---------|
| `auth.js` | token/refreshToken/userInfo | None |
| `player.js` | currentSong/isPlaying/currentTime/duration | **Rewrite**: Audio API driven |
| `favorites.js` | favorites/isLoading | None |
| `theme.js` | mode/resolved | None |
| `search.js` | isOpen | None |
| `agent.js` | messages/loading/contextPath | None |
| `quiz.js` (NEW) | score/currentQuestion/answers/streak | **NEW**: Quiz state |

### 6.5 New Module Designs

#### 6.5.1 Folk Stories Module (`/stories`)

**Features**:
- Story list page: Card display with cover image, title, summary
- Story detail: Text-image layout, cultural annotation sidebar, reading audio playback
- Data source: Backend contentApi or frontend static data (initial phase)

**Component Structure**:
```
Story.vue
├── StoryList (story list)
│   └── StoryCard (cover + title + summary)
├── StoryDetail (expanded detail)
│   ├── Text-image content
│   ├── Cultural annotation sidebar
│   └── AudioPlayer (reuse global player)
└── StoryTimeline (timeline navigation, optional)
```

#### 6.5.2 Fun Quiz Module (`/quiz`)

**Features**:
- Multiple choice: Buyi vocabulary → select Chinese meaning (or reverse)
- Instant feedback: Correct/wrong motion effect + vocabulary explanation
- Scoring system: +10 for correct, bonus for consecutive correct
- Result page: Total score, accuracy rate, wrong answer review

**Component Structure**:
```
Quiz.vue
├── QuizStart (start page: rules + start button)
├── QuizQuestion (question area)
│   ├── Question (Buyi word + pronunciation button)
│   ├── Option list (4 choices)
│   └── Feedback (correct ✓ / wrong ✗)
├── QuizResult (result page)
│   ├── Score + accuracy
│   ├── Wrong answer review
│   └── Play again / Share
└── quiz.js store (score/currentIndex/answers)
```

#### 6.5.3 Bilingual Comparison Learning Module (`/bilingual`)

**Features**:
- Sentence-by-sentence comparison cards: Buyi original + Chinese translation
- Click-to-pronounce: Play corresponding audio via Audio API
- Learning progress tracking: Learned/unlearned markers
- Follow-along recording comparison (optional, Web Speech API)

**Component Structure**:
```
Bilingual.vue
├── Comparison card list
│   └── BilingualCard
│       ├── Buyi sentence + pronunciation button
│       ├── Chinese translation
│       └── Cultural annotation (optional)
├── Progress bar (learned/total)
└── Control bar (prev/next/auto play)
```

#### 6.5.4 Interactive Tone System

**Features**:
- 6 even tones → 6 piano keys
- Click key to play example word audio for that tone
- Tone curve chart highlights corresponding tone value
- Keyboard support (1-6 number keys)

**Component Structure**:
```
TonePiano.vue (new component)
├── Piano keyboard (6 keys, 6 tone values)
├── Current tone display (name + value + description)
├── Example word display
└── Link with ToneChart (highlight current tone)
```

#### 6.5.5 Audio Spectrum Visualization

**Features**:
- Real-time spectrum display when playing folk songs
- Use Web Audio API AnalyserNode to get frequency data
- Canvas draw spectrum bar chart
- Spectrum pauses when playback paused

**Technical Solution**:
```
AudioPlayer.vue
├── Audio element
├── AudioContext → MediaElementSource → AnalyserNode
├── Canvas spectrum drawing (requestAnimationFrame)
└── Spectrum style: indigo gradient bars, echoing brand color
```

---

## VII. Project Documentation Integration Summary

> Below are key information extracts from various Markdown documents in the project, enabling AI to quickly understand the project without reading original documents.

### 7.1 Web Frontend README Summary

- **Location**: `buyi-dictionary-vue/README.md`
- **Core Info**: Vue 3 + Vite build, Liquid Glass design + Buyi indigo batik color scheme
- **Features**: Dictionary search, cultural exploration, folk song playback, learning cards, favorites, dark mode, accessibility, AI assistant
- **Backend Proxy**: Vite proxy forwards to `http://127.0.0.1:3000`
- **Startup**: `npm install` → `npm run dev` (default port 5173)

### 7.2 Web Frontend ARCHITECTURE Summary

- **Location**: `buyi-dictionary-vue/ARCHITECTURE.md`
- **Tech Stack**: Vue 3.4 + Vite 5.4 + Pinia 2.1 + Vue Router 4.2 + Axios 1.6
- **6 Stores**: auth, player, favorites, theme, search, agent
- **API Wrapper**: baseURL `/api`, request interceptor adds token, response interceptor auto-refreshes on 401
- **Design System**: CSS variable tokens, three-level materials (hero/content/quiet), `prefers-reduced-motion` support
- **Known Bugs**:
  - Simulated player (rAF + hardcoded 222s)
  - 5 uncompressed images (1.4MB/916KB/616KB/365KB/356KB)
  - SSE streaming backend-dependent
- **Fixed Items**: Flip card keyboard accessibility, progress bar touch drag, dark mode repaint, div+click to button, skip-link focus-visible, etc.

### 7.3 UI Design Evaluation Summary

- **Location**: `buyi-dictionary-vue/UI设计评估与优化建议.md` + `UI设计评估与优化建议-已落地.md`
- **Core Judgment**: UI direction is correct, but "style too full, too average, too forced"; liquid glass overused loses hierarchy
- **Implemented**: Three-level material semantics, background motion convergence, boundary between tool and narrative pages
- **Page Positioning**:
  - Home: Brand entry + cultural museum landing
  - Dictionary: Reading-type workspace
  - Culture: Content exhibition
  - Songs: Immersive content entry
  - Management/Settings: Light glass, weak decoration, high readability
- **Still Needs Iteration**: Clean hardcoded rgba, dark mode page-by-page walkthrough, culture page layout rhythm

### 7.4 Backend README Summary

- **Location**: `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/README.md`
- **Core Info**: NestJS backend, provides `/api/miniapp/*` and `/api/admin/*` endpoints
- **Auth**: access token + refresh token dual-token, session-level logout
- **Features**: Swagger docs, Excel import/export, media upload validation, production environment strict validation
- **Production Deployment**: Must switch to MySQL, disable DB_SYNCHRONIZE, configure real WeChat credentials, use COS storage

### 7.5 Deployment Documentation Summary

- **Location**: `BuyiDictionaryApp-main/BuyiDictionaryApp-main/项目部署与前后端联动说明.md`
- **Project Structure**: Mini Program frontend + admin frontend + NestJS backend
- **Local Dev**: Backend `npm run start:dev` (127.0.0.1:3000), Mini Program via WeChat DevTools
- **Admin**: admin / Admin@123456
- **Production Deployment**: Linux + Nginx + PM2 + MySQL + HTTPS domain
- **Web Frontend Deployment**: `npm run build` → static files to Nginx, `/api/` proxies to backend
- **Key Principle**: Mini Program production requires HTTPS, no HTTP IP addresses

### 7.6 Web Interface Guidelines Review Summary

- **Location**: `buyi-dictionary-vue/.trae/documents/web-frontend-guidelines-review-report.md`
- **Compliant**: Interactive element semantics, focus management, reduced motion preference, image sizing/loading strategy, copy details
- **Needs Improvement**: Hardcoded rgba in dark mode, few decorative shadows not tokenized, chart components need standardization

---

## VIII. Summary

### Project Strengths

1. **Excellent Topic**: Buyi language digital preservation, aligns with "Digital Creativity" theme, has cultural and social value
2. **Mature Design System**: Liquid Glass + indigo batik color scheme has good recognition, three-level material semantics established
3. **Complete Full Stack**: Vue Web + WeChat Mini Program + NestJS backend, multi-platform coverage
4. **Comprehensive Accessibility**: ARIA, keyboard navigation, reduced-motion support
5. **Standard Architecture**: Pinia state management, Axios wrapper, route authentication

### Project Weaknesses

1. **Simulated Player**: Fatal issue, does not meet Category B "executable" requirement
2. **Insufficient Content**: Only dictionary lookup, lacks multimedia interactive content
3. **Lack of Digital Media Innovation**: No audio visualization, no 3D interaction, no AI highlights
4. **Insufficient Cultural Experience**: Static display, lacks immersive interaction
5. **Missing Supporting Materials**: No work description, no demo video
6. **Unverified Windows Compatibility**: Mandatory competition requirement

### Award Winning Strategy

With "Buyi Digital Cultural Museum" as the core concept, pursue first prize through:

1. **Fix Critical Issues** (player + Windows compatibility)
2. **Add Digital Media Innovation Highlights** (audio spectrum, interactive tone piano, loading sequence)
3. **Expand Content Depth** (folk stories, fun quiz, bilingual comparison, digital science)
4. **Strengthen Ethnic特色** (patterns integrated into system, cultural narrative, audio multimedia)
5. **Complete Supporting Materials** (work description document, demo video script)

---

## IX. 2026-07-14 Current-State Addendum

> This addendum is based on the official 2026 competition notice and a local repository check performed on 2026-07-14. When an earlier proposal statement conflicts with this section, this section is the current source of truth. Official source: [北京市教育委员会《关于举办2026年北京市大学生数字媒体设计竞赛的通知》](https://jw.beijing.gov.cn/gjc/tzgg_15688/202606/t20260623_4711507.html).

### 9.1 Official Requirement Verification

The official notice confirms the following requirements relevant to this project:

| Requirement | Verified rule | Project consequence |
|-------------|---------------|---------------------|
| Category | B: Internet Application and Multimedia Works Application | The final application must be a completed, actually runnable application; a concept video alone is insufficient. |
| Screen recording | A real screen demonstration video in `.mov` or `.avi`, 1920×1080 or higher | The recording must show the real build and real interactions, including search, culture, and audio playback. |
| Runtime platform | The application must run smoothly on Windows | Chrome/Edge verification on a clean Windows machine is a release gate, not an optional polish task. |
| Submission medium | VCD/DVD data disc or USB drive, labelled with work name, content, authors, contact details, school, and instructor | The team needs a reproducible local package and a clear directory/label convention. |
| Registration and submission | July 1–September 20; work submission deadline is September 20 | Internal freeze should happen before the deadline to leave time for rehearsal and packaging. |
| Registration form | Printed form, accurate and unaltered, stamped by the university or department | This is an administrative task owned by the team, not a software feature. |
| Team and school contact | Up to five authors; each school designates one or two competition contacts | Confirm author order, instructor information, and the school contact before final packaging. |

The notice also states that submitted discs/USB drives are not returned. Keep a complete backup of the source code, database, media assets, build output, and final video outside the submission medium.

### 9.2 Verified Current Baseline

| Area | Local evidence checked on 2026-07-14 | Current conclusion | Competition implication |
|------|--------------------------------------|--------------------|------------------------|
| Production build | `npm run build` passes with Vite 5.4.21; 147 modules transformed | Build pipeline is currently functional | This proves buildability, but not Windows runtime compatibility or backend availability. |
| UI direction | Current working tree contains the liquid-glass convergence work across 16 frontend files | Partially implemented: material hierarchy, quieter effects, route-level visual distinction, and focus states have progressed | This directly improves Design Effect; the final build must include and visually review these changes. |
| Search interaction | Search controls include visible focus states; the search modal adds listbox/active-descendant semantics | Accessibility work is present but not end-to-end tested | Keyboard-only and screen-reader smoke tests are still required before recording. |
| Folk-song page | `/songs` loads song content through `contentApi`, has hero/list presentation and playback controls | Page presentation is usable; playback implementation is not complete | The visual player must not be presented as a completed multimedia feature until real audio is connected. |
| Audio implementation | `src/stores/player.js` still advances time with `requestAnimationFrame` and falls back to 222 seconds; `AudioPlayer.vue` has no real `<audio>` playback flow | **P0 remains open** | This is the largest gap against the Category B “actually runnable application” requirement. |
| Existing media | Backend contains real files under `backend/uploads/buyi_audio/`, including `fenshoudiao.MP3`, `huiyouge.MP3`, and `yushuiqing.MP3` | Media assets exist, but the Web player does not yet map song records to playable URLs | Reuse the existing assets after confirming rights, MIME handling, CORS, and production paths. |
| Routes and content | Current router has the existing 10 routes; `/stories`, `/quiz`, and `/bilingual` are not implemented | New content modules remain proposals, not current features | Do not claim these modules in the demo or submission description until they exist and are tested. |
| API deployment | Current working tree points Axios to `http://39.105.201.88:3000/api`, while the README describes a relative `/api` proxy | Environment configuration is inconsistent | The final package must choose a stable local-backend or hosted-backend strategy; do not depend on an undocumented hardcoded endpoint. |
| Asset size | The latest build output contains 9 image assets above 200 KB; the largest is about 1.4 MB | Image optimization remains open | Large assets can hurt live demonstration fluency and should be handled before recording. |

### 9.3 Revised Release Gates

The following gates supersede the earlier feature-first ordering. New feature modules should not delay the mandatory gates.

#### P0 — Must pass before the work can be called submission-ready

1. **Real audio playback**: replace the simulated progress loop with an `HTMLAudioElement` or equivalent media flow. The player must load a real file, derive duration from metadata, support play/pause, seek, end-of-track handling, and show an error state when a file is unavailable.
2. **Reproducible runtime package**: decide whether the USB package runs a local backend or uses a stable hosted service. Document the decision, remove environment-specific assumptions, and verify the package from a clean Windows machine.
3. **Windows compatibility rehearsal**: test the production build in current Windows Chrome and Edge, including direct launch, route navigation, refresh/deep links, API requests, images, and audio.
4. **Real screen demonstration**: record a 1920×1080-or-higher `.mov`/`.avi` video from the same build that is submitted. The video must show actual working states rather than mocked progress or design slides.
5. **Submission administration**: complete the stamped registration form, author order, instructor information, school contact, USB label, and backup copies.

#### P1 — Direct score and presentation impact

1. Compress or convert the nine large image assets, then recheck visual quality and loading behavior.
2. Produce the work description with four explicit claims: cultural problem, user journey, design concept, and technical/media innovation. Each claim should be backed by a screen or interaction in the submitted build.
3. Improve the Culture page from static reading to at least one demonstrable interaction, such as expandable pattern provenance, playable tone examples, or an annotated cultural timeline.
4. Add source/provenance notes and usage permissions for Buyi text, photographs, recordings, illustrations, and generated assets.

#### P2 — Add only after P0 and P1 are closed

Audio spectrum visualization, interactive tone piano, folk stories, bilingual comparison, and the fun quiz can become score-enhancing highlights. They should be implemented as a small number of reliable, well-presented interactions rather than several incomplete routes.

### 9.4 Definition of Done and Evidence Matrix

| Gate | Pass criterion | Evidence to keep |
|------|----------------|------------------|
| Clean launch | A reviewer can follow the README and start the app on Windows without relying on the developer’s machine state | Launcher/instructions, dependency versions, startup screenshot |
| Route stability | Home, dictionary, culture, songs, login, and protected pages load; refreshing a deep link does not produce a blank page | Test log with URL and result for each route |
| Dictionary | Search works with Chinese, Pinyin, and Buyi-script input, including empty, loading, no-result, and error states | Short screen capture or checklist |
| Culture | At least one cultural interaction has a visible response and explanatory context | Screenshot/video timestamp and content source note |
| Audio | A real file plays, pauses, seeks, reaches its actual end, and recovers from an unavailable file | Windows Chrome/Edge test record plus media URL/file mapping |
| Accessibility | Keyboard focus is visible; modal focus is usable; reduced-motion mode does not block the main task | Keyboard smoke-test checklist |
| Performance | Image loading is acceptable during a live demo and no console-blocking error prevents the main flow | Build output, browser console check, optional Lighthouse record |
| Video | The video is real, horizontal, `.mov` or `.avi`, and at least 1920×1080 | Final video metadata and checksum |
| Package | USB contains the runnable application, backend/data/media if needed, README, video, and backup manifest | Final directory listing and backup location |

### 9.5 Suggested Execution Sequence

This is an internal delivery sequence aligned to the September 20 official deadline; it can be shifted according to team availability.

| Window | Focus | Exit condition |
|--------|-------|----------------|
| July 14–17 | Real audio and runtime strategy | One complete song plays from the intended deployment path; no simulated duration remains in the demo path |
| July 18–21 | Windows build and route/API rehearsal | Clean-machine Chrome/Edge test passes for the main route and API flows |
| July 22–28 | Image optimization, culture interaction, content/provenance cleanup | P1 evidence exists and the main journey is stable |
| July 29–August 7 | Work description, screenshots, and video script | Every claim in the description maps to a working screen or interaction |
| August 8–15 | Final polish and recording | Final candidate build and video pass the evidence matrix |
| August 16–September 10 | Freeze, backup, and repeated rehearsal | No feature changes without a regression check; package can be rebuilt from backup |
| Before September 20 | Registration and submission | Stamped form and labelled USB/disc are delivered with a retained backup |

### 9.6 Recommended Submission Package

Use a simple, judge-friendly structure. The exact launcher name can be decided after the local/hosted runtime strategy is fixed.

```text
BuyiDictionary_2026_B/
├── 01_Runnable_Application/
│   ├── README_Windows.md
│   ├── start-windows.bat              # if a local backend is required
│   ├── frontend-dist/                 # final Web build
│   ├── backend/                       # only if required by the chosen package
│   └── data-and-media/                # database and audio assets, if local
├── 02_Demo_Video/
│   └── BuyiDictionary_Demo_1920x1080.mov
├── 03_Work_Description/
│   ├── BuyiDictionary_Work_Description.pdf
│   ├── Screenshots/
│   └── Asset_Provenance.md
├── 04_Registration/
│   └── Registration_Form_Copy.pdf
└── 05_Backup_Manifest/
    └── SHA256SUMS.txt
```

The package should state clearly whether Internet access is required. If the application depends on a remote API, include a fallback/demo mode or a tested local service; a USB submission that silently depends on an unavailable IP address is not a reliable executable deliverable.

### 9.7 Updated Decision Summary

The project is currently in a strong visual refinement stage but not yet at the Category B submission baseline. The immediate success condition is not the number of planned pages; it is a repeatable Windows demonstration in which dictionary search, cultural content, and real audio all work from the submitted package. Once that path is stable, the best score gain will come from one or two distinctive cultural-media interactions supported by clear provenance and a concise work description.
