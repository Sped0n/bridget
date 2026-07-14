---
name: solid-syntax-signals
description: >
  Use when creating signals, effects, memos, resources, or managing component lifecycle in SolidJS.
  Prevents React useState/useEffect anti-patterns that break fine-grained reactivity tracking.
  Covers createSignal, createEffect, createMemo, createResource, createRenderEffect, createComputed, batch, untrack, on, onMount, onCleanup, observable, and from.
  Keywords: createSignal, createEffect, createMemo, createResource, batch,
  untrack, onMount, onCleanup, SolidJS reactivity, signals, reactive state,
  side effects, computed value, fetch data, lifecycle hooks.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x with TypeScript."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-syntax-signals

## Quick Reference

### All Reactive Primitives

| Primitive | Import | Purpose | Returns |
|-----------|--------|---------|---------|
| `createSignal<T>` | `solid-js` | Reactive state atom | `[Accessor<T>, Setter<T>]` |
| `createEffect` | `solid-js` | Side effect on dependency change | `void` |
| `createMemo<T>` | `solid-js` | Cached derived value (IS a reactive source) | `Accessor<T>` |
| `createResource<T>` | `solid-js` | Async data with loading/error states | `[Resource<T>, { mutate, refetch }]` |
| `createRenderEffect` | `solid-js` | Synchronous effect during render phase | `void` |
| `createComputed` | `solid-js` | Before-render state synchronization | `void` |
| `batch` | `solid-js` | Defer propagation until callback completes | `T` (return value) |
| `untrack` | `solid-js` | Prevent dependency tracking | `T` (return value) |
| `on` | `solid-js` | Explicit dependency specification for effects | `EffectFunction` |
| `onMount` | `solid-js` | Run once after DOM mount (non-tracking) | `void` |
| `onCleanup` | `solid-js` | Dispose resources on scope cleanup (LIFO) | `void` |
| `observable` | `solid-js` | Convert signal to RxJS Observable | `Observable<T>` |
| `from` | `solid-js` | Bridge external reactive source to signal | `Accessor<T>` |

### Critical Warnings

**ALWAYS** call signal getters as functions: `count()`, NEVER `count`. Forgetting the parentheses reads the getter function itself, not the value, and breaks reactivity tracking.

**NEVER** use dependency arrays. SolidJS tracks dependencies automatically. Writing `createEffect(() => { ... }, [dep])` does NOT work like React's `useEffect`.

**NEVER** destructure props or store objects. Destructuring reads values once and kills reactive tracking. ALWAYS access properties on the original object.

**ALWAYS** remember: the component function runs ONCE. Only reactive expressions (effects, memos, JSX bindings) re-execute. Top-level code is setup code, not render code.

**NEVER** return cleanup functions from effects. SolidJS uses `onCleanup()` as a separate call, not a return value like React's `useEffect`.

**NEVER** use `createEffect` for derived values. ALWAYS use `createMemo` instead. Effects are for side effects only.

---

## Decision Tree: Which Primitive to Use

```
Need reactive state?
  YES --> Simple value? --> createSignal
         Complex/nested object? --> createStore (see solid-syntax-stores)

Need derived value?
  YES --> Synchronous? --> createMemo
         Asynchronous? --> createResource

Need side effect?
  YES --> After render, DOM available? --> createEffect
         During render, synchronous? --> createRenderEffect
         Before render, state sync? --> createComputed

Need lifecycle hook?
  YES --> Run once on mount? --> onMount
         Cleanup on disposal? --> onCleanup

Need to control tracking?
  YES --> Prevent tracking? --> untrack
         Explicit deps only? --> on
         Defer propagation? --> batch

Need external interop?
  YES --> Signal to Observable? --> observable
         Observable to Signal? --> from
```

---

## Effect Execution Timing

| Aspect | createComputed | createRenderEffect | createEffect |
|--------|----------------|-------------------|--------------|
| **When** | Before render | During render (synchronous) | After render completes |
| **Initial run** | Before DOM exists | Before DOM mount | After DOM mount |
| **Refs available** | No | No (initial run) | Yes |
| **Re-runs** | Before render cycle | After memos, before paint | After render + memos |
| **SSR behavior** | Runs | Runs once (synchronous phase) | NEVER runs |
| **Use case** | State synchronization | DOM measurements | Side effects, subscriptions |

---

## Core Primitives

### createSignal

The foundational reactive atom. Returns a getter function and a setter function.

```typescript
const [count, setCount] = createSignal<number>(0);

// Read: ALWAYS call as function
count(); // 0

// Write: direct value
setCount(5);

// Write: functional update (receives previous)
setCount((prev) => prev + 1);

// Options: custom equality, debug name
const [data, setData] = createSignal<Data>(initial, {
  equals: (prev, next) => prev.id === next.id,
  name: "userData",
});

// Always-notify (skip equality check)
const [tick, setTick] = createSignal(0, { equals: false });
```

**WRONG (React) vs CORRECT (SolidJS):**

```typescript
// WRONG -- React useState returns a value, not a getter
const [count, setCount] = useState(0);
return <div>{count}</div>;      // React re-renders entire component

// CORRECT -- SolidJS createSignal returns a getter function
const [count, setCount] = createSignal(0);
return <div>{count()}</div>;    // Only this text node updates
```

### createEffect

Runs side effects when tracked dependencies change. Dependencies are tracked automatically.

```typescript
createEffect(() => {
  document.title = `Count: ${count()}`; // Auto-tracks count
});

// With previous value
createEffect((prev: number) => {
  const current = count();
  console.log("Changed from", prev, "to", current);
  return current;
}, 0);

// Cleanup inside effects
createEffect(() => {
  const handler = () => console.log(count());
  window.addEventListener("resize", handler);
  onCleanup(() => window.removeEventListener("resize", handler));
});
```

**WRONG (React) vs CORRECT (SolidJS):**

```typescript
// WRONG -- React: manual dependency array
useEffect(() => { console.log(count); }, [count]);

// CORRECT -- SolidJS: automatic tracking, no array
createEffect(() => { console.log(count()); });

// WRONG -- React: return cleanup function
useEffect(() => { return () => cleanup(); }, []);

// CORRECT -- SolidJS: onCleanup is a separate call
createEffect(() => { onCleanup(() => cleanup()); });
```

### createMemo

Cached derived value that IS a reactive source. Unlike React's `useMemo`, other computations can track a memo.

```typescript
const double = createMemo(() => count() * 2);
// double() is cached, recalculates only when count() changes

// Memos ARE trackable reactive sources
createEffect(() => console.log(double())); // Tracks double

const filtered = createMemo(() =>
  items().filter((item) => item.active)
);
```

**WRONG (React) vs CORRECT (SolidJS):**

```typescript
// WRONG -- Using effect + signal for derived values
createEffect(() => { setDouble(count() * 2); }); // Unnecessary

// CORRECT -- Use createMemo for derived values
const double = createMemo(() => count() * 2);
```

### createResource

Async data fetching with built-in loading/error states and Suspense integration.

```tsx
// Basic fetch
const [data] = createResource(async () => {
  const res = await fetch("/api/data");
  return res.json();
});

// Source-based: auto-refetches when userId changes
const [userId, setUserId] = createSignal(1);
const [user] = createResource(userId, async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

// With actions
const [posts, { refetch, mutate }] = createResource(fetchPosts);
mutate((prev) => [...prev, newPost]); // Optimistic update
await refetch();                       // Manual refetch

// In JSX with Suspense
<Suspense fallback={<Spinner />}>
  <UserProfile />
</Suspense>
```

**Resource states:** `data.state` is one of `"unresolved" | "pending" | "ready" | "refreshing" | "errored"`. Use `data.loading`, `data.error`, and `data.latest` for UI rendering.

---

## Reactive Utilities

### batch

Defers all downstream updates until the callback completes. Reduces `m x n` updates to `m` updates.

```typescript
batch(() => {
  setFirstName("John");
  setLastName("Doe");
  setAge(30);
}); // All downstream effects fire ONCE here
```

**ALWAYS** remember: async breaks batching. Only updates before the first `await` are batched. Effects and store setters auto-batch internally.

### untrack

Reads a signal without creating a dependency.

```typescript
createEffect(() => {
  // count() IS tracked, name() is NOT
  console.log(count(), untrack(() => name()));
});
```

### on

Explicitly specifies which dependencies to track. Use `defer: true` to skip the initial run.

```typescript
createEffect(on(userId, (id, prevId) => {
  console.log("User changed from", prevId, "to", id);
}, { defer: true }));

// Multiple explicit deps
createEffect(on([a, b], ([aVal, bVal]) => {
  console.log(aVal, bVal);
}));
```

---

## Lifecycle

### onMount / onCleanup

```typescript
function Timer() {
  let ref: HTMLDivElement;

  onMount(() => {
    // DOM is available, refs are set
    ref.focus();
  });

  const timer = setInterval(() => tick(), 1000);
  onCleanup(() => clearInterval(timer)); // LIFO order

  return <div ref={ref}>...</div>;
}
```

---

## Reactive Anti-Patterns (React Contamination)

| React Pattern | Why It Breaks SolidJS | SolidJS Equivalent |
|--------------|----------------------|-------------------|
| `const { name } = props` | Destructures once, kills tracking | `props.name` (access on object) |
| `const val = signal()` at top level | Snapshot, never updates | Call `signal()` where needed |
| `useEffect(() => {}, [deps])` | No dependency arrays in SolidJS | `createEffect(() => { })` |
| `useMemo(() => x, [deps])` | Not a reactive source | `createMemo(() => x)` |
| `useEffect(() => { return cleanup })` | Return value ignored | `onCleanup(() => cleanup())` |
| `useEffect(() => {}, [])` for mount | Wrong semantics | `onMount(() => { })` |
| Early return before signal access | Skipped signals lose tracking | Access all signals first, then branch |
| `setState({...state, key: val})` | Full replacement, not granular | `setStore("key", val)` path syntax |

---

## SolidJS 2.x Changes

| Feature | 1.x | 2.x |
|---------|-----|-----|
| Reactivity | Synchronous | Microtask-batched (use `flush()` for immediate) |
| Effects | `createEffect` | Split compute/apply pattern |
| Mount hook | `onMount` | `onSettled` (can return cleanup) |
| Derived state | `createMemo` only | `createSignal(fn)` for derived-but-writable |

---

## Reference Links

- [references/methods.md](references/methods.md) -- Complete API signatures for all 13 reactive primitives
- [references/examples.md](references/examples.md) -- Usage patterns and reactive composition examples
- [references/anti-patterns.md](references/anti-patterns.md) -- React patterns that break SolidJS with corrections

### Official Sources

- https://docs.solidjs.com/concepts/intro-to-reactivity
- https://docs.solidjs.com/concepts/signals
- https://docs.solidjs.com/reference/basic-reactivity/create-signal
- https://docs.solidjs.com/reference/basic-reactivity/create-effect
- https://docs.solidjs.com/reference/basic-reactivity/create-memo
- https://docs.solidjs.com/reference/basic-reactivity/create-resource
- https://docs.solidjs.com/reference/secondary-primitives/create-render-effect
- https://docs.solidjs.com/reference/secondary-primitives/create-computed
- https://docs.solidjs.com/reference/reactive-utilities/batch
- https://docs.solidjs.com/reference/reactive-utilities/untrack
- https://docs.solidjs.com/reference/reactive-utilities/observable
- https://docs.solidjs.com/reference/reactive-utilities/from
- https://docs.solidjs.com/reference/lifecycle/on-mount
- https://docs.solidjs.com/reference/lifecycle/on-cleanup
