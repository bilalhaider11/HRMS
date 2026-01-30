from fastapi import HTTPException
from sqlmodel import select
from models import Finance, Company


# --- Create a new finance record ---
def create_finance_in_db(finance, session, current_admin):
    # Get company of current admin
    company = session.exec(select(Company).where(Company.company_name == current_admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company Doesn't Found for Admin")
    
    # Check for duplicate finance record
    existing = session.exec(select(Finance).where(
        Finance.cheque_number == finance.cheque_number,
        Finance.date == finance.date,
        Finance.amount == finance.amount,
        Finance.company_id == company.company_id
    )).first()
    if existing:
        raise HTTPException(status_code=409, detail="Finance Record already exists")
    
    # Validate mandatory fields
    if finance.description == 'string':
        raise HTTPException(status_code=400, detail="Enter Description")
    if finance.amount == 0:
        raise HTTPException(status_code=400, detail="Enter Amount")
    if finance.cheque_number == 'string':
        raise HTTPException(status_code=400, detail="Enter Cheque Number")
    if finance.category_id == 0:
        raise HTTPException(status_code=400, detail="Enter Category ID")

    # Create finance record and assign company/admin
    new_finance = Finance.model_validate(finance)
    new_finance.company_id = company.company_id
    new_finance.added_by = current_admin.id
    session.add(new_finance)
    session.commit()
    session.refresh(new_finance)
    return new_finance


# --- Edit an existing finance record ---
def edit_finance_record_in_db(finance_id, finance, session, current_admin):
    company = session.exec(select(Company).where(Company.company_name == current_admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company Doesn't Found for Admin")
    # Retrieve existing finance record
    existing = session.exec(select(Finance).where(Finance.id == finance_id,
                                                    Finance.company_id == company.company_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Finance Record does not exists")

    # Update fields if valid
    if finance.tax_deductions != 0:
        existing.tax_deductions = finance.tax_deductions
    if finance.description != 'string':
        existing.description = finance.description
    if finance.amount != 0:
        existing.amount = finance.amount
    if finance.cheque_number != 'string':
        existing.cheque_number = finance.cheque_number
    if finance.category_id != 0:
        existing.category_id = finance.category_id

    session.commit()
    session.refresh(existing)
    return existing


# --- Delete a finance record ---
def delete_finance_record_in_db(finance_id, session, current_admin):
    company = session.exec(select(Company).where(Company.company_name == current_admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company Doesn't Found for Admin")
    # Retrieve existing finance record
    existing = session.exec(select(Finance).where(Finance.id == finance_id,
                                                    Finance.company_id == company.company_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Finance Record does not exists")

    # Delete record
    session.delete(existing)
    session.commit()
    return {"Message": "Deleted Successfully"}


# --- Get finance records with filters and pagination ---
def get_finance_records_in_db(page, page_size, start_date, end_date, category_id, session, current_admin):
    # Get company of current admin
    company = session.exec(select(Company).where(Company.company_name == current_admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company Doesn't Found for Admin")

    # Base query for finance records
    query = select(Finance).where(Finance.company_id == company.company_id)

    # Apply date range filters
    if start_date:
        query = query.where(Finance.date >= start_date)
    if end_date:
        query = query.where(Finance.date <= end_date)

    # Apply category filter
    if category_id:
        query = query.where(Finance.category_id == category_id)

    all_records = session.exec(query).all()
    total_count = len(all_records)

    # Pagination calculation
    offset = (page - 1) * page_size
    paginated_records = all_records[offset:offset + page_size]

    # --- Summary calculations ---
    total_earnings = sum(f.amount for f in all_records)
    total_salaries = sum(f.amount for f in all_records if f.category_id == 1)  # Salary category
    total_expenses = sum(f.amount for f in all_records if f.category_id in [3,4,7,8])  # Non-salary expenses
    total_profit = total_earnings - total_salaries - total_expenses

    # Return structured response
    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "filters": {
            "start_date": str(start_date) if start_date else "All",
            "end_date": str(end_date) if end_date else "All",
            "category_id": category_id if category_id else "All",
        },
        "records": paginated_records,
        "summary": {
            "total_earnings": total_earnings,
            "total_salaries": total_salaries,
            "total_expenses": total_expenses,
            "total_profit": total_profit
        }
    }
