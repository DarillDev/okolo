# Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-layer SCSS design system (SCSS primitives → CSS custom properties) with dark/light theming, SSR FOUC prevention, and a Claude skill for future DS work.

**Architecture:** SCSS primitives (`$primitive-*`) are compile-time only and never emitted to CSS. Theme files map primitives to semantic CSS custom properties on `[data-theme]`. Components import only the DS barrel (`@use 'ds'`) for mixins and reference CSS vars directly. Themes are loaded globally once from `globals.scss`. FOUC prevented by an inline script in `<head>` before paint.

**Tech Stack:** Next.js 16.2.7, React 19, Sass 1.x (`@use`/`@forward` module system), Jest 30 + Testing Library

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `next.config.ts` | Modify | Add `sassOptions.includePaths` so components can `@use 'ds'` |
| `styles/ds/tokens/_primitives.scss` | Create | SCSS color primitives — never emitted to CSS |
| `styles/ds/tokens/_typography.scss` | Create | SCSS font/size primitives |
| `styles/ds/tokens/_spacing.scss` | Create | SCSS spacing scale primitives |
| `styles/ds/tokens/_motion.scss` | Create | SCSS duration/easing primitives |
| `styles/ds/tokens/_radius.scss` | Create | SCSS border-radius primitives |
| `styles/ds/themes/_base.scss` | Create | `:root` CSS vars — theme-independent tokens |
| `styles/ds/themes/_dark.scss` | Create | `[data-theme="dark"]` semantic color vars |
| `styles/ds/themes/_light.scss` | Create | `[data-theme="light"]` semantic color vars (skeleton) |
| `styles/ds/mixins/_glass.scss` | Create | `@mixin glass()` — glassmorphism surface |
| `styles/ds/mixins/_typography.scss` | Create | `@mixin text($preset)` — typography presets |
| `styles/ds/mixins/_motion.scss` | Create | `@mixin transition($props...)` — standardized motion |
| `styles/ds/mixins/_breakpoint.scss` | Create | `@mixin bp($name)` — responsive breakpoints |
| `styles/ds/index.scss` | Create | DS barrel — `@forward` mixins only |
| `app/globals.scss` | Modify | Load DS themes globally |
| `app/layout.tsx` | Modify | Add `data-theme` default + FOUC script |
| `components/ThemeToggle/ThemeToggle.test.tsx` | Create | ThemeToggle unit tests (TDD) |
| `components/ThemeToggle/ThemeToggle.tsx` | Create | Theme toggle client component |
| `.claude/skills/ds-okolo.md` | Create | Claude skill for DS workflows |

---

## Task 1: Configure Sass path resolution

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Read current next.config.ts**

```ts
// next.config.ts — current content:
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
```

- [ ] **Step 2: Add sassOptions**

Replace the entire file:

```ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(process.cwd(), "styles")],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Verify dev server still starts**

```bash
pnpm dev
```

Expected: server starts on `http://localhost:3000` without errors. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat(ds): configure sass includePaths for ds barrel import"
```

---

## Task 2: Create DS token files

**Files:**
- Create: `styles/ds/tokens/_primitives.scss`
- Create: `styles/ds/tokens/_typography.scss`
- Create: `styles/ds/tokens/_spacing.scss`
- Create: `styles/ds/tokens/_motion.scss`
- Create: `styles/ds/tokens/_radius.scss`

These are SCSS variable files only — they emit zero CSS. They serve as the single source of truth for raw values.

- [ ] **Step 1: Create `styles/ds/tokens/_primitives.scss`**

```scss
// Color primitives — SCSS only, never emitted to CSS directly
// Used exclusively by theme files to map to semantic CSS vars

$bg-900:    #07080d;
$bg-800:    #0b0c13;
$ink-100:   #eef0f8;
$ink-400:   #9aa0b8;
$ink-600:   #60657d;
$line:      rgba(255, 255, 255, 0.07);
$glass:     rgba(18, 20, 32, 0.58);

$green:     #58e39f;
$amber:     #ffc266;
$red:       #ff6b8a;
$blue:      #6cb9ff;
$violet:    #b48bff;
```

- [ ] **Step 2: Create `styles/ds/tokens/_typography.scss`**

```scss
// Typography primitives
$font-display: 'Unbounded', sans-serif;
$font-body:    'Onest', system-ui, sans-serif;
```

- [ ] **Step 3: Create `styles/ds/tokens/_spacing.scss`**

```scss
// Spacing scale — 4px grid
$space: (
  1:  4px,
  2:  8px,
  3:  12px,
  4:  16px,
  5:  20px,
  6:  24px,
  8:  32px,
  10: 40px,
  12: 48px,
);
```

- [ ] **Step 4: Create `styles/ds/tokens/_motion.scss`**

```scss
// Motion primitives
$duration-fast:  150ms;
$duration-base:  200ms;
$duration-slow:  300ms;
$ease-default:   cubic-bezier(0.4, 0, 0.2, 1);
$ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
```

- [ ] **Step 5: Create `styles/ds/tokens/_radius.scss`**

```scss
// Border-radius scale
$radius-sm:   10px;
$radius-md:   14px;
$radius-lg:   20px;
$radius-xl:   24px;
$radius-full: 999px;
```

- [ ] **Step 6: Commit**

```bash
git add styles/
git commit -m "feat(ds): add primitive token files"
```

---

## Task 3: Create theme files

**Files:**
- Create: `styles/ds/themes/_base.scss`
- Create: `styles/ds/themes/_dark.scss`
- Create: `styles/ds/themes/_light.scss`

Theme files emit CSS custom properties to the DOM. `_base.scss` uses `:root` (theme-independent). `_dark.scss` and `_light.scss` use `[data-theme]`.

- [ ] **Step 1: Create `styles/ds/themes/_base.scss`**

```scss
@use '../tokens/typography' as t;
@use '../tokens/spacing' as s;
@use '../tokens/motion' as m;
@use '../tokens/radius' as r;

:root {
  --font-display: #{t.$font-display};
  --font-body:    #{t.$font-body};

  @each $key, $val in s.$space {
    --space-#{$key}: #{$val};
  }

  --radius-sm:   #{r.$radius-sm};
  --radius-md:   #{r.$radius-md};
  --radius-lg:   #{r.$radius-lg};
  --radius-xl:   #{r.$radius-xl};
  --radius-full: #{r.$radius-full};

  --duration-fast:  #{m.$duration-fast};
  --duration-base:  #{m.$duration-base};
  --duration-slow:  #{m.$duration-slow};
  --ease-default:   #{m.$ease-default};
  --ease-spring:    #{m.$ease-spring};
}
```

- [ ] **Step 2: Create `styles/ds/themes/_dark.scss`**

```scss
@use '../tokens/primitives' as p;

[data-theme="dark"] {
  --color-bg-base:      #{p.$bg-900};
  --color-bg-raised:    #{p.$bg-800};
  --color-text-primary: #{p.$ink-100};
  --color-text-muted:   #{p.$ink-400};
  --color-text-subtle:  #{p.$ink-600};
  --color-border:       #{p.$line};
  --color-surface:      #{p.$glass};

  --color-status-good:  #{p.$green};
  --color-status-warn:  #{p.$amber};
  --color-status-bad:   #{p.$red};
  --color-accent:       #{p.$blue};
  --color-accent-alt:   #{p.$violet};
}
```

- [ ] **Step 3: Create `styles/ds/themes/_light.scss`**

```scss
@use '../tokens/primitives' as p;

[data-theme="light"] {
  --color-bg-base:      #ffffff;
  --color-bg-raised:    #f5f5f7;
  --color-text-primary: #0a0a0a;
  --color-text-muted:   #6b7280;
  --color-text-subtle:  #9ca3af;
  --color-border:       rgba(0, 0, 0, 0.08);
  --color-surface:      rgba(255, 255, 255, 0.72);

  --color-status-good:  #{p.$green};
  --color-status-warn:  #{p.$amber};
  --color-status-bad:   #{p.$red};
  --color-accent:       #{p.$blue};
  --color-accent-alt:   #{p.$violet};
}
```

- [ ] **Step 4: Commit**

```bash
git add styles/
git commit -m "feat(ds): add base, dark, and light theme files"
```

---

## Task 4: Create mixin files

**Files:**
- Create: `styles/ds/mixins/_glass.scss`
- Create: `styles/ds/mixins/_typography.scss`
- Create: `styles/ds/mixins/_motion.scss`
- Create: `styles/ds/mixins/_breakpoint.scss`

Mixins are pure — they emit CSS only when called (`@include`). They reference CSS vars at runtime, not SCSS vars.

- [ ] **Step 1: Create `styles/ds/mixins/_glass.scss`**

```scss
@mixin glass($blur: 24px, $saturate: 140%) {
  background: var(--color-surface);
  backdrop-filter: blur(#{$blur}) saturate(#{$saturate});
  -webkit-backdrop-filter: blur(#{$blur}) saturate(#{$saturate});
  border: 1px solid var(--color-border);
}
```

- [ ] **Step 2: Create `styles/ds/mixins/_typography.scss`**

```scss
// Presets: display | label | body | caption
@mixin text($preset) {
  font-family: var(--font-body);

  @if $preset == 'display' {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 500;
    letter-spacing: -0.03em;
    line-height: 1.1;
  } @else if $preset == 'label' {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  } @else if $preset == 'body' {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
  } @else if $preset == 'caption' {
    font-size: 11px;
    font-weight: 400;
    color: var(--color-text-subtle);
  }
}
```

- [ ] **Step 3: Create `styles/ds/mixins/_motion.scss`**

```scss
@mixin transition($props...) {
  $declarations: ();

  @each $prop in $props {
    $declarations: append(
      $declarations,
      #{$prop} var(--duration-base) var(--ease-default),
      comma
    );
  }

  transition: $declarations;
}
```

- [ ] **Step 4: Create `styles/ds/mixins/_breakpoint.scss`**

```scss
$breakpoints: (
  mobile:  480px,
  tablet:  768px,
  desktop: 1280px,
);

@mixin bp($name) {
  $value: map-get($breakpoints, $name);

  @if $value == null {
    @error "Unknown breakpoint '#{$name}'. Available: #{map-keys($breakpoints)}.";
  }

  @media (max-width: #{$value}) {
    @content;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add styles/
git commit -m "feat(ds): add glass, typography, motion, and breakpoint mixins"
```

---

## Task 5: Create DS barrel and wire globals.scss

**Files:**
- Create: `styles/ds/index.scss`
- Modify: `app/globals.scss`

The barrel forwards only mixins (no CSS side effects). `globals.scss` is the only place that loads theme CSS.

- [ ] **Step 1: Create `styles/ds/index.scss`**

```scss
// DS barrel — forwards pure mixins only.
// Theme CSS vars are loaded exclusively from app/globals.scss.
@forward 'mixins/glass';
@forward 'mixins/typography';
@forward 'mixins/motion';
@forward 'mixins/breakpoint';
```

- [ ] **Step 2: Replace `app/globals.scss`**

```scss
@import "tailwindcss";

// Load DS global CSS — themes emit CSS custom properties to the DOM.
// These @use statements must appear here and nowhere else.
@use '../styles/ds/themes/base';
@use '../styles/ds/themes/dark';
@use '../styles/ds/themes/light';

body {
  font-family: var(--font-body);
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.005em;
}
```

- [ ] **Step 3: Verify dev server compiles without errors**

```bash
pnpm dev
```

Expected: server starts cleanly. Open `http://localhost:3000` — page should render (dark background from `--color-bg-base`). Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add styles/ app/globals.scss
git commit -m "feat(ds): wire DS barrel and load themes from globals.scss"
```

---

## Task 6: Update layout.tsx with FOUC prevention

**Files:**
- Modify: `app/layout.tsx`

The server renders `<html data-theme="dark">` as default. An inline script fires before paint to restore the user's saved preference from `localStorage`, preventing a flash of unstyled content on theme switch.

- [ ] **Step 1: Update `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "okolo.auto",
  description: "Найди надёжный автосервис рядом",
};

const themeScript = `(function(){var t=localStorage.getItem('okolo-theme');if(t)document.documentElement.setAttribute('data-theme',t);})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Runs before paint to restore saved theme — prevents FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify server renders correct attribute**

```bash
pnpm dev
```

Open `http://localhost:3000`, inspect the `<html>` element — it must have `data-theme="dark"`. Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(ds): add FOUC prevention script and default dark theme to layout"
```

---

## Task 7: Write ThemeToggle tests (TDD — write first)

**Files:**
- Create: `components/ThemeToggle/ThemeToggle.test.tsx`

Write all tests before implementing the component. They must all fail at this stage.

- [ ] **Step 1: Create `components/ThemeToggle/ThemeToggle.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.clear();
  });

  it('renders a button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('switches to light when current theme is dark', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('switches to dark when current theme is light', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persists the new theme to localStorage', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('okolo-theme')).toBe('light');
  });

  it('reads the current theme from data-theme attribute, not localStorage', () => {
    localStorage.setItem('okolo-theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'light');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    // attribute was 'light', so toggles to 'dark'
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
pnpm test components/ThemeToggle/ThemeToggle.test.tsx
```

Expected: `Cannot find module './ThemeToggle'` — all 5 tests fail.

---

## Task 8: Implement ThemeToggle

**Files:**
- Create: `components/ThemeToggle/ThemeToggle.tsx`

- [ ] **Step 1: Create `components/ThemeToggle/ThemeToggle.tsx`**

```tsx
'use client';

export function ThemeToggle() {
  const toggle = () => {
    const current = document.documentElement.getAttribute('data-theme') ?? 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('okolo-theme', next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      type="button"
    >
      Toggle theme
    </button>
  );
}
```

- [ ] **Step 2: Run tests — verify they all pass**

```bash
pnpm test components/ThemeToggle/ThemeToggle.test.tsx
```

Expected: 5 tests pass, 0 failures.

- [ ] **Step 3: Run full test suite**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add components/
git commit -m "feat(ds): add ThemeToggle component with tests"
```

---

## Task 9: Create DS skill file

**Files:**
- Create: `.claude/skills/ds-okolo.md`

This skill tells Claude how to work with this DS in future sessions. It is **rigid** — rules are not optional.

- [ ] **Step 1: Create `.claude/skills/ds-okolo.md`**

```markdown
---
name: ds-okolo
description: Design system workflows for okolo.auto — add/modify tokens, create DS components, add new themes, debug CSS vars. Use when touching styles/, creating components that use DS tokens, or adding themes.
metadata:
  type: rigid
---

# DS okolo — Design System Skill

## HARD RULES

1. Components NEVER hardcode hex values — always `var(--color-*)`.
2. Components NEVER import primitives (`styles/ds/tokens/`) — only the DS barrel (`@use 'ds'`).
3. Themes are loaded ONLY in `app/globals.scss` — never in components.
4. All CSS custom property names follow the convention: `--color-*`, `--space-*`, `--radius-*`, `--duration-*`, `--ease-*`, `--font-*`.

## Architecture Recap

```
SCSS primitives ($bg-900, $green…)
       ↓  (theme files map primitives to semantic names)
CSS custom properties (--color-bg-base, --color-accent…)
       ↓  (components use CSS vars + DS mixins)
Component styles
```

**Token files:** `styles/ds/tokens/` — SCSS vars only, emit zero CSS.  
**Theme files:** `styles/ds/themes/` — emit CSS vars to `[data-theme]` or `:root`.  
**Mixin files:** `styles/ds/mixins/` — pure SCSS, emit CSS only when `@include`d.  
**Barrel:** `styles/ds/index.scss` — `@forward` mixins only.

## Workflow 1: Add or modify a token

### Adding a new color primitive
1. Add `$new-color: #xxxxxx;` to `styles/ds/tokens/_primitives.scss`.
2. Add semantic mappings in BOTH `styles/ds/themes/_dark.scss` and `styles/ds/themes/_light.scss`:
   ```scss
   --color-new-role: #{p.$new-color};
   ```
3. Never skip the light theme — even if it's a placeholder with the same value.

### Adding a non-color token (spacing, radius, motion)
1. Add the SCSS var to the relevant file in `styles/ds/tokens/`.
2. Add the CSS var emission to `styles/ds/themes/_base.scss`.
3. Check: does the new var fit the existing naming convention?

### Modifying an existing token
1. Change the primitive value in `styles/ds/tokens/_primitives.scss`.
2. Verify no other semantic mapping should also change.
3. Search for any hardcoded value being replaced: `grep -r "#oldvalue" app/ components/` — there should be none.

## Workflow 2: Create a DS component

1. Create `components/ComponentName/ComponentName.tsx` and `ComponentName.module.scss`.
2. SCSS module structure:
   ```scss
   @use 'ds' as ds;

   .root {
     @include ds.glass();         // use mixins
     border-radius: var(--radius-lg); // use CSS vars
     @include ds.transition(transform, opacity);
   }

   .label {
     @include ds.text('label');
     color: var(--color-text-muted);
   }
   ```
3. In TSX, import styles: `import styles from './ComponentName.module.scss';`
4. Available mixins: `glass()`, `text($preset)`, `transition($props...)`, `bp($name)`.
5. Text presets: `display` | `label` | `body` | `caption`.
6. Breakpoint names: `mobile` (480px) | `tablet` (768px) | `desktop` (1280px).

## Workflow 3: Add a new theme

1. Create `styles/ds/themes/_themename.scss`:
   ```scss
   @use '../tokens/primitives' as p;

   [data-theme="themename"] {
     // Copy ALL vars from _dark.scss and remap to new primitives/values.
     // Every semantic var must be defined — no gaps.
     --color-bg-base:      ...;
     --color-bg-raised:    ...;
     --color-text-primary: ...;
     --color-text-muted:   ...;
     --color-text-subtle:  ...;
     --color-border:       ...;
     --color-surface:      ...;
     --color-status-good:  ...;
     --color-status-warn:  ...;
     --color-status-bad:   ...;
     --color-accent:       ...;
     --color-accent-alt:   ...;
   }
   ```
2. Add `@use '../styles/ds/themes/themename';` to `app/globals.scss`.
3. Add the new theme name to the `ThemeToggle` cycle in `components/ThemeToggle/ThemeToggle.tsx`.
4. Test: set `data-theme="themename"` on `<html>` in DevTools and verify all UI renders correctly.

## Workflow 4: Debug a missing/wrong CSS var

Follow this chain to find the break:

1. **In DevTools:** Inspect element → Computed tab → search `--color-`. Is the var defined?
2. **If undefined:** Check `app/globals.scss` — are all three `@use` theme statements present?
3. **If theme file not loading:** Check `pnpm dev` console for SCSS compilation errors.
4. **Check theme file:** Open `styles/ds/themes/_dark.scss` — is the var defined under `[data-theme="dark"]`?
5. **Check primitive:** Open `styles/ds/tokens/_primitives.scss` — is the primitive referenced in the theme file actually defined?
6. **Naming issue:** Run `grep -r "var(--color-wrongname" app/ components/` — typo in the component?

## SSR Notes

- `app/layout.tsx` renders `<html data-theme="dark">` on the server — safe for SSR.
- The inline FOUC script reads `localStorage` and overwrites `data-theme` before first paint — no `useEffect` needed in components.
- Server components use CSS vars normally — CSS is static, no hydration issues.
- Only `ThemeToggle` (and any future theme-aware hooks) need `'use client'`.
```

- [ ] **Step 2: Verify skill file is valid YAML frontmatter**

```bash
head -8 .claude/skills/ds-okolo.md
```

Expected output:
```
---
name: ds-okolo
description: Design system workflows for okolo.auto...
metadata:
  type: rigid
---
```

- [ ] **Step 3: Run full test suite one final time**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 4: Final commit**

```bash
git add .claude/skills/ds-okolo.md
git commit -m "feat(ds): add ds-okolo Claude skill for DS workflows"
```

---

## Done

After all tasks:
- DS token/mixin structure in `styles/ds/`
- Dark theme live, light theme skeleton ready
- FOUC-free theme switching via `[data-theme]` + localStorage
- `ThemeToggle` component tested
- `ds-okolo` skill available for future DS work

Verify with: `pnpm build` — must compile cleanly with zero errors.
