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

**Client-side sort:** the dataset is a personal, bounded todo list. Sorting 50-100 items in-memory is instant. With pagination or multi-user scale, sort would move to the API layer via an `?orderBy=` query param.

**TanStack Query over plain `useEffect` + `useState`:** gives us query caching, background refetch on focus, optimistic update rollback, and consistent loading/error states with zero boilerplate.

**Undo delete:** the pending-delete `useRef` lives in `useUndoDelete` rather than `TaskRow` because `TaskRow` unmounts immediately when the item is removed from the React Query cache. The 4-second `setTimeout` commits the real DELETE; clicking Undo cancels the timeout and restores the item in the cache.

**No component library:** SCSS modules keep styles scoped and the bundle small. The UI is simple enough that a full design system would add more complexity than it removes.

## Production considerations

Already in place:
- Optimistic updates via TanStack Query — UI responds instantly, rolls back automatically on error
- Undo delete: the pending-delete `useRef` lives in `useUndoDelete` rather than `TaskRow` because `TaskRow` unmounts immediately when the item is removed from the cache. A 4-second timeout commits the real DELETE; clicking Undo cancels it and restores the item.
- No component library — SCSS modules keep styles scoped and the bundle small
- 22 unit tests covering loading/empty/filtered states, completion toggle, inline create flow, sort ordering, and filter handler invocation

Not implemented yet:
- Auth (JWT bearer) and user-scoped todos
- Pagination and server-side sort/filter once the dataset grows beyond what fits in memory
- E2E tests (Playwright)
- Due date times with timezone support (currently date-only)

## What's next

The most natural next step is categories or named lists, which would require a `List` model and a foreign key on `Todo`. After that, a detail page (`/todos/:id`) would open up richer editing and task history without crowding the table view. Drag-to-reorder (needs an `order` field on the model) and alternative views like a Kanban board or calendar would come after that.
