# UI/UX Design System Specification (`design.md`) — The Lenny Growth Assistant

---

## 1. Design Philosophy & Visual Identity

**The Lenny Growth Assistant** is conceived as a high-density, professional decision-support system for product managers, growth executives, and founders. The design language marries the sleek, distraction-free aesthetic of modern developer tools (e.g., Linear, Raycast, Vercel) with rich glassmorphism and subtle micro-animations.

### Core Visual Principles:
1. **Low-Cognitive Load Dark Architecture**: Tailored deep-space slate tones (`slate-950`, `slate-900`) minimize eye fatigue during extended strategy sessions.
2. **Deterministic Information Hierarchy**: Visual distinction between user prompts (subtle surface), assistant responses (deep readable text), grounded citation cards (semi-transparent badges), and interactive code artifacts.
3. **Responsive Tactile Feedback**: Micro-transitions on hover (`scale-[0.98]`, glow borders, subtle drop-shadow expansions) reinforce state changes and user control.
4. **Frictionless Navigation**: Two-click access between marketing overview and chat workspace, with automatic fresh session initialization.

---

## 2. Design Token System

### 2.1 Color Palette

```
Surface & Backgrounds
  ├── App Canvas:       #020617 (slate-950)
  ├── Card / Panel:     #090d16 (glassmorphic 90% opacity)
  ├── Elevated Surface: #0f172a (slate-900)
  ├── Border Primary:   #1e293b (slate-800/80)
  └── Border Subtle:    rgba(255, 255, 255, 0.08)

Brand Accents & Gradients
  ├── Primary Sky:      #0ea5e9 (sky-500)
  ├── Primary Indigo:   #6366f1 (indigo-500)
  ├── Primary Purple:   #a855f7 (purple-500)
  └── Gradient CTA:     linear-gradient(to right, #0284c7, #4f46e5)

Semantic Feedback States
  ├── Emerald (Active): #34d399 (emerald-400) — Online / RAG Active
  ├── Amber (Warning):  #fbbf24 (amber-400)   — Fallback Grounding / Offline Daemon
  ├── Rose (Error/Del): #f43f5e (rose-500)    — Delete / Session Drop
  └── Sky (Artifact):   #38bdf8 (sky-400)     — Generated Artifacts
```

### 2.2 Typography Scale
- **Primary Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `system-ui`, `sans-serif`
- **Code & Numeric Font**: `JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, `monospace`

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display-lg` | 3rem (48px) | 800 (Extrabold) | 1.15 | Landing Hero Headline |
| `display-md` | 2.25rem (36px) | 700 (Bold) | 1.2 | Section Headers |
| `heading-sm` | 1.125rem (18px) | 600 (Semibold) | 1.3 | Panel & Artifact Titles |
| `body-base` | 0.875rem (14px) | 400 (Regular) | 1.6 | Chat Messages & Answers |
| `body-sm` | 0.8125rem (13px) | 500 (Medium) | 1.5 | Citation Text & Summaries |
| `caption` | 0.6875rem (11px) | 600 (Semibold Mono) | 1.4 | Badges, Timestamps, Metrics |

---

## 3. Screen Layout Blueprints

### 3.1 Screen A: Landing Page (`LandingPage.tsx`)

The landing page introduces product capabilities, displays live server health, highlights the technical architecture, and guides users directly into conversation.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [✨ Lenny AI v1.0]                          [🟢 API Online] [💬 Open Chat]       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                       [ ✨ Lenny's Podcast · RAG Assistant ]                     │
│               Grounded Product & Growth Intelligence                             │
│       Ask about growth loops, PLG, pricing, team discovery, and frameworks.      │
│                                                                                  │
│                 [ 💬 Start Chatting -> ]   [ ⚡ View API Docs ]                  │
│                                                                                  │
│      [4 Transcripts]    [24 Vector Chunks]    [4 LLM Models]    [100% Grounded]  │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ ── ARCHITECTURE SHOWCASE: Frontend · Backend · Embeddings · Security ─────────── │
│ [ 4 Category Cards displaying Next.js, FastAPI, Bleach, and 384d Vector Engine ] │
├──────────────────────────────────────────────────────────────────────────────────┤
│ ── PROVEN LEADER TRANSCRIPTS ─────────────────────────────────────────────────── │
│ [ Elena Verna ]    [ Patrick Campbell ]    [ Marty Cagan ]    [ Shreyas Doshi ]  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Screen B: Chat & Workspace (`AppShell.tsx`)

The central operating environment combines multi-session management, conversational feed, model provider control, and the live split-pane artifact viewer.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [✨ Lenny AI]             Lenny Growth Knowledge Assistant   [🟢 RAG Engine Active]   [🗂 Artifacts (1)] [🏠 Landing] │
├───────────────────┬─────────────────────────────────────────────────────────────┬─────────────────────────────────┤
│                   │                                                             │                                 │
│  SIDEBAR          │  MAIN CONVERSATION STREAM                                   │  SPLIT-PANE ARTIFACT VIEWER     │
│  (Width: 288px)   │                                                             │  (Width: 50% / Min 380px)       │
│                   │  User:                                                      │                                 │
│  [+ New Chat]     │  "Create a SaaS value metric calculator."                   │  Header:                        │
│                   │                                                             │  [🗂] Interactive Calculator    │
│  Recent Chats:    │  Assistant:                                                 │  [👁 Preview]  [💻 Code]  [✕]   │
│  - Pricing Tier   │  "Here is an interactive HTML calculator modeling Patrick   │ ┌─────────────────────────────┐ │
│  - PLG Loops      │  Campbell's SaaS pricing tiers..."                          │ │ Live Isolated <iframe>      │ │
│  - Task LNO       │                                                             │ │ Price Slider: [$49/mo]      │ │
│                   │  ┌────────────────────────────────────────────────────────┐ │ │ Churn Rate:   [2.1%]        │ │
│  RAG Knowledge:   │  │ 📚 Grounded Source Citations (2 Matches)               │ │ │ Estimated ARR: $142,000   │ │
│  - 4 Leaders      │  │ • Elena Verna (Score: 94%) — Growth Loops Excerpt      │ │ └─────────────────────────────┘ │
│  - 24 Chunks      │  │ • Patrick Campbell (Score: 91%) — Value Metric Excerpt │ │                                 │
│                   │  └────────────────────────────────────────────────────────┘ │  Footer:                        │
│  Profile Status:  │                                                             │  [Copy HTML]   [Export Snippet] │
│  [PL] PM Lead     │  COMPOSER: [Elena Loops] [Cagan Teams] [Shreyas LNO]        │                                 │
│                   │  [ Message Lenny Growth Assistant...           [↑ Send] ]   │                                 │
└───────────────────┴─────────────────────────────────────────────────────────────┴─────────────────────────────────┘
```

---

## 4. Component Design Specifications

### 4.1 Chat Header (`ChatHeader.tsx`)
- **Brand Title**: Tracking-tight white title with product identifier.
- **Provider Status Pill**: Live indicator dot reflecting provider availability (`RAG Engine Active` vs. `Fallback Grounding`).
- **Artifacts Toggle Button**: Visible only when artifacts exist in the active session. Styled with sky-blue active indicator.
- **Top-Right Landing Page Button**: High-visibility direct shortcut to exit chat and return to the landing page with zero state loss.

### 4.2 Citation Cards (`MessageList.tsx`)
- Nested collapsible accordion underneath assistant responses.
- **Score Badge**: Color-coded similarity percentage (`90%+ Emerald`, `80-89% Sky`, `<80% Slate`).
- **Source Link**: Direct clickable hyperlink to canonical podcast or newsletter article.
- **Quote Styling**: Italicized, bordered quote excerpt with speaker attribution.

### 4.3 Sandboxed Artifact Viewer (`ArtifactViewer.tsx`)
- **Mode Switcher**: Dual-tab toggle between **Preview** (live rendered component) and **Code** (syntax-highlighted raw HTML/Markdown).
- **Security Sandboxing**: Embeds `<SandboxedFrame>` with `sandbox="allow-scripts"` to strictly isolate CSS, Javascript execution, and parent window cookies.
- **Copy Utility**: One-click clipboard copy with a 2-second visual confirmation checkmark (`Check` icon).

### 4.4 Composer (`Composer.tsx`)
- **Auto-expanding Textarea**: Grows up to 200px max height without shifting overall layout.
- **Action Chips**: Clickable prompt pills above composer for instant execution of core leadership frameworks:
  - `Elena Verna: PLG Growth Loops`
  - `Marty Cagan: Empowered Teams`
  - `Patrick Campbell: SaaS Pricing`
  - `Shreyas Doshi: LNO Strategy`
- **Model Selector**: In-composer dropdown to switch models and providers on the fly.

---

## 5. Responsive Layout Breakpoints

| Breakpoint | Width | Layout Adjustments |
|---|---|---|
| **Mobile (`< 640px`)** | `< 640px` | Sidebar collapses to slide-over drawer; Artifact viewer opens full-width modal; Hero stats display in 2x2 grid. |
| **Tablet (`640px - 1024px`)** | `640px - 1024px` | Sidebar fixed at 240px; Artifact viewer slides over 70% of chat width. |
| **Desktop (`1024px - 1440px`)** | `1024px - 1440px` | Standard 3-column layout: 288px Sidebar, flexible conversation stream, 50% split-pane Artifact Viewer. |
| **Ultra-wide (`> 1440px`)** | `> 1440px` | Centered max-width constraints on chat feed (850px) to maintain optimal readability line lengths (65-75 chars). |

---

## 6. Accessibility & Micro-Interactions

1. **Keyboard Ergonomics**:
   - `Enter`: Submit message.
   - `Shift + Enter`: Insert multiline line-break without submitting.
   - `Esc`: Close open Artifact Viewer panel.
2. **Focus Visibility**:
   - Explicit `ring-2 ring-sky-500/50` focus indicators on all inputs, interactive buttons, and session links.
3. **Contrast Compliance**:
   - All text tokens tested against WCAG 2.1 AA standards (minimum 4.5:1 contrast ratio against `slate-950` / `slate-900` backgrounds).
