---
name: solid-errors-error-handling
description: >
  Use when implementing error boundaries, Suspense loading states, or error recovery in SolidJS components.
  Prevents uncaught rendering errors, missing fallback UIs, and incorrect ErrorBoundary/Suspense nesting.
  Covers ErrorBoundary with reset, Suspense for createResource, nested boundaries, caught vs uncaught errors, and combined error/loading patterns.
  Keywords: ErrorBoundary, Suspense, error handling, fallback, reset,
  createResource, loading state, error recovery, app crashes, unhandled error,
  loading spinner, catch errors in component.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x with TypeScript."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-errors-error-handling

## Quick Reference

### ErrorBoundary

| Aspect | Details |
|--------|---------|
| Import | `import { ErrorBoundary } from "solid-js";` |
| Purpose | Catches errors in child reactive computations and rendering |
| Fallback | Static JSX or function receiving `(err, reset)` |
| Reset | Calls `reset()` to clear error state and re-render children |
| Version | Available since SolidJS 1.0 |

### Suspense

| Aspect | Details |
|--------|---------|
| Import | `import { Suspense } from "solid-js";` |
| Purpose | Shows fallback while `createResource` calls resolve |
| Behavior | Creates DOM immediately but delays attachment until resources resolve |
| Nested | Each boundary resolves independently |
| Version | Available since SolidJS 1.0 |

### What ErrorBoundary Catches vs Does NOT Catch

| Catches | Does NOT Catch |
|---------|----------------|
| Errors during JSX rendering | Errors in event handlers (`onClick`, etc.) |
| Errors in `createEffect` | Errors in `setTimeout` / `setInterval` callbacks |
| Errors in `createMemo` | Errors in async code outside reactive scope |
| Errors in `createResource` | Errors in the ErrorBoundary's own `fallback` |
| Errors in reactive computations | Errors thrown at module/top-level scope |

### Critical Warnings

**NEVER** rely on `try/catch` for rendering errors -- SolidJS rendering is compiled to direct DOM operations. A `try/catch` in a component body runs once during setup and CANNOT catch errors that occur later in reactive updates.

**NEVER** throw errors inside an ErrorBoundary `fallback` function expecting the SAME boundary to catch them -- errors in the fallback propagate to the PARENT boundary. If no parent boundary exists, the error is uncaught.

**ALWAYS** wrap components using `createResource` in BOTH `<Suspense>` AND `<ErrorBoundary>` -- Suspense handles loading states while ErrorBoundary handles fetch failures.

**ALWAYS** place `<ErrorBoundary>` OUTSIDE `<Suspense>` when protecting against resource errors -- if ErrorBoundary is inside Suspense, a resource error may not display the error fallback correctly.

**NEVER** assume `createEffect` errors are caught during SSR -- `createEffect` NEVER runs during SSR. Use `isServer` checks for server-side error handling.

---

## ErrorBoundary Patterns

### Static Fallback

```typescript
import { ErrorBoundary } from "solid-js";

<ErrorBoundary fallback={<p>Something went wrong.</p>}>
  <App />
</ErrorBoundary>
```

### Fallback with Error Details and Reset

```typescript
import { ErrorBoundary } from "solid-js";

<ErrorBoundary
  fallback={(err: Error, reset: () => void) => (
    <div class="error-panel">
      <h2>Error occurred</h2>
      <p>{err.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
>
  <DataView />
</ErrorBoundary>
```

When `reset()` is called, ErrorBoundary clears its error state and re-renders its children from scratch.

### Nested Boundaries

Inner boundaries catch first. If the inner boundary's fallback itself throws, the error propagates to the outer boundary:

```typescript
<ErrorBoundary fallback={<p>App-level error</p>}>
  <Header />
  <ErrorBoundary
    fallback={(err, reset) => (
      <div>
        <p>Section error: {err.message}</p>
        <button onClick={reset}>Retry</button>
      </div>
    )}
  >
    <DataSection />
  </ErrorBoundary>
  <Footer />
</ErrorBoundary>
```

If `<DataSection />` throws, only the inner boundary activates. `<Header />` and `<Footer />` remain visible.

---

## Suspense Patterns

### Basic Resource Loading

```typescript
import { Suspense, createResource } from "solid-js";

const [data] = createResource(fetchData);

<Suspense fallback={<LoadingSpinner />}>
  <DataDisplay data={data()} />
</Suspense>
```

### Suspense vs Show

| Aspect | `<Suspense>` | `<Show when={resource()}>` |
|--------|-------------|---------------------------|
| DOM creation | Creates children immediately, delays attachment | Destroys and recreates children on toggle |
| State preservation | Preserves internal state across loading cycles | Loses all internal state on each toggle |
| Resource tracking | Automatically tracks `createResource` calls | Manual condition checking |
| Use case | Async data loading | Conditional rendering |

**ALWAYS** use `<Suspense>` for `createResource` loading states. **NEVER** use `<Show>` as a loading gate for resources -- it destroys and recreates the entire subtree, losing state.

### Nested Suspense (Independent Loading)

```typescript
<Suspense fallback={<HeaderSkeleton />}>
  <Header user={userResource()} />

  <Suspense fallback={<ContentSkeleton />}>
    <Content data={dataResource()} />

    <Suspense fallback={<CommentsSkeleton />}>
      <Comments comments={commentsResource()} />
    </Suspense>
  </Suspense>
</Suspense>
```

Each boundary resolves independently -- the header shows as soon as `userResource` resolves, without waiting for content or comments.

### Suspense Timing

- `onMount` inside Suspense runs AFTER resources resolve
- `createEffect` inside Suspense runs AFTER resources resolve
- Both fallback and children branches exist in memory simultaneously
- Fallback is removed and children are attached once ALL tracked resources resolve

---

## ErrorBoundary + Suspense Composition

### Standard Pattern: ErrorBoundary Outside Suspense

```typescript
import { ErrorBoundary, Suspense, createResource } from "solid-js";

const [data] = createResource(fetchData);

<ErrorBoundary
  fallback={(err, reset) => (
    <div>
      <p>Failed to load: {err.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )}
>
  <Suspense fallback={<LoadingSpinner />}>
    <DataDisplay data={data()} />
  </Suspense>
</ErrorBoundary>
```

**Why this order**: When a resource rejects, the error propagates upward. ErrorBoundary outside Suspense catches it and displays the error fallback. If ErrorBoundary were inside Suspense, the Suspense boundary would not know to stop showing its fallback.

### Error Recovery with Resource Refetch

```typescript
import { ErrorBoundary, Suspense, createResource } from "solid-js";

function DataPanel() {
  const [data, { refetch }] = createResource(fetchData);

  return (
    <ErrorBoundary
      fallback={(err, reset) => (
        <div>
          <p>Error: {err.message}</p>
          <button onClick={() => { reset(); refetch(); }}>
            Retry
          </button>
        </div>
      )}
    >
      <Suspense fallback={<p>Loading...</p>}>
        <div>{data()?.title}</div>
      </Suspense>
    </ErrorBoundary>
  );
}
```

**ALWAYS** call both `reset()` AND `refetch()` when recovering from resource errors. `reset()` clears the error state; `refetch()` re-triggers the data fetch.

---

## Error Recovery Patterns

### Reset + State Reset

```typescript
import { ErrorBoundary, createSignal } from "solid-js";

function RecoverableForm() {
  const [formData, setFormData] = createSignal({ name: "", email: "" });

  return (
    <ErrorBoundary
      fallback={(err, reset) => (
        <div>
          <p>Form error: {err.message}</p>
          <button onClick={() => {
            setFormData({ name: "", email: "" });
            reset();
          }}>
            Reset Form
          </button>
        </div>
      )}
    >
      <FormContent data={formData()} onUpdate={setFormData} />
    </ErrorBoundary>
  );
}
```

### catchError (Programmatic Error Handling)

```typescript
import { catchError, createEffect } from "solid-js";

function MonitoredComponent() {
  catchError(
    () => {
      createEffect(() => {
        // Reactive computation that might fail
        riskyOperation();
      });
    },
    (err) => {
      console.error("Caught in reactive scope:", err);
      reportToErrorService(err);
    }
  );
}
```

`catchError` provides programmatic error handling within reactive scopes without rendering a fallback UI. Use it for logging, reporting, or silent recovery.

---

## Server-Side Considerations

- `createEffect` NEVER runs during SSR -- errors in effects are client-only
- `Suspense` on the server enables streaming HTML -- resources resolve server-side
- ErrorBoundary works during SSR for synchronous rendering errors
- **ALWAYS** use `isServer` from `solid-js/web` when error handling logic differs between server and client

---

## Decision Tree

### Choosing an Error Handling Strategy

```
Is the error from a reactive computation or rendering?
├── YES → Use <ErrorBoundary>
│   ├── Need error details + retry? → fallback={(err, reset) => ...}
│   ├── Simple error display? → fallback={<ErrorMessage />}
│   └── Need programmatic handling too? → Add catchError inside
└── NO (event handler, setTimeout, etc.)
    └── Use standard try/catch in the handler
```

### Choosing Loading State Strategy

```
Is data from createResource?
├── YES → Use <Suspense>
│   ├── Multiple independent resources? → Nested <Suspense> boundaries
│   ├── Resource might fail? → Wrap with <ErrorBoundary> OUTSIDE
│   └── Need previous data during refresh? → Use resource.latest
└── NO (signal-based state)
    └── Use <Show when={data()}> for conditional rendering
```

---

## Reference Links

- [references/methods.md](references/methods.md) -- API signatures for ErrorBoundary, Suspense, catchError
- [references/examples.md](references/examples.md) -- Working code examples for all error handling patterns
- [references/anti-patterns.md](references/anti-patterns.md) -- What NOT to do, with explanations

### Official Sources

- https://docs.solidjs.com/reference/components/error-boundary
- https://docs.solidjs.com/reference/components/suspense
- https://docs.solidjs.com/reference/basic-reactivity/create-resource
