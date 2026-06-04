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
