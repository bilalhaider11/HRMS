# employee_db.py
from datetime import date
from sqlmodel import Session, select
from fastapi import HTTPException
from typing import Optional
import bcrypt

from models import Employee, EmployeeResponse, EmployeeIncrement

# -------------------- Employee DB Utils --------------------
def get_session():
    from sqlmodel import create_engine
    import load_env
    DATABASE_URL = load_env.get_database_url()
    engine = create_engine(DATABASE_URL, echo=True)
    with Session(engine) as session:
        yield session


# --- Register a new employee ---
def register_new_employee_in_db(employee, session: Session):
    # 1️⃣ Validate required fields
    required_fields = [
        "employee_code", "name", "bank_name", "bank_account_title",
        "bank_branch_code", "bank_account_number", "bank_iban_number",
        "initial_base_salary", "department", "home_address",
        "email", "password", "designation", "cnic", "date_of_birth"
    ]
    employee_data = employee.dict()
    for field in required_fields:
        value = employee_data.get(field)
        if value in ("string", "", None, 0, str(date.today()), date.today()):
            raise HTTPException(status_code=400, detail=f"Enter valid value for {field}")

    # 2️⃣ Check if employee already exists (business code)
    existing = session.exec(
        select(Employee).where(Employee.employee_code == employee.employee_code)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Employee already exists")

    # 3️⃣ Set defaults
    if employee.current_base_salary == 0:
        employee.current_base_salary = employee.initial_base_salary
    if not employee.fulltime_joining_date:
        employee.fulltime_joining_date = employee.date_of_joining
    if not employee.last_increment_date:
        employee.last_increment_date = employee.fulltime_joining_date
    if not employee.actual_date_of_birth:
        employee.actual_date_of_birth = employee.date_of_birth

    # 4️⃣ Hash password and add employee
    employee_data = employee.model_dump()
    employee_data["password"] = bcrypt.hashpw(
        employee_data["password"].encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")
    db_employee = Employee.model_validate(employee_data)
    session.add(db_employee)
    session.commit()
    session.refresh(db_employee)

    return {"message": "Employee Added Successfully", "employee": db_employee.employee_code}


# --- Update employee details ---
def update_employee_details_in_db(employee_code: str, employee, session: Session):
    db_employee = session.exec(
        select(Employee).where(Employee.employee_code == employee_code)
    ).first()

    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not db_employee.status:
        raise HTTPException(status_code=403, detail="Employee is deactivated")

    # Update only provided fields (email/password not in EmployeeUpdate schema)
    update_data = employee.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(db_employee, key, value)

    session.commit()
    session.refresh(db_employee)
    return {"message": "Employee updated successfully", "employee": db_employee.employee_code}


# --- Deactivate employee ---
def deactivate_employee_in_db(employee_code: str, session: Session):
    if not employee_code or employee_code == "string":
        raise HTTPException(status_code=400, detail="Enter employee_code")

    db_employee = session.exec(
        select(Employee).where(Employee.employee_code == employee_code)
    ).first()

    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not db_employee.status:
        raise HTTPException(status_code=409, detail="Employee already deactivated")

    db_employee.status = False
    session.commit()
    session.refresh(db_employee)
    return {"message": "Employee Deactivated", "employee": db_employee.employee_code}


# --- Display all employees with optional filters ---
def display_all_employee_in_db(
    page: int = 1, page_size: int = 10,
    department: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    session: Session = None
):
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10

    query = select(Employee)
    if status == "inactive":
        query = query.where(Employee.status == False)
    elif status == "active" or status is None:
        query = query.where(Employee.status == True)

    if department:
        query = query.where(Employee.department.ilike(f"%{department}%"))
    if search:
        query = query.where(
            (Employee.name.ilike(f"%{search}%")) |
            (Employee.employee_code.ilike(f"%{search}%")) |
            (Employee.email.ilike(f"%{search}%")) |
            (Employee.designation.ilike(f"%{search}%"))
        )

    total_employees = session.exec(query).all()
    total_count = len(total_employees)
    offset = (page - 1) * page_size
    paginated_employees = total_employees[offset:offset + page_size]

    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "employees": [EmployeeResponse.model_validate(emp) for emp in paginated_employees]
    }

