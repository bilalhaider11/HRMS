import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
import load_env
from admin_db import get_session
from models import AdminBase, Admin

# Load environment variables for secret key, algorithm, and token expiration
SECRET_KEY = load_env.get_secret_key()
ALGORITHM = load_env.get_algorithm()
ACCESS_TOKEN_EXPIRE_MINUTES = load_env.get_token_expire_minutes()

# Configure OAuth2 scheme for token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")


# --- Password Verification ---
def verify_password(plain_password: str, stored_password: str) -> bool:
    # Simple comparison of provided password with stored password
    # (In production, use hashing like bcrypt for security)
    return plain_password == stored_password


# --- JWT Token Creation ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    # Copy data to encode into JWT
    to_encode = data.copy()
    # Determine expiration time for token
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})  # Add expiration to payload
    # Encode the JWT using secret key and algorithm
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


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
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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
