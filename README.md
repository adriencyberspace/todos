# Ezra Todo

Full-stack todo app - .NET 10 REST API + React 19 frontend.

## Prerequisites

| Dependency | Version | Install |
|------------|---------|---------|
| [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) | `10.x` | `brew install --cask dotnet-sdk` |
| [Node.js](https://nodejs.org) | `18+` | `brew install node` |

Verify: `dotnet --version` and `node --version`.

## Quick Start

```bash
make dev
```

`make dev` installs frontend dependencies and starts both services. Open **http://localhost:5173**. Press `Ctrl+C` to stop.

## What's Running

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:5000 |
| API Docs (Scalar) | http://localhost:5000/api-doc |

No database setup needed - SQLite is created automatically on first run.

## Features

- Create, edit, and delete tasks
- Inline creation and editing of task title and description
- Set priority (low / medium / high) and due date
- Mark tasks complete
- Filter by status and priority
- Sort by any column
- Undo delete (4-second window via toast notification)
- Interactive API explorer at `/api-doc`

## Stack

| | |
|-|--|
| **Frontend** | React 19, TypeScript, Vite, TanStack Query, SCSS modules |
| **Backend** | .NET 10, ASP.NET Core, Entity Framework Core, SQLite |

## About

Hi, I'm Adrien, a full-stack engineer with a TypeScript/NestJS background. 

**Backend:** Controllers handle routing and HTTP concerns only. Business logic lives in a service layer, which is what the unit tests exercise directly. Cross-cutting concerns like error handling and request logging are in middleware. That separation makes each piece easy to reason about and test independently.

**Frontend:** My take on "production MVP" is something people would actually want to use. Inline editing on every field felt more natural than a modal form. Toasts with optimistic updates make completing tasks feel instant. The undo-delete window is there because accidental deletes happen and recovering from them shouldn't require hunting for a deleted state.

Detailed architecture notes, endpoint docs, and production considerations are in [api/README.md](./api/README.md).

## More

- [API details, endpoints, and tests](./api/README.md)
- [Frontend architecture and component notes](./frontend/README.md)
