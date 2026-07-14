---
name: solid-impl-solidstart
description: >
  Use when building SolidStart applications with SSR, file-based routing, or server functions.
  Prevents incorrect 'use server' placement, broken hydration, and misuse of query/createAsync patterns.
  Covers file-based routing, data loading with query and createAsync, server functions, actions with form integration, SSR streaming, hydration, and API routes.
  Keywords: SolidStart, use server, createAsync, query, file-based routing,
  SSR, hydration, API routes, Vinxi, Nitro, server function, full-stack SolidJS,
  data loading, server actions.
license: MIT
compatibility: "Designed for Claude Code. Requires SolidStart 1.x with SolidJS 1.x/2.x and TypeScript."
metadata:
  author: OpenAEC-Foundation
  version: "1.0"
---

# solid-impl-solidstart

## Quick Reference

### Architecture Stack

| Layer | Technology | Role |
|-------|-----------|------|
| SolidJS | Fine-grained reactivity | Component rendering, signals, stores |
| Vite | Bundler | Dev server, HMR, production builds |
| Nitro | Server runtime | Deployment adapters, server functions |
| Vinxi | CLI + config | Combines Vite + Nitro into unified tooling |

### Project Structure

```
src/
├── routes/              # File-based routing (ALWAYS here)
│   ├── index.tsx        # / route
│   ├── about.tsx        # /about route
│   └── api/             # API routes
├── entry-client.tsx     # Client hydration entry
├── entry-server.tsx     # Server request handler
└── app.tsx              # Root component (Router + FileRoutes)
```

### Minimum app.tsx

```tsx
import { Suspense } from "solid-js";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

export default function App() {
  return (
    <Router root={(props) => <Suspense>{props.children}</Suspense>}>
      <FileRoutes />
    </Router>
  );
}
```

### Critical Warnings

**ALWAYS** make `"use server"` functions `async` -- the directive requires the function to return a `Promise`. Non-async server functions cause runtime errors.

**ALWAYS** `throw redirect()` from server functions -- NEVER `return redirect()`. Redirect is implemented as a thrown response, not a return value. Returning it does nothing.

**NEVER** use `getServerSideProps`, `useLoaderData`, or any Next.js/React Router data loading patterns. SolidStart uses `query()` + `createAsync()` exclusively.

**NEVER** use `useEffect` for data fetching -- SolidStart has NO equivalent of React's `useEffect` data fetching pattern. ALWAYS use `query()` + `createAsync()`.

**NEVER** use `element={<Component />}` on Route -- ALWAYS use `component={Component}`. The React pattern creates the component immediately, breaking Solid's deferred rendering.

**NEVER** use the deprecated 0.x APIs (`createServerData$`, `createServerAction$`) -- ALWAYS use `query()`, `action()`, and `"use server"` from SolidStart 1.0+.

---

## File-Based Routing Convention Table

| File Pattern | URL | Description |
|-------------|-----|-------------|
| `routes/index.tsx` | `/` | Home route |
| `routes/about.tsx` | `/about` | Static route |
| `routes/blog/article.tsx` | `/blog/article` | Nested route |
| `routes/blog.tsx` + `routes/blog/` | Layout wrapper | Layout for `/blog/*` children |
| `routes/users/[id].tsx` | `/users/:id` | Dynamic parameter |
| `routes/users/[[id]].tsx` | `/users` or `/users/:id` | Optional parameter |
| `routes/docs/[...path].tsx` | `/docs/*` | Catch-all parameter |
| `routes/(admin)/dashboard.tsx` | `/dashboard` | Route group (no URL segment) |
| `routes/api/users.ts` | `/api/users` | API route (no default export) |

### Dynamic Route Parameters

```tsx
import { useParams } from "@solidjs/router";

// routes/users/[id].tsx
export default function UserPage() {
  const params = useParams();
  return <div>User: {params.id}</div>;
}

// routes/docs/[...path].tsx -- catch-all
export default function DocsPage() {
  const params = useParams();
  // params.path = "guides/getting-started" (slash-delimited)
  return <div>Doc: {params.path}</div>;
}
```

### Nested Layout Pattern

```tsx
// routes/blog.tsx -- layout wrapper for /blog/*
import type { RouteSectionProps } from "@solidjs/router";

export default function BlogLayout(props: RouteSectionProps) {
  return (
    <div>
      <nav>Blog Navigation</nav>
      {props.children}
    </div>
  );
}
```

---

## Decision Tree: Data Loading

```
Need server-side data?
├─ YES: Is it a read operation (query)?
│  ├─ YES: Use query() + createAsync()
│  │  └─ Need fine-grained store updates? → Use createAsyncStore()
│  └─ NO: It's a mutation → Use action() (see Actions section)
└─ NO: Client-only data
   └─ Use createSignal/createResource directly
```

---

## Data Loading Pattern

### Step 1: Define a Query with Server Function

```tsx
import { query } from "@solidjs/router";

const getUser = query(async (id: string) => {
  "use server";
  const user = await db.getUser(id);
  if (!user) throw new Error("User not found");
  return user;
}, "user");
```

### Step 2: Consume with createAsync

```tsx
import { createAsync } from "@solidjs/router";
import { Suspense } from "solid-js";

export default function UserPage() {
  const params = useParams();
  const user = createAsync(() => getUser(params.id));

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <h1>{user()?.name}</h1>
    </Suspense>
  );
}
```

### Step 3: Preload for Instant Navigation

```tsx
import type { RouteDefinition } from "@solidjs/router";

export const route = {
  preload({ params }) {
    getUser(params.id); // fire-and-forget, warms cache
  },
} satisfies RouteDefinition;
```

---

## Decision Tree: Mutations

```
Need to mutate server data?
├─ From a <form>?
│  ├─ YES: Use action={myAction} method="post"
│  │  └─ Need extra args? → Use action={myAction.with(extraArg)}
│  └─ NO: Programmatic mutation
│     └─ Use useAction(myAction) for imperative calls
└─ Track submission state?
   ├─ Single submission → useSubmission(myAction)
   └─ Multiple concurrent → useSubmissions(myAction)
```

---

## Actions and Forms Pattern

### Form-Based Action

```tsx
import { action, redirect } from "@solidjs/router";

const addTodo = action(async (formData: FormData) => {
  "use server";
  const title = formData.get("title") as string;
  await db.addTodo(title);
  throw redirect("/todos");  // ALWAYS throw, NEVER return
}, "addTodo");

export default function NewTodo() {
  return (
    <form action={addTodo} method="post">
      <input name="title" required />
      <button type="submit">Add</button>
    </form>
  );
}
```

### Programmatic Action with useAction

```tsx
import { action, useAction } from "@solidjs/router";

const toggleTodo = action(async (id: string) => {
  "use server";
  await db.toggleTodo(id);
}, "toggleTodo");

function TodoItem(props: { id: string; done: boolean }) {
  const doToggle = useAction(toggleTodo);
  return (
    <button onClick={() => doToggle(props.id)}>
      {props.done ? "Undo" : "Done"}
    </button>
  );
}
```

### Submission Tracking

```tsx
import { useSubmission } from "@solidjs/router";

function TodoForm() {
  const submission = useSubmission(addTodo);
  return (
    <form action={addTodo} method="post">
      <input name="title" />
      <button disabled={submission.pending}>
        {submission.pending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
```

### Response Helpers After Actions

```tsx
import { redirect, reload, revalidate } from "@solidjs/router";

const updateUser = action(async (id: string, formData: FormData) => {
  "use server";
  await db.updateUser(id, Object.fromEntries(formData));
  // Option 1: Redirect (ALWAYS throw)
  throw redirect("/users");
  // Option 2: Revalidate specific query + redirect
  throw redirect("/users", { revalidate: getUser.keyFor(id) });
  // Option 3: Reload current page
  throw reload({ revalidate: getUser.key });
}, "updateUser");
```

---

## Server Functions

### Function-Level "use server"

```tsx
const getData = async (id: string) => {
  "use server";
  return db.getData(id);  // Runs server-only, compiled to RPC
};
```

### File-Level "use server"

```tsx
// src/lib/server/queries.ts
"use server";

export async function getUsers() {
  return db.getUsers();
}

export async function getProduct(id: string) {
  return db.getProduct(id);
}
```

### Serialization Requirement

Arguments and return values MUST be serializable (SolidStart uses Seroval). NEVER pass DOM nodes, functions, or class instances through server functions.

---

## SSR and Hydration

| Mode | Function | Use Case |
|------|----------|----------|
| Sync SSR | `renderToString` | Static pages, no async data |
| Streaming SSR | `renderToStream` | Dynamic pages with Suspense boundaries |
| Client hydration | `hydrate` | Attach reactivity to server-rendered HTML |

### Streaming SSR (Default in SolidStart)

```tsx
import { renderToStream } from "solid-js/web";

const stream = renderToStream(() => <App />, {
  onCompleteShell() {
    // Shell rendered, Suspense fallbacks in place
  },
  onCompleteAll() {
    // All async content resolved
  },
});
stream.pipe(res);       // Node.js
stream.pipeTo(writable); // Web Streams
```

### HydrationScript

ALWAYS include `<HydrationScript />` once in the HTML head. It captures user events (click, input) before Solid loads, then replays them after hydration.

### isServer

```tsx
import { isServer } from "solid-js/web";

if (isServer) {
  // Tree-shaken from client bundle at build time
}
```

---

## API Routes

API routes export named HTTP method handlers (NOT a default component):

```tsx
// routes/api/users/[id].ts
import type { APIEvent } from "@solidjs/start/server";

export async function GET({ params }: APIEvent) {
  const user = await db.getUser(params.id);
  if (!user) return new Response("Not found", { status: 404 });
  return user; // Auto-serialized to JSON
}

export async function DELETE({ params }: APIEvent) {
  await db.deleteUser(params.id);
  return new Response(null, { status: 204 });
}
```

API routes are prioritized over UI routes at the same path.

---

## SolidStart 0.x to 1.0 Migration

| 0.x (Deprecated) | 1.0 (Current) |
|-------------------|----------------|
| `createServerData$` | `query()` + `createAsync()` |
| `createServerAction$` | `action()` |
| `createRouteData` | `query()` + `createAsync()` |
| `useRouteData()` | `createAsync(() => myQuery())` |
| `server$()` wrapper | `"use server"` directive |

---

## Reference Links

- [references/methods.md](references/methods.md) -- API signatures for query, createAsync, action, redirect, renderToStream, hydrate
- [references/examples.md](references/examples.md) -- File routing, data loading, server functions, action/form, SSR, API route patterns
- [references/anti-patterns.md](references/anti-patterns.md) -- Next.js patterns, getServerSideProps, useEffect data fetching, React Router patterns

### Official Sources

- https://docs.solidjs.com/solid-start
- https://docs.solidjs.com/solid-start/building-your-application/routing
- https://docs.solidjs.com/solid-start/reference/server/use-server
- https://docs.solidjs.com/solid-router/reference/data-apis/query
- https://docs.solidjs.com/solid-router/reference/data-apis/action
- https://docs.solidjs.com/solid-router/reference/data-apis/create-async
- https://docs.solidjs.com/reference/rendering/render-to-stream
- https://docs.solidjs.com/reference/rendering/hydrate
- https://docs.solidjs.com/solid-start/building-your-application/api-routes
