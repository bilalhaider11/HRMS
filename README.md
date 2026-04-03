# HRMS — Human Resource Management System

A single-admin HRMS for managing employees, inventory, and finance. Built with a **FastAPI** backend and **React + TypeScript** frontend.

## Tech Stack

| Layer    | Stack |
|----------|-------|
| Backend  | FastAPI, SQLModel, Alembic, python-jose (JWT), bcrypt, Pydantic Settings |
| Frontend | React 19, TypeScript, Tailwind CSS, React Router, Formik + Yup, Axios, Chart.js |
| Database | PostgreSQL 16 |
| DevOps   | Docker, Docker Compose |

## Quick Start (Docker)

The easiest way to run the full project locally.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Run

```bash
docker compose -f docker-compose.yml up -d
```

This starts 3 services:

| Service  | URL                          | Description |
|----------|------------------------------|-------------|
| Frontend | http://localhost:3000         | React dev server |
| Backend  | http://localhost:8000         | FastAPI server |
| API Docs | http://localhost:8000/docs    | Swagger UI |
| Database | localhost:5432               | PostgreSQL |

On first run, the backend automatically:
1. Waits for PostgreSQL to be ready
2. Generates and runs database migrations
3. Seeds default finance categories
4. Starts the API server with hot reload

### Stop

```bash
docker compose -f docker-compose.yml down
```

To also remove the database volume (fresh start):

```bash
docker compose -f docker-compose.yml down -v
```

### View Logs

```bash
docker compose -f docker-compose.yml logs -f backend    # Backend logs
docker compose -f docker-compose.yml logs -f frontend   # Frontend logs
docker compose -f docker-compose.yml logs -f db         # Database logs
```

## Manual Setup (without Docker)

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
pip install -r requirement.txt
```

Create a `.env` file in `backend/` (see `.env.example`):

```env
data_base_url=postgresql://user:password@localhost:5432/hrms_db
secret_key=your-secret-key
algorithm=HS256
access_token_expire_minutes=30
```

Run migrations, seed data, and start the server:

```bash
alembic revision --autogenerate -m "initial_schema"
alembic upgrade head
python seeders.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm start
```

Dev server at http://localhost:3000

## Project Structure

```
backend/
  main.py            # FastAPI app, routes, middleware, CORS
  models.py          # SQLModel ORM models
  auth.py            # JWT authentication + bcrypt password hashing
  load_env.py        # Environment config (Pydantic Settings)
  admin_db.py        # Admin CRUD + JWT token management
  employee_db.py     # Employee CRUD
  increment_db.py    # Salary increment CRUD
  finance_db.py      # Finance record CRUD
  inventory_db.py    # Item category + inventory item CRUD
  seeders.py         # Database seed data (finance categories)
  alembic/           # Database migrations
  entrypoint.sh      # Docker entrypoint (migrations + seeds + server)

frontend/src/
  app/               # App shell, routing, auth & theme contexts
  features/          # Feature modules (employees, finance, inventory, dashboard, auth, settings)
  pages/             # Page components
  widgets/           # Layout components (sidebar, navbar, footer)
  shared/            # Shared utilities and components
```

## Author

**Bilal Haider**
