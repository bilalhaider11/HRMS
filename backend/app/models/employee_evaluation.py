from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field as PydanticField
from sqlmodel import SQLModel, Field


class EmployeeEvaluationCreate(BaseModel):
    task_completion: int = PydanticField(default=0, ge=0, le=5)
    team_player: int = PydanticField(default=0, ge=0, le=5)
    time_management: int = PydanticField(default=0, ge=0, le=5)
    positive_work_attitide: int = PydanticField(default=0, ge=0, le=5)
    adaptable_and_flexible: int = PydanticField(default=0, ge=0, le=5)
    ability_to_learn: int = PydanticField(default=0, ge=0, le=5)
    problem_solving: int = PydanticField(default=0, ge=0, le=5)
    punctuality: int = PydanticField(default=0, ge=0, le=5)
    general_comments: str = ""
    extra_comments: Optional[str] = None
    created_at: Optional[str] = None


class EmployeeEvaluationUpdate(BaseModel):
    task_completion: Optional[int] = PydanticField(default=None, ge=0, le=5)
    team_player: Optional[int] = PydanticField(default=None, ge=0, le=5)
    time_management: Optional[int] = PydanticField(default=None, ge=0, le=5)
    positive_work_attitide: Optional[int] = PydanticField(default=None, ge=0, le=5)
    adaptable_and_flexible: Optional[int] = PydanticField(default=None, ge=0, le=5)
    ability_to_learn: Optional[int] = PydanticField(default=None, ge=0, le=5)
    problem_solving: Optional[int] = PydanticField(default=None, ge=0, le=5)
    punctuality: Optional[int] = PydanticField(default=None, ge=0, le=5)
    general_comments: Optional[str] = None
    extra_comments: Optional[str] = None
    created_at: Optional[str] = None


class EmployeeEvaluation(SQLModel, table=True):
    
    __tablename__ = "employee_evaluation"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    employee_id: int = Field(foreign_key="employee.id")
    
    task_completion: int = Field(default=0, nullable=False,ge=0, le=5)
    team_player: int = Field(default=0, nullable=False,ge=0, le=5)
    time_management: int = Field(default=0, nullable=False,ge=0, le=5)
    positive_work_attitide: int = Field(default=0, nullable=False,ge=0, le=5)
    adaptable_and_flexible: int = Field(default=0, nullable=False,ge=0, le=5)
    ability_to_learn: int = Field(default=0, nullable=False,ge=0, le=5)
    problem_solving: int = Field(default=0, nullable=False,ge=0, le=5)
    punctuality: int = Field(default=0, nullable=False,ge=0, le=5)
    general_comments: str = Field(default="", nullable=False)
    extra_comments: Optional[str] = Field(default=None, nullable=True)
    updated_by: str = Field(default="", nullable=True)
    created_by: str = Field(default="", nullable=False)
    created_at: Optional[datetime] = Field(default=None, nullable=True)
    updated_at: Optional[str] = Field(default=None, nullable=True)

     