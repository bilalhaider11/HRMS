from fastapi import HTTPException
from sqlmodel import select, Session
from models import Finance, FinanceUpdate, FinanceCategory, FinanceEditHistory, Admin, BankAccount
from collections import defaultdict
import calendar


# --- Utility ---
def get_single_admin_id(session: Session) -> int:
    admin = session.exec(select(Admin)).first()
    if not admin:
        raise HTTPException(status_code=500, detail="No admin exists in the system")
    return admin.id


def _category_name_map(session: Session) -> dict:
    cats = session.exec(select(FinanceCategory)).all()
    return {c.category_id: c.category_name for c in cats}


# --- Create a new finance record ---
def create_finance_in_db(finance, session: Session):
    admin_id = get_single_admin_id(session)

    # Validate mandatory fields
    if finance.description in ("", "string"):
        raise HTTPException(status_code=400, detail="Enter Description")
    if finance.amount == 0:
        raise HTTPException(status_code=400, detail="Enter Amount")
    if finance.category_id == 0:
        raise HTTPException(status_code=400, detail="Enter Category ID")
    if finance.bank_account_id == 0:
        raise HTTPException(status_code=400, detail="Select a Bank Account")

    # Validate category exists
    category = session.exec(
        select(FinanceCategory).where(FinanceCategory.category_id == finance.category_id)
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail=f"Finance category {finance.category_id} does not exist")

    # Validate bank account exists
    account = session.exec(
        select(BankAccount).where(BankAccount.id == finance.bank_account_id)
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail=f"Bank account {finance.bank_account_id} does not exist")

    # Check for duplicate (only if cheque_number provided)
    if finance.cheque_number:
        existing = session.exec(
            select(Finance).where(
                Finance.cheque_number == finance.cheque_number,
                Finance.date == finance.date,
                Finance.amount == finance.amount,
                Finance.bank_account_id == finance.bank_account_id,
            )
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Finance Record already exists")

    new_finance = Finance.model_validate(finance)
    new_finance.added_by = admin_id
    session.add(new_finance)
    session.commit()
    session.refresh(new_finance)
    return new_finance


# --- Edit an existing finance record ---
def edit_finance_record_in_db(finance_id: int, finance: FinanceUpdate, session: Session):
    admin_id = get_single_admin_id(session)

    existing = session.exec(select(Finance).where(Finance.id == finance_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Finance Record does not exist")

    update_data = finance.model_dump(exclude_unset=True)

    if "category_id" in update_data and update_data["category_id"]:
        category = session.exec(
            select(FinanceCategory).where(FinanceCategory.category_id == update_data["category_id"])
        ).first()
        if not category:
            raise HTTPException(status_code=404, detail=f"Finance category {update_data['category_id']} does not exist")

    if "bank_account_id" in update_data and update_data["bank_account_id"]:
        account = session.exec(
            select(BankAccount).where(BankAccount.id == update_data["bank_account_id"])
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail=f"Bank account {update_data['bank_account_id']} does not exist")

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

    existing.added_by = admin_id
    session.commit()
    session.refresh(existing)
    return existing


# --- Get finance records with filters and pagination ---
def get_finance_records_in_db(
    page: int, page_size: int,
    start_date=None, end_date=None,
    category_id=None, bank_account_id=None,
    session: Session = None,
):
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10

    query = select(Finance)

    if start_date:
        query = query.where(Finance.date >= start_date)
    if end_date:
        query = query.where(Finance.date <= end_date)
    if category_id:
        query = query.where(Finance.category_id == category_id)
    if bank_account_id:
        query = query.where(Finance.bank_account_id == bank_account_id)

    all_records = session.exec(query).all()
    total_count = len(all_records)

    offset = (page - 1) * page_size
    paginated_records = all_records[offset:offset + page_size]

    # Resolve category names/colors and added_by names for paginated records
    category_map = {}
    admin_map = {}
    for record in paginated_records:
        if record.category_id and record.category_id not in category_map:
            cat = session.exec(
                select(FinanceCategory).where(FinanceCategory.category_id == record.category_id)
            ).first()
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
        data["has_edits"] = session.exec(
            select(FinanceEditHistory).where(FinanceEditHistory.finance_id == record.id)
        ).first() is not None
        enriched_records.append(data)

    # Summary — based on category name prefix for all filtered records
    all_cat_ids = {f.category_id for f in all_records if f.category_id}
    all_cat_map = {}
    for cid in all_cat_ids:
        if cid in category_map:
            all_cat_map[cid] = category_map[cid]["name"]
        else:
            cat = session.exec(
                select(FinanceCategory).where(FinanceCategory.category_id == cid)
            ).first()
            all_cat_map[cid] = cat.category_name if cat else ""

    total_income = sum(
        f.amount for f in all_records
        if all_cat_map.get(f.category_id, "").startswith("Income")
    )
    total_expense = sum(
        f.amount for f in all_records
        if not all_cat_map.get(f.category_id, "").startswith("Income")
    )

    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size if total_count else 1,
        "records": enriched_records,
        "summary": {
            "total_income": total_income,
            "total_expense": total_expense,
            "net": total_income - total_expense,
        },
    }


# --- Finance Categories ---

def get_all_categories_in_db(session: Session):
    return session.exec(select(FinanceCategory)).all()


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
        if h.field_name == "category_id":
            for val in [old_value, new_value]:
                if val and val.isdigit() and int(val) not in category_map:
                    cat = session.exec(
                        select(FinanceCategory).where(FinanceCategory.category_id == int(val))
                    ).first()
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


# --- Monthly Summary (per bank account) ---

def get_monthly_summary_in_db(bank_account_id: int, year: int, session: Session):
    account = session.exec(select(BankAccount).where(BankAccount.id == bank_account_id)).first()
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")

    cat_map = _category_name_map(session)

    all_records = session.exec(
        select(Finance).where(Finance.bank_account_id == bank_account_id)
    ).all()

    # Compute opening balance of the requested year
    pre_year_income = sum(
        r.amount for r in all_records
        if r.date.year < year and cat_map.get(r.category_id, "").startswith("Income")
    )
    pre_year_expense = sum(
        r.amount for r in all_records
        if r.date.year < year and not cat_map.get(r.category_id, "").startswith("Income")
    )
    year_opening = account.opening_balance + pre_year_income - pre_year_expense

    # Group by month for the requested year
    monthly: dict = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
    for r in all_records:
        if r.date.year == year:
            if cat_map.get(r.category_id, "").startswith("Income"):
                monthly[r.date.month]["income"] += r.amount
            else:
                monthly[r.date.month]["expense"] += r.amount

    months = []
    running = year_opening
    for m in range(1, 13):
        opening = running
        income = monthly[m]["income"]
        expense = monthly[m]["expense"]
        closing = opening + income - expense
        running = closing
        months.append({
            "month": m,
            "month_name": calendar.month_abbr[m],
            "opening_balance": opening,
            "income": income,
            "expense": expense,
            "net": income - expense,
            "closing_balance": closing,
        })

    return {"year": year, "bank_account_id": bank_account_id, "months": months}
