from datetime import date
from sqlmodel import Session, select, func
from fastapi import HTTPException
from typing import Optional
import bcrypt
from app.models.employee import Employee, EmployeeResponse


def _apply_employee_filters(query, status, department, search):
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
    return query


def register_new_employee_in_db(employee, session: Session):
    required_fields = [
        "employee_code", "name", "bank_name", "bank_account_title",
        "bank_branch_code", "bank_account_number", "bank_iban_number",
        "initial_base_salary", "department", "home_address",
        "email", "password", "designation", "cnic", "date_of_birth"
    ]
    employee_data = employee.model_dump()
    for field in required_fields:
        value = employee_data.get(field)
        if value in ("string", "", None, 0, str(date.today()), date.today()):
            raise HTTPException(status_code=400, detail=f"Enter valid value for {field}")

    existing = session.exec(
        select(Employee).where(Employee.employee_code == employee.employee_code)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Employee already exists")

    if employee.current_base_salary == 0:
        employee.current_base_salary = employee.initial_base_salary
    if not employee.fulltime_joining_date:
        employee.fulltime_joining_date = employee.date_of_joining
    if not employee.last_increment_date:
        employee.last_increment_date = employee.fulltime_joining_date
    if not employee.actual_date_of_birth:
        employee.actual_date_of_birth = employee.date_of_birth

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


def update_employee_details_in_db(employee_code: str, employee, session: Session):
    db_employee = session.exec(
        select(Employee).where(Employee.employee_code == employee_code)
    ).first()

    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not db_employee.status:
        raise HTTPException(status_code=403, detail="Employee is deactivated")

    update_data = employee.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(db_employee, key, value)

    session.add(db_employee)
    session.commit()
    session.refresh(db_employee)
    return {"message": "Employee updated successfully", "employee": db_employee.employee_code}


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


def display_all_employee_in_db(
    page: int = 1, page_size: int = 10,
    department: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    session: Session = None
):
    page = max(1, page)
    page_size = min(max(1, page_size), 200)

    count_q = _apply_employee_filters(
        select(func.count()).select_from(Employee), status, department, search
    )
    total_count = session.exec(count_q).one()

    data_q = _apply_employee_filters(select(Employee), status, department, search)
    employees = session.exec(
        data_q.offset((page - 1) * page_size).limit(page_size)
    ).all()

    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size if total_count else 1,
        "employees": [EmployeeResponse.model_validate(emp) for emp in employees]
    }


def get_employee(emp_id: int, session: Session) -> Employee:
    employee = session.exec(select(Employee).where(Employee.id == emp_id)).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee
