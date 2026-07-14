---
name: solid-syntax-context
description: >
  Use when sharing state between components, creating providers, or implementing dependency injection in SolidJS.
  Prevents non-reactive context values and missing Provider errors common when porting React context patterns.
  Covers createContext, useContext, Provider pattern, reactive context with signals and stores, typed context, custom hooks, and nested overrides.
  Keywords: createContext, useContext, Provider, SolidJS context, dependency
  injection, shared state, typed context, share data between components,
  avoid prop drilling, global provider.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x with TypeScript."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-syntax-context

## Quick Reference

### Context API Surface

| Function | Import | Purpose |
|----------|--------|---------|
| `createContext<T>(default?)` | `solid-js` | Create a context object with optional default value |
| `useContext(ctx)` | `solid-js` | Read the nearest Provider's value for a context |
| `<Ctx.Provider value={v}>` | (from context object) | Supply a value to all descendants |

### Type Signatures

```typescript
// createContext
interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}
function createContext<T>(): Context<T | undefined>;
function createContext<T>(defaultValue: T): Context<T>;

// useContext
function useContext<T>(context: Context<T>): T;
```

### Critical Warnings

**ALWAYS** provide a typed generic to `createContext<T>()` — omitting the generic results in `Context<undefined>` which provides no type safety for consumers.

**ALWAYS** wrap `useContext` in a custom hook with an error check — calling `useContext` directly gives no feedback when a Provider is missing.

**NEVER** destructure or access signals/stores when passing them to `value` — pass the signal accessor or store object directly to preserve reactivity.

**NEVER** rely on the default value as a functional substitute for a Provider — defaults exist only as a type-narrowing fallback, not as working application state.

**ALWAYS** define context objects in separate modules — this prevents Hot Module Replacement (HMR) issues where context identity is lost on file reload.

---

## Decision Tree: Context vs Props vs Global Signals

```
Need to share state between components?
├── Only parent → child (1-2 levels)?
│   └── USE PROPS — simplest, most explicit
├── Deep tree (3+ levels) but single subtree?
│   └── USE CONTEXT — avoids prop drilling, scoped to Provider
├── Multiple unrelated trees need same state?
│   ├── Read-only singleton?
│   │   └── USE MODULE-LEVEL SIGNAL — simplest global state
│   └── Needs encapsulation + methods?
│       └── USE CONTEXT + STORE — full reactive state container
└── Server-provided data needed in deep components?
    └── USE CONTEXT — Provider wraps at route level
```

---

## Core Patterns

### 1. Basic Context (Typed, with Custom Hook)

This is the **recommended pattern** for all context usage:

```tsx
// counter-context.tsx — ALWAYS define in a separate module
import { createContext, useContext, type ParentProps } from "solid-js";
import { createSignal } from "solid-js";

interface CounterState {
  count: () => number;
  increment: () => void;
  decrement: () => void;
}

const CounterContext = createContext<CounterState>();

// ALWAYS export a custom hook — NEVER export the raw context
export function useCounter(): CounterState {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error("useCounter: must be used within a <CounterProvider>");
  }
  return context;
}

export function CounterProvider(props: ParentProps) {
  const [count, setCount] = createSignal(0);

  const value: CounterState = {
    count,
    increment: () => setCount((c) => c + 1),
    decrement: () => setCount((c) => c - 1),
  };

  return (
    <CounterContext.Provider value={value}>
      {props.children}
    </CounterContext.Provider>
  );
}
```

```tsx
// app.tsx — usage
import { CounterProvider, useCounter } from "./counter-context";

function Display() {
  const { count } = useCounter();
  return <p>Count: {count()}</p>;
}

function Controls() {
  const { increment, decrement } = useCounter();
  return (
    <div>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
    </div>
  );
}

export default function App() {
  return (
    <CounterProvider>
      <Display />
      <Controls />
    </CounterProvider>
  );
}
```

### 2. Context with Store (Complex State)

```tsx
import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

interface TodoState {
  todos: Todo[];
}

type TodoContextValue = [
  state: TodoState,
  actions: {
    addTodo: (text: string) => void;
    toggleTodo: (id: number) => void;
  },
];

const TodoContext = createContext<TodoContextValue>();

export function useTodos(): TodoContextValue {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodos: must be used within a <TodoProvider>");
  }
  return context;
}

export function TodoProvider(props: ParentProps) {
  const [state, setState] = createStore<TodoState>({ todos: [] });

  const actions = {
    addTodo(text: string) {
      setState("todos", (prev) => [
        ...prev,
        { id: Date.now(), text, done: false },
      ]);
    },
    toggleTodo(id: number) {
      setState("todos", (t) => t.id === id, "done", (d) => !d);
    },
  };

  return (
    <TodoContext.Provider value={[state, actions]}>
      {props.children}
    </TodoContext.Provider>
  );
}
```

### 3. Nested Context Override

Inner Providers override outer Providers for the same context:

```tsx
import { ThemeProvider, useTheme } from "./theme-context";

function ThemedBox() {
  const { theme } = useTheme();
  return <div style={{ background: theme().bg }}>{theme().name}</div>;
}

function App() {
  return (
    <ThemeProvider theme="light">
      <ThemedBox />            {/* reads "light" */}
      <ThemeProvider theme="dark">
        <ThemedBox />          {/* reads "dark" — inner overrides outer */}
      </ThemeProvider>
    </ThemeProvider>
  );
}
```

---

## Reactivity Rules

| Pattern | Reactive? | Why |
|---------|-----------|-----|
| `value={{ count: count() }}` | NO | Object is created once at Provider render; `count()` is read once |
| `value={{ count }}` (passing accessor) | YES | Accessor function is called in consuming component's render |
| `value={store}` (passing store proxy) | YES | Store proxy tracks property access in consumers |
| `value={[state, actions]}` (tuple) | YES | If `state` is a store or contains accessors |

**Rule**: ALWAYS pass signal accessors (functions) or store proxies as context values. NEVER call signals inside the `value` prop object literal — this reads the value once and breaks reactivity.

---

## Reference Links

- [references/methods.md](references/methods.md) — Full type signatures for createContext, useContext, Provider
- [references/examples.md](references/examples.md) — Extended examples: reactive context, typed context, nested contexts, context + stores
- [references/anti-patterns.md](references/anti-patterns.md) — Common mistakes: missing Provider, broken reactivity, React contamination

### Official Sources

- https://docs.solidjs.com/concepts/context
- https://docs.solidjs.com/reference/component-apis/create-context
- https://docs.solidjs.com/reference/component-apis/use-context
