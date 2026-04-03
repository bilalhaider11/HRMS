# employee_db.py
from datetime import date
from sqlmodel import Session, select
from fastapi import HTTPException
from typing import List, Optional
import bcrypt

from models import Employee, EmployeeResponse, AdditionalRole, EmployeeAdditionalRoleLink, EmployeeIncrement

# -------------------- Employee DB Utils --------------------
def get_session():
    from sqlmodel import create_engine
    import load_env
    DATABASE_URL = load_env.get_database_url()
    engine = create_engine(DATABASE_URL, echo=True)
    with Session(engine) as session:
        yield session


# --- Register a new employee ---
def register_new_employee_in_db(employee, role_list: List[AdditionalRole], session: Session):
    # 1️⃣ Validate required fields
    required_fields = [
        "employee_id", "name", "bank_name", "bank_account_title",
        "bank_branch_code", "bank_account_number", "bank_iban_number",
        "initial_base_salary", "department", "team", "home_address",
        "email", "password", "designation", "cnic", "date_of_birth"
    ]
    employee_data = employee.dict()
    for field in required_fields:
        value = employee_data.get(field)
        if value in ("string", "", None, 0, str(date.today()), date.today()):
            raise HTTPException(status_code=400, detail=f"Enter valid value for {field}")

    # 2️⃣ Check if employee already exists (business ID)
    existing = session.exec(
        select(Employee).where(Employee.employee_id == employee.employee_id)
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

    # 5️⃣ Add roles safely
    for role_data in role_list:
        if role_data.role_name in ("string", "", None):
            continue

        # Check if role exists globally
        db_role = session.exec(
            select(AdditionalRole).where(AdditionalRole.role_name == role_data.role_name)
        ).first()
        if not db_role:
            db_role = AdditionalRole.model_validate(role_data)
            session.add(db_role)
            session.commit()
            session.refresh(db_role)

        # Link employee with role
        link = EmployeeAdditionalRoleLink(employee_id=db_employee.id, role_id=db_role.id)
        session.add(link)

    session.commit()
    session.refresh(db_employee)

    return {"message": "Employee Added Successfully", "employee": db_employee.employee_id}


# --- Update employee details ---
def update_employee_details_in_db(employee_id: str, employee, session: Session):
    db_employee = session.exec(
        select(Employee).where(Employee.employee_id == employee_id)
    ).first()

    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not db_employee.status:
        raise HTTPException(status_code=403, detail="Employee is deactivated")

    # Update dynamically excluding unset/default values
    employee_data = employee.dict(exclude_unset=True, exclude_defaults=True)
    for key, value in employee_data.items():
        if value not in ("string", 0, str(date.today()), date.today()):
            if key == "password":
                value = bcrypt.hashpw(value.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            setattr(db_employee, key, value)

    session.commit()
    session.refresh(db_employee)
    return {"message": "Employee updated successfully", "employee": db_employee.employee_id}


# --- Deactivate employee ---
def deactivate_employee_in_db(employee_id: str, session: Session):
    if not employee_id or employee_id == "string":
        raise HTTPException(status_code=400, detail="Enter employee_id")

    db_employee = session.exec(
        select(Employee).where(Employee.employee_id == employee_id)
    ).first()

    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not db_employee.status:
        raise HTTPException(status_code=409, detail="Employee already deactivated")

    db_employee.status = False
    session.commit()
    session.refresh(db_employee)
    return {"message": "Employee Deactivated", "employee": db_employee.employee_id}


# --- Display all employees with optional filters ---
def display_all_employee_in_db(
    page: int = 1, page_size: int = 10,
    department: Optional[str] = None, team: Optional[str] = None,
    session: Session = None
):
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10

    query = select(Employee).where(Employee.status == True)

    if department:
        query = query.where(Employee.department.ilike(f"%{department}%"))
    if team:
        query = query.where(Employee.team.ilike(f"%{team}%"))

    total_employees = session.exec(query).all()
    total_count = len(total_employees)
    offset = (page - 1) * page_size
    paginated_employees = total_employees[offset:offset + page_size]

    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "filters": {"department": department or "All", "team": team or "All"},
        "employees": [EmployeeResponse.model_validate(emp) for emp in paginated_employees]
    }


# --- Update employee roles ---
def update_roles_in_db(employee_id: str, role_list: List[AdditionalRole], session: Session):
    if not employee_id or employee_id == "string":
        raise HTTPException(status_code=400, detail="Enter employee_id")

    # Get employee
    db_employee = session.exec(
        select(Employee).where(Employee.employee_id == employee_id)
    ).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not db_employee.status:
        raise HTTPException(status_code=403, detail="Employee is deactivated")

    # Remove existing links only (do NOT delete roles globally)
    existing_links = session.exec(
        select(EmployeeAdditionalRoleLink).where(EmployeeAdditionalRoleLink.employee_id == db_employee.id)
    ).all()
    for link in existing_links:
        session.delete(link)
    session.commit()

    # Add new roles
    for role_data in role_list:
        if role_data.role_name in ("string", "", None):
            continue

        db_role = session.exec(
            select(AdditionalRole).where(AdditionalRole.role_name == role_data.role_name)
        ).first()
        if not db_role:
            db_role = AdditionalRole.model_validate(role_data)
            session.add(db_role)
            session.commit()
            session.refresh(db_role)

        link = EmployeeAdditionalRoleLink(employee_id=db_employee.id, role_id=db_role.id)
        session.add(link)

    session.commit()
    session.refresh(db_employee)

    return {"message": "Roles updated successfully", "employee": db_employee.employee_id}