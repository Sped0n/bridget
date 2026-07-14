---
name: solid-agents-review
description: >
  Use when reviewing generated SolidJS code, validating a SolidJS project, or checking for React pattern contamination.
  Prevents silent reactivity breaks from incorrect signal access, destructured props, wrong control flow, and store mutation errors.
  Covers signal access patterns, control flow components, props handling, store mutations, event handling, and context usage.
  Keywords: SolidJS review, code validation, React contamination, signal access,
  createSignal, Show, For, props, stores, check my SolidJS code, is this correct,
  review component, validate SolidJS.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-agents-review

## Quick Reference

Run this checklist on EVERY generated SolidJS code block. Each item has a severity level:

- **CRITICAL** -- Breaks reactivity silently. Code appears to work but updates fail.
- **WARNING** -- Suboptimal pattern. Works but causes performance issues or maintenance problems.
- **INFO** -- Style issue. Does not break functionality but violates SolidJS idioms.

---

## 1. Signal Access Checks

### CRITICAL: Signals MUST be called as functions in JSX and reactive scopes

```tsx
// WRONG -- signal value read once, never updates
const [count, setCount] = createSignal(0);
return <div>{count}</div>;

// CORRECT -- signal called as function, tracked reactively
return <div>{count()}</div>;
```

### CRITICAL: NEVER store signal results in variables outside reactive scopes

```tsx
// WRONG -- snapshot, never updates
const value = count();
return <div>{value}</div>;

// CORRECT -- call getter where the value is needed
return <div>{count()}</div>;
```

### CRITICAL: NEVER destructure signal getters from arrays or objects

```tsx
// WRONG -- extracted once, loses tracking
const currentCount = count();

// CORRECT -- use createMemo for derived state
const doubled = createMemo(() => count() * 2);
```

### WARNING: Use createMemo for derived values, NOT createEffect + setSignal

```tsx
// WRONG -- unnecessary effect/signal pair
const [doubled, setDoubled] = createSignal(0);
createEffect(() => setDoubled(count() * 2));

// CORRECT -- createMemo caches derived state
const doubled = createMemo(() => count() * 2);
```

### CRITICAL: NEVER access signals conditionally before other signals in effects

```tsx
// WRONG -- name() not tracked when loading() is true
createEffect(() => {
  if (loading()) return;
  console.log(name());
});

// CORRECT -- access all signals first, then use conditionally
createEffect(() => {
  const isLoading = loading();
  const currentName = name();
  if (isLoading) return;
  console.log(currentName);
});
```

---

## 2. Props Checks

### CRITICAL: NEVER destructure props

```tsx
// WRONG -- kills reactivity
function Greeting({ name }: { name: string }) {
  return <h1>{name}</h1>;
}

// WRONG -- also kills reactivity
function Greeting(props: { name: string }) {
  const { name } = props;
  return <h1>{name}</h1>;
}

// CORRECT -- access props directly
function Greeting(props: { name: string }) {
  return <h1>{props.name}</h1>;
}
```

### WARNING: Use splitProps to separate prop groups reactively

```tsx
// CORRECT -- preserves reactivity while splitting
const [local, others] = splitProps(props, ["class", "onClick"]);
return <div class={local.class} {...others} />;
```

### WARNING: Use mergeProps for default prop values

```tsx
// CORRECT -- reactive defaults
const merged = mergeProps({ variant: "primary" }, props);
return <button class={merged.variant}>{props.children}</button>;
```

### WARNING: Use children() helper when manipulating props.children

```tsx
// WRONG -- may re-create children on each access
const kids = props.children;

// CORRECT -- resolve and cache children
import { children } from "solid-js";
const resolved = children(() => props.children);
return <div>{resolved()}</div>;
```

---

## 3. Control Flow Checks

### WARNING: Use `<For>` instead of Array.map for list rendering

```tsx
// WRONG -- re-creates all DOM nodes on change
{items().map((item) => <div key={item.id}>{item.name}</div>)}

// CORRECT -- fine-grained updates per item
<For each={items()}>
  {(item) => <div>{item.name}</div>}
</For>
```

### WARNING: Use `<Show>` instead of ternary for conditional rendering

```tsx
// WRONG -- can cause unnecessary DOM recreation
{isLoggedIn() ? <Dashboard /> : <Login />}

// CORRECT -- reactive conditional rendering
<Show when={isLoggedIn()} fallback={<Login />}>
  <Dashboard />
</Show>
```

### WARNING: Use `<Switch>`/`<Match>` instead of switch statements or chained ternaries

```tsx
// CORRECT
<Switch fallback={<NotFound />}>
  <Match when={route() === "home"}><Home /></Match>
  <Match when={route() === "about"}><About /></Match>
</Switch>
```

### INFO: NEVER use the `key` prop -- SolidJS `<For>` tracks by reference

```tsx
// WRONG -- key prop is ignored in SolidJS
<For each={items()}>
  {(item) => <div key={item.id}>{item.name}</div>}
</For>

// CORRECT -- no key needed
<For each={items()}>
  {(item) => <div>{item.name}</div>}
</For>
```

### INFO: Use `<Index>` for arrays of primitives, `<For>` for arrays of objects

---

## 4. Store Checks

### CRITICAL: NEVER destructure store properties

```tsx
// WRONG -- snapshot, loses reactivity
const { username } = store.users[0];

// CORRECT -- access in tracking scope
<span>{store.users[0].username}</span>
```

### CRITICAL: Use setStore path syntax for updates, NEVER spread-replace

```tsx
// WRONG -- replaces entire state, breaks fine-grained tracking
setStore({ ...store, count: store.count + 1 });

// CORRECT -- surgical path update
setStore("count", (c) => c + 1);
setStore("users", 0, "loggedIn", true);
```

### WARNING: Use produce for complex mutations

```tsx
// CORRECT -- Immer-style mutations applied immutably
setStore(produce((state) => {
  state.users.push(newUser);
  state.count += 1;
}));
```

---

## 5. Component Checks

### CRITICAL: NEVER use early returns for conditional rendering

```tsx
// WRONG -- component body runs once, early return is permanent
function Profile(props: { user: User | null }) {
  if (!props.user) return <p>Loading...</p>;
  return <div>{props.user.name}</div>;
}

// CORRECT -- use Show for reactive conditional
function Profile(props: { user: User | null }) {
  return (
    <Show when={props.user} fallback={<p>Loading...</p>}>
      {(user) => <div>{user().name}</div>}
    </Show>
  );
}
```

### WARNING: Use correct event binding patterns

```tsx
// WRONG -- calls handler immediately, assigns return value
<button onClick={handleClick()}>Click</button>

// CORRECT -- passes handler reference
<button onClick={handleClick}>Click</button>

// CORRECT -- arrow function for arguments
<button onClick={() => handleClick(id)}>Click</button>

// CORRECT -- array syntax avoids closure creation
<button onClick={[handleClick, id]}>Click</button>
```

### INFO: Use `let ref!: HTMLElement` for refs, NOT useRef

```tsx
// CORRECT
let inputRef!: HTMLInputElement;
onMount(() => inputRef.focus());
return <input ref={inputRef} />;
```

### INFO: Declare directives in module scope for TypeScript

```tsx
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      clickOutside: () => void;
    }
  }
}
```

---

## 6. React Contamination Scan

### CRITICAL: Scan for ALL React imports and hooks

NEVER allow these in SolidJS code:

| React Pattern | SolidJS Replacement |
|---------------|-------------------|
| `useState` | `createSignal` |
| `useEffect` | `createEffect` |
| `useMemo` | `createMemo` |
| `useRef` | `let ref!: T` |
| `useCallback` | Not needed (no re-renders) |
| `useContext` | `useContext` (same name, different import) |
| `forwardRef` | Pass `ref` as regular prop |
| `React.createElement` | SolidJS JSX compiler |
| `React.memo` | Not needed (no re-renders) |
| `useReducer` | `createStore` |

### CRITICAL: NEVER use dependency arrays

```tsx
// WRONG -- dependency arrays are a React concept
createEffect(() => {
  console.log(count());
}, [count]);

// CORRECT -- automatic tracking, no deps
createEffect(() => {
  console.log(count());
});
```

### CRITICAL: NEVER return cleanup from effects

```tsx
// WRONG -- React cleanup pattern
createEffect(() => {
  const id = setInterval(fn, 1000);
  return () => clearInterval(id);
});

// CORRECT -- use onCleanup
createEffect(() => {
  const id = setInterval(fn, 1000);
  onCleanup(() => clearInterval(id));
});
```

### CRITICAL: NEVER use `element={}` on Route definitions

```tsx
// WRONG -- React Router pattern
<Route path="/" element={<Home />} />

// CORRECT -- Solid Router pattern
<Route path="/" component={Home} />
```

---

## Review Procedure

Execute these checks in order on every generated SolidJS code block:

1. **Import scan** -- Flag ANY import from `react`, `react-dom`, `react-router-dom`
2. **Hook scan** -- Flag `useState`, `useEffect`, `useMemo`, `useRef`, `useCallback`, `useReducer`, `forwardRef`
3. **Signal access** -- Verify ALL signals are called as functions `signal()` in JSX
4. **Props handling** -- Verify NO destructuring of props objects
5. **Control flow** -- Verify `<For>`, `<Show>`, `<Switch>` used instead of `.map()`, ternaries, switch statements
6. **Store access** -- Verify NO destructuring of store properties
7. **Store updates** -- Verify path syntax used, no spread-replace
8. **Early returns** -- Verify NO early returns in component bodies for conditional rendering
9. **Cleanup** -- Verify `onCleanup()` used, NOT return from effects
10. **Dependency arrays** -- Verify NO `[deps]` passed to createEffect/createMemo
11. **key prop** -- Flag any usage of `key={}` in JSX
12. **Refs** -- Verify `let ref!: T` pattern, NOT `useRef`

---

## Reference Links

- [references/methods.md](references/methods.md) -- Complete validation checklist organized by area
- [references/examples.md](references/examples.md) -- Review scenarios with good code, bad code, and fixes
- [references/anti-patterns.md](references/anti-patterns.md) -- All React contamination patterns consolidated for scanning

### Official Sources

- https://docs.solidjs.com/concepts/intro-to-reactivity
- https://docs.solidjs.com/concepts/components/props
- https://docs.solidjs.com/reference/basic-reactivity/create-signal
- https://docs.solidjs.com/reference/basic-reactivity/create-effect
- https://docs.solidjs.com/reference/basic-reactivity/create-memo
- https://docs.solidjs.com/reference/store-utilities/create-store
- https://docs.solidjs.com/reference/components/for
- https://docs.solidjs.com/reference/components/show
