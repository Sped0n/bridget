# Bridget

Minimal Hugo theme for photographers/visual artists. Hugo (Go templates) drives content/routing; SolidJS (via Vite) drives interactive islands (custom cursor, gallery, stage nav). Theme is in **maintenance mode** — keep it minimal, don't add scope beyond what's asked.

## Stack

- **Hugo** — templates in `layouts/`, theme module mounts defined in `hugo.toml`. Demo/test content lives in `exampleSite/`.
- **SolidJS + TypeScript** — components in `assets/ts/`, split into `desktop/` and `mobile/` variants (separate layout trees, not just responsive CSS).
- **Vite** — bundles `assets/ts/main.tsx` and `assets/ts/critical.ts` into `bundled/js/`. `vite-plugin-solid` handles JSX.
- **Sass** — `assets/scss/`, split into `_core/` (foundation, reset, typography, mixins, fonts) and `_partial/` (one file per feature: nav, gallery, stage, postStage, customCursor, collection, article, container, postList).
- **GSAP** — used for animations (`stageAnimations.ts`, gallery transitions).
- **Swiper** — gallery/carousel.
- Package manager: **pnpm**.

## Commands

```
pnpm dev            # vite watch + hugo dev server (use while iterating)
pnpm build          # vite build + hugo build (production, minified) — run before calling any change done
pnpm server         # vite build (watch) + hugo server, production-like
pnpm lint           # eslint --fix + prettier --write
pnpm lint:check     # eslint + prettier --check (CI-equivalent, no writes)
```

`bundled/` and `public/` are build output — generated, don't hand-edit. `exampleSite/` is the content used by `hugo:dev`/`hugo:build` to preview the theme.

## Architecture notes

- Desktop and mobile are genuinely separate component trees (`assets/ts/desktop/*`, `assets/ts/mobile/*`), each with their own `state.ts` — not a single responsive component. Check `main.tsx` / `layout.tsx` in both trees before assuming a change applies to one only.
- `configState.tsx` / `imageState.tsx` hold shared reactive state consumed by both trees.
- Gallery navigation, "stage" (single-image) view, and custom cursor are the three interactive centerpieces — most feature work touches one of these.
- SCSS partials map roughly 1:1 to the TSX components under `_partial/`; keep that pairing when adding new components (new component → new partial, not appended to an existing one).

## Design system (existing, don't reinvent)

This is a photography portfolio theme — **the images are the content, UI must recede**.

- **Palette**: white background (`_core/_base.scss`), black type/chrome, no accent color. Full-bleed imagery supplies the only color on the page.
- **Type**: `Geist` (sans, self-hosted via `_core/_font.scss`) for body copy, `FW` (sans, condensed/utility) for buttons/controls. Base `16px`, scaling to `18px`/`19px` at tablet/laptop breakpoints (`_core/_typography.scss`). Don't introduce a third family.
- **Chrome stays quiet**: nav, cursor, and stage-nav are thin overlays over imagery, not boxed UI — no cards, no shadows, no rounded-corner containers competing with photos.
- **Motion**: GSAP-driven, used for gallery/stage transitions and cursor follow — orchestrated, not decorative. New motion should serve navigation (moving between images/views), not sit on top as flourish.
- **Custom cursor** replaces the system cursor in interactive zones — treat it as a first-class UI element, not a gimmick; keep it legible against both light and dark photos.

When touching UI, use the `frontend-design`/`frontend-ui-engineering` skills to stay consistent with this system rather than introducing new tokens. SolidJS-specific correctness (signals/stores/reactivity, not styling) is covered by the `solid-*` skills — reach for those when reactivity looks off rather than guessing.

## graphify

`.graphifyignore` excludes `bundled/`, `exampleSite/`, `public/`, `.claude/` — build output and test fixtures, not theme source. Keep it that way so graph queries stay scoped to `layouts/` and `assets/`.

## Conventions

- TypeScript + ESLint (`eslint-config-love`, `eslint-plugin-solid`) + Prettier (`prettier-plugin-organize-imports`, `prettier-plugin-go-template` for Go templates). Run `pnpm lint` before considering frontend work done.
- Go templates in `layouts/` are also formatted by Prettier — don't hand-diverge from its formatting.
- **New features go on a feature branch**, never directly on `main`.
- **After building a feature, add an example for it in `exampleSite/`** (content in `exampleSite/content/`, config in `exampleSite/config/`) so `pnpm hugo:dev`/`pnpm dev` can exercise it — this is the test fixture for the theme, not just a demo.

## Before calling any change done

1. `pnpm lint:check` (or `pnpm lint` to autofix).
2. `pnpm build` — must complete clean (Vite + Hugo). This is the final verification step for every change in this repo, not optional.
