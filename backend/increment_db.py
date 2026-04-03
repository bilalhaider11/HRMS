from fastapi import HTTPException
from sqlmodel import select, Session
from datetime import date
from models import EmployeeIncrement, Employee, Admin
from pydantic import BaseModel
from typing import List, Optional

# ----------------------------
# Pydantic Schemas for API
# ----------------------------
class IncrementCreate(BaseModel):
    employee_code: str  # business code input
    increment_amount: float
    effective_date: date
    notes: Optional[str] = ""

class IncrementUpdate(BaseModel):
    increment_amount: float = 0
    effective_date: Optional[date] = None
    notes: Optional[str] = None

class IncrementResponse(BaseModel):
    id: int
    employee_code: str  # business code output
    increment_amount: float
    effective_date: date
    notes: str

# ----------------------------
# Utility: get single admin
# ----------------------------
def get_single_admin_id(session: Session) -> int:
    admin = session.exec(select(Admin)).first()
    if not admin:
        raise HTTPException(status_code=500, detail="No admin exists in the system")
    return admin.id

# ----------------------------
# CREATE Increment
# ----------------------------
def create_increment_in_db(new_increment: IncrementCreate, session: Session) -> IncrementResponse:
    # Get employee by business ID
    employee = session.exec(
        select(Employee).where(Employee.employee_code == new_increment.employee_code, Employee.status == True)
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee {new_increment.employee_code} not found")

    # Check last increment within 30 days
    last_increment = session.exec(
        select(EmployeeIncrement)
        .where(EmployeeIncrement.employee_id == employee.id)
        .order_by(EmployeeIncrement.effective_date.desc())
    ).first()
    if last_increment:
        days_diff = (new_increment.effective_date - last_increment.effective_date).days
        if days_diff < 30:
            raise HTTPException(
                status_code=409,
                detail=f"Employee received an increment {days_diff} days ago. Minimum gap is 30 days."
            )

    # Create increment (FK uses employee.id)
    increment = EmployeeIncrement(
        employee_id=employee.id,
        increment_amount=new_increment.increment_amount,
        effective_date=new_increment.effective_date,
        notes=new_increment.notes
    )

    # Update employee salary
    employee.current_base_salary += increment.increment_amount
    employee.last_increment_date = increment.effective_date
    employee.increment_amount = increment.increment_amount

    session.add(increment)
    session.commit()
    session.refresh(increment)
    session.refresh(employee)

    return IncrementResponse(
        id=increment.id,
        employee_code=employee.employee_code,
        increment_amount=increment.increment_amount,
        effective_date=increment.effective_date,
        notes=increment.notes
    )

# ----------------------------
# GET Increment by ID
# ----------------------------
def get_increment_by_id_in_db(increment_id: int, session: Session) -> IncrementResponse:
    increment = session.exec(
        select(EmployeeIncrement).where(EmployeeIncrement.id == increment_id)
    ).first()
    if not increment:
        raise HTTPException(status_code=404, detail="Increment does not exist")

    employee = session.exec(select(Employee).where(Employee.id == increment.employee_id)).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return IncrementResponse(
        id=increment.id,
        employee_code=employee.employee_code,
        increment_amount=increment.increment_amount,
        effective_date=increment.effective_date,
        notes=increment.notes
    )

# ----------------------------
# GET All Increments by Employee Business ID
# ----------------------------
def get_increments_by_business_id(business_id: str, session: Session) -> List[IncrementResponse]:
    employee = session.exec(select(Employee).where(Employee.employee_code == business_id)).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    increments = session.exec(
        select(EmployeeIncrement).where(EmployeeIncrement.employee_id == employee.id)
    ).all()

    return [
        IncrementResponse(
            id=inc.id,
            employee_code=employee.employee_code,
            increment_amount=inc.increment_amount,
            effective_date=inc.effective_date,
            notes=inc.notes
        )
        for inc in increments
    ]

# ----------------------------
# UPDATE Increment
# ----------------------------
def update_increment_in_db(increment_id: int, new_increment: IncrementUpdate, session: Session) -> IncrementResponse:
    increment = session.exec(select(EmployeeIncrement).where(EmployeeIncrement.id == increment_id)).first()
    if not increment:
        raise HTTPException(status_code=404, detail="Increment does not exist")

    employee = session.exec(select(Employee).where(Employee.id == increment.employee_id)).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Update increment amount
    if new_increment.increment_amount != 0:
        diff = new_increment.increment_amount - increment.increment_amount
        employee.current_base_salary += diff
        employee.increment_amount = new_increment.increment_amount
        increment.increment_amount = new_increment.increment_amount

    # Update effective date
    if new_increment.effective_date:
        increment.effective_date = new_increment.effective_date
        employee.last_increment_date = new_increment.effective_date

    # Update notes
    if new_increment.notes is not None:
        increment.notes = new_increment.notes

    session.commit()
    session.refresh(increment)
    session.refresh(employee)

    return IncrementResponse(
        id=increment.id,
        employee_code=employee.employee_code,
        increment_amount=increment.increment_amount,
        effective_date=increment.effective_date,
        notes=increment.notes
    )

# ----------------------------
# DELETE Increment
# ----------------------------
def delete_increment_in_db(increment_id: int, session: Session) -> dict:
    increment = session.exec(select(EmployeeIncrement).where(EmployeeIncrement.id == increment_id)).first()
    if not increment:
        raise HTTPException(status_code=404, detail="Increment does not exist")

    session.delete(increment)
    session.commit()
    return {"detail": "Increment deleted successfully"}