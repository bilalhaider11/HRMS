from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

# --- Company Models ---
class CompanyBase(SQLModel):
    # Base model for company input validation
    company_name: str = Field(..., min_length=1)
    website: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)

class Company(CompanyBase, table=True):
    # Database table for companies
    __tablename__ = 'company'
    company_id: Optional[int] = Field(default=None, primary_key=True, index=True)


# --- Admin Models ---
class AdminBase(SQLModel):
    # Base model for admin input validation
    company_name: str = Field(..., min_length=1)
    website: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

class Admin(AdminBase, table=True):
    # Database table for admins
    __tablename__ = "admin"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)


# --- Additional Roles ---
class AdditionalRoleBase(SQLModel):
    # Base model for additional roles
    role_name: str = Field(..., min_length=1)
    role_description: Optional[str] = None

class AdditionalRole(AdditionalRoleBase, table=True):
    # Table for storing additional roles
    __tablename__ = "additional_roles"
    id: Optional[int] = Field(default=None, primary_key=True, unique=True, index=True)
    employees: List["EmployeeAdditionalRoleLink"] = Relationship(back_populates="role")


# --- Many-to-Many Link Table for Employee-Role ---
class EmployeeAdditionalRoleLink(SQLModel, table=True):
    __tablename__ = "employee_additional_roles"
    employee_id: str = Field(foreign_key="employee.employee_id", primary_key=True)
    role_id: int = Field(foreign_key="additional_roles.id", primary_key=True)

    # Relationships
    employee: Optional["Employee"] = Relationship(back_populates="additional_roles")
    role: Optional["AdditionalRole"] = Relationship(back_populates="employees")


# --- Employee Increment Models ---
class EmployeeIncrementBase(SQLModel):
    # Base model for employee increment
    employee_id: str = Field(foreign_key="employee.employee_id", nullable=False)
    increment_amount: float
    effective_date: date
    notes: Optional[str] = Field(default=None)

class EmployeeIncrement(EmployeeIncrementBase, table=True):
    # Table for employee increment history
    __tablename__ = "employee_increment_history"
    id: Optional[int] = Field(default=None, primary_key=True)
    company_id: Optional[int] = Field(default=None, foreign_key="company.company_id")
    employee: Optional["Employee"] = Relationship(back_populates="increments")


# --- Employee Models ---
class EmployeeBase(SQLModel):
    # Base employee model for validation
    employee_id: str
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
    # Table for employee data
    __tablename__ = "employee"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    company_id: Optional[int] = Field(default=None, foreign_key="company.company_id")
    status: bool = Field(default=True)
    additional_roles: List["EmployeeAdditionalRoleLink"] = Relationship(back_populates="employee")
    increments: List["EmployeeIncrement"] = Relationship(back_populates="employee")


# --- Finance Models ---
class FinanceCategoryBase(SQLModel):
    category_name: str
    color_code: str

class FinanceCategory(FinanceCategoryBase, table=True):
    __tablename__='financecategory'
    # Table for finance categories
    category_id: Optional[int] = Field(default=None, primary_key=True, index=True)
    company_id: Optional[int] = Field(foreign_key='company.company_id')

class FinanceBase(SQLModel):
    # Base finance record model
    date: date
    description: str
    amount: float
    tax_deductions: float
    cheque_number: str
    category_id: int = Field(foreign_key='financecategory.category_id')

class Finance(FinanceBase, table=True):
    # Table for finance records
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    added_by: Optional[int] = Field(default=None, foreign_key='admin.id', nullable=True)
    company_id: Optional[int] = Field(default=None, foreign_key='company.company_id', nullable=True)


# --- Inventory / Store Models ---
class StoreBase(SQLModel):
    name: str = Field(..., min_length=1)
    unique_identifier: str = Field(..., min_length=1)
    description: Optional[str] = Field(default=None)

class Store(StoreBase, table=True):
    __tablename__ = "store"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    company_id: Optional[int] = Field(default=None, foreign_key="company.company_id")

class ItemCategoryBase(SQLModel):
    name: str = Field(..., min_length=1)
    description: Optional[str]
    store_id: int = Field(foreign_key="store.id")

class ItemCategory(ItemCategoryBase, table=True):
    __tablename__ = "item_category"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    company_id: Optional[int] = Field(default=None, foreign_key="company.company_id")

class StoreItemsBase(SQLModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = Field(default=None)
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
    team_lead_id: str = Field(foreign_key='employee.employee_id')
    company_id: int = Field(foreign_key='company.company_id')

class Team(TeamBase, table=True):
    __tablename__='team'
    id: Optional[int] = Field(default=None, primary_key=True, index=True)

class Teams_to_employee(SQLModel, table=True):
    # Linking table for employees to teams
    __tablename__='teams_to_employee'
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    team_id: int = Field(foreign_key='team.id')
    team_lead_id: int = Field(foreign_key='employee.id')

class jwt_tokens(SQLModel, table=True):
    # Table for storing JWT tokens
    __tablename__ = "jwt_tokens"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    client_ip: str = Field(..., min_length=1)
    token: str = Field(..., min_length=1)
    created_at: Optional[date] = Field(default=date.today())