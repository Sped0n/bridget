---
name: solid-syntax-stores
description: >
  Use when managing complex nested state, updating objects or arrays, or choosing between signals and stores in SolidJS.
  Prevents direct state mutation and spread-copy patterns that destroy store proxy reactivity.
  Covers createStore, setStore path syntax, produce, reconcile, unwrap, and createMutable.
  Keywords: createStore, setStore, produce, reconcile, unwrap, createMutable,
  SolidJS store, nested state, proxy reactivity, complex state, update nested
  object, array mutation, store not updating.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x with TypeScript."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-syntax-stores

## Quick Reference

### Import

```typescript
// ALL store utilities come from "solid-js/store" — NEVER from "solid-js"
import { createStore, produce, reconcile, unwrap, createMutable } from "solid-js/store";
```

### Store Primitives Overview

| Primitive | Purpose | Import |
|-----------|---------|--------|
| `createStore` | Proxy-based reactive state for nested data | `solid-js/store` |
| `setStore` | Path-syntax setter for surgical updates | Returned by `createStore` |
| `produce` | Immer-style mutation syntax | `solid-js/store` |
| `reconcile` | Data diffing for API responses | `solid-js/store` |
| `unwrap` | Strip reactive proxy to plain object | `solid-js/store` |
| `createMutable` | Direct mutation store (MobX/Vue-style) | `solid-js/store` |

### Stores vs Signals Decision Tree

| Question | Use Signal | Use Store |
|----------|-----------|-----------|
| Single primitive value (string, number, boolean)? | YES | NO |
| Nested object with multiple properties? | NO | YES |
| Array of objects that update individually? | NO | YES |
| Need fine-grained tracking per property? | NO | YES |
| Simple toggle or counter? | YES | NO |
| Form with many fields? | NO | YES |
| API response data (objects/arrays)? | NO | YES |

**Rule of thumb:** ALWAYS use `createStore` when your state is an object or array. ALWAYS use `createSignal` for primitives.

### Stores vs Signals Syntax Comparison

| Aspect | Signal | Store |
|--------|--------|-------|
| Create | `const [val, setVal] = createSignal(0)` | `const [store, setStore] = createStore({x: 0})` |
| Read | `val()` (function call) | `store.x` (property access) |
| Write | `setVal(1)` | `setStore("x", 1)` |
| Nested update | N/A | `setStore("a", "b", "c", value)` |
| Reactivity unit | Entire value | Per property |

---

## Critical Warnings

**NEVER destructure a store — it kills reactivity:**

```typescript
// WRONG — Reads value once, loses all reactive tracking
const { username } = store.users[0];
return <span>{username}</span>; // NEVER updates

// CORRECT — Access store properties in JSX directly
return <span>{store.users[0].username}</span>; // Fine-grained tracking
```

**NEVER call a store property as a function — stores use property access, NOT function calls:**

```typescript
// WRONG — Signals use function calls, stores do NOT
return <span>{store.count()}</span>; // TypeError: store.count is not a function

// CORRECT — Direct property access
return <span>{store.count}</span>; // Tracked reactively via proxy
```

**NEVER replace the entire store with spread — use path syntax for surgical updates:**

```typescript
// WRONG — React pattern: spread/replace destroys fine-grained tracking
setStore({ ...store, name: "Jane" }); // Replaces entire root object

// CORRECT — Path syntax updates only the targeted property
setStore("name", "Jane"); // Only "name" subscribers update
```

**NEVER mutate store directly without createMutable — use setStore or produce:**

```typescript
// WRONG — Direct mutation on a createStore proxy does nothing reactive
store.count = 5; // Silently fails — no subscribers notified

// CORRECT — Use the setter
setStore("count", 5);
```

---

## createStore

Creates a proxy-based reactive store with fine-grained tracking at the property level. Signals are created **lazily** — only when a property is first accessed within a tracking scope.

```typescript
const [store, setStore] = createStore<T>(initialValue: T): [Store<T>, SetStoreFunction<T>];
```

```typescript
const [store, setStore] = createStore({
  user: { firstName: "John", lastName: "Smith" },
  items: [
    { id: 1, text: "Learn SolidJS", done: false },
    { id: 2, text: "Build app", done: false },
  ],
  count: 0,
});
```

---

## setStore Path Syntax

The setter uses a path-based syntax for surgical nested updates. See [references/methods.md](references/methods.md) for complete API signatures.

### Cheat Sheet

| Operation | Syntax |
|-----------|--------|
| Set property | `setStore("key", value)` |
| Nested property | `setStore("a", "b", "c", value)` |
| Array item by index | `setStore("items", 0, "done", true)` |
| Functional update | `setStore("count", (prev) => prev + 1)` |
| Multiple indices | `setStore("items", [0, 2, 4], "done", true)` |
| Range | `setStore("items", { from: 0, to: 5 }, "done", true)` |
| Range with step | `setStore("items", { from: 0, to: 10, by: 2 }, "done", true)` |
| Filter predicate | `setStore("items", (item) => !item.done, "done", true)` |
| Append to array | `setStore("items", store.items.length, newItem)` |
| Object merge | `setStore("user", { lastName: "Doe" })` (shallow merge) |
| Delete property | `setStore("key", undefined)` |

### Object Merge Behavior

When the final value in a path is an object, it performs a **shallow merge** — existing properties are preserved, only specified properties change:

```typescript
setStore("user", { lastName: "Doe" });
// firstName remains "John", only lastName changes to "Doe"
```

---

## Store Utilities

### produce: Immer-Style Mutations

Write mutation-style code that gets applied as reactive updates. See [references/methods.md](references/methods.md) for signature.

```typescript
setState(
  produce((s) => {
    s.user.name = "Jane";
    s.items.push({ id: 3, text: "Deploy", done: false });
    s.items[0].done = true;
  })
);
```

**NEVER use produce with Sets or Maps** — it only works with plain objects and arrays.

Combine produce with path syntax for scoped mutations:

```typescript
setStore("items", 0, produce((item) => {
  item.text = "Updated text";
  item.done = true;
}));
```

### reconcile: Data Diffing

Diffs new data against existing store, updating only what changed. ALWAYS use reconcile when syncing API responses into stores.

```typescript
// Sync API response — only changed properties trigger updates
const response = await fetch("/api/todos");
const todos = await response.json();
setStore("todos", reconcile(todos));
```

Options: `key` (default `"id"`) for item matching, `merge` (default `false`) for leaf-level diffing.

### unwrap: Strip Reactive Proxy

Returns a plain JavaScript object. ALWAYS use unwrap before passing store data to non-SolidJS code.

```typescript
const plain = unwrap(store);
JSON.stringify(plain);           // Safe serialization
thirdPartyLib.process(plain);    // No proxy interference
```

### createMutable: Direct Mutation Store

Allows direct property mutation (MobX/Vue-style). Supports computed getters/setters.

```typescript
const state = createMutable({
  firstName: "John",
  lastName: "Smith",
  get fullName() { return `${this.firstName} ${this.lastName}`; },
  set fullName(value: string) { [this.firstName, this.lastName] = value.split(" "); },
});

state.firstName = "Jane";  // Direct mutation — reactive
```

**NEVER use createMutable as default choice.** ALWAYS prefer `createStore` for unidirectional data flow. Use `createMutable` ONLY when migrating from MobX/Vue or wrapping mutable third-party APIs.

---

## Computed Getters in Stores

```typescript
const [store, setStore] = createStore({
  firstName: "John",
  lastName: "Smith",
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
});

// fullName updates reactively when firstName or lastName changes
return <span>{store.fullName}</span>;
```

---

## SolidJS 2.x Store Changes

| Aspect | SolidJS 1.x | SolidJS 2.x |
|--------|-------------|-------------|
| Store setters | Path-style ergonomics | Draft-first by default |
| Derived stores | Not supported | `createStore(fn)` for derived-but-writable patterns |

Both versions share the same core store concepts. Path syntax and produce/reconcile remain available in 2.x.

---

## WRONG vs CORRECT Patterns

### Pattern 1: Updating Nested State

```typescript
// WRONG — React spread/replace pattern
setStore({ ...store, user: { ...store.user, name: "Jane" } }); // Replaces everything

// CORRECT — SolidJS path syntax
setStore("user", "name", "Jane"); // Only "name" updates
```

### Pattern 2: Adding to Arrays

```typescript
// WRONG — React immutable array pattern
setStore("items", [...store.items, newItem]); // Replaces entire array

// CORRECT — SolidJS append via index
setStore("items", store.items.length, newItem); // Adds without replacing
```

### Pattern 3: Updating Array Items

```typescript
// WRONG — React map/replace pattern
setStore("items", store.items.map(item =>
  item.id === targetId ? { ...item, done: true } : item
)); // Replaces entire array, all items re-render

// CORRECT — SolidJS filter predicate
setStore("items", (item) => item.id === targetId, "done", true); // Only matching items update
```

### Pattern 4: Reading Store in JSX

```typescript
// WRONG — Extracting value outside JSX
const name = store.user.name; // Snapshot, not reactive
return <span>{name}</span>;   // Never updates

// CORRECT — Access in JSX tracking scope
return <span>{store.user.name}</span>; // Tracked, updates reactively
```

---

## Reference Links

- [references/methods.md](references/methods.md) -- API signatures for createStore, setStore, produce, reconcile, unwrap, createMutable
- [references/examples.md](references/examples.md) -- Store patterns: nested updates, array operations, computed getters, API sync
- [references/anti-patterns.md](references/anti-patterns.md) -- Destructuring stores, spread-replace, direct mutation pitfalls

### Official Sources

- https://docs.solidjs.com/concepts/stores
- https://docs.solidjs.com/reference/store-utilities/create-store
- https://docs.solidjs.com/reference/store-utilities/produce
- https://docs.solidjs.com/reference/store-utilities/reconcile
- https://docs.solidjs.com/reference/store-utilities/unwrap
- https://docs.solidjs.com/reference/store-utilities/create-mutable
