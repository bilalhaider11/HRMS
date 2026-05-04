import datetime
from datetime import date
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON

if TYPE_CHECKING:
    from .increment import EmployeeIncrement

# --- Employee Models ---
class EmployeeBase(SQLModel):
    employee_code: str
    name: str
    bank_name: str
    bank_account_title: str
    bank_branch_code: str
    bank_account_number: str
    bank_iban_number: str
    initial_base_salary: float
    current_base_salary: float
    date_of_joining: date
    fulltime_joining_date: Optional[date] = None
    last_increment_date: Optional[date] = None
    increment_amount: float = 0.0
    department: str
    home_address: str
    email: str
    password: str
    designation: str
    cnic: str
    date_of_birth: date
    actual_date_of_birth: Optional[date] = None
    hobbies: Optional[str] = None
    vehicle_registration_number: Optional[str] = None
    badge_number: Optional[str] = None
    profile_pic_url: Optional[str] = None


class EmployeeUpdate(SQLModel):
    employee_code: Optional[str] = None
    name: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_title: Optional[str] = None
    bank_branch_code: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_iban_number: Optional[str] = None
    initial_base_salary: Optional[float] = None
    current_base_salary: Optional[float] = None
    date_of_joining: Optional[date] = None
    fulltime_joining_date: Optional[date] = None
    last_increment_date: Optional[date] = None
    increment_amount: Optional[float] = None
    department: Optional[str] = None
    home_address: Optional[str] = None
    designation: Optional[str] = None
    cnic: Optional[str] = None
    date_of_birth: Optional[date] = None
    actual_date_of_birth: Optional[date] = None
    hobbies: Optional[str] = None
    vehicle_registration_number: Optional[str] = None
    badge_number: Optional[str] = None
    profile_pic_url: Optional[str] = None


class EmployeeResponse(SQLModel):
    id: Optional[int] = None
    employee_code: str
    name: str
    bank_name: str
    bank_account_title: str
    bank_branch_code: str
    bank_account_number: str
    bank_iban_number: str
    initial_base_salary: float
    current_base_salary: float
    date_of_joining: date
    fulltime_joining_date: Optional[date] = None
    last_increment_date: Optional[date] = None
    increment_amount: float = 0.0
    department: str
    home_address: str
    email: str
    designation: str
    cnic: str
    date_of_birth: date
    actual_date_of_birth: Optional[date] = None
    hobbies: Optional[str] = None
    vehicle_registration_number: Optional[str] = None
    badge_number: Optional[str] = None
    profile_pic_url: Optional[str] = None
    status: bool = True
    role_ids: List[int] = Field(default_factory=list)

class Employee(EmployeeBase, table=True):
    __tablename__ = "employee"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    role_ids: List[int] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )

    status: bool = Field(default=True)

    increments: List["EmployeeIncrement"] = Relationship(back_populates="employee")


from pydantic import BaseModel

class AssignRoleRequest(BaseModel):
    emp_id: int
    role_ids: List[int]