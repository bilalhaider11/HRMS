from sqlmodel import create_engine, Session, select
from fastapi import HTTPException
from models import Admin, jwt_tokens
from jose import jwt, JWTError, ExpiredSignatureError
import bcrypt

import load_env

# Load DB config
DATABASE_URL = load_env.get_database_url()
SECRET_KEY = load_env.get_secret_key()
ALGORITHM = load_env.get_algorithm()

# SQLModel engine
engine = create_engine(DATABASE_URL, echo=True)


# ---------- DB UTILS ----------

def get_session():
    with Session(engine) as session:
        yield session

def get_db():
    with Session(engine) as session:
        yield session


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
    
    # Check if admin already exists
    existing = session.exec(select(Admin).where(Admin.email == admin.email)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Admin already exists")
    
    # Hash password and save to DB
    admin_data = admin.model_dump()
    admin_data["password"] = bcrypt.hashpw(
        admin_data["password"].encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")
    db_admin = Admin.model_validate(admin_data)
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


# ---------- JWT OPERATIONS ----------

def add_jwt_token_in_db(client_ip: str, token: str, session: Session):
    jwt_record = session.exec(select(jwt_tokens).where(jwt_tokens.client_ip == client_ip)).first()
    if jwt_record:
        jwt_record.token = token
    else:
        jwt_record = jwt_tokens(client_ip=client_ip, token=token)
        session.add(jwt_record)
    session.commit()
    session.refresh(jwt_record)
    return jwt_record


def get_client_token_in_db(client_ip: str, session: Session):
    jwt_record = session.exec(select(jwt_tokens).where(jwt_tokens.client_ip == client_ip)).first()
    if jwt_record:
        token = jwt_record.token
        try:
            jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return token
        except (ExpiredSignatureError, JWTError):
            return None
    return None