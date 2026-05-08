from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.services.employee_evaluation import (
    create_employee_evaluation,
    update_employee_evaluation,
    delete_employee_evaluation,
    get_employee_evaluations,
    get_employee_scope_for_evaluation,
    ensure_can_view_employee_evaluations,
)
from app.services.admin_db import get_session
from app.services import auth

router = APIRouter(prefix="/evaluation")

@router.post("/evaluate/{emp_id}", status_code=200)
def employee_evaluation(
    emp_id: int,
    form_data: dict,
    user = Depends(auth.get_current_role),
    session: Session = Depends(get_session),
):

    ensure_can_view_employee_evaluations(user["user_type"], user["user"], emp_id, session)
    return create_employee_evaluation(
        emp_id,
        form_data,
        user["user_type"], 
        user["user"],
        session=session,
    )

@router.get("/employees", status_code=200)
def get_employees_for_evaluation(
    user = Depends(auth.get_current_role),
    session: Session = Depends(get_session),
):
    
    scope, employees = get_employee_scope_for_evaluation(
        user["user_type"],
        user["user"],
        session,
    )
    return {
        "scope": scope,
        "employees": [
            {
                "id": employee.id,
                "employee_code": employee.employee_code,
                "name": employee.name,
                "email": employee.email,
                "department": employee.department,
                "designation": employee.designation,
            }
            for employee in employees
        ],
    }


@router.get("/evaluate/{emp_id}", status_code=200)
def get_evaluations_by_employee(
    emp_id: int,
    user=Depends(auth.get_current_role),
    session: Session = Depends(get_session),
):
    
    ensure_can_view_employee_evaluations(user["user_type"], user["user"], emp_id, session)
    return get_employee_evaluations(emp_id ,user["user_type"], user["user"], session=session)


@router.patch("/update-evaluation/{emp_id}", status_code=200)
def update_evaluation(
    emp_id: int,
    form_data: dict,
    evaluation_id: int,
    user=Depends(auth.get_current_role),
    session: Session = Depends(get_session),
):
    
    if user["user_type"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can update evaluations")
    return update_employee_evaluation(
        emp_id,
        evaluation_id,
        form_data,
        user["user"].company_name,
        session=session,
    )
    
    
@router.delete("/delete-evaluation/{emp_id}", status_code=200)
def delete_evaluation(
    emp_id: int, evaluation_id: int, user=Depends(auth.get_current_role), session: Session = Depends(get_session),
):
    
    if user["user_type"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can delete evaluations")
    return delete_employee_evaluation(emp_id, evaluation_id, session=session)

