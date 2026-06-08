import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from app.core.load_env import get_secret_key, get_algorithm, get_token_expire_minutes
from app.services.admin_db import get_session
from app.models.admin import Admin
from app.models.employee import Employee


# Configure OAuth2 scheme for token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")
oauth2_employee_scheme = OAuth2PasswordBearer(tokenUrl="/employee/login")


# --- Password Hashing ---
def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(
        plain_password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


# --- Password Verification ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except (ValueError, TypeError):
        # Stored password is not a valid bcrypt hash (e.g. legacy plaintext)
        return False


# --- JWT Token Creation ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    # Copy data to encode into JWT
    to_encode = data.copy()
    # Determine expiration time for token
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=get_token_expire_minutes()))
    to_encode.update({"exp": expire})  # Add expiration to payload
    # Encode the JWT using secret key and algorithm
    return jwt.encode(to_encode, get_secret_key(), algorithm=get_algorithm())


def authenticate_admin(session: Session, email: str, password: str) -> Optional[Admin]:
    # Query admin table by email
    statement = select(Admin).where((Admin.email == email))
    admin = session.exec(statement).first()

    # Return None if admin not found
    if not admin:
        print("Incorrect username/email:", email)
        return None
    # Verify provided password
    if not verify_password(password, admin.password):
        print("Incorrect password for user:", email)
        return None
    # Return admin object if authenticated
    return admin


# --- Get Current User from JWT ---
def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> Admin:
    # Exception to raise if authentication fails
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode JWT token to get payload
        payload = jwt.decode(token, get_secret_key(), algorithms=[get_algorithm()])
        admin_id: Optional[int] = payload.get("user_id")  # Extract user ID
        if admin_id is None:
            raise credentials_exception
    except JWTError:
        # Raise exception if token is invalid
        raise credentials_exception

    # Retrieve admin from database
    user = session.get(Admin, admin_id)
    if user is None:
        raise credentials_exception  # Raise if admin not found
    return user


def get_current_employee(
    token: str = Depends(oauth2_employee_scheme),
    session: Session = Depends(get_session),
) -> Employee:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=[get_algorithm()])
        user_type: Optional[str] = payload.get("user_type")
        employee_id: Optional[int] = payload.get("user_id")
        if employee_id is None or user_type != "employee":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    employee = session.get(Employee, employee_id)
    if employee is None:
        raise credentials_exception
    return employee

def get_current_role(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
   
    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=[get_algorithm()])
        user_id: Optional[int] = payload.get("user_id")
        user_type: Optional[str] = payload.get("user_type")
        
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if user_type == "employee":
        employee = session.get(Employee, user_id)
        if employee is None:
            raise credentials_exception
        return {"user_type": "employee", "user": employee}
    else:
        user_type = "admin"
        admin = session.get(Admin, user_id)
        if admin is None:
            raise credentials_exception
        return {"user_type": user_type, "user": admin}
