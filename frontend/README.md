# Ezra Todo - Frontend

React 19 + TypeScript + Vite frontend for the Ezra Todo app. Connects to the .NET API at `http://localhost:5000`.

## Setup

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`. Start the API first (`cd ../api/src/TodoApi.Api && dotnet run`).

## Stack

- **React 19 + TypeScript + Vite** - scaffolded with `create-vite`
- **TanStack Query v5** - server state, caching, background refetch
- **SCSS modules** - scoped styles, no component library
- **react-day-picker** - date picker in the edit modal
- **react-hot-toast** - toast notifications (including undo-delete)
- **lucide-react** - icons

## Tests

```bash
npm run test
```

22 tests across four files (`TaskTable`, `AddTaskRow`, `EmptyState`, `sort`). Coverage includes: loading/empty/filtered/all-done states, task rendering, completion toggle, inline create flow, sort ordering, and filter handler invocation.

## Architecture decisions

**Why client-side sort** - the dataset is a personal, bounded todo list. Sorting 50–100 items in-memory is instant. With pagination or multi-user scale, sort would move to the API layer (add an `?orderBy=` query param).

**Why TanStack Query over plain `useEffect` + `useState`** - gives us query caching, background refetch on focus, optimistic update rollback, and consistent loading/error states with zero boilerplate.

**Why SQLite** - appropriate for a local-dev MVP. The EF Core abstraction means swapping to Postgres in production is a one-line connection string change.

**CORS** - locked to `localhost:5173` in `Startup.cs`. In production, read the allowed origin from an environment variable.

**Undo delete** - the pending-delete `useRef` lives in `useUndoDelete` (not `TaskRow`) because `TaskRow` unmounts immediately when the item is removed from the React Query cache. The 4-second `setTimeout` commits the real DELETE; clicking Undo cancels the timeout and restores the item in the cache.

## Future enhancements

- **Categories / lists** - group todos under named lists; requires a `List` model and foreign key on `Todo`
- **Detail page** (`/todos/:id`) - dedicated route per task for richer editing and history
- **Due date times** - extend `dueDate` from date-only to full datetime with timezone support
- **Alternative views** - board (Kanban columns by status/priority) or calendar view
- **Drag-to-reorder** - needs an `order` field on the API model
- **Server-side sort and filter** - necessary at scale; add `?orderBy=` and move filter logic out of the client
- **Pagination / infinite scroll**
- **Authentication** (JWT bearer)
