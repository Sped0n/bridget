---
name: solid-syntax-components
description: >
  Use when creating components, handling props, working with children, refs, directives, or events in SolidJS.
  Prevents props destructuring and children access patterns from React that break SolidJS reactivity.
  Covers Component/ParentComponent/VoidComponent/FlowComponent types, splitProps, mergeProps, children() helper, ref patterns, use: directives, and event delegation.
  Keywords: splitProps, mergeProps, children, Component, ParentComponent,
  VoidComponent, FlowComponent, ref, use directive, SolidJS props, event handling,
  pass props, access children, click handler, component types.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x with TypeScript."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-syntax-components

## Quick Reference

### Component Types

| Type | Children | Use When |
|------|----------|----------|
| `Component<P>` | Optional (untyped) | General-purpose component |
| `ParentComponent<P>` | Required (`children: JSX.Element`) | Layout wrappers, containers |
| `VoidComponent<P>` | Forbidden | Icons, inputs, leaf nodes |
| `FlowComponent<P, C>` | Typed (`children: C`) | Control flow, render props |

### Props Handling

| Need | Tool | Import |
|------|------|--------|
| Access prop values | `props.x` directly | -- |
| Derived values outside JSX | `() => props.x` | -- |
| Separate prop groups | `splitProps(props, [...keys])` | `solid-js` |
| Default prop values | `mergeProps(defaults, props)` | `solid-js` |
| Spread remaining props | `splitProps` + `{...rest}` | `solid-js` |

### Children Resolution

| Need | Tool | Import |
|------|------|--------|
| Resolve and cache children | `children(() => props.children)` | `solid-js` |
| Iterate resolved children | `resolved.toArray()` | `solid-js` |

### Ref Patterns

| Pattern | Syntax | When |
|---------|--------|------|
| Variable assignment | `let ref!: HTMLElement` | Standard ref |
| Callback | `ref={(el) => { ... }}` | Side effects on creation |
| Signal ref | `const [ref, setRef] = createSignal<HTMLElement>()` | Conditional elements |
| Forwarding | Pass `ref` as regular prop | Parent needs child DOM access |

### Event Systems

| System | Syntax | Listener Location | Use When |
|--------|--------|-------------------|----------|
| Delegated | `onClick={handler}` | `document` (shared) | Common UI events (23 events) |
| Native | `on:scroll={handler}` | Element (direct) | Custom events, stopPropagation needed |

### Critical Warnings

**NEVER** destructure props in function parameters or body -- this severs reactivity. Props are reactive getters on a proxy object. ALWAYS access as `props.x`.

**NEVER** access `props.children` multiple times without the `children()` helper -- each access can re-create child elements. ALWAYS resolve with `children(() => props.children)`.

**NEVER** use `useRef` or `forwardRef` -- these are React APIs. ALWAYS use `let ref!: HTMLElement` for refs and pass `ref` as a regular prop for forwarding.

**NEVER** use `event.stopPropagation()` with delegated events expecting it to prevent other delegated handlers -- delegated events share a single document listener. ALWAYS use `on:` prefix when propagation control is needed.

**NEVER** call a handler signal directly in an event attribute (`onClick={handler()}`) -- this evaluates once. ALWAYS wrap in an arrow function: `onClick={() => handler()}`.

---

## Component Type Decision Tree

```
Creating a new component?
|
+-- Does it accept children?
|   |
|   +-- YES: Are children a specific type (render prop, typed slot)?
|   |   |
|   |   +-- YES --> FlowComponent<Props, ChildType>
|   |   +-- NO  --> ParentComponent<Props>
|   |
|   +-- NO: Will it NEVER have children?
|       |
|       +-- YES --> VoidComponent<Props>
|       +-- MAYBE --> Component<Props>
```

ALWAYS import types from `solid-js`:

```typescript
import type { Component, ParentComponent, VoidComponent, FlowComponent } from "solid-js";
```

---

## Props Handling

### WRONG vs CORRECT: Destructuring

```typescript
// WRONG -- breaks reactivity (frozen at initial value):
function Greeting({ name }: { name: string }) {
  return <h1>Hello {name}</h1>;
}

// WRONG -- same problem:
function Greeting(props: { name: string }) {
  const { name } = props;
  return <h1>Hello {name}</h1>;
}

// CORRECT -- reactive access:
const Greeting: Component<{ name: string }> = (props) => {
  return <h1>Hello {props.name}</h1>;
};

// CORRECT -- derived accessor for use outside JSX:
const Greeting: Component<{ name: string }> = (props) => {
  const upper = () => props.name.toUpperCase();
  return <h1>Hello {upper()}</h1>;
};
```

### splitProps -- Reactive Prop Separation

```typescript
import { splitProps } from "solid-js";

const Button: ParentComponent<ButtonProps> = (props) => {
  const [local, styleProps, rest] = splitProps(
    props,
    ["onClick", "disabled"],   // Group 1: behavior
    ["variant", "class"]       // Group 2: styling
  );                           // rest: everything else

  return (
    <button
      onClick={local.onClick}
      disabled={local.disabled}
      class={`btn-${styleProps.variant} ${styleProps.class}`}
      {...rest}
    >
      {props.children}
    </button>
  );
};
```

### mergeProps -- Default Values

```typescript
import { mergeProps } from "solid-js";

const Button: ParentComponent<ButtonProps> = (props) => {
  const merged = mergeProps(
    { variant: "primary", size: "md", disabled: false },
    props
  );
  // Later sources override earlier ones -- props overrides defaults
  return <button class={`btn-${merged.variant}`} disabled={merged.disabled}>{props.children}</button>;
};
```

---

## Children

### WRONG vs CORRECT

```typescript
// WRONG -- accessing props.children multiple times re-creates elements:
const Bad: ParentComponent = (props) => {
  createEffect(() => { console.log(props.children); }); // Re-creates!
  return <div>{props.children}</div>;                    // Creates again!
};

// CORRECT -- resolve once with children() helper:
import { children } from "solid-js";
const Good: ParentComponent = (props) => {
  const resolved = children(() => props.children);
  createEffect(() => { console.log(resolved()); }); // Stable reference
  return <div>{resolved()}</div>;
};
```

### Iterating Children

```typescript
const List: ParentComponent = (props) => {
  const resolved = children(() => props.children);
  return (
    <ul>
      <For each={resolved.toArray()}>
        {(child) => <li>{child}</li>}
      </For>
    </ul>
  );
};
```

---

## Refs

### WRONG vs CORRECT: React useRef vs SolidJS ref

```typescript
// WRONG (React pattern):
const ref = useRef<HTMLCanvasElement>(null);
useEffect(() => { ref.current?.getContext("2d"); }, []);
return <canvas ref={ref} />;

// CORRECT (SolidJS):
let canvasRef!: HTMLCanvasElement;
onMount(() => { canvasRef.getContext("2d"); });
return <canvas ref={canvasRef} />;
```

### React vs SolidJS Ref Comparison

| Aspect | React `useRef` | SolidJS `ref` |
|--------|---------------|---------------|
| Declaration | `const ref = useRef(null)` | `let ref!: HTMLElement` |
| Access | `ref.current` | `ref` (direct) |
| Timing | After mount (`useEffect`) | Assigned during render, use in `onMount` |
| Hook required | Yes (`useRef`) | No -- plain variable |
| Forwarding | `forwardRef()` HOC | Pass `ref` as regular prop |
| Directives | No built-in system | `use:` prefix for reusable behaviors |

### Ref Forwarding

```typescript
// Parent:
function Parent() {
  let childRef!: HTMLCanvasElement;
  onMount(() => { childRef.getContext("2d"); });
  return <ChildCanvas ref={childRef} />;
}

// Child -- ref is ALWAYS received as a callback, regardless of parent declaration:
const ChildCanvas: Component<{ ref: HTMLCanvasElement | ((el: HTMLCanvasElement) => void) }> = (props) => {
  return <canvas ref={props.ref} />;
};
```

---

## Directives (`use:`)

### Directive Signature

```typescript
function directiveName(element: Element, accessor: () => any): void;
```

### Example: clickOutside

```typescript
import { onCleanup } from "solid-js";

function clickOutside(element: Element, accessor: () => () => void): void {
  const onClick = (e: Event) => {
    if (!element.contains(e.target as Node)) accessor()();
  };
  document.addEventListener("click", onClick);
  onCleanup(() => document.removeEventListener("click", onClick));
}

// TypeScript declaration (required to avoid errors):
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      clickOutside: () => void;
    }
  }
}

// Usage:
<div use:clickOutside={() => setOpen(false)}>Dropdown content</div>
```

---

## Event Handling

### Delegated Events (23 Events)

`beforeinput`, `click`, `dblclick`, `contextmenu`, `focusin`, `focusout`, `input`, `keydown`, `keyup`, `mousedown`, `mousemove`, `mouseout`, `mouseover`, `mouseup`, `pointerdown`, `pointermove`, `pointerout`, `pointerover`, `pointerup`, `touchend`, `touchmove`, `touchstart`

For ALL other events, ALWAYS use the `on:` prefix.

### Array Binding Syntax

```typescript
const handler = (data: string, event: MouseEvent) => {
  console.log("Data:", data, "Target:", event.target);
};

// Avoids creating a new closure -- data is first arg, event is second:
<button onClick={[handler, "hello"]}>Click</button>
```

### Event Delegation Caveats

1. **stopPropagation**: Delegated events share a document listener -- `stopPropagation()` does NOT prevent other delegated handlers. Use `on:click` when propagation control is needed.
2. **Portals**: Events propagate through the **component tree**, not the DOM tree.

---

## Reference Links

- [references/methods.md](references/methods.md) -- Component types, splitProps, mergeProps, children(), ref patterns, directives, event types
- [references/examples.md](references/examples.md) -- Complete component patterns, props handling, children resolution, ref forwarding, directives, events
- [references/anti-patterns.md](references/anti-patterns.md) -- Destructuring props, useRef, forwardRef, React children patterns, event handler mistakes

### Official Sources

- https://docs.solidjs.com/concepts/components/basics
- https://docs.solidjs.com/concepts/components/props
- https://docs.solidjs.com/reference/component-apis/children
- https://docs.solidjs.com/concepts/refs
- https://docs.solidjs.com/concepts/components/event-handlers
