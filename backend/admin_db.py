from sqlmodel import create_engine, Session, select
from fastapi import HTTPException
from models import Admin, Company, jwt_tokens
from jose import jwt, JWTError, ExpiredSignatureError

import load_env

# Load the database URL from environment variables or config
DATABASE_URL = load_env.get_database_url()
SECRET_KEY = load_env.get_secret_key()
ALGORITHM = load_env.get_algorithm()

# Create SQLModel engine with echo=True to log SQL statements
engine = create_engine(DATABASE_URL, echo=True)


# ---------- DB UTILS ----------

# Get a new database session (context manager)
def get_session():
    with Session(engine) as session:
        yield session

# Alias for get_session(), also returns a database session
def get_db():
    with Session(engine) as session:
        yield session

# Register a new company in the database
def register_company_in_db(company, session):
    # Validation checks for default placeholder values
    if company.company_name == 'string':
        raise HTTPException(status_code=400, detail="Enter company_name")
    if company.website == 'string':
        raise HTTPException(status_code=400, detail="Enter website")
    if company.address == 'string':
        raise HTTPException(status_code=400, detail="Enter address")
    if company.phone == 'string':
        raise HTTPException(status_code=400, detail="Enter phone")
    if company.email == 'string':
        raise HTTPException(status_code=400, detail="Enter email")
    
    # Check if a company with the same name already exists
    existing = session.exec(select(Company).where(Company.company_name == company.company_name)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Company with given name already exists")
    # Validate and convert company input to ORM model
    company = Company.model_validate(company)
    
    # Add new company to session and commit to DB
    session.add(company)
    session.commit()
    session.refresh(company)  # Refresh to get updated data like auto-generated IDs
    return company

# Create a new admin user in the database
def create_admin_in_db(admin, session):
    # Validate admin fields against default placeholder values
    if admin.company_name == 'string':
        raise HTTPException(status_code=400, detail="Enter Username")
    if admin.website == 'string':
        raise HTTPException(status_code=400, detail="Enter Email")
    if admin.address == 'string':
        raise HTTPException(status_code=400, detail="Enter password")
    if admin.phone == 'string':
        raise HTTPException(status_code=400, detail="Enter Username")
    if admin.email == 'string':
        raise HTTPException(status_code=400, detail="Enter Email")
    if admin.password == 'string':
        raise HTTPException(status_code=400, detail="Enter password")
    
    # Check if the company exists
    company = session.exec(select(Company).where(Company.company_name == admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail='No company exist with the given name')
    
    # Check if admin already exists for that company
    existing = session.exec(
        select(Admin).where(Admin.email == admin.email,
                            Admin.company_name == admin.company_name)).first()

    if existing:
        raise HTTPException(status_code=409, detail="User already exists")

    # Convert input to ORM model and save to database
    db_admin = Admin.model_validate(admin)
    session.add(db_admin)
    session.commit()
    session.refresh(db_admin)  # Refresh to get generated ID
    return {
        "message": "Admin created successfully",
        "admin": db_admin.id
    }

# Update company profile details in the database
def update_company_profile_in_db(company_id, company, session, current_admin):
    # Fetch the existing company by ID
    existing = session.exec(
        select(Company).where(Company.company_id == company_id,
                                Company.company_name == current_admin.company_name)).first()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Company Does not exists")
    
    # Update fields if new values are provided
    if company.company_name != 'string':
        existing.company_name = company.company_name
    if company.website != 'string':
        existing.website = company.website
    if company.address != 'string':
        existing.address = company.address
    if company.phone != 'string':
        existing.phone = company.phone
    if company.email != 'string':
        existing.email = company.email
    
    session.commit()
    session.refresh(existing)  # Refresh to get updated company data
    return existing

# Update admin password
def update_password_in_db(old, new, current_admin, session):
    # Verify old password matches
    if old == current_admin.password:
        current_admin.password = new  # Set new password
        session.commit()
        session.refresh(current_admin)  # Refresh to get updated admin data
        return "Password Update"
    else:
        # Raise error if old password is incorrect
        raise HTTPException(status_code=401, detail="Provided password is wrong")


def add_jwt_token_in_db(client_ip: str, token: str, session: Session):
    # Create new JWT token record
    jwt_record = session.exec(select(jwt_tokens).where(jwt_tokens.client_ip == client_ip)).first()
    if jwt_record:
        jwt_record.token = token
    else:
        jwt_record = jwt_tokens(client_ip=client_ip, token=token)
        session.add(jwt_record)
    session.commit()
    session.refresh(jwt_record)  # Refresh to get generated ID
    return jwt_record

def get_client_token_in_db(client_ip: str, session: Session):
    jwt_record = session.exec(select(jwt_tokens).where(jwt_tokens.client_ip == client_ip)).first()
    if jwt_record:
        token = jwt_record.token

        # Check if token is expired
        try:
            jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            # if no exception → token is valid
            return token

        except ExpiredSignatureError:
            return "Token Expired. Login Again."

        except JWTError:
            return "Invalid Token"
    return "Register yourself First"
