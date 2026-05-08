# role_db.py
from sqlmodel import Session, select
from fastapi import HTTPException
from typing import List
from app.models.role import Role, RoleCreate, RoleUpdate, RoleResponse
from app.models.employee import Employee
from app.repositories import roles as role_repo


def get_available_roles(session: Session):
    roles = session.exec(
        select(Role).where(Role.is_active == True)
    ).all()
    return [RoleResponse.model_validate(role) for role in roles]


def create_role_in_db(role_create: RoleCreate, session: Session):
    name = (role_create.role_name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="role_name is required")

    existing = session.exec(select(Role).where(Role.role_name == name)).first()
    if existing:
        if existing.is_active:
            raise HTTPException(status_code=409, detail="Role name already exists")
        existing.is_active = True
        role_repo.save_role(existing, session)
       
        return {
            "message": "Role reactivated successfully",
            "role": RoleResponse.model_validate(existing),
        }

    db_role = Role(role_name=name)
    role_repo.save_role(db_role, session)
    return {"message": "Role created successfully", "role": RoleResponse.model_validate(db_role)}


def _strip_role_id_from_all_employees(role_id: int, session: Session) -> None:
    employees = session.exec(select(Employee)).all()
    for emp in employees:
        ids = list(emp.role_ids or [])
        if role_id in ids:
            emp.role_ids = [i for i in ids if i != role_id]
            session.add(emp)


# --- Create a role for an employee ---
def create_role_for_employee(role: RoleCreate, session: Session):
    # Validate role_name
    available_role_names = [r.role_name for r in get_available_roles(session)]
    if role.role_name not in available_role_names:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid role. Available roles: {', '.join(available_role_names)}"
        )
    
    # Check if role already exists for this employee (soft delete check)
    existing_role = session.exec(
        select(Role).where(
            Role.role_name == role.role_name
        )
    ).first()
    
    if existing_role:
        if existing_role.is_active:
            raise HTTPException(status_code=409, detail="Role already assigned to this employee")
        else:
            # Reactivate soft-deleted role
            existing_role.is_active = True
            session.commit()
            session.refresh(existing_role)
            return {"message": "Role reactivated successfully", "role": RoleResponse.model_validate(existing_role)}
    
    # Create new role
    db_role = Role.model_validate(role)
    role_repo.save_role(db_role, session)
  
    return {"message": "Role assigned successfully", "role": RoleResponse.model_validate(db_role)}


# --- Get all roles for an employee ---
def get_roles_by_employee_id(emp_id: int, session: Session):
    employee = session.exec(
        select(Employee).where(Employee.id == emp_id)
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    role_ids = employee.role_ids or []
    roles = session.exec(
        select(Role).where(Role.id.in_(role_ids), Role.is_active == True)
    ).all() if role_ids else []

    return {
        "employee_id": emp_id,
        "role_ids": [role.id for role in roles if role.id is not None],
        "roles": [RoleResponse.model_validate(role) for role in roles]
    }

def get_employees_by_role(role_name: str, session: Session):

    # 1. Get single role
    role = session.exec(
        select(Role).where(
            Role.role_name == role_name.strip(),
            Role.is_active == True
        )
    ).first()

    if not role or not role.id:
        raise HTTPException(
            status_code=404,
            detail=f"Role '{role_name}' not found"
        )

    # 2. Query employees efficiently (NO FULL TABLE SCAN)
    employees = session.exec(
        select(Employee).where(
            Employee.role_ids != None
        )
    ).all() 

    # 3. Filter in Python (safe fallback if JSON query not supported)
    matched_employees = [
        e for e in employees
        if e.role_ids and role.id in e.role_ids
    ]

    return {
        "role": role.role_name,
        "total_employees": len(matched_employees),
        "employees": [
            {
                "employee_id": e.id,
                "employee_code": e.employee_code,
                "employee_name": e.name,
                "role": role.role_name
            }
            for e in matched_employees
        ]
    }


# --- Update a role (change role_name) ---
def update_role_in_db(role_id: int, role_update: RoleUpdate, session: Session):
    db_role = session.exec(
        select(Role).where(Role.id == role_id)
    ).first()
    
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role_update.role_name is not None:
        new_name = role_update.role_name.strip()
        if not new_name:
            raise HTTPException(status_code=400, detail="role_name cannot be empty")
        conflict = session.exec(
            select(Role).where(Role.role_name == new_name, Role.id != role_id)
        ).first()
        if conflict:
            raise HTTPException(status_code=409, detail="Role name already in use")
        db_role.role_name = new_name

    if role_update.is_active is not None:
        db_role.is_active = role_update.is_active
    
    session.commit()
    session.refresh(db_role)
    return {"message": "Role updated successfully", "role": RoleResponse.model_validate(db_role)}


# --- Soft delete a role (remove employee from role) ---
def delete_role_in_db(role_id: int, session: Session):
    db_role = session.exec(
        select(Role).where(Role.id == role_id)
    ).first()
    
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if not db_role.is_active:
        raise HTTPException(status_code=409, detail="Role already removed")
    
    # Soft delete - set is_active to False
    db_role.is_active = False
    _strip_role_id_from_all_employees(role_id, session)
    session.commit()
    session.refresh(db_role)
    
    return {"message": "Role removed successfully", "role": RoleResponse.model_validate(db_role)}


# --- All roles (admin UI: include inactive) ---
def get_all_roles(session: Session):
    roles = session.exec(select(Role).order_by(Role.id)).all()
    return [RoleResponse.model_validate(role) for role in roles]


def get_active_role_names_for_employee(emp_id: int, session: Session, role_id:list) -> List[str]:

    roles = session.exec(
        select(Role).where(Role.id.in_(role_id), Role.is_active == True)
    ).all()
    return [role.role_name for role in roles]