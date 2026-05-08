from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import List, Optional
from app.services import login_service
from app.services.admin_db import get_session
from app.services import auth, admin_db
from app.services.increment_db import get_increment_by_id_in_db, create_increment_in_db, update_increment_in_db, delete_increment_in_db, get_increments_by_business_id
from app.models.increment import IncrementCreate, IncrementUpdate, IncrementResponse
from app.services import employee_db
from app.services import role_db
from app.models.employee import EmployeeBase, EmployeeUpdate,Employee, AssignRoleRequest
from app.models.role import Role, RoleCreate, RoleUpdate
from app.models.team import Team, Teams_to_Employee
from app.repositories import employee as employee_repo
from app.models.employee import EmployeeResponse
admin_router = APIRouter(prefix="/admin", dependencies=[Depends(auth.get_current_user)])
employee_router = APIRouter(prefix="/employee")



@employee_router.post("/login", status_code=200)
def employee_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
    request: Request = None,
):
    return login_service.login(
        session,
        form_data,
        request,
        Employee,
        extra_jwt_claims={"user_type": "employee"},
    )


@employee_router.get("/profile")
def get_employee_profile(
    current_employee: Employee = Depends(auth.get_current_employee),
    session: Session = Depends(get_session),
):
    role_names = role_db.get_active_role_names_for_employee(current_employee.id, session,current_employee.role_ids)
    return {
        "id": current_employee.id,
        "name": current_employee.name,
        "email": current_employee.email,
        "employee_code": current_employee.employee_code,
        "roles": role_names,
    }


# ==================== Role Management Endpoints ====================


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

# These endpoints are accessible by both HR and Team Leads/Technical Managers, but the data returned is filtered based on the employee's role and team associations.
@employee_router.get("/list/{employee_id}")
def get_employees_list(
    employee_id: int,
    current_employee: Employee = Depends(auth.get_current_employee),
    session: Session = Depends(get_session),
):
    if current_employee.id != employee_id:
        raise HTTPException(status_code=403, detail="Access denied for requested employee data")

    role_names = set(
        role_db.get_active_role_names_for_employee(current_employee.id, session,current_employee.role_ids)
    )
    
    if "HR" in role_names:
        employees = session.exec(select(Employee).where(Employee.status == True)).all()
        return {
            "scope": "all",
            "employees": [EmployeeResponse.model_validate(emp) for emp in employees],
        }

    if not ({"Team Lead", "Technical Manager"} & role_names):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access employees section",
        )

    if "Team Lead" in role_names:
        teams = session.exec(
            select(Team).where(
                Team.delete_record == False,
                Team.team_lead_id == current_employee.id,
            )
        ).all()
    else:
        teams = session.exec(
            select(Team).where(
                Team.delete_record == False,
                Team.id.in_(
                    select(Teams_to_Employee.team_id).where(
                        Teams_to_Employee.employee_id == current_employee.id,
                        Teams_to_Employee.delete_record == False,
                    )
                ),
            )
        ).all()

    team_ids = [team.id for team in teams if team.id is not None]
    if not team_ids:
        return {"scope": "team_basic", "employees": []}

    team_member_links = session.exec(
        select(Teams_to_Employee).where(
            Teams_to_Employee.team_id.in_(team_ids),
            Teams_to_Employee.delete_record == False,
        )
    ).all()
    member_ids = sorted({link.employee_id for link in team_member_links})
    if not member_ids:
        return {"scope": "team_basic", "employees": []}

    team_members = session.exec(
        select(Employee).where(Employee.id.in_(member_ids), Employee.status == True)
    ).all()

    basic_employees = [
        {
            "id": emp.id,
            "employee_code": emp.employee_code,
            "name": emp.name,
            "email": emp.email,
            "department": emp.department,
            "designation": emp.designation,
            "status": emp.status,
        }
        for emp in team_members
    ]
    return {"scope": "team_basic", "employees": basic_employees}

