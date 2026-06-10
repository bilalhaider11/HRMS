from datetime import datetime
from typing import List, Optional, Set, Tuple

from fastapi import HTTPException
from sqlalchemy import update
from sqlmodel import Session, select

from app.services import role_db,employee_db,teams_db
from app.models.employee_evaluation import EmployeeEvaluation, EmployeeEvaluationCreate, EmployeeEvaluationUpdate
from app.models.employee import Employee
from app.models.team import Team, Teams_to_Employee
from app.models.admin import Admin

def _parse_created_at(value: Optional[str]) -> datetime:
    if not value:
        return datetime.now()
    try:
        return datetime.strptime(value, "%Y-%m-%d")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="created_at must be YYYY-MM-DD") from exc


def _format_created_at(value: Optional[datetime]) -> str:
    if value is None:
        return ""
    return value.strftime("%Y-%m-%d")


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
        "created_at": _format_created_at(evaluation.created_at),
        "updated_at": evaluation.updated_at or "",
        "created_by": evaluation.created_by or "",
        "updated_by": evaluation.updated_by or "",
    }


def _get_role_names(employee_id: int, session: Session, role_ids) -> Set[str]:
    return set(role_db.get_active_role_names_for_employee(employee_id, session, role_ids))


def _has_evaluation_feature_access(employee_id: int, session: Session, role_ids) -> bool:
    role_names = _get_role_names(employee_id, session, role_ids)
    return "HR" in role_names or "Team Lead" in role_names


def _has_target_evaluation_access(
    employee_id: int,
    target_employee_id: int,
    session: Session,
    role_ids,
) -> bool:
    role_names = _get_role_names(employee_id, session, role_ids)

    if "HR" in role_names:
        return True

    if "Team Lead" in role_names:
        member_ids = _get_team_member_ids_for_lead(employee_id, session)
        return target_employee_id in member_ids

    return False

def _get_team_member_ids_for_lead(current_employee_id: int, session: Session) -> Set[int]:
    teams = session.exec(
        select(Team).where(
            Team.delete_record == False,
            Team.team_lead_id == current_employee_id,
        )
    ).all()
    
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
    role_names = _get_role_names(current_employee.id, session, user.role_ids)

    if "HR" in role_names:
        employees = session.exec(select(Employee).where(Employee.status == True)).all()
        return "all", employees

    if "Team Lead" in role_names:
        member_ids = _get_team_member_ids_for_lead(current_employee.id, session)
        if not member_ids:
            return "team", []
        employees = session.exec(
            select(Employee).where(Employee.id.in_(member_ids), Employee.status == True)
        ).all()
        return "team", employees

    return "self", []


def ensure_can_do_evaluation(
    user_type: str,
    evaluation_type: str,
    current_user: object,
    session: Session,
    target_employee_id: Optional[int] = None,
) -> None:
    action = evaluation_type.lower()

    if user_type == "admin":
        return

    current_employee: Employee = current_user
    role_ids = current_user.role_ids

    if action == "list":
        if not _has_evaluation_feature_access(current_employee.id, session, role_ids):
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to access employee evaluations",
            )
        return

    if action in ("update", "delete"):
        raise HTTPException(status_code=403, detail="Only admin can update or delete evaluations")

    if target_employee_id is None:
        raise HTTPException(status_code=400, detail="target_employee_id is required")

    if action == "create":
        if current_employee.id == target_employee_id:
            raise HTTPException(
                status_code=403,
                detail="You cannot do evaluation for yourself",
            )
        if not _has_target_evaluation_access(
            current_employee.id, target_employee_id, session, role_ids
        ):
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to create evaluations",
            )
        return

    if action == "view":
        if not _has_target_evaluation_access(
            current_employee.id, target_employee_id, session, role_ids
        ):
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to view these evaluations",
            )
        return

    raise HTTPException(status_code=400, detail="Invalid evaluation action")


def create_employee_evaluation(emp_id: int, payload: EmployeeEvaluationCreate, user_type:str, user:object, session: Session) -> dict:

    if user_type == "admin":
        created_by = user.company_name
    else:
        created_by = user.name
    employee = employee_db.get_employee(emp_id, session)

    evaluation_data = payload.model_dump(exclude={"created_at"})
    evaluation = EmployeeEvaluation(
        employee_id=emp_id,
        created_by=created_by,
        updated_by="",
        created_at=_parse_created_at(payload.created_at),
        **evaluation_data,
    )
    
    session.add(evaluation)
    session.commit()
    session.refresh(evaluation)
    
    return emp_evaluation_payload(evaluation, employee)


def get_employee_evaluations(emp_id: int,user_type: str,user: object , session: Session) -> dict:

    employee = employee_db.get_employee(emp_id, session)

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


def update_employee_evaluation(emp_id: int, evaluation_id: int, payload: EmployeeEvaluationUpdate, update_by:str, session: Session) -> dict:

    employee = employee_db.get_employee(emp_id, session)
    evaluation = session.exec(
        select(EmployeeEvaluation).where(
            EmployeeEvaluation.employee_id == emp_id,
            EmployeeEvaluation.id == evaluation_id,
        )
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found for the employee to update")

    raw_update = payload.model_dump(exclude_unset=True)
    if "created_at" in raw_update:
        raw_update["created_at"] = _parse_created_at(raw_update["created_at"])
    update_data = {k: v for k, v in raw_update.items() if v is not None}
    update_data["updated_by"] = update_by
    update_data["updated_at"] = datetime.now()
    statement = (
        update(EmployeeEvaluation)
        .where(
            EmployeeEvaluation.id == evaluation_id,
            EmployeeEvaluation.employee_id == emp_id
        )
        .values(update_data)
    )

    session.exec(statement)
    session.commit()
    session.refresh(evaluation)

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