from sqlmodel import create_engine, Session, select
from fastapi import HTTPException
from models import Admin, jwt_tokens
from jose import jwt, JWTError, ExpiredSignatureError

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
    
    # Save to DB
    db_admin = Admin.model_validate(admin)
    session.add(db_admin)
    session.commit()
    session.refresh(db_admin)
    return {
        "message": "Admin created successfully",
        "admin": db_admin.id
    }


def update_password_in_db(old, new, current_admin, session):
    if old == current_admin.password:
        current_admin.password = new
        session.commit()
        session.refresh(current_admin)
        return "Password Updated"
    else:
        raise HTTPException(status_code=401, detail="Provided password is wrong")


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
        except ExpiredSignatureError:
            return "Token Expired. Login Again."
        except JWTError:
            return "Invalid Token"
    return "Register yourself First"