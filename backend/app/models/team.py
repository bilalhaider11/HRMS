
import datetime
from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

# --- Teams Models ---
class Team(SQLModel, table=True):
    __tablename__ = "teams"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    team_name: str
    team_description: Optional[str] = None
    team_lead_id: Optional[int] = Field(default=None, foreign_key="employee.id")
    company_id: Optional[int] = Field(default=None, foreign_key="admin.id")
    delete_record: bool = Field(default=False, nullable=False, index=True)


class Teams_to_Employee(SQLModel, table=True):
    __tablename__ = "teams_to_employee"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    team_id: int = Field(foreign_key="teams.id")
    employee_id: int = Field(foreign_key="employee.id")
    delete_record: bool = Field(default=False, nullable=False, index=True)
     
     