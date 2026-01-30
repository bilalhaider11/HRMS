from fastapi import HTTPException 
from sqlmodel import select
from datetime import date
from models import EmployeeIncrement, Employee, Company


# ---------------- CREATE ----------------
from datetime import timedelta

def create_increment_in_db(new_increment, session, current_admin):
    # Get company of current admin
    company = session.exec(
        select(Company).where(Company.company_name == current_admin.company_name)
    ).first()

    if not company:
        raise HTTPException(status_code=404, detail="Company Doesn't Found for Admin")
    # Get employee for the increment
    employee = session.exec(select(Employee).where(
        Employee.employee_id == new_increment.employee_id,
        Employee.company_id == company.company_id,
        Employee.status == True
    )).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee Doesn't Exists")
    # BLOCK INCREMENT WITHIN 30 DAYS
    last_increment = session.exec(
        select(EmployeeIncrement)
        .where(EmployeeIncrement.employee_id == new_increment.employee_id)
        .order_by(EmployeeIncrement.effective_date.desc())
    ).first()

    if last_increment:
        # Check day difference
        days_diff = (new_increment.effective_date - last_increment.effective_date).days

        if days_diff < 30:
            raise HTTPException(
                status_code=409,
                detail=f"Employee received an increment {days_diff} days ago. "
                        f"Minimum gap required is 30 days."
            )
    new_increment = EmployeeIncrement.model_validate(new_increment)
    new_increment.company_id = company.company_id
    employee.increment_amount = new_increment.increment_amount
    employee.last_increment_date = new_increment.effective_date
    employee.current_base_salary += new_increment.increment_amount

    session.add(new_increment)
    session.commit()
    session.refresh(new_increment)
    session.refresh(employee)

    return new_increment

# ---------------- READ ----------------
def get_increment_by_id_in_db(id, session, current_admin):
    # Get company of current admin
    company = session.exec(select(Company).where(Company.company_name == current_admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company Doesn't Found for Admin")

    # Retrieve increment for employee
    Increment = session.exec(select(EmployeeIncrement).where(EmployeeIncrement.id == id,
                                                                EmployeeIncrement.company_id == company.company_id)).first()
    if Increment:
        return Increment

    raise HTTPException(status_code=404, detail="Increment does not exist")

# ---------------- UPDATE / EDIT ----------------
def update_increment_in_db(increment_id, new_increment, session, current_admin):
    # Get company of current admin
    company = session.exec(select(Company).where(Company.company_name == current_admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company Doesn't Found for Admin")
    
    # Retrieve existing increment
    increment = session.exec(select(EmployeeIncrement).where(EmployeeIncrement.id == increment_id,
                                                            EmployeeIncrement.company_id == company.company_id)).first()
    if not increment:
        raise HTTPException(status_code=404, detail="Increment does not exist")
    
    # Get employee record
    employee =  session.exec(select(Employee).where(Employee.employee_id == new_increment.employee_id,
                                                    Employee.company_id == company.company_id)).first()
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee with id: {new_increment.employee_id} does not exists")
    if new_increment.employee_id != 'string':
        increment.employee_id  = new_increment.employee_id
        
    # Update increment amount and adjust employee salary
    if new_increment.increment_amount != 0:
        increment.increment_amount = new_increment.increment_amount
        if new_increment.increment_amount >= employee.increment_amount:
            employee.current_base_salary += (new_increment.increment_amount - employee.increment_amount)
        else:
            employee.current_base_salary -= (employee.increment_amount - new_increment.increment_amount)
        employee.increment_amount = new_increment.increment_amount

    # Update effective date
    if new_increment.effective_date != str(date.today()):
        increment.effective_date = new_increment.effective_date
        employee.last_increment_date = new_increment.effective_date

    # Update notes
    if new_increment.notes != 'string':
        increment.notes = new_increment.notes

    session.commit()
    session.refresh(increment)
    session.refresh(employee)
    return increment


# ---------------- HARD DELETE ----------------
def delete_increment_in_db(id, session, current_admin):
    # Get company of current admin
    company = session.exec(select(Company).where(Company.company_name == current_admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company Doesn't Found for Admin")
    
    # Retrieve increment record
    increment = session.exec(select(EmployeeIncrement).where(EmployeeIncrement.id == id,
                                                                EmployeeIncrement.company_id == company.company_id)).first()
    if not increment:
        raise HTTPException(status_code=404, detail="Increment does not exist")
    
    # Delete increment
    session.delete(increment)
    session.commit()
    return {"detail": "Increment deleted successfully"}
