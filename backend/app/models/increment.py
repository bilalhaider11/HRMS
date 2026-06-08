import datetime
from datetime import date
from typing import Optional, List
from app.models.employee import Employee
from sqlmodel import SQLModel, Field, Relationship
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



# --- Employee Increment Models ---
class EmployeeIncrementBase(SQLModel):
    employee_id: int = Field(foreign_key="employee.id", nullable=False)
    increment_amount: float
    effective_date: date
    notes: Optional[str] = None


class EmployeeIncrement(EmployeeIncrementBase, table=True):
    __tablename__ = "employee_increment_history"
    id: Optional[int] = Field(default=None, primary_key=True)

    employee: Optional["Employee"] = Relationship(back_populates="increments")

