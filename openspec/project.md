# Project Context

## Purpose
[Describe your project's purpose and goals]

## Tech Stack
- **Backend**: Go (latest stable), Gin/Echo, GORM/sqlx, slog
- **Frontend**: React 18+, TypeScript 5+, Vite, Ant Design 5.x, Zustand, TanStack Query
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Scripts / CI**: Ruby 3.1+ only (no bash); Docker Compose for dev/test
- **API**: REST, OpenAPI 3.0, versioned `/api/v1/`

## Project Conventions

- **Code comments**: English only.
- **Docs**: Under `docs/`; see `docs/README.md` for index.
- **Development**: Docker Compose required; no local run without containers.
- **Rules**: Implementation must follow `rules/*.mdc` (Cursor alwaysApply).

### Architecture Patterns
Layered: Presentation → Business Logic → Data Access → Domain. API-first, microservices-ready.

### Testing Strategy
Ruby-based automated test scripts; unit + integration + E2E; coverage ≥80% for core logic; all runs in Docker Compose.

### Git Workflow
Conventional Commits; PR to main/develop; keep commits small and buildable.

## Domain Context
[Add domain-specific knowledge that AI assistants need to understand]

## Important Constraints
- All scripts in Ruby 3.1+; no bash/shell.
- Docker Compose required for dev and test.
- CI/CD fully automated (no manual steps).

## External Dependencies
[Document key external services, APIs, or systems]
