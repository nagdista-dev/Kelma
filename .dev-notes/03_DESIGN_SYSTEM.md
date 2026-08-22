# 🎨 Design System — Play With Words

> **Last Updated**: 2026-08-20  
> **Status**: 🟡 Defined, CSS pending implementation

---

## Theme

**Primary**: Dark mode default with optional light mode toggle.

---

## Color Palette

```css
:root {
  --bg-primary:   #0B0F1A;
  --bg-secondary: #111827;
  --bg-tertiary:  #1F2937;

  --accent-primary:   #7C3AED;
  --accent-secondary: #8B5CF6;
  --accent-light:     #A78BFA;

  --success:       #10B981;
  --success-light: #34D399;

  --error:       #EF4444;
  --error-light: #FCA5A5;

  --xp-gold:    #F59E0B;
  --xp-light:   #FCD34D;

  --text-primary:   #F9FAFB;
  --text-secondary: #9CA3AF;
  --text-muted:     #6B7280;

  --glass-bg:     rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.10);
}
```

---

## Typography

**Font**: `Inter` from Google Fonts

| Scale | Usage | Tailwind |
|-------|-------|---------|
| 32px 800 | Page titles | `text-3xl font-extrabold` |
| 24px 700 | Section headers | `text-2xl font-bold` |
| 20px 600 | Card titles | `text-xl font-semibold` |
| 16px 500 | Body / questions | `text-base font-medium` |
| 14px 400 | Labels, hints | `text-sm` |
| 12px 400 | Captions | `text-xs` |

---

## Answer Button States

- **Default**: `bg-white/5 border border-white/10 hover:border-violet-500 hover:bg-violet-500/10`
- **Correct**: `bg-emerald-500/20 border-emerald-500 text-emerald-300`
- **Wrong**: `bg-red-500/20 border-red-500 text-red-300`
- **I don't know**: `bg-white/5 border-dashed border-gray-600 text-gray-400`

---

## Emoji Roles (Fixed)

| Emoji | Meaning |
|-------|---------|
| ✅ | Correct answer |
| ❌ | Wrong answer |
| 🤔 | "I don't know" |
| 🔥 | Streak milestone |
| 🏆 | Session complete |
| ⚡ | XP |

---

## Framer Motion Animations

| Animation | Trigger | Details |
|-----------|---------|---------|
| Card slide-in | New question | `y: 20→0`, opacity 0→1, 300ms |
| Answer shake | Wrong selected | `x: [-8,8,-8,0]`, 400ms |
| Answer pulse | Correct | Scale 1→1.05→1 |
| Page transition | Route change | Fade + Y offset |
| XP count-up | Correct answer | Number animation |
| Streak badge | Milestone | Bounce + glow |

---

## Responsive

- Mobile-first, `max-w-2xl` centered
- `px-4` mobile, `px-8` desktop
- Buttons optimized for thumb reach (bottom half of screen)
