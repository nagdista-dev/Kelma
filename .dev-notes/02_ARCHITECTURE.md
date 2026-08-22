# 🏗️ Architecture — Play With Words

> **Last Updated**: 2026-08-20  
> **Status**: 🟢 Implementation Started

---

## Routing Structure

```
/                   → LandingPage
/settings           → SettingsPage
/session            → SessionSetupPage (word input)
/quiz               → QuizPage (active quiz)
/summary            → SummaryPage (results)
/history            → HistoryPage (past sessions)
```

**Route Guards:**
- `/quiz` → redirects to `/session` if no active session exists
- `/summary` → redirects to `/` if no completed session in state
- `/session` → redirects to `/settings` if no API key is set

---

## File Structure

```
play-with-words/
├── .dev-notes/                    ← Dev documentation (this folder)
│
├── public/
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── quiz/
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── AnswerButton.tsx
│   │   │   ├── FeedbackCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── XPCounter.tsx
│   │   │   ├── StreakBadge.tsx
│   │   │   ├── WordPipelineTracker.tsx
│   │   │   └── HintButton.tsx
│   │   │
│   │   ├── session/
│   │   │   ├── WordInput.tsx
│   │   │   └── LevelSelector.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Spinner.tsx
│   │       └── ApiKeyInput.tsx
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── SessionSetupPage.tsx
│   │   ├── QuizPage.tsx
│   │   ├── SummaryPage.tsx
│   │   └── HistoryPage.tsx
│   │
│   ├── hooks/
│   │   ├── useQuizEngine.ts
│   │   ├── useAIQuiz.ts
│   │   ├── useLocalStorage.ts
│   │   └── useSessionHistory.ts
│   │
│   ├── store/
│   │   ├── quizStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── aiProviderFactory.ts
│   │   ├── quizDataGenerator.ts
│   │   └── reportGenerator.ts
│   │
│   ├── types/
│   │   └── index.ts              ← ✅ DONE
│   │
│   ├── constants/
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Data Models

### TypeScript Types (`src/types/index.ts`) ✅ DONE

All types defined. Key interfaces:
- `WordQuizData` — AI-generated data per word
- `WordProgress` — runtime tracking of each word through rounds
- `QuizQuestion` — a single rendered question
- `QuizState` / `SettingsState` — Zustand stores
- `SessionRecord` — IndexedDB persisted session

---

## IndexedDB Schema (Dexie)

```typescript
class PlayWithWordsDB extends Dexie {
  sessions!: Table<SessionRecord>;
  constructor() {
    super('PlayWithWordsDB');
    this.version(1).stores({
      sessions: '++id, date, completed',
    });
  }
}
export const db = new PlayWithWordsDB();
```

---

## Constants

```typescript
export const MAX_WORDS = 10;
export const XP_PER_ROUND = 5;       // Rounds 1, 2, 3
export const XP_ROUND_4 = 10;        // Round 4
export const XP_HINT_PENALTY = 3;
export const STREAK_MILESTONES = [3, 5, 10];
export const TOTAL_ROUNDS = 4;
export const MCQ_OPTIONS_COUNT = 4;  // 3 distractors + 1 correct
export const I_DONT_KNOW = "I don't know";
```
