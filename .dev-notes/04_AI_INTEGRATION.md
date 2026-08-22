# 🤖 AI Integration — Play With Words

> **Last Updated**: 2026-08-20  
> **Status**: 🟡 Designed, pending implementation

---

## Providers Supported

| Provider | Models |
|----------|--------|
| OpenAI | gpt-4o, gpt-4o-mini, gpt-4-turbo |
| Google Gemini | gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash |
| Anthropic Claude | claude-3-5-sonnet-latest, claude-3-haiku |

API key stored in LocalStorage. Never sent to any server — only directly to the AI provider.

---

## Library: Vercel AI SDK + Zod

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
```

Using `generateObject` (not `generateText`) for structured, type-safe AI responses.

---

## AI Provider Factory

```typescript
// src/lib/aiProviderFactory.ts
export function getAIModel(provider: AIProvider, apiKey: string, model: string) {
  switch (provider) {
    case 'openai':    return openai(model, { apiKey });
    case 'google':    return google(model, { apiKey });
    case 'anthropic': return anthropic(model, { apiKey });
  }
}
```

---

## Call 1 — Session Data Generation (One call at session start)

**Trigger**: User submits word list + level  
**Output**: `WordQuizData[]` — all quiz data for all words

### Zod Schema

```typescript
const WordQuizDataSchema = z.object({
  word: z.string(),
  arabicMeaning: z.string(),
  englishDefinition: z.string(),
  exampleSentence: z.string(),
  distractors: z.array(z.string()).length(3),
  arabicDistractors: z.array(z.string()).length(3),
  sentenceDistractors: z.array(z.string()).length(3),
  collocations: z.array(z.string()),
  emojiAnchor: z.string().optional(),
  frequencyNote: z.enum(['common', 'formal', 'specialized']),
  memoryTip: z.string().optional(),
});

const SessionDataSchema = z.object({
  words: z.array(WordQuizDataSchema),
});
```

---

## Call 2 — Wrong Answer Feedback (On-demand)

**Trigger**: User picks wrong answer or "I don't know"  
**Output**: Arabic explanation string  
**Includes**: collocation, emoji anchor, frequency note, memory tip

---

## Call 3 — Mastery Dialogue (Optional)

**Trigger**: User opts in after completing all 4 rounds  
**Output**: Short dialogue with blanks + button options

---

## Error Handling

| Error | Handling |
|-------|---------|
| Invalid API key | Friendly UI message in Settings |
| Rate limit | Retry after 2s |
| Network error | "Cannot start quiz offline" message |
| Bad response | Retry with temperature 0 |

---

## Cost Estimate (10 words per session)

| Call | Input tokens | Output tokens |
|------|-------------|--------------|
| Session data | ~800-1200 | ~600-900 |
| Wrong answer feedback | ~200-300 | ~150-200 |
| Mastery dialogue | ~300-400 | ~200-300 |

**Total**: < $0.01 per session for most providers/models
