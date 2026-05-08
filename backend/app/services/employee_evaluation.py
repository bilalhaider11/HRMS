import datetime
from typing import Dict, List, Optional, Set, Tuple

from fastapi import HTTPException
from sqlalchemy import update
from sqlmodel import Session, select

from app.services import role_db,employee_db,teams_db
from app.models.employee_evaluation import EmployeeEvaluation
from app.models.employee import Employee
from app.models.team import Team, Teams_to_Employee
from app.models.admin import Admin

def emp_evaluation_payload(evaluation: EmployeeEvaluation, employee: Employee) -> dict:
    return {
        "evaluation_id": evaluation.id,
        "employee_id": employee.id,
        "employee_name": employee.name,
        "task_completion": evaluation.task_completion,
        "team_player": evaluation.team_player,
        "time_management": evaluation.time_management,
        "positive_work_attitide": evaluation.positive_work_attitide,
        "adaptable_and_flexible": evaluation.adaptable_and_flexible,
        "ability_to_learn": evaluation.ability_to_learn,
        "problem_solving": evaluation.problem_solving,
        "punctuality": evaluation.punctuality,
        "general_comments": evaluation.general_comments,
        "extra_comments": evaluation.extra_comments,
    }


def check_by_roles(employee_id,target_employee_id,session,role_ids):
    role_names = set(role_db.get_active_role_names_for_employee(employee_id, session,role_ids))

    if "HR" in role_names:
        return

    if "Team Lead" in role_names:
        member_ids = _get_team_member_ids_for_lead(employee_id, session)
        if target_employee_id in member_ids:
            return

    raise HTTPException(status_code=403, detail="You do not have permission to view these evaluations")

def _get_team_member_ids_for_lead(current_employee_id: int, session: Session) -> Set[int]:
    teams = session.exec(
        select(Team).where(
            Team.delete_record == False,
            Team.team_lead_id == current_employee_id,
        )
    ).all()
    
    get_members = []
    member_ids = {}
    for team in teams:
        team_members = teams_db._serialize_team(team,session)
        members = team_members['teams_to_employee']
        
        for member in members:
                   
            get_members.append(teams_db._serialize_team(team,session))
    
        
    team_ids = [team.id for team in teams if team.id is not None]
    
    if not team_ids:
        return set()

    team_member_links = session.exec(
        select(Teams_to_Employee).where(
            Teams_to_Employee.team_id.in_(team_ids),
            Teams_to_Employee.delete_record == False,
        )
    ).all()
    
    return {link.employee_id for link in team_member_links}


def get_employee_scope_for_evaluation(
    user_type: str,
    user: object,
    session: Session,
) -> Tuple[str, List[Employee]]:
    if user_type == "admin":
        employees = session.exec(select(Employee).where(Employee.status == True)).all()
        return "all", employees

    current_employee: Employee = user
    role_names = set(role_db.get_active_role_names_for_employee(current_employee.id, session, user.role_ids))

    if "HR" in role_names:
        employees = session.exec(select(Employee).where(Employee.status == True)).all()
        return "all", employees

    if "Team Lead" in role_names:
        member_ids = _get_team_member_ids_for_lead(current_employee.id, session)
        print("mrmber ids: ",member_ids)
        if not member_ids:
            return "team", []
        employees = session.exec(
            select(Employee).where(Employee.id.in_(member_ids), Employee.status == True)
        ).all()
        return "team", employees

    return "self", [current_employee]


def ensure_can_view_employee_evaluations(
    user_type: str,
    current_user: object,
    target_employee_id: int,
    session: Session,
) -> None:
    
    if user_type == "admin":
        return

    current_employee: Employee = current_user
    if current_employee.id == target_employee_id:
        return
    
    return check_by_roles(current_employee.id,target_employee_id,session,current_user.role_ids)


def create_employee_evaluation(emp_id: int, payload: dict, user_type:str, user:object, session: Session) -> dict:
    
    if user_type == "admin":
        created_by = user.company_name
        employee = employee_db.get_employee(emp_id, session) 
    else:
        created_by = user.name
        employee = user
        
    evaluation = EmployeeEvaluation(employee_id=emp_id,created_by=created_by, **payload)
    
    session.add(evaluation)
    session.commit()
    session.refresh(evaluation)
    
    return emp_evaluation_payload(evaluation, employee)


def get_employee_evaluations(emp_id: int,user_type: str,user: object , session: Session) -> dict:
    
    if user_type == "admin":
        employee = employee_db.get_employee(emp_id, session)
    else:
        employee = user
        
    evaluations = session.exec(
        select(EmployeeEvaluation).where(EmployeeEvaluation.employee_id == emp_id)
    ).all()
    return {
        "employee": {
            "id": employee.id,
            "employee_code": employee.employee_code,
            "name": employee.name,
            "email": employee.email,
        },
        "evaluations": [emp_evaluation_payload(evaluation, employee) for evaluation in evaluations],
    }


def update_employee_evaluation(emp_id: int, evaluation_id: int, payload: dict,update_by:str, session: Session) -> dict:
    
    employee = employee_db.get_employee(emp_id, session)
    evaluation = session.exec(
        select(EmployeeEvaluation).where(
            EmployeeEvaluation.employee_id == emp_id,
            EmployeeEvaluation.id == evaluation_id,
        )
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found for the employee to update")
    
    payload['updated_by'] = update_by
    statement = (
    update(EmployeeEvaluation)
        .where(
            EmployeeEvaluation.id == evaluation_id,
            EmployeeEvaluation.employee_id == emp_id
        )
        .values(payload) 
    )

    session.exec(statement)
    session.commit()
    
    return emp_evaluation_payload(evaluation, employee)


def delete_employee_evaluation(emp_id: int, evaluation_id: int, session: Session) -> dict:
    
    evaluation = session.exec(
        select(EmployeeEvaluation).where(
            EmployeeEvaluation.employee_id == emp_id,
            EmployeeEvaluation.id == evaluation_id,
        )
    ).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found for the employee")

    session.delete(evaluation)
    session.commit()
    return {"message": "Evaluation deleted successfully"}