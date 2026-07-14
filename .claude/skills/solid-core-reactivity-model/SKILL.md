---
name: solid-core-reactivity-model
description: >
  Use when reasoning about SolidJS reactivity, debugging tracking issues, or understanding why components run once.
  Prevents React mental model contamination such as expecting re-renders, virtual DOM diffing, or stale closure patterns.
  Covers reactive dependency graph, tracking contexts, ownership tree, synchronous execution model, and direct DOM updates.
  Keywords: SolidJS reactivity, fine-grained, signals, tracking scope, ownership,
  createEffect, createMemo, no virtual DOM, how reactivity works, why component
  runs once, not like React, mental model.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-core-reactivity-model

## Quick Reference

### The Fundamental Mental Model

SolidJS has NO virtual DOM. Components run **exactly once** to set up a reactive dependency graph. Only reactive expressions (effects, memos, JSX bindings) re-execute when their dependencies change. The DOM is updated **directly** through reactive bindings — no diffing, no reconciliation, no re-rendering.

### Tracking Scope Matrix

| Context | Tracking? | Re-executes on change? | Purpose |
|---------|-----------|----------------------|---------|
| `createEffect(() => ...)` | YES | YES | Side effects |
| `createMemo(() => ...)` | YES | YES | Cached derived values |
| `createRenderEffect(() => ...)` | YES | YES | Synchronous render-phase effects |
| `createComputed(() => ...)` | YES | YES | Pre-render state sync |
| JSX expression `{count()}` | YES | YES | DOM text/attribute bindings |
| Component function body | NO | NO — runs once | Setup only |
| Event handlers `onClick` | NO | NO — runs on demand | User interaction |
| `onMount(() => ...)` | NO | NO — runs once after mount | DOM initialization |
| `untrack(() => ...)` | NO | NO — explicitly suppressed | Read without subscribing |

### Reactive Dependency Graph

```
Signal (source)          Memo (derived)         Effect (sink)
  [count]  ──────────►  [double]  ──────────►  [DOM update]
     │                                              ▲
     └──────────────────────────────────────────────┘
                    (direct subscription)
```

- **Signals** are sources — they store values and notify subscribers
- **Memos** are derived nodes — they cache computed values and propagate changes
- **Effects** are sinks — they perform side effects, NEVER produce reactive values
- Dependencies are tracked **automatically** when a signal/memo getter is called inside a tracking scope

### Execution Models

| Aspect | SolidJS 1.x | SolidJS 2.x |
|--------|-------------|-------------|
| Signal propagation | Synchronous — updates propagate immediately | Microtask-batched — reads reflect after flush |
| Forcing immediate propagation | N/A (already synchronous) | `flush()` |
| Effect timing | After render, before paint | Compute-then-apply split |
| Lifecycle hook | `onMount` | `onSettled` (can return cleanup) |
| Async support | Manual via `createResource` | First-class — computations can return Promises |

### Critical Warnings

**NEVER** assume components re-render — SolidJS component functions run ONCE. Only reactive expressions inside tracking scopes re-execute. Placing logic in the component body expecting it to re-run is the #1 cause of broken SolidJS code.

**NEVER** destructure props or signal results outside a tracking scope — this captures a static snapshot and permanently breaks reactivity.

**NEVER** use dependency arrays — SolidJS tracks dependencies automatically. There is no equivalent to React's `useEffect([deps])` or `useMemo([deps])`.

**NEVER** return cleanup functions from effects — use `onCleanup()` as a separate call instead. Returning a function from `createEffect` does NOT register cleanup.

**NEVER** access signals conditionally or after early returns inside effects — signals accessed after an early `return` or inside an `if` branch are only tracked when that code path executes, causing intermittent tracking failures.

**ALWAYS** call signal getters as functions (`count()`, not `count`) — the getter function call is what registers the dependency in the tracking scope.

**ALWAYS** access props directly (`props.name`) or use `splitProps`/`mergeProps` — NEVER destructure props at the function parameter level.

---

## How JSX Compilation Works

SolidJS compiles JSX into **direct DOM creation** calls with reactive bindings. There is no virtual DOM tree, no diff algorithm, no reconciliation.

```tsx
// What you write:
const el = <div class={className()}>{count()}</div>;

// What the compiler produces (conceptual):
const el = document.createElement("div");
createRenderEffect(() => el.className = className());
createRenderEffect(() => el.textContent = count());
```

Each `{expression}` in JSX becomes a fine-grained reactive binding. When `count()` changes, ONLY that specific text node updates — the `div` element, its attributes, and all sibling nodes remain untouched.

---

## Ownership Tree and Disposal

SolidJS organizes reactive computations into an **ownership tree**. Every computation (effect, memo) is owned by the scope that created it. When a scope disposes, all child computations are automatically cleaned up.

### Key Primitives

| Primitive | Purpose |
|-----------|---------|
| `createRoot(fn)` | Creates a new ownership root — computations inside are NOT auto-disposed |
| `getOwner()` | Returns the current tracking owner (or `null` outside any scope) |
| `runWithOwner(owner, fn)` | Executes `fn` under a specific owner's scope |
| `onCleanup(fn)` | Registers cleanup for when the current scope disposes or re-executes |

### Ownership Hierarchy

```
createRoot (application root)
  └── Component A (runs once)
        ├── createEffect (owned by A)
        │     └── onCleanup (runs on re-execute or dispose)
        ├── createMemo (owned by A)
        └── Child Component B (owned by A)
              └── createEffect (owned by B)
```

When Component A unmounts, ALL its owned computations (effects, memos, child components) are disposed automatically.

### When to Use createRoot

**ALWAYS** use `createRoot` when creating reactive computations outside of a component tree — for example, in a standalone reactive system, a test harness, or a module-level subscription.

```tsx
// WRONG: Effect created outside ownership — memory leak, no cleanup
createEffect(() => console.log(globalSignal()));

// CORRECT: createRoot provides ownership and disposal
const dispose = createRoot((dispose) => {
  createEffect(() => console.log(globalSignal()));
  return dispose;
});
// Later: dispose() to clean up
```

### runWithOwner for Async Contexts

Async callbacks lose their tracking owner. Use `runWithOwner` to restore it:

```tsx
function AsyncComponent() {
  const owner = getOwner();

  onMount(async () => {
    const data = await fetchData();
    // WRONG: createEffect here has no owner (async broke the scope)
    // CORRECT: restore the owner explicitly
    runWithOwner(owner!, () => {
      createEffect(() => console.log(data, someSignal()));
    });
  });
}
```

---

## Synchronous vs Batched Execution

### SolidJS 1.x: Synchronous by Default

Signal updates propagate **immediately**. Each `setSignal()` call triggers all dependent computations synchronously before the next line of code executes.

```tsx
const [a, setA] = createSignal(1);
const [b, setB] = createSignal(2);

createEffect(() => console.log(a() + b()));

setA(10); // Effect runs immediately: logs 12
setB(20); // Effect runs immediately: logs 30
```

Use `batch()` to defer propagation:

```tsx
batch(() => {
  setA(10);
  setB(20);
}); // Effect runs ONCE: logs 30
```

### SolidJS 2.x: Microtask-Batched by Default

All signal updates are batched automatically. Reads do NOT reflect updates until the microtask batch flushes. Use `flush()` when immediate propagation is needed.

```tsx
// 2.x behavior:
setA(10);
setB(20);
// Effects have NOT run yet — batched until microtask flush

flush(); // Force immediate propagation
```

---

## Version-Specific Changes

### Key 2.x Reactivity Changes

- **Microtask batching**: Default behavior — no manual `batch()` needed for most cases
- **`flush()`**: Forces immediate propagation when synchronous behavior is required
- **Async first-class**: Computations can return Promises; the graph handles suspension automatically
- **`onMount` renamed to `onSettled`**: Can return a cleanup function
- **Dev guardrails**: Warnings for accidental top-level reads and reactive scope writes
- **`createSignal(fn)`**: Derived-but-writable signals (function argument creates derived initial value)

---

## Decision Trees

### "Should this code be in a tracking scope?"

1. Does the code read a signal/memo value? → If NO → tracking scope not needed
2. Should the code re-run when that value changes? → If NO → use `untrack()` or read in component body
3. Does the code produce a derived value? → If YES → use `createMemo`
4. Does the code perform a side effect? → If YES → use `createEffect`
5. Does the code update the DOM directly? → If YES → use `createRenderEffect`

### "Why is my value not updating?"

1. Are you calling the signal getter as a function? → `count()` not `count`
2. Is the access inside a tracking scope? → Component body is NOT tracked
3. Did you destructure props or store values? → Destructuring breaks tracking
4. Is there an early return BEFORE the signal access? → Move signal reads before returns
5. Is the access inside `untrack()`? → This explicitly suppresses tracking
6. Is the signal inside a conditional branch? → Access unconditionally, use value conditionally

---

## Reference Links

- [references/methods.md](references/methods.md) — API signatures for createRoot, getOwner, runWithOwner, tracking scope primitives
- [references/examples.md](references/examples.md) — Reactive graph examples, tracking demos, ownership patterns
- [references/anti-patterns.md](references/anti-patterns.md) — React mental model violations: re-render assumption, VDOM thinking, dependency arrays

### Official Sources

- https://docs.solidjs.com/concepts/intro-to-reactivity
- https://docs.solidjs.com/concepts/signals
- https://docs.solidjs.com/concepts/effects
- https://docs.solidjs.com/reference/basic-reactivity/create-signal
- https://docs.solidjs.com/reference/basic-reactivity/create-effect
- https://docs.solidjs.com/reference/basic-reactivity/create-memo
- https://docs.solidjs.com/reference/reactive-utilities/batch
- https://docs.solidjs.com/reference/reactive-utilities/untrack
- https://github.com/solidjs/solid/releases
