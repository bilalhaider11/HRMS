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
    opening_balance: float = Field(default=0.0)


class AdminProfileUpdate(SQLModel):
    company_name: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    opening_balance: Optional[float] = None


class AdminPasswordUpdate(SQLModel):
    old_password: str
    new_password: str = Field(..., min_length=1)


class Admin(AdminBase, table=True):
    __tablename__ = "admin"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)


# --- Employee Increment Models ---
class EmployeeIncrementBase(SQLModel):
    # IMPORTANT FIX → use employee.id
    employee_id: int = Field(foreign_key="employee.id", nullable=False)
    increment_amount: float
    effective_date: date
    notes: Optional[str] = None


class EmployeeIncrement(EmployeeIncrementBase, table=True):
    __tablename__ = "employee_increment_history"
    id: Optional[int] = Field(default=None, primary_key=True)

    employee: Optional["Employee"] = Relationship(back_populates="increments")


# --- Employee Models ---
class EmployeeBase(SQLModel):
    employee_code: str  # Business code
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


class Employee(EmployeeBase, table=True):
    __tablename__ = "employee"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)

    status: bool = Field(default=True)

    increments: List["EmployeeIncrement"] = Relationship(back_populates="employee")


# --- Finance Models ---
class FinanceCategoryBase(SQLModel):
    category_name: str
    color_code: str


class FinanceCategory(FinanceCategoryBase, table=True):
    __tablename__ = 'financecategory'
    category_id: Optional[int] = Field(default=None, primary_key=True, index=True)


class FinanceBase(SQLModel):
    date: date
    description: str
    amount: float
    tax_deductions: float
    cheque_number: Optional[str] = None
    category_id: int = Field(foreign_key='financecategory.category_id')


class FinanceUpdate(SQLModel):
    date: Optional[datetime.date] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    tax_deductions: Optional[float] = None
    cheque_number: Optional[str] = None
    category_id: Optional[int] = None


class Finance(FinanceBase, table=True):
    __tablename__ = "finance"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)

    # Single admin system → optional tracking
    added_by: Optional[int] = Field(default=None, foreign_key='admin.id')
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))


class FinanceEditHistory(SQLModel, table=True):
    __tablename__ = "finance_edit_history"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    finance_id: int = Field(foreign_key="finance.id")
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    edited_by: Optional[int] = Field(default=None, foreign_key='admin.id')
    edited_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))


# --- Inventory Models ---
class ItemCategoryBase(SQLModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None


class ItemCategory(ItemCategoryBase, table=True):
    __tablename__ = "item_category"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)


class ItemCategoryUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None


class InventoryItemBase(SQLModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    quantity: int
    category_id: int = Field(foreign_key="item_category.id")


class InventoryItem(InventoryItemBase, table=True):
    __tablename__ = "store_items"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)


class InventoryItemUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    category_id: Optional[int] = None


# --- Attendance Models ---
class AttendanceRaw(SQLModel, table=True):
    __tablename__ = "attendance_raw"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    serial_number: str
    employee_code: str
    status: int  # 0 = check-in, 1 = check-out
    timestamp: datetime.datetime
    date: date


# --- JWT Tokens ---
class jwt_tokens(SQLModel, table=True):
    __tablename__ = "jwt_tokens"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    client_ip: str = Field(..., min_length=1)
    token: str = Field(..., min_length=1)

    # IMPORTANT FIX
    created_at: date = Field(default_factory=date.today)