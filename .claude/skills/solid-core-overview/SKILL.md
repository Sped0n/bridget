---
name: solid-core-overview
description: >
  Use when starting a SolidJS project, checking API availability, or looking up import paths and version compatibility.
  Prevents using deprecated APIs such as SolidStart 0.x patterns or pre-0.15 router cache function.
  Covers version matrix for SolidJS 1.x/2.x and SolidStart, import reference, ecosystem package map, and getting started guidance.
  Keywords: SolidJS API, version matrix, SolidStart, solid-js imports,
  @solidjs/router, ecosystem, Vite, what is SolidJS, getting started,
  which version, API reference.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-core-overview

## Quick Reference

### Version Matrix

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `solid-js` | 1.x (1.8+) | Stable | Fine-grained reactivity, signals, stores, effects, SSR, streaming |
| `solid-js` | 2.0 | Beta | Microtask batching, async first-class, `onSettled` replaces `onMount` |
| `@solidjs/start` | 0.x | Deprecated | Used `createServerData$`, `createServerAction$` — NEVER use for new projects |
| `@solidjs/start` | 1.0 | Stable | Uses `"use server"` directive, built on Vinxi/Vite/Nitro |
| `@solidjs/router` | < 0.15 | Legacy | Used `cache` function (now deprecated) |
| `@solidjs/router` | 0.15+ | Stable | Introduced `query` (replaces `cache`), current API |

### Key Version Dependencies

| Dependency | Requirement |
|-----------|-------------|
| SolidStart 1.0 | Requires `@solidjs/router` 0.15+ |
| `@solidjs/router` | Requires `solid-js` 1.8.4+ |
| `createAsync` | Bridge API between 1.x and 2.0 — use it NOW |
| `babel-preset-solid` | Required build dependency for JSX compilation |

### Critical Warnings

**NEVER** use SolidStart 0.x APIs (`createServerData$`, `createServerAction$`) in new projects — they are removed in SolidStart 1.0. ALWAYS use `"use server"` with `query`/`action` instead.

**NEVER** use `cache` from `@solidjs/router` — it is deprecated. ALWAYS use `query` (available in router 0.15+).

**NEVER** import store utilities from `solid-js` — stores live in `solid-js/store`. Wrong imports cause runtime errors with no compile-time warning.

**NEVER** import rendering utilities from `solid-js` — SSR/hydration functions live in `solid-js/web`.

**NEVER** confuse `@solidjs/router` (current) with the old `solid-app-router` package — the old package is abandoned.

---

## API Categories at a Glance

### Reactivity Primitives (`solid-js`)

| API | Purpose |
|-----|---------|
| `createSignal` | Reactive value with getter/setter |
| `createEffect` | Side effects that auto-track dependencies |
| `createMemo` | Cached derived values (reactive source) |
| `createResource` | Async data fetching with loading/error states |
| `createComputed` | Synchronous pre-render state sync |
| `createRenderEffect` | Synchronous render-phase effects |

### Reactive Utilities (`solid-js`)

| API | Purpose |
|-----|---------|
| `batch` | Defer updates until callback completes |
| `untrack` | Read signals without creating dependencies |
| `on` | Explicit dependency specification for effects |
| `observable` | Convert signal to RxJS-compatible Observable |
| `from` | Bridge external reactive systems into signals |

### Lifecycle (`solid-js`)

| API | Purpose | SolidJS 2.x |
|-----|---------|-------------|
| `onMount` | Run once after DOM mount (non-tracking) | Replaced by `onSettled` |
| `onCleanup` | Cleanup on unmount or effect re-run | Unchanged |

### Store Utilities (`solid-js/store`)

| API | Purpose |
|-----|---------|
| `createStore` | Proxy-based reactive nested state |
| `createMutable` | Direct-mutation reactive state (MobX-style) |
| `produce` | Immer-style mutation syntax for stores |
| `reconcile` | Diff-based store updates (API responses) |
| `unwrap` | Strip reactive proxy, get plain object |

### Component Utilities (`solid-js`)

| API | Purpose |
|-----|---------|
| `splitProps` | Split props into groups without losing reactivity |
| `mergeProps` | Merge props with defaults reactively |
| `createContext` | Create context for dependency injection |
| `useContext` | Consume context value |
| `lazy` | Code-split component with dynamic import |
| `children` | Resolve and track children reactively |

### Control Flow (`solid-js`)

| Component | Purpose |
|-----------|---------|
| `<Show>` | Conditional rendering |
| `<For>` | Keyed list rendering (reference identity) |
| `<Index>` | Indexed list rendering (position identity) |
| `<Switch>`/`<Match>` | Multi-branch conditional |
| `<Suspense>` | Async loading boundary |
| `<ErrorBoundary>` | Error catching boundary |
| `<Portal>` | Render outside component tree |
| `<Dynamic>` | Dynamic component selection |

### Rendering (`solid-js/web`)

| API | Purpose |
|-----|---------|
| `render` | Mount app to DOM element |
| `hydrate` | Attach reactivity to server-rendered HTML |
| `renderToString` | Synchronous SSR |
| `renderToStream` | Streaming SSR |
| `isServer` | Boolean constant for environment detection |

### Router (`@solidjs/router`)

| API | Purpose |
|-----|---------|
| `Router`, `Route`, `A` | Core routing components |
| `useNavigate`, `useParams` | Navigation hooks |
| `useSearchParams`, `useLocation` | URL state hooks |
| `query` | Cached server data fetching |
| `createAsync` | Reactive async primitive (recommended) |
| `action` | Server mutation wrapper |
| `useSubmission` | Track mutation status |

### SolidStart (`@solidjs/start`)

| API | Purpose |
|-----|---------|
| `FileRoutes` | File-based route generation |
| `"use server"` | Server function directive |
| API routes | HTTP method handlers (GET, POST, etc.) |

---

## SolidJS 2.x Changes Summary

| Feature | SolidJS 1.x | SolidJS 2.x |
|---------|-------------|-------------|
| Reactivity | Synchronous by default | Microtask-batched |
| Async | Manual with `createResource` | First-class Promises/async iterables |
| Effects | Single `createEffect` | Split compute/apply pattern |
| Lifecycle | `onMount` | `onSettled` (can return cleanup) |
| Store setters | Path-style | Draft-first by default |
| List rendering | `<Index>` component | `<For keyed={false}>` with accessors |
| Derived state | `createMemo` only | `createSignal(fn)` for derived-but-writable |

### New 2.x Primitives

- **`<Loading>`** — Fallback during initial render without tearing down UI
- **`isPending()`** — Track refreshing state
- **`action()`** — Dedicated mutation primitive with optimistic patterns
- **`createOptimistic`** / **`createOptimisticStore`** — Explicit optimistic UI

---

## Getting Started

```bash
npm init solid@latest
```

### Minimal SolidStart Project Structure

```
my-app/
├── public/
├── src/
│   ├── routes/
│   │   └── index.tsx          # / route
│   ├── entry-client.tsx       # Client hydration entry
│   ├── entry-server.tsx       # Server handler entry
│   └── app.tsx                # Root component
├── app.config.ts              # SolidStart configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Minimal app.tsx (SolidStart)

```tsx
import { Suspense } from "solid-js";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

export default function App() {
  return (
    <Router root={(props) => <Suspense>{props.children}</Suspense>}>
      <FileRoutes />
    </Router>
  );
}
```

### Minimal SolidJS App (No SolidStart)

```tsx
import { render } from "solid-js/web";
import { createSignal } from "solid-js";

function App() {
  const [count, setCount] = createSignal(0);
  return <button onClick={() => setCount((c) => c + 1)}>Count: {count()}</button>;
}

render(() => <App />, document.getElementById("root")!);
```

---

## Ecosystem Package Map

| Package | npm Name | Purpose |
|---------|----------|---------|
| Solid Router | `@solidjs/router` | Client/server routing, data loading, actions |
| SolidStart | `@solidjs/start` | Full-stack meta-framework (SSR, API routes) |
| Solid Primitives | `@solid-primitives/*` | 40+ community reactive utilities |
| Kobalte | `@kobalte/core` | Accessible unstyled UI components (like Radix UI) |
| Solid Testing Library | `@solidjs/testing-library` | Testing utilities (Testing Library conventions) |
| Solid DevTools | `solid-devtools` | Browser extension for signal/component inspection |
| Babel Preset | `babel-preset-solid` | JSX compilation (required build dependency) |
| Solid Transition Group | `solid-transition-group` | CSS enter/exit animations |

---

## Reference Links

- [references/methods.md](references/methods.md) -- Complete import map for all entry points
- [references/examples.md](references/examples.md) -- App setup, SolidStart setup, version-specific patterns
- [references/anti-patterns.md](references/anti-patterns.md) -- Wrong imports, version mismatches, ecosystem confusion

### Official Sources

- https://docs.solidjs.com/concepts/intro-to-reactivity
- https://docs.solidjs.com/solid-start
- https://docs.solidjs.com/solid-router
- https://github.com/solidjs/solid
- https://github.com/solidjs-community/solid-primitives
