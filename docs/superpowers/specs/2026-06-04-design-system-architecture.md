# Design System Architecture — okolo.auto

**Date:** 2026-06-04  
**Status:** Approved

## Overview

Pure SCSS design system for okolo.auto. Independent layer — no Tailwind inside DS. Tailwind remains in the project but does not participate in the DS. Two themes: dark ("neon cartograph", implemented first) and light (future).

## Approach: Two-Layer Tokens (C)

SCSS primitives → CSS custom properties (semantic tokens). Components reference only semantic tokens via `var(--token-name)` — never raw hex values.

- **Layer 1 — Primitives:** SCSS variables (`$primitive-*`). Compile-time only. Never written to CSS directly.
- **Layer 2 — Semantic tokens:** CSS custom properties on `[data-theme]`. Runtime switchable. Same names across all themes.

## File Structure

Project has no `src/` directory — styles live at root level alongside `app/`.

```
styles/
  ds/
    tokens/
      _primitives.scss   # $primitive-* — raw values, SCSS only
      _typography.scss   # $font-family-*, size scale
      _spacing.scss      # $space-* (4px grid)
      _motion.scss       # $duration-*, $ease-*
      _radius.scss       # $radius-*
    themes/
      _dark.scss         # [data-theme="dark"]  { --color-* → primitives }
      _light.scss        # [data-theme="light"] { --color-* → primitives }
      _base.scss         # :root — typography, spacing, motion, radius (theme-independent)
    mixins/
      _glass.scss        # @mixin glass()
      _typography.scss   # @mixin text($preset)
      _motion.scss       # @mixin transition($props...)
      _breakpoint.scss   # @mixin bp($name)
    index.scss           # barrel: @forward all tokens, themes, mixins
app/
  globals.scss           # @use '../styles/ds'; + Tailwind import
```

### SCSS Path Resolution

`next.config.ts` must configure `sassOptions.includePaths` so components can use short imports:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: ['./styles'],
  },
};
```

This allows `@use 'ds'` (instead of `@use '../../styles/ds'`) from any component.

## Token Naming Convention

### Primitives (SCSS only)
```scss
$primitive-bg-900:    #07080d;
$primitive-bg-800:    #0b0c13;
$primitive-ink-100:   #eef0f8;
$primitive-ink-400:   #9aa0b8;
$primitive-ink-600:   #60657d;
$primitive-line:      rgba(255,255,255,0.07);
$primitive-glass:     rgba(18,20,32,0.58);

$primitive-green:     #58e39f;
$primitive-amber:     #ffc266;
$primitive-red:       #ff6b8a;
$primitive-blue:      #6cb9ff;
$primitive-violet:    #b48bff;
```

### Semantic Color Tokens (CSS vars)
```scss
[data-theme="dark"] {
  --color-bg-base:      #{$primitive-bg-900};
  --color-bg-raised:    #{$primitive-bg-800};
  --color-text-primary: #{$primitive-ink-100};
  --color-text-muted:   #{$primitive-ink-400};
  --color-text-subtle:  #{$primitive-ink-600};
  --color-border:       #{$primitive-line};
  --color-surface:      #{$primitive-glass};

  --color-status-good:  #{$primitive-green};
  --color-status-warn:  #{$primitive-amber};
  --color-status-bad:   #{$primitive-red};
  --color-accent:       #{$primitive-blue};
  --color-accent-alt:   #{$primitive-violet};
}
```

### Base Tokens (theme-independent, :root)
```scss
:root {
  --font-display:   'Unbounded', sans-serif;
  --font-body:      'Onest', system-ui, sans-serif;

  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-5: 20px;  --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px;

  --radius-sm:   10px;  --radius-md: 14px;
  --radius-lg:   20px;  --radius-xl: 24px;
  --radius-full: 999px;

  --duration-fast:  150ms;
  --duration-base:  200ms;
  --duration-slow:  300ms;
  --ease-default:   cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## Mixins

### glass()
```scss
@mixin glass($blur: 24px, $saturate: 140%) {
  background: var(--color-surface);
  backdrop-filter: blur(#{$blur}) saturate(#{$saturate});
  -webkit-backdrop-filter: blur(#{$blur}) saturate(#{$saturate});
  border: 1px solid var(--color-border);
}
```

### text($preset)
Presets: `display`, `label`, `body`, `caption`
```scss
@mixin text($preset) {
  font-family: var(--font-body);
  @if $preset == 'display'  { font-family: var(--font-display); font-size: 26px; font-weight: 500; letter-spacing: -0.03em; }
  @if $preset == 'label'    { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; }
  @if $preset == 'body'     { font-size: 14px; font-weight: 500; }
  @if $preset == 'caption'  { font-size: 11px; color: var(--color-text-subtle); }
}
```

### transition($props...)
```scss
@mixin transition($props...) {
  $result: ();
  @each $prop in $props {
    $result: append($result, #{$prop} var(--duration-base) var(--ease-default), comma);
  }
  transition: $result;
}
```

### bp($name)
Breakpoints: `mobile` (480px), `tablet` (768px), `desktop` (1280px)
```scss
@mixin bp($name) {
  @media (max-width: map-get($breakpoints, $name)) { @content; }
}
```

## SSR + Next.js Integration

### layout.tsx — FOUC prevention
The `<html>` element is rendered server-side with `data-theme="dark"` as default. An inline script runs before paint to restore the user's saved preference from localStorage.

```tsx
// app/layout.tsx — Server Component
export default function RootLayout({ children }) {
  return (
    <html lang="ru" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var t = localStorage.getItem('okolo-theme');
            if (t) document.documentElement.setAttribute('data-theme', t);
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Server Components
No special handling required. CSS custom properties are static CSS — rendered as-is in HTML. Server components use DS SCSS modules like any other component.

### ThemeToggle — Client Component
The only component aware of the theme mechanism:

```tsx
'use client';
export function ThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('okolo-theme', next);
  };
  return <button onClick={toggle}>Toggle theme</button>;
}
```

**Rules:**
- Never use `useEffect` + `mounted` pattern to read the theme — FOUC script makes it unnecessary
- Never hardcode hex values in components — always `var(--color-*)`
- Never import primitives (`$primitive-*`) in components — only mixins and CSS vars

## Component Usage Pattern

```scss
// components/SearchBar/SearchBar.module.scss
@use 'ds' as ds;

.search {
  @include ds.glass();
  border-radius: var(--radius-full);
  @include ds.transition(transform, border-color);

  &:hover {
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateY(-2px);
  }
}

.input {
  @include ds.text('body');
  color: var(--color-text-primary);
  background: transparent;
}
```

## Skill Coverage (ds-okolo skill)

The skill guides four workflows:

1. **Add/modify a token** — which file, naming rules, propagation check
2. **Create a DS component** — SCSS module template, mixin usage, semantic-only references
3. **Add a new theme** — create `themes/_new.scss`, map all semantic vars to new primitives
4. **Debug a token** — checklist: primitive → semantic → theme file → CSS var in DevTools → component

The skill is **rigid** — rules must be followed exactly to maintain DS consistency.
