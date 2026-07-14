# Buyi Dictionary Web - Frontend Acceptance Report

**Project**: `buyi-dictionary-vue`  
**Date**: 2026-07-15  
**Scope**: Frontend-only review (logic, UI, structure, aesthetics)

---

## 🔴 P0 - Critical Issues (Must Fix)

### Issue 1: Dictionary Pronunciation Playback Not Implemented

**Severity**: P0  
**File**: `src/views/Dictionary.vue`  
**Lines**: 180–182

**Description**:  
The "Play Pronunciation" button in the dictionary detail panel is a core feature, but the `handlePlay` function only shows a toast message. It never actually invokes any audio playback capability. Even when a word has an `audioUrl`, no audio is played.

**Code snippet**:
```javascript
function handlePlay(item) {
  notify(item.audioUrl
    ? '该词条已收录发音，播放能力将在播放器接入后提供。'
    : '该词条暂未收录可播放发音。')
}
```

**Impact**: Users cannot hear the actual pronunciation of Buyi words — the dictionary's core value is severely diminished.

---

### Issue 2: Quiz.vue Missing RouterLink Import Causes Runtime Error

**Severity**: P0  
**File**: `src/views/Quiz.vue`  
**Lines**: 76, 128

**Description**:  
The template uses `<RouterLink>` components (for "先去文化页看看" and "回到文化页"), but `RouterLink` is never imported in `<script setup>`. This causes a runtime failure and the entire quiz page becomes unusable.

**Impact**: Quiz page is completely broken — a functional blocker.

---

### Issue 3: Token Refresh Does Not Sync with Auth Store State

**Severity**: P0  
**File**: `src/utils/api.js`  
**Lines**: 44–57

**Description**:  
The auto token-refresh logic in the response interceptor writes directly to `localStorage`, but the reactive `token` and `refreshToken` variables in the auth store are **never updated**. After a silent refresh:

- `isLoggedIn` computed property still reflects the old token state
- Any logic that reads `authStore.token` gets a stale value
- Manual logout may use the stale token

**Related store**: `src/stores/auth.js`

**Impact**: Inconsistent auth state across the app; features relying on the store may behave unpredictably after a token refresh.

---

### Issue 4: Favorite List Data Is Incomplete, Causes Broken Display

**Severity**: P0  
**File**: `src/stores/favorites.js`  
**Lines**: 36–39

**Description**:  
When `toggleFavorite` adds a new favorite, only `contentType` and `contentId` are stored — no title, Chinese translation, or other display fields. However, `Favorites.vue` expects `item.title`, `item.buyiText`, `item.zhText`, `item.subtitle`, and `item.chinese` to render each row. Newly favorited items fall back to showing `#${contentId}`, which is essentially unreadable.

**Code snippet**:
```javascript
if (result.favorited) {
  if (!isFavorite(contentType, contentId)) {
    favorites.value.unshift({ contentType, contentId })
  }
}
```

**Impact**: Users cannot identify newly favorited items in the favorites list — severely broken UX.

---

## 🟠 P1 - Important Issues (Should Fix)

### Issue 5: Footer Links Are Plain Text, Not Clickable

**Severity**: P1  
**File**: `src/components/layout/AppFooter.vue`  
**Lines**: 23–25

**Description**:  
Under the "关于" (About) section, three links — "项目介绍" (About), "使用帮助" (Help), "联系我们" (Contact) — are rendered as `<span class="footer-link-text">` instead of clickable `<RouterLink>` or `<a>` tags. Users see link labels but cannot navigate to them.

**Code snippet**:
```html
<div class="footer-section">
  <h4>关于</h4>
  <span class="footer-link-text">项目介绍</span>
  <span class="footer-link-text">使用帮助</span>
  <span class="footer-link-text">联系我们</span>
</div>
```

**Impact**: Incomplete information architecture; gives the impression of an unfinished product.

---

### Issue 6: Learning Records May Be Duplicated

**Severity**: P1  
**File**: `src/views/Learn.vue`  
**Lines**: 60–76, 78–92

**Description**:  
`nextWord` automatically records a `view` action when advancing to the next word (lines 82–87). Separately, the "复习" (Review) button also calls `recordsApi.create` with `actionType: 'view'` (lines 67–71). If a user taps "Review" and then "Next", the same word gets recorded **twice** under the same action type.

**Impact**: Inflated learning statistics; inaccurate learning history data.

---

### Issue 7: AgentPanel Uses an Undefined CSS Class

**Severity**: P1  
**File**: `src/components/specific/AgentPanel.vue`  
**Line**: 109

**Description**:  
The side panel's root element has the class `glow-card`, but this class is defined neither in the component's scoped styles nor in any global stylesheet. It appears to be leftover / dead code from an earlier iteration.

**Code snippet**:
```html
<section
  id="agent-panel"
  ref="panelRef"
  class="agent-panel liquid-glass glow-card"
```

**Impact**: Not a functional bug, but signals incomplete code cleanup and may hint at other leftover logic.

---

### Issue 8: Default Profile Avatar Uses Emoji Instead of SVG Icon

**Severity**: P1  
**File**: `src/views/Profile.vue`  
**Line**: 88

**Description**:  
The default avatar uses the `👤` emoji, which has several problems:
1. Renders inconsistently across platforms (Windows, macOS, iOS, Android all show different glyphs)
2. Clashes with the overall SVG linear-icon design language
3. An `IconUser` component already exists in the project but is not used here

**Code snippet**:
```html
<span v-else class="avatar-icon">👤</span>
```

**Impact**: Design inconsistency; reduces perceived polish.

---

### Issue 9: Search Modal Lacks History Management Controls

**Severity**: P1  
**File**: `src/components/common/SearchModal.vue`  
**Lines**: 319–330

**Description**:  
The recent-searches list supports viewing and re-querying only. Missing:
- Delete single search history item
- Clear all search history

Users cannot manage their own search history — poor privacy and controllability.

**Impact**: Incomplete UX for a standard search feature.

---

## 🟡 P2 - Medium Issues (Experience Improvements)

### Issue 10: Styles Are Fragmented, Maintenance Cost Is High

**Severity**: P2  
**Files involved**:
- `src/assets/styles/variables.css` — design tokens
- `src/assets/styles/main.css` — global base styles
- `src/assets/styles/liquid-glass.css` — glass effect
- Scoped styles in every page / component

**Description**:  
Styles are scattered across many files. Card layouts, button variants, and section patterns are re-implemented in each page component rather than extracted into shared components. Design tokens (CSS variables) exist but are under-utilized — local overrides are common.

**Impact**: High maintenance cost; global style changes require touching many files; inconsistencies creep in easily.

---

### Issue 11: Content-Type Mappings Are Duplicated Across Components

**Severity**: P2  
**Files involved**:
- `src/views/Dictionary.vue` (line 41) — `typeToContentType`
- `src/views/Profile.vue` (lines 21–26) — `typeLabels`
- `src/views/Favorites.vue` (lines 14–26) — `typeLabels` + `typePaths`

**Description**:  
Chinese labels, route paths, and API type mappings for content types (`dictionary` / `phrase` / `proverb` / `song`) are redefined in multiple components. Adding a new content type requires updating several places in parallel, which is error-prone.

**Impact**: Code duplication; risk of drift between components.

---

### Issue 12: Culture & Songs Pages Override Global Color Tokens Locally

**Severity**: P2  
**Files**: `src/views/Culture.vue` (lines 233–267), `src/views/Songs.vue` (lines 167–181)

**Description**:  
Both pages redefine a full set of CSS variables inside the component (`--c-text`, `--c-brand`, `--c-divider`, `--c-bg-silver`, etc.), essentially shadowing the global token system. This means:
- Dark-mode switching may break on these pages
- Debugging styles requires checking both global and local levels
- No consistent reference for future dark-themed pages

**Impact**: Increases style system complexity; dark-mode compatibility risk.

---

### Issue 13: Animation Density Is Too High for Low-End Devices

**Severity**: P2  
**Pages affected**: Home, Culture, Songs, Dictionary, Learn, Quiz

**Description**:  
Nearly every page stacks multiple animation systems:
- Parallax scrolling background
- IntersectionObserver reveal animations
- Hero multi-element stagger entrance
- Background image scale-in
- Card hover lift + shadow
- Audio spectrum, 3D flip card, etc.

On mid-to-low-end mobile devices, or when the browser has many tabs open, this can cause frame drops and janky scrolling.

**Impact**: Degraded performance on lower-end hardware.

---

### Issue 14: Liquid-Glass Effect Is Overused

**Severity**: P2  
**Scope**: Most components across the site

**Description**:  
Almost every container — search box, result list, detail panel, stat cards, menu items, flashcards — uses the `liquid-glass` effect. Visual hierarchy suffers:
- Primary actions and secondary info have similar visual weight
- The overall UI feels "hazy" with few solid visual anchors
- Text-on-glass contrast degrades when multiple glass layers stack

**Impact**: Weak visual hierarchy; important content doesn't stand out; possible eye strain during long sessions.

---

### Issue 15: Mobile Nav Drawer Has No Transition Animation

**Severity**: P2  
**File**: `src/components/layout/AppHeader.vue`  
**Lines**: 580–588

**Description**:  
The mobile navigation drawer toggles via `display: none` → `display: flex` with no slide-in / slide-out transition. The interaction feels abrupt compared to the rich animation set on the desktop side.

**Impact**: Mobile UX feels less polished; inconsistent with desktop motion design.

---

### Issue 16: API Layer Is Coupled with Business Logic

**Severity**: P2  
**File**: `src/utils/api.js`

**Description**:  
`api.js` handles both low-level axios setup **and** higher-level auth business logic:
- Auto token refresh with request queuing
- 401 auth cleanup and redirect
- Per-status-code error logging

These belong in the auth store or a dedicated interceptor module, not in the API utility file.

**Impact**: Unclear separation of concerns; harder to test and debug.

---

## 🟢 P3 - Minor Issues (Detail Polish)

### Issue 17: Homepage Emphasizes Culture Over Dictionary Utility

**Severity**: P3  
**File**: `src/views/Home.vue`

**Description**:  
The homepage is framed as "布依数字文化馆" (Buyi Digital Culture Hall) with long-form copy and multiple exhibition-style sections. For a dictionary product, the core user intent — look up words, translate — is not prominent enough. The search button is just one CTA inside the hero, with average visual priority.

**Impact**: New users may not quickly find the core feature; product positioning feels ambiguous.

---

### Issue 18: Inconsistent Responsive Typography Sizing

**Severity**: P3  
**Pages affected**: Home, Culture, Songs, Quiz

**Description**:  
`clamp()`-based headings produce inconsistent results on mobile:
- Home H1: `clamp(45px, 13vw, 70px)` → ~48.75px on 375px-wide screens (too large)
- Culture H2: `clamp(34px, 5vw, 58px)` → ~18.75px on 375px (too small)

Responsive type strategy varies page to page. On some pages, a single mobile screen shows very little actual content above the fold.

**Impact**: Low information density on mobile; inconsistent visual rhythm.

---

### Issue 19: No Global Error Boundary

**Severity**: P3

**Description**:  
There is no centralized error handling mechanism. Each component handles API failures independently with its own `try/catch` and custom error display:
- Some show a state panel
- Some show an action toast
- Some only log to the console

There is no app-level error safety net (e.g., Vue `errorHandler`, route-level error page).

**Impact**: Inconsistent error feedback; a severe error could leave the user with a blank screen.

---

### Issue 20: Insufficient Test Coverage

**Severity**: P3  
**Test files**:
- `tests/playableSongs.test.js`
- `tests/player.test.js`
- `tests/tones.test.js`
- `tests/quiz.test.js`

**Description**:  
Only 4 pure-data / utility test files exist. Coverage is extremely narrow:
- No UI component tests
- No page interaction tests
- No store / state management tests
- No API layer tests

**Impact**: Code quality is not systematically guarded; refactoring and iteration are risky.

---

### Issue 21: Quiz Page Background–Text Contrast May Be Insufficient

**Severity**: P3  
**File**: `src/views/Quiz.vue`

**Description**:  
Quiz page titles and body text are white with a text-shadow, placed directly on the `bouyei-nature.jpg` background image. In brighter areas of the photo, the white-on-bright contrast ratio may fall below accessibility thresholds despite the shadow.

**Impact**: Potential WCAG accessibility violation; reduced readability.

---

### Issue 22: Learn Page "Review" Button Has Misleading Semantics

**Severity**: P3  
**File**: `src/views/Learn.vue`  
**Lines**: 60–76

**Description**:  
The "复习" (Review) button actually calls `recordsApi.create` with `actionType: 'view'` — it just logs another view record. Users typically expect "review" to mean spaced repetition, a wrong-answer notebook, memory-curve practice, etc. The actual behavior does not match user expectations.

**Impact**: Mismatch between user expectation and real functionality; potential confusion.

---

## 📊 Summary

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 P0 - Critical | 4 | Must fix — breaks core features or causes errors |
| 🟠 P1 - Important | 5 | Should fix — hurts UX or feature completeness |
| 🟡 P2 - Medium | 7 | Optimizations — affects maintainability & fine UX |
| 🟢 P3 - Minor | 6 | Polish items — not urgent |
| **Total** | **22** | |
