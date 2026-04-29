import datetime
from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


# --- Admin Models ---
class AdminBase(SQLModel):
    company_name: str = Field(..., min_length=1)
    website: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
    access_key: Optional[str] = None


class AdminProfileUpdate(SQLModel):
    company_name: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class AdminPasswordUpdate(SQLModel):
    old_password: str
    new_password: str = Field(..., min_length=1)


class Admin(AdminBase, table=True):
    __tablename__ = "admin"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
