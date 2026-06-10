from __future__ import annotations

import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.load_env import get_cors_origins, validate_required_env

from app.api.routers import admin, employees, finance, inventory, attendance, bank_accounts, teams, roles, evaluation

validate_required_env()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Celestials Management System")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Serve uploads (same behavior as legacy)
os.makedirs("uploads/profile_pics", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins() or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(admin.router)
app.include_router(employees.admin_router)
app.include_router(employees.employee_router)
app.include_router(finance.router)
app.include_router(inventory.router)
app.include_router(attendance.router)
app.include_router(attendance.attendance_router)
app.include_router(bank_accounts.router)
app.include_router(teams.router)
app.include_router(roles.admin_router)
app.include_router(evaluation.router)