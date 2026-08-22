# 🛠️ Tech Stack — Play With Words

> **Last Updated**: 2026-08-20  
> **Status**: 🟢 Confirmed & Being Installed

---

## Core Framework

| Library | Version | Purpose |
|---------|---------|---------|
| React | ^18 | UI framework |
| TypeScript | ^5 | Type safety |
| Vite | ^5 | Build tool (fast dev server) |
| React Router DOM | ^6 | Client-side routing |

---

## Styling

| Library | Version | Purpose |
|---------|---------|---------|
| TailwindCSS | ^3 | Utility-first CSS |
| Framer Motion | ^11 | Animations (card flips, transitions, feedback) |

---

## Icons

| Library | Version | Purpose |
|---------|---------|---------|
| Lucide React | latest | All icons |

---

## AI Integration

| Library | Version | Purpose |
|---------|---------|---------|
| `ai` (Vercel AI SDK) | ^3 | Unified AI streaming interface |
| `@ai-sdk/openai` | latest | OpenAI provider (GPT-4o, GPT-4-turbo) |
| `@ai-sdk/google` | latest | Google Gemini provider |
| `@ai-sdk/anthropic` | latest | Anthropic Claude provider |

**Why Vercel AI SDK?**  
Single unified interface for all 3 providers. Easy to switch provider without changing core logic. Supports streaming responses natively.

---

## Storage

| Library | Version | Purpose |
|---------|---------|---------|
| Dexie.js | ^4 | IndexedDB wrapper (sessions, word history, progress) |
| LocalStorage (native) | — | API keys, user settings, preferences, theme |

---

## State Management

| Library | Version | Purpose |
|---------|---------|---------|
| Zustand | ^4 | Quiz state (active word pool, rounds, XP, streak) |

---

## UI Utilities

| Library | Version | Purpose |
|---------|---------|---------|
| React Hot Toast | ^2 | Toast notifications (streak milestones, XP earned) |

---

## Report Generation

| Library | Version | Purpose |
|---------|---------|---------|
| jsPDF | ^2 | PDF session report generation |
| jsPDF-AutoTable | ^3 | Table formatting inside PDF |

---

## Installation Commands

```bash
# Step 1 — Init (done)
npx -y create-vite@latest ./ --template react-ts --overwrite --no-interactive

# Step 2 — Base deps (done)
npm install

# Step 3 — App deps
npm install react-router-dom framer-motion lucide-react zustand dexie react-hot-toast ai @ai-sdk/openai @ai-sdk/google @ai-sdk/anthropic jspdf jspdf-autotable zod

# Step 4 — Dev deps
npm install -D tailwindcss@3 postcss autoprefixer @types/node
npx tailwindcss init -p
```
