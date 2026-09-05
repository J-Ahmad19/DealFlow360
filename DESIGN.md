# DealFlow360 — Design System Reference

> **Lingo-Inspired Tactile UI** · Nunito · Green × Purple · 3D Depth

This file is the authoritative design system reference for DealFlow360. Every AI agent, developer, and contributor must consult this document before writing or modifying any UI code.

---

## 1. Visual Identity

DealFlow360 uses a **Lingo-inspired** design language: minimal layouts, bright semantic colors, rounded friendly shapes, and a signature **tactile 3D depth** that makes interactive elements feel physically pressable.

The core personality is **confident, approachable, and intelligent** — professional enough for enterprise B2B, clear enough for any user.

---

## 2. Typography

### Font Families

| Role | Family | Fallback |
|---|---|---|
| Display, Body, UI | `Nunito` | `system-ui, sans-serif` |
| Code, Monospace | `JetBrains Mono` | `monospace` |

**Only Nunito is used for all text.** No Inter, Plus Jakarta Sans, or any other sans-serif.

### Type Scale

| Size | px | Usage |
|---|---|---|
| `text-xs` | 12px | Labels, captions, timestamps |
| `text-sm` | 14px | Body secondary, tags |
| `text-base` | 16px | Body primary |
| `text-lg` | 18px | Lead copy |
| `text-xl` | 20px | Large lead |
| `text-2xl` | 24px | Sub-headings |
| `text-3xl` | 30px | Section headings |
| `text-4xl` | 36px | Page headings |
| `text-5xl–7xl` | 48–72px | Hero headings |

### Font Weights

| Weight | Usage |
|---|---|
| `font-bold` (700) | Body text, card descriptions |
| `font-extrabold` (800) | Sub-headings, section labels |
| `font-black` (900) | Hero headings, metric values, CTAs |

> **Rule:** All interactive labels (buttons, nav links, badges) use `font-black`. Body copy uses `font-bold`. Never use weights below 700 in production UI.

---

## 3. Color Palette

All colors are defined as CSS custom properties in `src/index.css` under `@theme {}` and consumed via Tailwind utility classes.

### Brand (Primary Green)

| Token | Hex | Usage |
|---|---|---|
| `brand-500` | `#58CC02` | Primary actions, CTAs, progress, active states |
| `brand-600` | `#46a302` | Button bottom-border depth, hover darken |
| `brand-400` | `#5ed614` | Lighter fills, icon backgrounds |
| `brand-50`–`100` | Light greens | Card backgrounds, badge fills |

### Secondary (Purple)

| Token | Hex | Usage |
|---|---|---|
| `secondary-400` | `#CE82FF` | Secondary highlights, complementary accents |
| `secondary-500` | `#a568cc` | Darker secondary elements |
| `secondary-50` | `#f7e6ff` | Purple-tinted backgrounds |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `success-500` | `#58CC02` | Positive states (same as brand) |
| `warning-500` | `#FFC800` | Caution, streaks, pending states |
| `danger-500` | `#FF4B4B` | Errors, destructive actions |

### Neutrals (Tailwind slate)

| Token | Usage |
|---|---|
| `slate-900` | Footer background, dark headings |
| `slate-800` | Default text on light backgrounds |
| `slate-600` | Secondary text |
| `slate-400` | Muted/placeholder text |
| `slate-200` | Borders, dividers |
| `slate-100` | Subtle backgrounds |
| `slate-50` | Card alt backgrounds |
| `white` | Card surfaces, inputs |

### Text

| Token | Hex | Usage |
|---|---|---|
| `text-main` | `#3C3C3C` | All body text on white |

---

## 4. Depth & Tactile Interaction

The most distinctive characteristic of the DealFlow360 UI is its **tactile 3D press effect**. Interactive elements appear raised and physically depress when clicked.

### The Mechanism

```css
/* From src/index.css */
.btn-tactile {
  border-bottom-width: 4px;          /* raises the element */
  transition: all 0.15s ease;
}

.btn-tactile:active {
  transform: translateY(4px);        /* simulates pressing down */
  border-bottom-width: 0px;          /* removes the raise on press */
}
```

### Button Classes

| Class | Description |
|---|---|
| `.btn-tactile` | Base class — always combine with a color variant |
| `.btn-primary` | Green fill, green bottom-border |
| `.btn-secondary` | White fill, gray border |

**Usage:**
```jsx
<button className="btn-tactile btn-primary px-8 py-4 text-lg">
  Get Started Free
</button>
```

### Card Classes

| Class | Description |
|---|---|
| `.card-tactile` | White card with `border-b-4` depth, lifts on hover |

```css
.card-tactile {
  background: #ffffff;
  border-radius: 1.25rem;     /* 20px */
  border: 2px solid #e5e7eb;
  border-bottom-width: 4px;
}

.card-tactile:hover {
  transform: translateY(-4px);
  border-bottom-width: 8px;   /* exaggerates depth on hover */
}
```

---

## 5. Spacing System

All spacing follows the Tailwind default 4px base scale. These are the only values used for padding, margins, and gaps:

| Scale | px | Token |
|---|---|---|
| 1 | 4px | `p-1`, `gap-1` |
| 2 | 8px | `p-2`, `gap-2` |
| 3 | 12px | `p-3`, `gap-3` |
| 4 | 16px | `p-4`, `gap-4` |
| 5 | 20px | `p-5`, `gap-5` |
| 6 | 24px | `p-6`, `gap-6` |
| 8 | 32px | `p-8`, `gap-8` |
| 10 | 40px | `p-10` |
| 12 | 48px | `p-12` |
| 16 | 64px | `p-16` |
| 20–24 | 80–96px | Section top/bottom padding |
| 24–32 | 96–128px | Major section spacing |

**Rule:** Never use arbitrary `px` values in JSX. Always use Tailwind spacing tokens.

---

## 6. Border Radius

| Usage | Class | px |
|---|---|---|
| Small tags, pills | `rounded-lg` | 8px |
| Buttons | `rounded-2xl` | 16px |
| Cards, panels | `rounded-[20px]` / `rounded-2xl` | 20px |
| Large containers | `rounded-3xl` | 24px |
| Icon containers | `rounded-xl` / `rounded-2xl` | 12–16px |
| Circular | `rounded-full` | Only for true circles |

---

## 7. Gradients & Special Text

### Gradient Text

```css
/* Token from src/index.css */
.gradient-text {
  background: linear-gradient(135deg, #58CC02, #CE82FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Used only on hero heading accent words.** Never on body copy or buttons.

### Hero Section Background

```css
.hero-gradient {
  background:
    radial-gradient(circle at top right, rgba(206, 130, 255, 0.1), transparent 40%),
    radial-gradient(circle at bottom left, rgba(88, 204, 2, 0.1), transparent 40%),
    #ffffff;
}
```

---

## 8. Section Rhythm

All page sections alternate between white and slate-50 backgrounds to create natural separation without heavy borders.

| Section | Background |
|---|---|
| Hero | `hero-gradient` (white base, colored orbs) |
| Features | `bg-slate-50` |
| Workflow | `bg-white` |
| Benefits | `bg-slate-50` |
| Metrics | `bg-white` |
| Testimonials | `bg-slate-50` |
| CTA | `bg-white` |
| Footer | `bg-slate-900` |

**Rule:** Never stack two `bg-white` or two `bg-slate-50` sections back-to-back without a clear visual break.

---

## 9. Section Heading Structure

Every section follows this exact structure:

```jsx
{/* Eyebrow label */}
<p className="text-sm font-black text-brand-600 uppercase tracking-widest mb-4">
  Section Category
</p>

{/* Section heading */}
<h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6">
  Main heading copy
</h2>

{/* Section description */}
<p className="text-lg font-bold text-slate-500 leading-relaxed">
  Supporting paragraph text.
</p>
```

**Eyebrow labels** alternate between `text-brand-600` (green) and `text-secondary-500` (purple) across sections.

---

## 10. Icon System

All icons use **Lucide React**. Icon sizing:

| Context | Size |
|---|---|
| Inline in text | 14–16px |
| Button icon | 18–20px |
| Card icon container | 20–24px |
| Large feature icon | 24px |

Icon containers are always wrapped in a rounded square:
```jsx
<div className="w-14 h-14 rounded-[18px] bg-brand-50 flex items-center justify-center">
  <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm">
    <ShieldCheck size={20} className="text-white" />
  </div>
</div>
```

---

## 11. Component States

Every interactive component must define all of these states:

| State | Implementation |
|---|---|
| Default | Base styles |
| Hover | `hover:` utilities or CSS hover |
| Active / Press | `active:translate-y-1` + `active:border-b-0` |
| Focus-visible | `focus-visible:ring-2 focus-visible:ring-brand-500` |
| Disabled | `opacity-50 pointer-events-none` |

---

## 12. Animation Principles

| Rule | Implementation |
|---|---|
| Entrance animations | Framer Motion `initial/animate/whileInView` |
| Scroll-triggered | `whileInView={{ opacity: 1, y: 0 }}` with `viewport={{ once: true }}` |
| Hover micro-animations | Tailwind `transition-all duration-200` |
| Float decorative | `@keyframes float` + `.animate-float` |
| Tactile press | CSS `transition: all 0.15s ease` on `.btn-tactile` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` collapses all to 0.01ms |

**Anti-pattern:** Never use `duration-700+` on hover transitions. Keep hover feedback under 200ms.

---

## 13. Accessibility Rules

| Rule | Enforcement |
|---|---|
| All text ≥ WCAG AA (4.5:1 contrast) | `#3C3C3C` on white = 12.6:1 ✅ |
| All buttons have `aria-label` | Required on icon-only buttons |
| Focus rings visible | `focus-visible:ring-2` on all interactive elements |
| Reduced motion respected | `@media (prefers-reduced-motion: reduce)` in `index.css` |
| Semantic HTML | `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>` used correctly |

---

## 14. Anti-Patterns (Never Do)

| ❌ Don't | ✅ Do instead |
|---|---|
| Raw hex colors in JSX (`text-[#58CC02]`) | Use `text-brand-500` |
| `font-weight` below 700 | `font-bold` minimum |
| Gradients on cards or body text | Only `.gradient-text` on hero headings |
| `position: absolute` for layout | Use flexbox / grid |
| Stacking same background colors | Alternate white / slate-50 |
| Emojis as icons | Use Lucide icons |
| Shadow-only depth (no border-bottom) | Use `border-b-4` for tactile feel |
| Arbitrary spacing values (`mt-[37px]`) | Use Tailwind scale only |
