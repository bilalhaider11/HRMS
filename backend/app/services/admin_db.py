from sqlmodel import select
from fastapi import HTTPException
import bcrypt
from app.models.admin import Admin
from app.db.session import get_session  # single shared engine

# Alias for routers that use get_db
get_db = get_session


# ---------- ADMIN OPERATIONS ----------

def create_admin_in_db(admin, session):
    # Validate admin fields
    if admin.company_name == 'string':
        raise HTTPException(status_code=400, detail="Enter company name")
    if admin.website == 'string':
        raise HTTPException(status_code=400, detail="Enter website")
    if admin.address == 'string':
        raise HTTPException(status_code=400, detail="Enter address")
    if admin.phone == 'string':
        raise HTTPException(status_code=400, detail="Enter phone")
    if admin.email == 'string':
        raise HTTPException(status_code=400, detail="Enter email")
    if admin.password == 'string':
        raise HTTPException(status_code=400, detail="Enter password")
    
    # Enforce single-admin constraint
    any_admin = session.exec(select(Admin)).first()
    if any_admin:
        raise HTTPException(status_code=409, detail="System already has an admin account")

    # Check for duplicate email
    existing = session.exec(select(Admin).where(Admin.email == admin.email)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Admin already exists")
    
    # Hash password and save to DB
    admin_data = admin.model_dump()
    admin_data["password"] = bcrypt.hashpw(
        admin_data["password"].encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")
    db_admin = admin.model_validate(admin_data)
    session.add(db_admin)
    session.commit()
    session.refresh(db_admin)
    return {
        "message": "Admin created successfully",
        "admin": db_admin.id
    }


def update_company_profile_in_db(profile_data, current_admin, session):
    if profile_data.company_name and profile_data.company_name != "string":
        current_admin.company_name = profile_data.company_name
    if profile_data.website and profile_data.website != "string":
        current_admin.website = profile_data.website
    if profile_data.address and profile_data.address != "string":
        current_admin.address = profile_data.address
    if profile_data.phone and profile_data.phone != "string":
        current_admin.phone = profile_data.phone
    if profile_data.email and profile_data.email != "string":
        current_admin.email = profile_data.email
    session.commit()
    session.refresh(current_admin)
    return {
        "message": "Company profile updated successfully",
        "company_name": current_admin.company_name,
        "website": current_admin.website,
        "address": current_admin.address,
        "phone": current_admin.phone,
        "email": current_admin.email
    }


def update_password_in_db(new, current_admin, session):
    current_admin.password = bcrypt.hashpw(
        new.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")
    session.commit()
    session.refresh(current_admin)
    return "Password Updated"


