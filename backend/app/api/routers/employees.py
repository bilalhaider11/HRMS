from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List, Optional
from app.services.admin_db import get_session
from app.services import auth
from app.services.increment_db import get_increment_by_id_in_db, create_increment_in_db, update_increment_in_db, delete_increment_in_db, get_increments_by_business_id
from app.models.increment import IncrementCreate, IncrementUpdate, IncrementResponse
from app.services import employee_db
from app.models.employee import EmployeeBase, EmployeeUpdate
admin_router = APIRouter(prefix="/admin", dependencies=[Depends(auth.get_current_user)])

@admin_router.post("/create_employee")
def create_employee(employee: EmployeeBase, session: Session = Depends(get_session)):
    return employee_db.register_new_employee_in_db(employee, session=session)

@admin_router.patch("/update_employee_details")
def update_employee(employee_code: str, employee: EmployeeUpdate, session: Session = Depends(get_session)):
    return employee_db.update_employee_details_in_db(employee_code, employee, session=session)

@admin_router.patch("/deactivate_employee")
def deactivate_employee(employee_code: str, session: Session = Depends(get_session)):
    return employee_db.deactivate_employee_in_db(employee_code, session=session)

@admin_router.get("/display_all_employees")
def display_employees(page: int = 1, page_size: int = 10, department: Optional[str] = None,
                      search: Optional[str] = None, status: Optional[str] = None,
                      session: Session = Depends(get_session)):
    return employee_db.display_all_employee_in_db(page, page_size, department, search, status, session=session)


@admin_router.post("/create_increment", response_model=IncrementResponse)
def create_increment(new_increment: IncrementCreate, session: Session = Depends(get_session)):
    return create_increment_in_db(new_increment, session=session)

@admin_router.get("/get_increment/{increment_id}", response_model=IncrementResponse)
def get_increment(increment_id: int, session: Session = Depends(get_session)):
    return get_increment_by_id_in_db(increment_id, session=session)

@admin_router.patch("/update_increment/{increment_id}", response_model=IncrementResponse)
def update_increment(increment_id: int, new_increment: IncrementUpdate, session: Session = Depends(get_session)):
    return update_increment_in_db(increment_id, new_increment, session=session)

@admin_router.delete("/delete_increment/{increment_id}")
def delete_increment(increment_id: int, session: Session = Depends(get_session)):
    return delete_increment_in_db(increment_id, session=session)

@admin_router.get("/get_increments/{employee_code}")
def get_employee_increments(employee_code: str, session: Session = Depends(get_session)):
    return get_increments_by_business_id(employee_code, session=session)
