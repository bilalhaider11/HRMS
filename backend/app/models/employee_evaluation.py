
from typing import Optional
from sqlmodel import SQLModel, Field

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
    updated_by:str = Field(default=0,nullable=False)
    created_by:str = Field(default=0,nullable=False)

     