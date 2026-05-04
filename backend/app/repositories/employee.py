


from sqlmodel import Session, select
from app.models.employee import Employee


def get_employee_by_id(emp_id: int, session: Session):
    return session.exec(
        select(Employee).where(Employee.id == emp_id)
    ).first()


def save_employee(employee: Employee, session: Session):
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee