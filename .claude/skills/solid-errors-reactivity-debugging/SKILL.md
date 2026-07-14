---
name: solid-errors-reactivity-debugging
description: >
  Use when SolidJS reactivity is broken, effects are not firing, or store updates are not reflected in the UI.
  Prevents lost tracking from destructuring, conditional signal access, async tracking loss, and stale closures.
  Covers diagnostic flowcharts, solid-devtools debugging, effect tracking issues, store propagation failures, and systematic symptom-to-fix resolution.
  Keywords: reactivity debugging, effect not firing, store not updating,
  signal tracking, solid-devtools, stale closure, createEffect, UI not updating,
  why doesn't my UI update, signal not working, reactive value stale,
  nothing happens when I change state.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x with TypeScript."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-errors-reactivity-debugging

## Quick Reference

### Diagnostic Table: Symptom to Cause to Fix

| Symptom | Cause | Fix |
|---------|-------|-----|
| UI never updates after signal change | Signal getter not called in JSX: `{count}` instead of `{count()}` | ALWAYS call the getter: `{count()}` |
| Effect runs once, never again | Signal accessed outside tracking scope (component body, event handler) | Move signal access inside `createEffect` or JSX expression |
| Effect ignores some signals | Conditional access / early return before signal read | Read ALL signals before any conditional logic |
| Store property not updating in UI | Destructured store property: `const { name } = store` | ALWAYS access via `store.name` in JSX |
| Store update has no effect | Direct mutation: `store.name = "x"` | ALWAYS use `setStore("name", "x")` |
| Props stop updating | Destructured props: `function Comp({ name })` | ALWAYS use `props.name`, use `splitProps` if needed |
| Value is stale in timeout/callback | Signal value captured: `const v = count()` then used later | Call `count()` at the point where you need the value |
| Effect works initially but stops | `await` inside effect breaks synchronous tracking | Move async code to a separate function; read signals before `await` |
| Memo returns stale value | Memo dependency was untracked or destructured | Verify all signal getters are called inside memo callback |
| Store array update not reflected | Used `store.items.push()` instead of setter | Use `setStore("items", items.length, newItem)` or `produce` |

### Critical Warnings

**NEVER** destructure props in the function signature — this reads values once and permanently breaks tracking. ALWAYS accept `props` as a single object and access properties reactively.

**NEVER** store a signal getter result in a variable and expect it to stay current — `const v = count()` captures a snapshot. ALWAYS call the getter where you need the live value.

**NEVER** place `await` before signal reads in an effect — `await` breaks the synchronous tracking scope. ALWAYS read all tracked signals before any `await`.

**NEVER** mutate a store directly — `store.x = 5` bypasses the reactive system entirely. ALWAYS use `setStore` or `produce`.

**NEVER** use `Array.push/splice/pop` on store arrays — these mutate without notifying the reactive graph. ALWAYS use `setStore` with path syntax or `produce`.

---

## Diagnostic Flowchart: "My UI Is Not Updating"

```
START: UI is not updating after state change
  |
  +--> Is the value a signal?
  |     |
  |     +--> Are you calling the getter? count() not count
  |     |     |
  |     |     +--> NO --> FIX: Add () to signal reads in JSX
  |     |     +--> YES --> Is the signal read inside a tracking scope?
  |     |                   |
  |     |                   +--> NO (component body, event handler, onMount)
  |     |                   |     --> FIX: Move read into createEffect or JSX expression
  |     |                   |
  |     |                   +--> YES --> Is there an early return or condition BEFORE the read?
  |     |                         |
  |     |                         +--> YES --> FIX: Read all signals before conditionals
  |     |                         +--> NO --> Is there an await before the read?
  |     |                               |
  |     |                               +--> YES --> FIX: Read signals before await
  |     |                               +--> NO --> Check equality: signal uses === by default
  |     |                                     --> FIX: Use { equals: false } for objects
  |
  +--> Is the value from a store?
  |     |
  |     +--> Did you destructure the store? const { x } = store
  |     |     --> FIX: Access as store.x in JSX
  |     |
  |     +--> Did you mutate directly? store.x = 5
  |     |     --> FIX: Use setStore("x", 5)
  |     |
  |     +--> Did you use Array.push/splice?
  |     |     --> FIX: Use setStore or produce
  |     |
  |     +--> Did you use setStore correctly?
  |           --> Verify path syntax: setStore("path", "to", "prop", value)
  |
  +--> Is the value from props?
        |
        +--> Did you destructure props? function Comp({ name })
        |     --> FIX: Use function Comp(props) and access props.name
        |
        +--> Did you spread props? <Child {...props} />
              --> FIX: Use splitProps/mergeProps for reactive forwarding
```

---

## Tracking Scope Rules

### What IS a Tracking Scope

| Scope | Tracks Dependencies | Re-runs |
|-------|-------------------|---------|
| `createEffect(() => ...)` | YES | When dependencies change |
| `createMemo(() => ...)` | YES | When dependencies change |
| `createRenderEffect(() => ...)` | YES | When dependencies change (sync) |
| `createComputed(() => ...)` | YES | When dependencies change (before render) |
| JSX expressions `{count()}` | YES | When dependencies change |

### What is NOT a Tracking Scope

| Context | Tracks | Why |
|---------|--------|-----|
| Component function body | NO | Runs exactly once during setup |
| Event handlers `onClick={() => ...}` | NO | Run on demand, not reactively |
| `onMount(() => ...)` | NO | Explicitly non-tracking, runs once |
| `setTimeout`/`setInterval` callbacks | NO | Scheduled by the browser, not SolidJS |
| `untrack(() => ...)` | NO | Deliberately suppresses tracking |
| Code after `await` | NO | Async breaks synchronous tracking context |

---

## Async Tracking Loss

The SolidJS reactive system tracks dependencies **synchronously**. Any signal read after an `await` is NOT tracked because the execution resumes in a new microtask outside the original tracking scope.

```typescript
// WRONG — signals after await are NOT tracked
createEffect(async () => {
  const response = await fetch("/api/data");
  console.log(count()); // NOT tracked — effect will NOT re-run when count changes
});

// CORRECT — read all signals BEFORE await
createEffect(() => {
  const currentCount = count(); // Tracked
  const url = apiUrl();         // Tracked

  // Non-tracked async work in a separate scope
  (async () => {
    const response = await fetch(url);
    const data = await response.json();
    setResult(data);
  })();
});
```

---

## SolidJS 2.x Debugging Differences

| Aspect | 1.x Behavior | 2.x Behavior |
|--------|-------------|-------------|
| Update timing | Synchronous propagation | Microtask-batched — reads stale until flush |
| Debugging reads | Values update immediately after set | Values may appear stale until batch flushes |
| Immediate propagation | Default behavior | Use `flush()` when needed |
| Dev warnings | Manual detection only | Built-in warnings for accidental top-level reads |
| Effect model | Single `createEffect` | Split compute/apply — inspect each phase separately |

When debugging 2.x: if a value appears stale immediately after `setSignal()`, this is expected microtask batching behavior. The value updates after the current synchronous execution completes. Use `flush()` only when you explicitly need immediate propagation.

---

## Debugging Strategies

### Strategy 1: Isolation Effect

Create a minimal effect that ONLY reads the suspect signal to verify it fires:

```typescript
// Step 1: Verify the signal itself updates
createEffect(() => {
  console.log("[DEBUG] count =", count());
});

// Step 2: If this fires but your UI does not, the problem is in HOW the signal
// is accessed in your component (destructuring, conditional, async)
```

### Strategy 2: Tracking Scope Verification

Wrap suspect code in `createEffect` to confirm tracking works:

```typescript
// If this logs on changes, tracking works — the bug is elsewhere
createEffect(() => {
  console.log("[DEBUG] store.user.name =", store.user.name);
});
```

### Strategy 3: solid-devtools

Install `solid-devtools` for visual dependency graph inspection:

```bash
npm install --save-dev solid-devtools
```

```typescript
// vite.config.ts
import devtools from "solid-devtools/vite";

export default defineConfig({
  plugins: [devtools(), solidPlugin()],
});
```

```typescript
// Entry point (index.tsx / App.tsx)
import "solid-devtools";
```

The devtools browser extension shows: signal values, dependency graphs, component tree, and which computations re-run on each update.

---

## Reference Links

- [references/methods.md](references/methods.md) -- Debugging tools: solid-devtools setup, console.log strategies, tracking scope identification techniques
- [references/examples.md](references/examples.md) -- Complete debugging scenarios with step-by-step diagnosis and fixes
- [references/anti-patterns.md](references/anti-patterns.md) -- Debugging mistakes that make problems worse

### Official Sources

- https://docs.solidjs.com/concepts/intro-to-reactivity
- https://docs.solidjs.com/concepts/effects
- https://docs.solidjs.com/concepts/stores
- https://github.com/thetarnav/solid-devtools
