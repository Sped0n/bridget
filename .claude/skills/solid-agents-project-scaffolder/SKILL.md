---
name: solid-agents-project-scaffolder
description: >
  Use when creating a new SolidJS project, scaffolding a SolidStart application, or setting up project infrastructure.
  Prevents misconfigured Vite/TypeScript settings, wrong directory structures, and React-style project patterns.
  Covers Vite configuration, TypeScript setup, component directory structure, routing, state management, and testing setup.
  Keywords: SolidJS scaffold, SolidStart project, Vite config, tsconfig,
  project template, file structure, routing setup, new SolidJS project,
  start from scratch, create SolidJS app.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidJS 1.x/2.x."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-agents-project-scaffolder

## Quick Reference

### Project Type Decision Tree

```
Need a new SolidJS project?
├── Need SSR, file-based routing, server functions, or API routes?
│   └── YES → SolidStart scaffold
│       ├── Full-stack app with data loading? → SolidStart with query/action
│       ├── Static site with prerendering? → SolidStart with SSG preset
│       └── API backend + frontend? → SolidStart with API routes
└── NO → Plain SolidJS scaffold (client-side SPA)
    ├── Simple reactive UI? → Plain SolidJS + Vite
    ├── Need routing? → Plain SolidJS + @solidjs/router
    └── Embedded widget or library? → Plain SolidJS minimal
```

### Critical Warnings

**NEVER** use `create-react-app`, `next`, or any React scaffolding tool for a SolidJS project. The generated configuration, babel presets, and JSX transform are incompatible.

**NEVER** omit `vite-plugin-solid` from `vite.config.ts`. Without it, JSX compilation fails silently or produces React output.

**ALWAYS** set `"jsxImportSource": "solid-js"` in `tsconfig.json`. Without this, TypeScript resolves JSX types from React, causing type errors on SolidJS-specific attributes.

**ALWAYS** use `babel-preset-solid` (included via `vite-plugin-solid`). This preset compiles JSX into SolidJS's fine-grained reactive DOM operations instead of `React.createElement` calls.

**NEVER** include `react`, `react-dom`, `@types/react`, or `@types/react-dom` in dependencies. Their presence causes type conflicts and import confusion.

**ALWAYS** use `solid-js/web` for `render` and `hydrate` — these are NOT imported from `solid-js` directly.

---

## Plain SolidJS Scaffold (Client-Side SPA)

### Required Dependencies

| Package | Type | Purpose |
|---------|------|---------|
| `solid-js` | dependency | Core reactive framework |
| `@solidjs/router` | dependency | Client-side routing (if needed) |
| `typescript` | devDependency | TypeScript compiler |
| `vite` | devDependency | Build tool and dev server |
| `vite-plugin-solid` | devDependency | Vite integration for SolidJS JSX compilation |
| `vitest` | devDependency | Testing framework |
| `@solidjs/testing-library` | devDependency | Component testing utilities |
| `jsdom` | devDependency | DOM environment for tests |

### Project Structure

```
my-solid-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── Counter.tsx
│   ├── context/
│   │   └── AppContext.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   └── index.tsx
├── test/
│   └── Counter.test.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── .gitignore
```

### Configuration Files

#### vite.config.ts

```typescript
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
```

#### tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "types": ["vite/client"],
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

#### Entry Point: index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My Solid App</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="/src/index.tsx" type="module"></script>
  </body>
</html>
```

#### Entry Point: src/index.tsx

```typescript
import { render } from "solid-js/web";
import App from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

render(() => <App />, root);
```

---

## SolidStart Scaffold (Full-Stack)

### Required Dependencies

| Package | Type | Purpose |
|---------|------|---------|
| `solid-js` | dependency | Core reactive framework |
| `@solidjs/router` | dependency | Routing (file-based + programmatic) |
| `@solidjs/start` | dependency | SolidStart meta-framework |
| `@solidjs/meta` | dependency | Document head management |
| `vinxi` | devDependency | Build orchestration (Vite + Nitro) |
| `typescript` | devDependency | TypeScript compiler |
| `vitest` | devDependency | Testing framework |
| `@solidjs/testing-library` | devDependency | Component testing utilities |
| `jsdom` | devDependency | DOM environment for tests |

### Project Structure

```
my-solidstart-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── Counter.tsx
│   ├── context/
│   │   └── AppContext.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── routes/
│   │   ├── api/
│   │   │   └── hello.ts
│   │   ├── about.tsx
│   │   └── index.tsx
│   ├── app.tsx
│   ├── entry-client.tsx
│   └── entry-server.tsx
├── test/
│   └── Counter.test.tsx
├── app.config.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── .gitignore
```

### Configuration Files

#### app.config.ts

```typescript
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({});
```

#### tsconfig.json (SolidStart)

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "types": ["vinxi/types/client"],
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

#### src/app.tsx

```typescript
import { Suspense } from "solid-js";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { MetaProvider } from "@solidjs/meta";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
```

#### src/entry-client.tsx

```typescript
// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

mount(() => <StartClient />, document.getElementById("app")!);
```

#### src/entry-server.tsx

```typescript
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
```

---

## State Management Setup

### Context + Store Provider Pattern

ALWAYS use this pattern for shared application state. NEVER use React's `useReducer` or Redux patterns.

```typescript
// src/context/AppContext.tsx
import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore } from "solid-js/store";

interface AppState {
  user: { name: string; email: string } | null;
  theme: "light" | "dark";
}

interface AppActions {
  setUser: (user: AppState["user"]) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<[AppState, AppActions]>();

export function AppProvider(props: ParentProps) {
  const [state, setState] = createStore<AppState>({
    user: null,
    theme: "light",
  });

  const actions: AppActions = {
    setUser: (user) => setState("user", user),
    toggleTheme: () =>
      setState("theme", (prev) => (prev === "light" ? "dark" : "light")),
  };

  return (
    <AppContext.Provider value={[state, actions]}>
      {props.children}
    </AppContext.Provider>
  );
}

export function useApp(): [AppState, AppActions] {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
```

---

## Testing Setup

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    environment: "jsdom",
    globals: true,
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
  },
  resolve: {
    conditions: ["development", "browser"],
  },
});
```

### Example Test: test/Counter.test.tsx

```typescript
import { render, fireEvent, screen } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Counter from "../src/components/Counter";

describe("Counter", () => {
  it("increments count on click", async () => {
    render(() => <Counter />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Count: 0");
    fireEvent.click(button);
    expect(button).toHaveTextContent("Count: 1");
  });
});
```

---

## Routing Setup (Plain SolidJS)

When adding routing to a plain SolidJS project, ALWAYS use `@solidjs/router` with `component` prop (NEVER use `element` prop like React Router).

```typescript
// src/App.tsx (with routing)
import { Router, Route } from "@solidjs/router";
import { lazy } from "solid-js";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="*404" component={NotFound} />
    </Router>
  );
}
```

---

## Reference Links

- [references/methods.md](references/methods.md) -- Scaffolding templates: file listings, config templates, component templates
- [references/examples.md](references/examples.md) -- Complete SolidJS project scaffold, complete SolidStart project scaffold
- [references/anti-patterns.md](references/anti-patterns.md) -- Scaffolding mistakes: wrong config, missing babel preset, React boilerplate

### Official Sources

- https://docs.solidjs.com/solid-start/getting-started
- https://docs.solidjs.com/guides/getting-started-with-solid
- https://github.com/solidjs/solid
- https://github.com/solidjs/solid-start
