# UI/UX Design System Document (`design.md`) — The Lenny Growth Assistant

---

## 1. Design Philosophy & Aesthetics
**The Lenny Growth Assistant** is crafted as a modern, high-density, dark-themed internal AI product tailored for senior product and growth professionals. 

Key visual principles:
1. **Professional Dark Palette**: Built on slate tones (`slate-950`, `slate-900`, `slate-800`) with vibrant sky-blue accents (`sky-600`, `sky-400`) and emerald status indicators.
2. **Clear Information Hierarchy**: Strict visual distinction between user prompts, assistant answers, grounded citation cards, and generated artifacts.
3. **Low Cognitive Load**: Micro-animations, responsive layout splits, clear loading states, and quick-action prompt chips.

---

## 2. Layout Structure (3-Column Responsive Grid)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ App Shell Header (Logo | Active Provider Toggle [Ollama / Claude] | Artifact Button)   │
├─────────────────┬──────────────────────────────────────────┬───────────────────────────┤
│                 │                                          │                           │
│  Sidebar        │  Main Conversation Area                  │  Slide-Out Artifact       │
│  (64px / 256px) │                                          │  Viewer (50% Split)       │
│                 │  - Message Stream                        │                           │
│  + New Chat     │  - Grounded Citation Cards               │  - Header & Mode Toggle   │
│  - Session 1    │  - Markdown Renderer                     │    (Preview vs Code)      │
│  - Session 2    │                                          │  - Sandboxed <iframe>     │
│                 │  Composer                                │    Render                 │
│                 │  - Quick Action Chips                    │                           │
│                 │  - Input Box & Send Button               │                           │
└─────────────────┴──────────────────────────────────────────┴───────────────────────────┘
```

---

## 3. Key UI Components & Interaction States

### 3.1 Model Selector & Connection Indicator
- Located in top header bar.
- Shows live status dots:
  - **Green Dot**: Ollama local or Anthropic cloud connected.
  - **Amber Dot**: Model missing or key unconfigured (with explanatory tooltip).

### 3.2 Citation Cards (Grounded Sources)
- Collapsible source accordion under assistant responses.
- Displays episode title, guest name, match percentage badge (e.g. `95% match`), verbatim transcript excerpt, and link to transcript.

### 3.3 Artifact Viewer Panel
- Appears beside the chat whenever the user requests a Ship 30 essay or HTML framework.
- Features view toggle:
  - **Preview Mode**: Renders sanitized HTML inside a sandboxed `<iframe>` (`sandbox="allow-scripts"`).
  - **Code Mode**: Renders syntax-highlighted HTML/CSS/Markdown source code.
- Includes quick **Copy to Clipboard** and **Close** controls.

### 3.4 Composer & Quick Action Chips
- Preset buttons for instant workflow execution:
  - `Product Strategy` (Shreyas Doshi LNO framework prompt)
  - `PLG Growth Loops` (Elena Verna growth loop prompt)
  - `Ship 30 Essay` (Marty Cagan discovery essay prompt)
  - `HTML Artifact Canvas` (1-page strategy canvas prompt)

---

## 4. Typography & Color Tokens
- **Font Family**: Inter, system-ui, sans-serif.
- **Backgrounds**: `slate-950` (#020617) for shell, `slate-900` (#0f172a) for cards/panels.
- **Borders**: `slate-800` (#1e293b).
- **Accents**: `sky-500` (#0ea5e9) primary, `emerald-400` (#34d399) success, `amber-400` (#fbbf24) warnings.
