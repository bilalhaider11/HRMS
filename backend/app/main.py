from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.middleware import auto_auth_middleware
from app.core.load_env import get_cors_origins

from app.api.routers import admin, employees, finance, inventory, attendance, bank_accounts, teams

app = FastAPI(title="Celestials Management System")

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

# Middleware
app.middleware("http")(auto_auth_middleware)

# Routers
app.include_router(admin.router)
app.include_router(employees.admin_router)
app.include_router(finance.router)
app.include_router(inventory.router)
app.include_router(attendance.router)
app.include_router(bank_accounts.router)
app.include_router(teams.router)