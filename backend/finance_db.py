from fastapi import HTTPException
from sqlmodel import select, Session
from models import Finance, FinanceUpdate, FinanceCategory, FinanceEditHistory, Admin


# --- Utility: get the single admin ID ---
def get_single_admin_id(session: Session) -> int:
    admin = session.exec(select(Admin)).first()
    if not admin:
        raise HTTPException(status_code=500, detail="No admin exists in the system")
    return admin.id


# --- Create a new finance record ---
def create_finance_in_db(finance, session: Session):
    admin_id = get_single_admin_id(session)

    # Check for duplicate finance record
    existing = session.exec(
        select(Finance).where(
            Finance.cheque_number == finance.cheque_number,
            Finance.date == finance.date,
            Finance.amount == finance.amount
        )
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Finance Record already exists")

    # Validate mandatory fields
    if finance.description in ("", "string"):
        raise HTTPException(status_code=400, detail="Enter Description")
    if finance.amount == 0:
        raise HTTPException(status_code=400, detail="Enter Amount")
    if finance.cheque_number in ("", "string"):
        raise HTTPException(status_code=400, detail="Enter Cheque Number")
    if finance.category_id == 0:
        raise HTTPException(status_code=400, detail="Enter Category ID")

    # Validate category exists
    category = session.exec(select(FinanceCategory).where(FinanceCategory.category_id == finance.category_id)).first()
    if not category:
        raise HTTPException(status_code=404, detail=f"Finance category with id {finance.category_id} does not exist")

    # Create finance record
    new_finance = Finance.model_validate(finance)
    new_finance.added_by = admin_id  # assign the single admin
    session.add(new_finance)
    session.commit()
    session.refresh(new_finance)
    return new_finance


# --- Edit an existing finance record ---
def edit_finance_record_in_db(finance_id: int, finance: FinanceUpdate, session: Session):
    admin_id = get_single_admin_id(session)

    # Retrieve existing finance record
    existing = session.exec(select(Finance).where(Finance.id == finance_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Finance Record does not exist")

    # Validate category if being changed
    update_data = finance.model_dump(exclude_unset=True)
    if "category_id" in update_data and update_data["category_id"] is not None:
        category = session.exec(select(FinanceCategory).where(
            FinanceCategory.category_id == update_data["category_id"]
        )).first()
        if not category:
            raise HTTPException(status_code=404, detail=f"Finance category with id {update_data['category_id']} does not exist")

    # Log each field change to edit history
    for key, value in update_data.items():
        if value is not None:
            old_value = str(getattr(existing, key, ""))
            new_value = str(value)
            if old_value != new_value:
                history = FinanceEditHistory(
                    finance_id=finance_id,
                    field_name=key,
                    old_value=old_value,
                    new_value=new_value,
                    edited_by=admin_id,
                )
                session.add(history)
            setattr(existing, key, value)

    # Ensure added_by still tracks admin
    existing.added_by = admin_id

    session.commit()
    session.refresh(existing)
    return existing


# --- Get finance records with filters and pagination ---
def get_finance_records_in_db(page: int, page_size: int, start_date=None, end_date=None, category_id=None, session: Session = None):
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10

    # Base query for finance records
    query = select(Finance)

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

    # Pagination
    offset = (page - 1) * page_size
    paginated_records = all_records[offset:offset + page_size]

    # Resolve category names/colors and added_by names
    category_map = {}
    admin_map = {}
    for record in paginated_records:
        if record.category_id and record.category_id not in category_map:
            cat = session.exec(select(FinanceCategory).where(FinanceCategory.category_id == record.category_id)).first()
            category_map[record.category_id] = {
                "name": cat.category_name if cat else str(record.category_id),
                "color": cat.color_code if cat else "",
            }
        if record.added_by and record.added_by not in admin_map:
            admin = session.exec(select(Admin).where(Admin.id == record.added_by)).first()
            admin_map[record.added_by] = admin.company_name if admin else str(record.added_by)

    enriched_records = []
    for record in paginated_records:
        data = record.model_dump()
        cat_info = category_map.get(record.category_id, {"name": "", "color": ""})
        data["category_name"] = cat_info["name"]
        data["category_color"] = cat_info["color"]
        data["added_by_name"] = admin_map.get(record.added_by, "")
        has_edits = session.exec(
            select(FinanceEditHistory).where(FinanceEditHistory.finance_id == record.id)
        ).first() is not None
        data["has_edits"] = has_edits
        enriched_records.append(data)

    # --- Summary calculations ---
    total_earnings = sum(f.amount for f in all_records)
    total_salaries = sum(f.amount for f in all_records if f.category_id == 1)  # Salary category
    total_expenses = sum(f.amount for f in all_records if f.category_id in [3, 4, 7, 8])  # Non-salary expenses
    total_profit = total_earnings - total_salaries - total_expenses

    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "records": enriched_records,
        "summary": {
            "total_earnings": total_earnings,
            "total_salaries": total_salaries,
            "total_expenses": total_expenses,
            "total_profit": total_profit
        }
    }


# --- Finance Categories ---

def get_all_categories_in_db(session: Session):
    categories = session.exec(select(FinanceCategory)).all()
    return categories


def create_category_in_db(category_name: str, color_code: str, session: Session):
    if not category_name or category_name in ("", "string"):
        raise HTTPException(status_code=400, detail="Enter category name")
    if not color_code or color_code in ("", "string"):
        raise HTTPException(status_code=400, detail="Enter color code")

    existing = session.exec(
        select(FinanceCategory).where(FinanceCategory.category_name == category_name)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Category already exists")

    new_category = FinanceCategory(category_name=category_name, color_code=color_code)
    session.add(new_category)
    session.commit()
    session.refresh(new_category)
    return new_category


def update_category_in_db(category_id: int, category_name: str, color_code: str, session: Session):
    existing = session.exec(
        select(FinanceCategory).where(FinanceCategory.category_id == category_id)
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")

    if category_name and category_name not in ("", "string"):
        existing.category_name = category_name
    if color_code and color_code not in ("", "string"):
        existing.color_code = color_code

    session.commit()
    session.refresh(existing)
    return existing


def delete_category_in_db(category_id: int, session: Session):
    existing = session.exec(
        select(FinanceCategory).where(FinanceCategory.category_id == category_id)
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if any finance records use this category
    records = session.exec(
        select(Finance).where(Finance.category_id == category_id)
    ).first()
    if records:
        raise HTTPException(status_code=409, detail="Cannot delete category — finance records are using it")

    session.delete(existing)
    session.commit()
    return {"message": "Category deleted successfully"}


# --- Finance Edit History ---

def get_edit_history_in_db(finance_id: int, session: Session):
    existing = session.exec(select(Finance).where(Finance.id == finance_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Finance record not found")

    history = session.exec(
        select(FinanceEditHistory)
        .where(FinanceEditHistory.finance_id == finance_id)
        .order_by(FinanceEditHistory.edited_at.desc())
    ).all()

    admin_map = {}
    category_map = {}
    results = []
    for h in history:
        if h.edited_by and h.edited_by not in admin_map:
            admin = session.exec(select(Admin).where(Admin.id == h.edited_by)).first()
            admin_map[h.edited_by] = admin.company_name if admin else str(h.edited_by)

        old_value = h.old_value
        new_value = h.new_value
        # Resolve category IDs to names
        if h.field_name == "category_id":
            for val in [old_value, new_value]:
                if val and val.isdigit() and int(val) not in category_map:
                    cat = session.exec(select(FinanceCategory).where(FinanceCategory.category_id == int(val))).first()
                    category_map[int(val)] = cat.category_name if cat else val
            old_value = category_map.get(int(old_value), old_value) if old_value and old_value.isdigit() else old_value
            new_value = category_map.get(int(new_value), new_value) if new_value and new_value.isdigit() else new_value

        results.append({
            "id": h.id,
            "field_name": h.field_name,
            "old_value": old_value,
            "new_value": new_value,
            "edited_by": admin_map.get(h.edited_by, ""),
            "edited_at": h.edited_at.isoformat() if h.edited_at else "",
        })

    return results