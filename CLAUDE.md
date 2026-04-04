# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HRMS (Human Resource Management System) — a single-admin system for managing employees, inventory, and finance. Monorepo with a FastAPI backend and React + TypeScript frontend, orchestrated with Docker Compose.

## Development Commands

### Docker (recommended — from project root)
```bash
docker compose -f docker-compose.yml up -d        # Start all services (DB + backend + frontend)
docker compose -f docker-compose.yml down          # Stop all services
docker compose -f docker-compose.yml down -v       # Stop + remove database volume (fresh start)
docker compose -f docker-compose.yml logs -f backend   # Backend logs
docker compose -f docker-compose.yml logs -f frontend  # Frontend logs
```
On first run, the backend auto-generates migrations, runs them, and seeds finance categories.

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:8000 |
| Swagger  | http://localhost:8000/docs |

### Manual (without Docker)

**Backend** (from `backend/`):
```bash
pip install -r requirement.txt                    # Install dependencies (note: "requirement.txt" not "requirements.txt")
alembic revision --autogenerate -m "description"  # Create migration
alembic upgrade head                              # Apply migrations
python seeders.py                                 # Seed finance categories
uvicorn main:app --reload --host 0.0.0.0 --port 8000  # Run dev server
```
Requires PostgreSQL and a `.env` file (see `.env.example`).

**Frontend** (from `frontend/`):
```bash
npm install     # Install dependencies
npm start       # Dev server at http://localhost:3000
npm run build   # Production build
npm test        # Jest tests
```

## Architecture

### Backend: FastAPI + SQLModel
- **`main.py`**: App entry point. Routes split into `admin_public_router` (login, register — no auth) and `admin_router` (protected). `finance_router` and `inventory_router` also protected via router-level `Depends(auth.get_current_user)`. CORS enabled for `localhost:3000`. Auto-auth middleware injects JWT tokens based on client IP.
- **`models.py`**: SQLModel ORM models — Admin, Employee, EmployeeIncrement, Finance, FinanceCategory, ItemCategory, InventoryItem, and link tables for many-to-many relationships.
- **`auth.py`**: JWT authentication using python-jose + bcrypt. OAuth2PasswordBearer scheme with `/admin/login` token URL. Config loaded from `.env`.
- **`load_env.py`**: Pydantic `BaseSettings` loading from `.env` file. Provides getter functions for DB URL and auth config.
- **`*_db.py` modules**: Each module handles CRUD operations for its entity (admin_db, employee_db, increment_db, finance_db, inventory_db). All use SQLModel Session dependency injection via `get_session()`.
- **Database**: Configured via `data_base_url` env var in `.env` (PostgreSQL). Migrations managed by Alembic. Auto-generated on first Docker run.

### Frontend: React 19 + TypeScript (Create React App)
- **State management**: React Context per feature. Each feature module in `src/features/` has its own `modal/` directory containing a Context provider + custom hook.
- **Routing**: React Router DOM. Auth gates in `AppContent.tsx` — unauthenticated users see login/signup, authenticated users get the full layout with sidebar.
- **Forms**: Formik + Yup for all forms.
- **Styling**: Tailwind CSS with dark mode (`darkMode: 'class'`). Custom fonts (Gilroy, Inter, Poppins, Urbanist) in tailwind config.
- **Import paths**: `baseUrl: "src"` in tsconfig.json, so imports are relative to `src/` (e.g., `import from "features/employees/..."`)

### Frontend Feature Structure
The three CRUD features (`employees`, `finance`, `inventory`) each follow this pattern:
- `api/` — data fetching (employees, finance, inventory still read from dummy JSON; auth is wired to real backend)
- `modal/` — Context provider with state, CRUD actions, and modal controls
- `ui/` — reusable UI components (tables, form fragments, modals)
- Top-level files — page-level components (e.g., `EmployeesBody.tsx`, `RegisterEmployees.tsx`)

Other features: `dashboard` (has `api/` + `ui/` but no context), `auth` (wired to backend API), `teams` (frontend UI exists but backend dropped), `settings` (flat, no subdirectories).

### Authentication
- **Frontend**: Wired to real backend. `login()` calls `POST /admin/login` (OAuth2 form data). `verify()` calls `GET /admin/company_profile` with Bearer token. Token stored in localStorage.
- **Backend**: JWT auth via `get_current_user()` applied as router-level dependency on all protected routes. Only `/admin/login` and `/admin/register_admin` are public. Passwords hashed with bcrypt. Single admin per system.
- **VerifyContext** (`app/VerifyContext.tsx`): Global auth state. `superAdmin = user !== null` (any logged-in user is admin in single-admin system). Routes: `/admin/login`, `/admin/register`.

### Key Design Decisions
- **Single admin**: One admin account per organization, no RBAC. Employees are managed by admin only.
- **Employee dual IDs**: `id` (int, internal PK) vs `employee_code` (string, user-facing business code like "EMP-001"). API endpoints accept the business code string; DB operations resolve to internal ID.
- **Pagination**: Page-based (`page`, `page_size`) returning `total_count`, `total_pages`, `items`.
- **Backend env vars**: `data_base_url`, `secret_key`, `algorithm`, `access_token_expire_minutes` — loaded via Pydantic Settings from `.env` in backend root.

## Detailed Module Documentation

For deep-dive documentation on each module, see `docs/`:

- **[Backend API Reference](docs/backend/api-reference.md)** — all endpoints, params, request/response shapes, pagination format
- **[Backend Data Models](docs/backend/data-models.md)** — ORM models, fields, types, constraints, relationships
- **[Backend Business Rules](docs/backend/business-rules.md)** — validation logic, side effects, 30-day increment gap, sentinel pattern
- **[Frontend Employees](docs/frontend/feature-employees.md)** — context API, TypeScript interfaces, routes, "Increament" spelling note
- **[Frontend Finance](docs/frontend/feature-finance.md)** — context API, sub-entity pattern (categories), PascalCase interface naming
- **[Frontend Inventory](docs/frontend/feature-inventory.md)** — two-level hierarchy (Category > Item), single context (Store dropped)
- **[Frontend Teams](docs/frontend/feature-teams.md)** — frontend UI exists but backend team management dropped
- **[Frontend App Shell](docs/frontend/app-shell.md)** — auth flow, provider nesting order, sidebar visibility rules, layout
- **[Frontend Shared Components](docs/frontend/shared-components.md)** — reusable UI components catalog
- **[Integration Gaps](docs/integration-gaps.md)** — frontend/backend data shape mismatches, missing endpoints, auth gap
