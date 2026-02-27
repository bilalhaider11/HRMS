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


class Admin(AdminBase, table=True):
    __tablename__ = "admin"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)


# --- Additional Roles ---
class AdditionalRoleBase(SQLModel):
    role_name: str = Field(..., min_length=1)
    role_description: Optional[str] = None


class AdditionalRole(AdditionalRoleBase, table=True):
    __tablename__ = "additional_roles"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    employees: List["EmployeeAdditionalRoleLink"] = Relationship(back_populates="role")


# --- Many-to-Many Link Table for Employee-Role ---
class EmployeeAdditionalRoleLink(SQLModel, table=True):
    __tablename__ = "employee_additional_roles"

    # IMPORTANT FIX → use employee.id (int), not employee.employee_id (str)
    employee_id: int = Field(foreign_key="employee.id", primary_key=True)
    role_id: int = Field(foreign_key="additional_roles.id", primary_key=True)

    employee: Optional["Employee"] = Relationship(back_populates="additional_roles")
    role: Optional["AdditionalRole"] = Relationship(back_populates="employees")


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
    employee_id: str  # Business ID (NOT FK anymore)
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
    team: str
    home_address: str
    email: str
    password: str
    designation: str
    cnic: str
    date_of_birth: date
    actual_date_of_birth: Optional[date] = None
    hobbies: Optional[str] = None
    vehicle_registration_number: Optional[str] = None


class Employee(EmployeeBase, table=True):
    __tablename__ = "employee"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)

    status: bool = Field(default=True)

    additional_roles: List["EmployeeAdditionalRoleLink"] = Relationship(back_populates="employee")
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
    cheque_number: str
    category_id: int = Field(foreign_key='financecategory.category_id')


class Finance(FinanceBase, table=True):
    __tablename__ = "finance"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)

    # Single admin system → optional tracking
    added_by: Optional[int] = Field(default=None, foreign_key='admin.id')


# --- Inventory / Store Models ---
class StoreBase(SQLModel):
    name: str = Field(..., min_length=1)
    unique_identifier: str = Field(..., min_length=1)
    description: Optional[str] = None


class Store(StoreBase, table=True):
    __tablename__ = "store"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)


class ItemCategoryBase(SQLModel):
    name: str = Field(..., min_length=1)
    description: Optional[str]
    store_id: int = Field(foreign_key="store.id")


class ItemCategory(ItemCategoryBase, table=True):
    __tablename__ = "item_category"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)


class StoreItemsBase(SQLModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    quantity: int
    category_id: int = Field(foreign_key="item_category.id")
    store_id: int = Field(foreign_key="store.id")


class StoreItems(StoreItemsBase, table=True):
    __tablename__ = "store_items"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)


# --- Team Models ---
class TeamBase(SQLModel):
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

    # IMPORTANT FIX → use employee.id
    team_lead_id: int = Field(foreign_key='employee.id')


class Team(TeamBase, table=True):
    __tablename__ = 'team'
    id: Optional[int] = Field(default=None, primary_key=True, index=True)


class Teams_to_employee(SQLModel, table=True):
    __tablename__ = 'teams_to_employee'

    # Recommended composite PK
    team_id: int = Field(foreign_key='team.id', primary_key=True)
    employee_id: int = Field(foreign_key='employee.id', primary_key=True)


# --- JWT Tokens ---
class jwt_tokens(SQLModel, table=True):
    __tablename__ = "jwt_tokens"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    client_ip: str = Field(..., min_length=1)
    token: str = Field(..., min_length=1)

    # IMPORTANT FIX
    created_at: date = Field(default_factory=date.today)