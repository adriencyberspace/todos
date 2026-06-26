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

Three tests in `src/test/TaskTable.test.tsx` cover: skeleton loading state, data rendering, and completion toggle mutation.

## Architecture decisions

**Why client-side sort** - the dataset is a personal, bounded todo list. Sorting 50–100 items in-memory is instant. With pagination or multi-user scale, sort would move to the API layer (add an `?orderBy=` query param).

**Why TanStack Query over plain `useEffect` + `useState`** - gives us query caching, background refetch on focus, optimistic update rollback, and consistent loading/error states with zero boilerplate.

**Why SQLite** - appropriate for a local-dev MVP. The EF Core abstraction means swapping to Postgres in production is a one-line connection string change.

**CORS** - locked to `localhost:5173` in `Startup.cs`. In production, read the allowed origin from an environment variable.

**Undo delete** - the pending-delete `useRef` lives in `App.tsx` (not `TaskRow`) because `TaskRow` unmounts immediately when the item is removed from the React Query cache. The 4-second `setTimeout` calls the real DELETE API call; clicking Undo cancels it and re-creates the task via POST.

## Future enhancements

- Drag-to-reorder (needs an `order` field on the API model)
- Pagination / infinite scroll
- Authentication (JWT bearer)
- Server-side sort and filter
- Due date push notifications
