---
name: solid-impl-routing
description: >
  Use when implementing client-side routing, navigation, or URL parameter handling in SolidJS applications.
  Prevents incorrect router setup, misused navigation hooks, and non-lazy-loaded route bundles.
  Covers Router/HashRouter setup, A component, useNavigate, useParams, useSearchParams, useBeforeLeave, lazy loading, route preloading, and config-based routing.
  Keywords: @solidjs/router, Route, useNavigate, useParams, useSearchParams,
  lazy, route guard, client-side routing, add routing, page navigation,
  URL parameters, protected routes.
license: MIT
compatibility: "Designed for Claude Code. Requires @solidjs/router 0.15+ with SolidJS 1.x/2.x and TypeScript."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-impl-routing

## Quick Reference

### Installation

```bash
npm install @solidjs/router
```

Requires SolidJS v1.8.4 or later.

### Router Types

| Router | URL Style | Use Case |
|--------|-----------|----------|
| `Router` | `/path` | Production apps with server support |
| `HashRouter` | `/#/path` | Static hosting without server rewrites |
| `MemoryRouter` | In-memory | Testing, no browser history |

### Hook Quick Reference

| Hook | Returns | Purpose |
|------|---------|---------|
| `useNavigate()` | `(to, options?) => void` | Programmatic navigation |
| `useParams()` | `Params` | Dynamic route parameter values |
| `useSearchParams()` | `[params, setParams]` | Query string read/write |
| `useLocation()` | `Location` | Current pathname, search, hash, state |
| `useMatch(() => path)` | `Accessor<Match \| undefined>` | Check if path matches current route |
| `useIsRouting()` | `Accessor<boolean>` | True during navigation transitions |
| `useBeforeLeave(callback)` | `void` | Route guard (unsaved changes warning) |
| `usePreloadRoute()` | `(href) => void` | Trigger preloading on hover |
| `useCurrentMatches()` | `Accessor<Match[]>` | All matched route segments |

### React Router vs Solid Router

| Concept | React Router (WRONG) | Solid Router (CORRECT) |
|---------|---------------------|------------------------|
| Link component | `<Link to="/path">` | `<A href="/path">` |
| Route element | `element={<Home />}` | `component={Home}` |
| Router hook | `useRouter()` | `useNavigate()` |
| Lazy import | `React.lazy(...)` | `lazy(...)` from `solid-js` |
| Loader data | `useLoaderData()` | `createAsync(() => query(...))` |
| Route loader | `loader` prop | `preload` prop |

### Critical Warnings

**NEVER** use `element={<Component />}` on a Route. This React pattern creates the component immediately, bypassing Solid Router's deferred rendering. ALWAYS use `component={Component}` (passing the reference, not a JSX call).

**NEVER** import `Link` from `@solidjs/router` — the component is called `A`, not `Link`. Using `Link` causes an import error.

**NEVER** import `useRouter` — this does not exist in Solid Router. ALWAYS use `useNavigate()` for programmatic navigation.

**NEVER** destructure `useParams()` at the top level — the returned object is a reactive proxy. Destructuring breaks reactivity. ALWAYS access `params.id` directly in JSX or inside tracked scopes.

**NEVER** call `useSearchParams()[1]` with a full replacement object expecting it to clear other params — it merges by default. To remove a param, set it to `undefined`.

---

## Router Setup

### Basic Router with JSX Routes

```tsx
import { Router, Route } from "@solidjs/router";
import { lazy } from "solid-js";
import { render } from "solid-js/web";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const User = lazy(() => import("./pages/User"));

function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/users/:id" component={User} />
    </Router>
  );
}

render(() => <App />, document.getElementById("root")!);
```

### Router with Root Layout

```tsx
import { Router, Route } from "@solidjs/router";
import type { RouteSectionProps } from "@solidjs/router";

function Layout(props: RouteSectionProps) {
  return (
    <div>
      <nav>
        <A href="/">Home</A>
        <A href="/about">About</A>
      </nav>
      <main>{props.children}</main>
    </div>
  );
}

function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
    </Router>
  );
}
```

### Config-Based Routing

```tsx
import { Router } from "@solidjs/router";
import type { RouteDefinition } from "@solidjs/router";
import { lazy } from "solid-js";

const routes: RouteDefinition[] = [
  { path: "/", component: lazy(() => import("./pages/Home")) },
  { path: "/about", component: lazy(() => import("./pages/About")) },
  {
    path: "/users",
    component: lazy(() => import("./pages/Users")),
    children: [
      { path: "/:id", component: lazy(() => import("./pages/UserDetail")) },
    ],
  },
];

function App() {
  return <Router>{routes}</Router>;
}
```

---

## Navigation

### The `<A>` Component

```tsx
import { A } from "@solidjs/router";

<A href="/dashboard">Dashboard</A>
<A href="/users" activeClass="font-bold" inactiveClass="text-gray" end>Users</A>
<A href="/settings" replace noScroll state={{ from: "nav" }}>Settings</A>
```

ALWAYS use `end` on root paths (`/`) to prevent matching every route.

### Programmatic Navigation

```tsx
import { useNavigate } from "@solidjs/router";

function LoginButton() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await performLogin();
    navigate("/dashboard", { replace: true });
  };

  return <button onClick={handleLogin}>Log In</button>;
}
```

### Navigate Component (Redirect)

```tsx
import { Navigate } from "@solidjs/router";
import { Show } from "solid-js";

function ProtectedRoute(props: RouteSectionProps) {
  const user = useUser();
  return (
    <Show when={user()} fallback={<Navigate href="/login" />}>
      {props.children}
    </Show>
  );
}
```

---

## Route Parameters and Search Params

### Dynamic Parameters

```tsx
import { useParams } from "@solidjs/router";

function UserProfile() {
  const params = useParams();
  // ALWAYS access params.id directly — NEVER destructure
  return <h1>User: {params.id}</h1>;
}

// Route: <Route path="/users/:id" component={UserProfile} />
```

### Search Parameters

```tsx
import { useSearchParams } from "@solidjs/router";

function ProductList() {
  const [search, setSearch] = useSearchParams();

  return (
    <div>
      <p>Page: {search.page ?? "1"}</p>
      <button onClick={() => setSearch({ page: String(Number(search.page ?? 1) + 1) })}>
        Next Page
      </button>
    </div>
  );
}
```

---

## Route Guards

```tsx
import { useBeforeLeave } from "@solidjs/router";
import { createSignal } from "solid-js";

function EditForm() {
  const [dirty, setDirty] = createSignal(false);

  useBeforeLeave((e) => {
    if (dirty() && !e.defaultPrevented) {
      e.preventDefault();
      if (window.confirm("Discard unsaved changes?")) {
        e.retry(true); // Force navigation
      }
    }
  });

  return <textarea onInput={() => setDirty(true)} />;
}
```

---

## Lazy Loading and Preloading

### Lazy Route Components

```tsx
import { lazy } from "solid-js";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));

<Route path="/dashboard" component={Dashboard} />
<Route path="/settings" component={Settings} />
```

### Route Preloading

```tsx
import { Route, query, createAsync } from "@solidjs/router";
import type { RoutePreloadFuncArgs } from "@solidjs/router";

const getProduct = query(async (id: string) => {
  const res = await fetch(`/api/products/${id}`);
  return res.json();
}, "product");

function preloadProduct({ params }: RoutePreloadFuncArgs) {
  getProduct(params.id); // Fire-and-forget, warms cache
}

// Route definition
<Route path="/products/:id" component={ProductPage} preload={preloadProduct} />
```

### Hover Preloading

```tsx
import { usePreloadRoute } from "@solidjs/router";

function NavBar() {
  const preload = usePreloadRoute();

  return (
    <nav>
      <A href="/dashboard" onMouseEnter={() => preload("/dashboard")}>
        Dashboard
      </A>
    </nav>
  );
}
```

---

## Nested Routes

```tsx
<Router>
  <Route path="/users" component={UsersLayout}>
    <Route path="/" component={UsersList} />
    <Route path="/:id" component={UserDetail} />
    <Route path="/:id/settings" component={UserSettings} />
  </Route>
</Router>
```

The parent `UsersLayout` receives `props.children` which renders the matched child route.

---

## Route Match Filters

```tsx
<Route
  path="/users/:id"
  component={UserPage}
  matchFilters={{ id: /^\d+$/ }}
/>
```

The route only matches when `id` is numeric. Non-matching URLs fall through to other routes or 404.

---

## Reference Links

- [references/methods.md](references/methods.md) -- API signatures for Router, Route, A, Navigate, and all hooks
- [references/examples.md](references/examples.md) -- Working code examples for router setup, navigation, guards, lazy loading, preloading, nested routes
- [references/anti-patterns.md](references/anti-patterns.md) -- React Router patterns that break Solid Router, with corrections

### Official Sources

- https://docs.solidjs.com/solid-router
- https://docs.solidjs.com/solid-router/reference/components/a
- https://docs.solidjs.com/solid-router/reference/components/route
- https://docs.solidjs.com/solid-router/reference/primitives/use-navigate
- https://docs.solidjs.com/solid-router/reference/preload-functions/preload
