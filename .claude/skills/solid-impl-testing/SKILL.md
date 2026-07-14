---
name: solid-impl-testing
description: >
  Use when writing unit or integration tests for SolidJS components, signals, or stores.
  Prevents missing cleanup calls, incorrect async test patterns, and React Testing Library habits that break SolidJS tests.
  Covers @solidjs/testing-library render, screen queries, fireEvent, cleanup, async testing, renderHook, testEffect, and vitest configuration.
  Keywords: @solidjs/testing-library, vitest, render, fireEvent, screen, cleanup,
  renderHook, testEffect, component testing, test SolidJS, unit test,
  how to test components, testing setup.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x with TypeScript and @solidjs/testing-library."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-impl-testing

## Quick Reference

### Installation

```bash
npm install --save-dev @solidjs/testing-library @testing-library/jest-dom vitest
npm install --save-dev vite-plugin-solid
```

### Key Dependencies

| Package | Role |
|---------|------|
| `@solidjs/testing-library` | SolidJS-specific render, cleanup, renderHook, testEffect |
| `@testing-library/dom` | Re-exported: screen, fireEvent, waitFor, within, queries |
| `@testing-library/jest-dom` | DOM matchers (toBeInTheDocument, toHaveTextContent) |
| `vitest` | Test runner (recommended over Jest for SolidJS) |
| `vite-plugin-solid` | Compiles JSX/TSX for tests (v2.8.2+ handles test config automatically) |

### Vitest Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    conditions: ["development", "browser"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    deps: {
      optimizer: {
        web: {
          include: ["solid-js", "@solidjs/router"],
        },
      },
    },
  },
});
```

```typescript
// src/test-setup.ts
import "@testing-library/jest-dom";
```

### Critical Warnings

**ALWAYS** pass a function returning JSX to `render()` -- NEVER pass JSX directly. SolidJS `render()` requires `() => <Component />`, not `<Component />`. Passing JSX directly executes it outside the test's reactive owner and breaks cleanup.

**ALWAYS** call `cleanup()` in `afterEach` -- even though the library claims auto-cleanup, explicitly calling it prevents disposal errors across test suites. Omitting cleanup causes reactive owners to leak between tests.

**NEVER** use `rerender()` -- it does NOT exist in solid-testing-library. SolidJS does not re-render; it executes side effects from reactive state changes. Use signals to drive state changes in tests instead.

**NEVER** destructure props in test components -- this breaks reactivity tracking. Use `props.value` access patterns, same as production components.

**ALWAYS** set `resolve.conditions: ["development", "browser"]` in Vitest config -- without this, Solid loads the server bundle in tests, causing hydration errors and missing DOM APIs.

---

## Decision Trees

### Which Testing API to Use

```
Need to test a component?
├─ Yes → render(() => <Component />) + screen queries
│   ├─ Component uses router? → Add { location: "/path" } option
│   ├─ Component uses context? → Add { wrapper: Provider } option
│   └─ Component has async data? → Use findBy* queries + waitFor
│
├─ Need to test a custom hook?
│   └─ Yes → renderHook(useMyHook) → access result directly
│
├─ Need to test a custom directive?
│   └─ Yes → renderDirective(myDirective) → use setArg for updates
│
└─ Need to test reactive effects?
    └─ Yes → testEffect(done => createEffect(() => { ... done() }))
```

### Which Query to Use

```
Can the element be found by its accessible role?
├─ Yes → getByRole("button", { name: "Submit" })       ← PREFERRED
│
├─ Is it a form field with a label?
│   └─ Yes → getByLabelText("Email")
│
├─ Does it have visible text content?
│   └─ Yes → getByText("Hello World")
│
├─ Is the element absent and you want to assert that?
│   └─ Yes → queryByText("Missing") → expect to be null
│
├─ Does the element appear asynchronously?
│   └─ Yes → findByText("Loaded Data")                 ← returns Promise
│
└─ No semantic way to find it?
    └─ Use getByTestId("my-element")                    ← LAST RESORT
```

---

## Core Patterns

### Pattern 1: Basic Component Test

```typescript
// Counter.test.tsx
import { render, screen, cleanup } from "@solidjs/testing-library";
import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it } from "vitest";
import { Counter } from "./Counter";

afterEach(() => cleanup());

describe("Counter", () => {
  it("increments on click", async () => {
    render(() => <Counter />);

    const button = screen.getByRole("button", { name: "Increment" });
    expect(screen.getByText("Count: 0")).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText("Count: 1")).toBeInTheDocument();
  });
});
```

### Pattern 2: Testing with Props via Signals

```typescript
import { createSignal } from "solid-js";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { Greeting } from "./Greeting";

afterEach(() => cleanup());

it("reacts to prop changes", () => {
  const [name, setName] = createSignal("Alice");

  // Pass signal getter as prop -- component updates reactively
  render(() => <Greeting name={name()} />);

  expect(screen.getByText("Hello, Alice")).toBeInTheDocument();

  setName("Bob");
  expect(screen.getByText("Hello, Bob")).toBeInTheDocument();
});
```

### Pattern 3: Testing with Context Providers

```typescript
import { render, screen, cleanup } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { ThemeProvider } from "./ThemeContext";
import { ThemedButton } from "./ThemedButton";

afterEach(() => cleanup());

it("uses theme from context", () => {
  render(() => <ThemedButton />, {
    wrapper: (props) => (
      <ThemeProvider theme="dark">{props.children}</ThemeProvider>
    ),
  });

  expect(screen.getByRole("button")).toHaveClass("dark-theme");
});
```

### Pattern 4: Testing Async Components

```typescript
import { render, screen, cleanup } from "@solidjs/testing-library";
import { waitFor } from "@testing-library/dom";
import { afterEach, expect, it } from "vitest";
import { UserProfile } from "./UserProfile";

afterEach(() => cleanup());

it("loads and displays user data", async () => {
  render(() => <UserProfile userId="123" />);

  // Suspense fallback shows first
  expect(screen.getByText("Loading...")).toBeInTheDocument();

  // Wait for async data to resolve
  await waitFor(() => {
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
```

### Pattern 5: Testing Custom Hooks

```typescript
import { renderHook, cleanup } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { useCounter } from "./useCounter";

afterEach(() => cleanup());

it("returns count and increment", () => {
  const { result } = renderHook(() => useCounter());

  expect(result.count()).toBe(0);
  result.increment();
  expect(result.count()).toBe(1);
});
```

### Pattern 6: Testing with Router

```typescript
import { render, screen, cleanup } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { App } from "./App";

afterEach(() => cleanup());

it("renders the correct route", async () => {
  render(() => <App />, { location: "/users/42" });

  // Router setup is async -- use findBy queries
  const heading = await screen.findByText("User 42");
  expect(heading).toBeInTheDocument();
});
```

### Pattern 7: Testing Reactive Effects with testEffect

```typescript
import { createSignal, createEffect } from "solid-js";
import { testEffect, cleanup } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

afterEach(() => cleanup());

it("tracks signal changes in effects", () => {
  const [count, setCount] = createSignal(0);

  return testEffect((done) =>
    createEffect((run: number = 0) => {
      if (run === 0) {
        expect(count()).toBe(0);
        setCount(1);
      } else if (run === 1) {
        expect(count()).toBe(1);
        done();
      }
      return run + 1;
    })
  );
});
```

---

## File Organization

```
src/
├── components/
│   ├── Counter.tsx
│   └── Counter.test.tsx          ← Co-located test files
├── hooks/
│   ├── useCounter.ts
│   └── useCounter.test.ts
├── test-setup.ts                 ← Global test setup
└── __tests__/                    ← Alternative: dedicated test folder
    └── integration/
        └── app.test.tsx
```

**ALWAYS** use `.test.tsx` extension for files containing JSX in tests. Use `.test.ts` only for pure logic tests without JSX.

---

## Reference Links

- [references/methods.md](references/methods.md) -- API signatures for render, screen, fireEvent, cleanup, waitFor, renderHook, testEffect
- [references/examples.md](references/examples.md) -- Complete test examples for components, signals, stores, async, and events
- [references/anti-patterns.md](references/anti-patterns.md) -- React Testing Library habits that break SolidJS tests

### Official Sources

- https://github.com/solidjs/solid-testing-library
- https://testing-library.com/docs/queries/about
- https://docs.solidjs.com/guides/testing
