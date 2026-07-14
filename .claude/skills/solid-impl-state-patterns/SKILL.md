---
name: solid-impl-state-patterns
description: >
  Use when designing state architecture or choosing between signals, stores, and context in SolidJS.
  Prevents using createEffect for derived state, capturing signal snapshots, and incorrect store mutation patterns.
  Covers createSignal vs createStore decision matrix, context providers, createMemo for derived state, form state patterns, and state composition strategies.
  Keywords: createSignal, createStore, createContext, createMemo, global state,
  context provider, state management, derived state, signal vs store, when to
  use which, share state between components, global reactive state.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x with TypeScript."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-impl-state-patterns

## Quick Reference

### State Primitives Overview

| Primitive | Import | Use Case | Access Syntax |
|-----------|--------|----------|---------------|
| `createSignal` | `solid-js` | Single values, primitives, toggles | `signal()` (getter function) |
| `createStore` | `solid-js/store` | Nested objects, arrays, complex state | `store.prop` (direct access) |
| `createContext` | `solid-js` | Shared state across component tree | Provider + `useContext` |
| `createMemo` | `solid-js` | Derived/computed values | `memo()` (getter function) |
| `createMutable` | `solid-js/store` | MobX/Vue migration only | `state.prop` (direct mutation) |

### Critical Warnings

**NEVER** use `createEffect` to synchronize derived state — ALWAYS use `createMemo` instead. Effects are for side effects (DOM, network, logging), not for computing values from other signals.

**NEVER** store signal values in variables outside tracking scopes — the variable captures a snapshot, not a reactive binding. ALWAYS call the getter function where you need the current value.

**NEVER** destructure props or stores — destructuring reads values once and breaks reactive tracking. ALWAYS access properties through the proxy object.

**NEVER** use Redux, useReducer, or Zustand patterns — SolidJS has built-in primitives (signals, stores, context) that are more efficient and idiomatic.

**NEVER** use global mutable variables for shared state — ALWAYS use `createContext` + `createStore` for type-safe, reactive, scoped state sharing.

---

## State Selection Decision Tree

```
Need state? → What kind of data?
│
├─ Single primitive value (string, number, boolean)
│  → createSignal
│
├─ Object with nested properties / array of items
│  → createStore
│
├─ Derived from other state (computed value)
│  → createMemo (NEVER createEffect + createSignal)
│
├─ Shared across multiple components
│  │
│  ├─ Parent → children (1-2 levels deep)
│  │  → Pass as props (direct)
│  │
│  └─ Across distant components / app-wide
│     → createContext + createStore + Provider
│
├─ Async data from server/API
│  → createResource (SolidJS 1.x) or createAsync (with @solidjs/router)
│
└─ External reactive source (RxJS, custom)
   → from() utility
```

### When to Use Signals vs Stores

| Scenario | Use Signal | Use Store |
|----------|-----------|-----------|
| Counter, toggle, input value | YES | No |
| User profile object | No | YES |
| List of items (todos, products) | No | YES |
| Theme (single string) | YES | No |
| Form with multiple fields | No | YES |
| Nested config object | No | YES |
| Loading/error boolean | YES | No |

---

## Global State Pattern: Context + Store

The canonical SolidJS pattern for shared state combines `createContext`, `createStore`, and a Provider component with a custom hook.

```tsx
import { createContext, useContext, ParentProps } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

// 1. Define state shape
interface AppState {
  user: { name: string; email: string } | null;
  theme: "light" | "dark";
  notifications: { id: string; message: string }[];
}

// 2. Define context type (state + actions)
type AppContextValue = [
  state: AppState,
  actions: {
    setUser: (user: AppState["user"]) => void;
    toggleTheme: () => void;
    addNotification: (message: string) => void;
    removeNotification: (id: string) => void;
  }
];

// 3. Create context (no default value — enforce Provider usage)
const AppContext = createContext<AppContextValue>();

// 4. Provider component with store + actions
export function AppProvider(props: ParentProps) {
  const [state, setState] = createStore<AppState>({
    user: null,
    theme: "light",
    notifications: [],
  });

  const actions = {
    setUser: (user: AppState["user"]) => setState("user", user),
    toggleTheme: () =>
      setState("theme", (prev) => (prev === "light" ? "dark" : "light")),
    addNotification: (message: string) =>
      setState("notifications", (prev) => [
        ...prev,
        { id: crypto.randomUUID(), message },
      ]),
    removeNotification: (id: string) =>
      setState("notifications", (prev) => prev.filter((n) => n.id !== id)),
  };

  return (
    <AppContext.Provider value={[state, actions]}>
      {props.children}
    </AppContext.Provider>
  );
}

// 5. Custom hook with safety check
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
```

**Usage in components:**

```tsx
function Header() {
  const [state, { toggleTheme }] = useApp();
  return (
    <header>
      <span>{state.user?.name ?? "Guest"}</span>
      <button onClick={toggleTheme}>Theme: {state.theme}</button>
    </header>
  );
}
```

---

## Derived State with createMemo

ALWAYS use `createMemo` for values computed from other reactive state. Memos cache results and only recompute when dependencies change.

```tsx
import { createSignal, createMemo } from "solid-js";

const [items, setItems] = createSignal<{ price: number; qty: number }[]>([]);
const [taxRate, setTaxRate] = createSignal(0.21);

// CORRECT: Derived values via createMemo
const subtotal = createMemo(() =>
  items().reduce((sum, item) => sum + item.price * item.qty, 0)
);
const tax = createMemo(() => subtotal() * taxRate());
const total = createMemo(() => subtotal() + tax());

// Memos chain: items/taxRate → subtotal → tax → total
// Changing taxRate recalculates tax and total, but NOT subtotal
```

### Derived State Anti-Pattern

```tsx
// WRONG: Using createEffect to sync derived state
const [count, setCount] = createSignal(0);
const [double, setDouble] = createSignal(0);

createEffect(() => {
  setDouble(count() * 2); // Unnecessary signal + effect cycle
});

// CORRECT: createMemo — no extra signal, no effect
const double = createMemo(() => count() * 2);
```

---

## Form State Pattern

### Store-Based Form (Recommended for Multi-Field Forms)

```tsx
import { createStore } from "solid-js/store";
import { createSignal, Show } from "solid-js";

interface FormData {
  name: string;
  email: string;
  role: "admin" | "user" | "viewer";
}

interface FormErrors {
  name?: string;
  email?: string;
}

function UserForm() {
  const [form, setForm] = createStore<FormData>({
    name: "",
    email: "",
    role: "user",
  });
  const [errors, setErrors] = createStore<FormErrors>({});
  const [submitting, setSubmitting] = createSignal(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.includes("@")) newErrors.email = "Invalid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await saveUser(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.name}
        onInput={(e) => setForm("name", e.currentTarget.value)}
      />
      <Show when={errors.name}><span class="error">{errors.name}</span></Show>

      <input
        value={form.email}
        onInput={(e) => setForm("email", e.currentTarget.value)}
      />
      <Show when={errors.email}><span class="error">{errors.email}</span></Show>

      <select
        value={form.role}
        onChange={(e) => setForm("role", e.currentTarget.value as FormData["role"])}
      >
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="viewer">Viewer</option>
      </select>

      <button type="submit" disabled={submitting()}>
        {submitting() ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

---

## State Composition Strategies

### splitProps for Prop Separation

```tsx
import { splitProps } from "solid-js";

function Button(props: {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  onClick: () => void;
  children: any;
  class?: string;
  disabled?: boolean;
}) {
  const [local, others] = splitProps(props, ["variant", "size", "children"]);
  return (
    <button
      {...others}
      class={`btn btn-${local.variant} btn-${local.size} ${others.class ?? ""}`}
    >
      {local.children}
    </button>
  );
}
```

### Multiple Contexts (Feature Slicing)

ALWAYS create separate contexts for unrelated state domains. This prevents unnecessary re-computations.

```tsx
// auth-context.tsx
export function AuthProvider(props: ParentProps) { /* ... */ }
export function useAuth() { /* ... */ }

// theme-context.tsx
export function ThemeProvider(props: ParentProps) { /* ... */ }
export function useTheme() { /* ... */ }

// Compose at app root
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### External State Integration with from()

```tsx
import { from } from "solid-js";

// Bridge RxJS observable into SolidJS signal
const currentUser = from(userService.currentUser$);

// Bridge custom subscription
const windowWidth = from((set) => {
  const handler = () => set(window.innerWidth);
  window.addEventListener("resize", handler);
  handler(); // Set initial value
  return () => window.removeEventListener("resize", handler);
});
```

### reconcile() for External Data Sync

```tsx
import { createStore, reconcile } from "solid-js/store";

const [state, setState] = createStore({ todos: [] as Todo[] });

// Sync external data — only changed properties trigger updates
websocket.on("todos-updated", (newTodos: Todo[]) => {
  setState("todos", reconcile(newTodos));
});
```

---

## Reference Links

- [references/methods.md](references/methods.md) -- Pattern signatures for context+store, derived state, form state patterns
- [references/examples.md](references/examples.md) -- Working code examples: global state, derived state, form management, counter/theme providers
- [references/anti-patterns.md](references/anti-patterns.md) -- Redux patterns, prop drilling, global mutable variables, unnecessary state

### Official Sources

- https://docs.solidjs.com/concepts/signals
- https://docs.solidjs.com/concepts/stores
- https://docs.solidjs.com/concepts/context
- https://docs.solidjs.com/reference/basic-reactivity/create-signal
- https://docs.solidjs.com/reference/basic-reactivity/create-memo
- https://docs.solidjs.com/reference/store-utilities/create-store
- https://docs.solidjs.com/reference/reactive-utilities/from
- https://docs.solidjs.com/reference/store-utilities/reconcile
