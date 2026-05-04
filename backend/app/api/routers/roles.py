from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import List, Optional
from app.services.admin_db import get_session
from app.services import auth, admin_db
from app.services.increment_db import get_increment_by_id_in_db, create_increment_in_db, update_increment_in_db, delete_increment_in_db, get_increments_by_business_id
from app.models.increment import IncrementCreate, IncrementUpdate, IncrementResponse
from app.services import employee_db
from app.services import role_db
from app.models.employee import EmployeeBase, EmployeeUpdate,Employee, AssignRoleRequest
from app.models.role import Role, RoleCreate, RoleUpdate
from app.models.team import Team, TeamMember
from app.repositories import employee as employee_repo
from app.models.employee import EmployeeResponse
admin_router = APIRouter(prefix="/admin", dependencies=[Depends(auth.get_current_user)])

# ==================== Role Management Endpoints ====================

@admin_router.get("/roles/available")
def get_available_roles(session: Session = Depends(get_session)):
    roles = role_db.get_available_roles(session)
    return {
        "roles": roles,
        "available_roles": [role.role_name for role in roles],
    }


@admin_router.post("/roles")
def create_role(payload: RoleCreate, session: Session = Depends(get_session)):
    return role_db.create_role_in_db(payload, session)


@admin_router.post("/roles/assign")
def assign_role_to_employee(
    payload: AssignRoleRequest,
    session: Session = Depends(get_session)
):
    employee = session.exec(
        select(Employee).where(Employee.id == payload.emp_id)
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    requested_role_ids = list(dict.fromkeys(payload.role_ids))
    if not requested_role_ids:
        employee.role_ids = []
        employee_repo.save_employee(employee, session)
        
        return {
            "message": "Roles updated successfully",
            "employee_id": employee.id,
            "role_ids": [],
            "roles": [],
        }

    roles = session.exec(
        select(Role).where(Role.id.in_(requested_role_ids), Role.is_active == True)
    ).all()
   
    
    employee.role_ids = requested_role_ids
    employee_repo.save_employee(employee, session)


    return {
        "message": "Roles updated successfully",
        "employee_id": employee.id,
        "role_ids": employee.role_ids,
        "roles": [{"id": role.id, "role_name": role.role_name} for role in roles],
    }
    
@admin_router.get("/roles/employee/{emp_id}")
def get_roles_by_employee_id(
    emp_id: int,
    session: Session = Depends(get_session)
):
    return role_db.get_roles_by_employee_id(emp_id, session)

@admin_router.get("/roles/by_role/{role_name}")
def get_employees_by_role(
    role_name: str,
    session: Session = Depends(get_session)
):
    return role_db.get_employees_by_role(role_name, session)


@admin_router.patch("/roles/update/{role_id}")
def update_role_in_db(
    role_id: int,
    role_update: RoleUpdate,
    session: Session = Depends(get_session),
):
    return role_db.update_role_in_db(role_id, role_update, session)


@admin_router.delete("/roles/remove/{role_id}")
def delete_role_in_db(
    role_id: int,
    session: Session = Depends(get_session),
):
    return role_db.delete_role_in_db(role_id, session)


@admin_router.get("/roles")
def get_all_roles(session: Session = Depends(get_session)):
    return {"roles": role_db.get_all_roles(session)}