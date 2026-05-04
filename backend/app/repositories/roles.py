
from sqlmodel import Session, select
from fastapi import HTTPException
from typing import List
from app.models.role import Role, RoleCreate, RoleUpdate, RoleResponse
from app.models.role import Role

def get_available_roles(session: Session,requested_role_ids: List[int]):
    roles = session.exec(
        select(Role).where(Role.is_active == True)
    ).all()
    return roles


def save_role(role: Role, session: Session):
    session.add(role)
    session.commit()
    session.refresh(role)
    return role