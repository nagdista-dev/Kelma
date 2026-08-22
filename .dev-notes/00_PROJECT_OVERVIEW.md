# 📚 Play With Words — Project Overview

> **Last Updated**: 2026-08-20  
> **Status**: 🟢 Implementation Started  
> **Working Model**: Antigravity (Claude Sonnet 4.6 Thinking)

---

## What Is This App?

**Play With Words** is an AI-powered English vocabulary trainer web application.  
The user provides up to **10 English words per session**, and the AI quizzes them through a fixed **4-round active-recall pipeline** — no passive reading, only real memory retrieval.

The app is built entirely **client-side** (no backend server), using:
- The user's own AI API key (stored in LocalStorage)
- Browser LocalStorage for settings/preferences
- Browser IndexedDB for session history and word progress

---

## Core Learning Philosophy

> **Active retrieval beats passive reading.**

Every word goes through exactly 4 rounds before it's considered "mastered":

| Round | Type | Direction |
|-------|------|-----------|
| 1 | Recognition | Arabic meaning → pick English word |
| 2 | Comprehension | English definition → pick English word |
| 3 | Translation | English word → pick Arabic meaning |
| 4 | Fill-in-blank | Sentence with blank → tap correct word |

- **Multiple choice only** — user never types quiz answers (only the initial word list)
- **"I don't know" option** always present — honest answer, not a failure
- **Feedback in Arabic** for wrong answers — short, clear explanation
- **Quiz questions in English** — immersive, simple language

---

## Key Constraints

- Max **10 words** per session input
- User provides their own **API Key** (OpenAI / Gemini / Claude)
- **No backend** — everything in the browser
- **No memory between sessions** — each session starts fresh
- All quiz answers via **tappable buttons** — zero typing during quiz

---

## AI Integration Strategy

1. **One initial AI call** → generate all quiz data for all words at session start:
   - Arabic meanings
   - English definitions
   - Smart distractors (confusable, not random)
   - Example sentences (level-matched)
   - Collocations
   - Emoji anchors
   - Frequency notes

2. **Feedback AI calls** → on-demand when user gets an answer wrong (detailed Arabic explanation)

3. **Optional AI calls** → mastery dialogue, speed round questions

---

## User Journey

```
Landing Page
    ↓
Settings Page (set API key + provider)
    ↓
Session Setup (enter ≤10 words + pick level)
    ↓
Quiz Page (4-round pipeline per word)
    ↓
[Optional] Speed Round
    ↓
[Optional] Mastery Dialogue
    ↓
Summary Page (XP + stats + download report)
    ↓
History Page (view past sessions)
```

---

## Files In This Folder

| File | Purpose |
|------|---------|
| `00_PROJECT_OVERVIEW.md` | This file — full project description |
| `01_TECH_STACK.md` | All libraries, versions, and why they were chosen |
| `02_ARCHITECTURE.md` | File structure, data models, routing |
| `03_DESIGN_SYSTEM.md` | Colors, typography, component patterns |
| `04_AI_INTEGRATION.md` | AI provider setup, prompt engineering, API flow |
| `05_PROGRESS.md` | ✅ / 🔄 / ❌ task tracker — updated continuously |
| `06_DECISIONS.md` | Key technical decisions and their rationale |
| `07_OPEN_QUESTIONS.md` | Unresolved questions requiring user input |
