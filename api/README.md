# TodoApi

A local-dev Todo REST API built with .NET 10, EF Core, and SQLite. No external dependencies - `dotnet run` is all you need.

## Prerequisites

**[.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)** - verify with `dotnet --version` (should be `10.x.x`).

macOS (Homebrew):
```bash
brew install --cask dotnet-sdk
```

Or download the installer directly from [dotnet.microsoft.com/download/dotnet/10.0](https://dotnet.microsoft.com/download/dotnet/10.0).

## Setup

```bash
cd src/TodoApi.Api
dotnet run
```

Navigate to `http://localhost:5000/api-doc` for the Scalar interactive docs.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/todos` | List todos. Optional: `?completed=true/false`, `?priority=low/medium/high` |
| `GET` | `/todos/{id}` | Get a single todo |
| `POST` | `/todos` | Create a todo |
| `PUT` | `/todos/{id}` | Update a todo |
| `PATCH` | `/todos/{id}/complete` | Mark a todo complete (idempotent) |
| `PATCH` | `/todos/{id}/uncomplete` | Mark a todo incomplete (idempotent) |
| `DELETE` | `/todos/{id}` | Delete a todo |

## Tests

```bash
dotnet test TodoApi.slnx
```

14 unit tests covering: create defaults, CRUD operations, complete/uncomplete with idempotency, combined filter (status + priority), and not-found paths. Each test uses an isolated in-memory EF Core database.

## Architecture decisions

**SQLite over in-memory EF Core for the API** - SQLite persists across restarts. The `todos.db` file is created automatically on first run via `Database.Migrate()` in startup. In-memory EF Core is reserved for tests only.

**GUID IDs** - non-enumerable, safe to expose in URLs without leaking record counts.

**No authentication** - scoped to local development. In production, add JWT bearer auth and lock the CORS policy to the deployed frontend origin.

**No subtasks** - one-level todo items only. A `parentId` relationship is explicitly out of scope.

## Production considerations

Already in place:
- Serilog structured logging to console, with request logging middleware and a custom enricher that stamps every log line with the app version and git SHA
- Exception middleware returns a generic error in production and logs at Critical — no stack traces leak to the client
- Input validation on DTOs via data annotations, rejected before business logic runs
- CORS uses an explicit origin whitelist, not `AllowAnyOrigin`
- Async/await + `CancellationToken` threaded through the full stack so in-flight requests cancel cleanly if the client disconnects

Not implemented yet:
- Auth: JWT bearer with a claims-based policy
- CORS: lock `WithOrigins` to the deployed frontend URL (currently `localhost:5173`)
- Rate limiting: `AddRateLimiter` with a fixed-window policy
- Containerization: multi-stage Dockerfile targeting `mcr.microsoft.com/dotnet/aspnet:10.0-alpine`
- Migrations: move `Database.Migrate()` out of startup and into a dedicated deploy pipeline step to avoid race conditions across multiple instances starting simultaneously
