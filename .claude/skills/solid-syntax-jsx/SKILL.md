---
name: solid-syntax-jsx
description: >
  Use when writing JSX templates, rendering lists, conditional rendering, or using control flow components in SolidJS.
  Prevents ternary/map anti-patterns from React that bypass SolidJS compiled DOM optimizations.
  Covers Show, For, Index, Switch/Match, Dynamic, Portal, Suspense, JSX compilation model, and namespaced attributes.
  Keywords: Show, For, Index, Switch, Match, Dynamic, Portal, Suspense,
  SolidJS JSX, control flow, conditional rendering, render list, if else
  in JSX, loop over array, show hide element.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x with TypeScript."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-syntax-jsx

## Quick Reference

### JSX Compilation Model

SolidJS compiles JSX to **direct DOM creation calls** -- there is NO virtual DOM. Components execute **once** during initialization. Dynamic expressions in `{}` are automatically wrapped in reactive effects that perform surgical DOM updates.

```
React:    JSX → createElement() → Virtual DOM → Diff → DOM patches
SolidJS:  JSX → Compiled DOM creation → Direct DOM nodes + reactive effects
```

### Control Flow Component Quick Reference

| Component | Import | Purpose | Key Props |
|-----------|--------|---------|-----------|
| `<Show>` | `solid-js` | Conditional rendering | `when`, `fallback`, `keyed` |
| `<For>` | `solid-js` | List rendering (objects) | `each`, `fallback` |
| `<Index>` | `solid-js` | List rendering (primitives) | `each`, `fallback` |
| `<Switch>/<Match>` | `solid-js` | Multi-branch conditionals | `fallback` / `when` |
| `<Dynamic>` | `solid-js/web` | Dynamic component/element | `component` |
| `<Portal>` | `solid-js/web` | Render outside DOM tree | `mount`, `useShadow`, `isSVG` |
| `<Suspense>` | `solid-js` | Async resource loading | `fallback` |

### Namespaced Attribute Prefixes

| Prefix | Purpose | Example |
|--------|---------|---------|
| `attr:` | Force HTML attribute (vs property) | `<div attr:data-id={id} />` |
| `prop:` | Set DOM property directly | `<input prop:value={val} />` |
| `class:` | Toggle individual CSS class | `<div class:active={isActive()} />` |
| `on:` | Native event listener (non-delegated) | `<div on:scroll={handler} />` |
| `use:` | Custom directive | `<div use:myDirective={value} />` |
| `bool:` | Boolean HTML attribute | `<div bool:disabled={isDisabled()} />` |
| `@once` | One-time binding (no reactivity) | `<div textContent={@once val} />` |

### For vs Index Decision Table

| Scenario | Use | Why |
|----------|-----|-----|
| Array of objects, items reorder | `<For>` | Keyed by reference -- DOM nodes move with items |
| Array of primitives (strings, numbers) | `<Index>` | Keyed by index -- values update in place |
| Form inputs where position matters | `<Index>` | Stable index means stable DOM position |
| List where items are added/removed/moved | `<For>` | Reference tracking avoids recreation |

### Critical Warnings

**NEVER** use `Array.map()` to render lists -- it recreates ALL DOM nodes on every array change. ALWAYS use `<For>` or `<Index>`.

**NEVER** use ternary operators for complex conditional rendering -- they bypass SolidJS fine-grained reactivity optimizations. ALWAYS use `<Show>` with `fallback`.

**NEVER** use JavaScript `switch`/`case` statements in component bodies for conditional views -- the component body runs once so the switch evaluates once and never updates. ALWAYS use `<Switch>`/`<Match>`.

**NEVER** pass a `key` prop to list items -- SolidJS ignores the `key` prop entirely. `<For>` keys by object reference automatically.

**NEVER** use early returns in component bodies for conditional rendering -- the component runs once so the return is permanent. ALWAYS use `<Show>` or `<Switch>/<Match>`.

---

## JSX Compilation Details

### Static vs Dynamic Optimization

The SolidJS compiler separates static and dynamic content at build time:

```typescript
// Static parts: template created once, cloned for each instance
// Dynamic parts: reactive effects update only the specific text node or attribute
const Counter = () => {
  const [count, setCount] = createSignal(0);
  return (
    <div class="counter">          {/* static -- compiled to template */}
      <span>Count: {count()}</span> {/* "Count: " static, {count()} dynamic */}
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
};
```

### Attribute Declaration Order

SolidJS evaluates attributes in **declaration order** -- later definitions override earlier ones:

```typescript
// value={currentValue} ALWAYS overrides any value in defaultProps
<input type="text" {...defaultProps} value={currentValue} />
```

### Style Object Syntax

ALWAYS use double curly braces and kebab-case property names:

```typescript
<button style={{ color: "red", "font-size": "2rem" }}>Click</button>
```

---

## Show -- Conditional Rendering

Renders children when `when` is truthy, otherwise renders `fallback`:

```typescript
import { Show } from "solid-js";

// Basic conditional with fallback:
<Show when={isLoggedIn()} fallback={<LoginForm />}>
  <Dashboard />
</Show>

// Render function -- receives narrowed non-null accessor:
<Show when={user()}>
  {(u) => <p>Welcome, {u().name}</p>}
</Show>

// Keyed -- re-renders when object reference changes:
<Show when={user()} keyed>
  <UserProfile user={user()} />
</Show>
```

**Behavior**: Without `keyed`, only truthiness changes trigger updates. With `keyed`, reference changes also trigger re-render.

---

## For -- List Rendering (Objects)

Renders a list keyed by **object reference**. ALWAYS use for arrays of objects:

```typescript
import { For } from "solid-js";

<For each={todos()} fallback={<p>No todos yet</p>}>
  {(todo, index) => (
    <div>
      <span>#{index() + 1}</span>  {/* index is a SIGNAL -- call it */}
      <span>{todo.text}</span>      {/* item is a direct VALUE */}
    </div>
  )}
</For>
```

**Callback signature**: `(item: T, index: () => number) => JSX.Element`
- `item` -- direct value (T), NOT a signal
- `index` -- signal, MUST call as `index()` to read

---

## Index -- List Rendering (Primitives)

Renders a list keyed by **array index**. ALWAYS use for arrays of primitives:

```typescript
import { Index } from "solid-js";

const [names, setNames] = createSignal(["Alice", "Bob", "Charlie"]);

<Index each={names()}>
  {(name, i) => (
    <input
      value={name()}     {/* item is a SIGNAL -- call it */}
      onInput={(e) => {
        setNames(prev => {
          const next = [...prev];
          next[i] = e.target.value;  {/* index is a plain NUMBER */}
          return next;
        });
      }}
    />
  )}
</Index>
```

**Callback signature**: `(item: () => T, index: number) => JSX.Element`
- `item` -- signal, MUST call as `item()` to read
- `index` -- direct number, NOT a signal

**This is the OPPOSITE of `<For>`.**

---

## Switch/Match -- Multi-Branch Conditionals

Evaluates `<Match>` children sequentially -- first truthy `when` wins:

```typescript
import { Switch, Match } from "solid-js";

<Switch fallback={<NotFound />}>
  <Match when={route() === "home"}><HomePage /></Match>
  <Match when={route() === "about"}><AboutPage /></Match>
  <Match when={route() === "settings"}><SettingsPage /></Match>
</Switch>

// With render function -- receives narrowed value:
<Switch>
  <Match when={user()}>
    {(u) => <UserProfile user={u()} />}
  </Match>
  <Match when={error()}>
    {(e) => <ErrorDisplay error={e()} />}
  </Match>
</Switch>
```

**Behavior**: Only ONE `<Match>` renders at a time (mutual exclusivity).

---

## Dynamic -- Dynamic Component/Element Selection

```typescript
import { Dynamic } from "solid-js/web";

// Dynamic component:
const [currentView, setCurrentView] = createSignal<Component>(HomeView);
<Dynamic component={currentView()} user={currentUser()} />

// Dynamic HTML element:
const [tag, setTag] = createSignal("h1");
<Dynamic component={tag()}>Hello World</Dynamic>

// Polymorphic "as" pattern:
function Box(props: { as?: string | Component; children: JSX.Element }) {
  const merged = mergeProps({ as: "div" }, props);
  return <Dynamic component={merged.as}>{props.children}</Dynamic>;
}
```

The `component` prop accepts SolidJS components, HTML tag strings, or JSX intrinsic element keys. All additional props are forwarded.

---

## Portal -- Render Outside DOM Tree

```typescript
import { Portal } from "solid-js/web";

<Portal mount={document.getElementById("modal-root")!}>
  <div class="modal-overlay">
    <div class="modal-content">Modal content here</div>
  </div>
</Portal>
```

**Key behavior**: Events propagate through the **component tree**, not the DOM tree. Client-side only -- hydration is disabled for portals.

---

## Suspense -- Async Resource Loading

Tracks all `createResource` calls within its boundary:

```typescript
import { Suspense } from "solid-js";

<Suspense fallback={<LoadingSpinner />}>
  <DataView data={dataResource()} />
</Suspense>
```

**Key advantage over Show**: `<Show when={resource()}>` destroys and recreates DOM. `<Suspense>` creates DOM nodes immediately but delays attachment -- preserving state and avoiding flicker.

**Nested Suspense** boundaries resolve independently:

```typescript
<Suspense fallback={<HeaderSkeleton />}>
  <Header />
  <Suspense fallback={<ContentSkeleton />}>
    <Content />
  </Suspense>
</Suspense>
```

---

## Common Anti-Patterns (Summary)

| React Pattern (WRONG) | SolidJS Pattern (CORRECT) | Why |
|----------------------|--------------------------|-----|
| `{items.map(i => ...)}` | `<For each={items()}>` | map recreates all DOM nodes |
| `{cond ? <A/> : <B/>}` | `<Show when={cond} fallback={<B/>}>` | Show optimizes DOM mutations |
| `switch(x) { case: ... }` | `<Switch><Match when={...}>` | Component body runs once |
| `<div key={id}>` | No key needed | For keys by reference |
| `if (!data) return <Loading/>` | `<Show when={data} fallback={...}>` | Early return is permanent |

---

## Reference Links

- [references/methods.md](references/methods.md) -- API signatures for Show, For, Index, Switch/Match, Dynamic, Portal, Suspense
- [references/examples.md](references/examples.md) -- Control flow patterns, conditional rendering, list rendering, portals, suspense
- [references/anti-patterns.md](references/anti-patterns.md) -- Array.map, ternary, switch/case, key prop -- all JSX anti-patterns

### Official Sources

- https://docs.solidjs.com/concepts/understanding-jsx
- https://docs.solidjs.com/reference/components/show
- https://docs.solidjs.com/reference/components/for
- https://docs.solidjs.com/reference/components/index-component
- https://docs.solidjs.com/reference/components/switch-and-match
- https://docs.solidjs.com/reference/components/dynamic
- https://docs.solidjs.com/reference/components/portal
- https://docs.solidjs.com/reference/components/suspense
