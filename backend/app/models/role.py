from typing import Optional
from sqlmodel import SQLModel, Field


# --- Role Model ---
class RoleBase(SQLModel):
    role_name: str


class RoleCreate(RoleBase):
    pass


class RoleUpdate(SQLModel):
    role_name: Optional[str] = None
    is_active: Optional[bool] = None


class RoleResponse(SQLModel):
    id: int
    role_name: str
    is_active: bool

class Role(RoleBase, table=True):
    __tablename__ = "roles"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    role_name: str = Field(nullable=False)
    is_active: bool = Field(default=True, nullable=False)