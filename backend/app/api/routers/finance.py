from fastapi import APIRouter, Depends
from datetime import date
from sqlmodel import Session
from app.services import admin_db
from app.services import auth
from app.services import finance_db
from app.models.finance import FinanceBase, FinanceUpdate

router = APIRouter(prefix="/finance", dependencies=[Depends(auth.get_current_user)])


@router.post("/create_finance_record")
def create_finance(finance: FinanceBase, session: Session = Depends(admin_db.get_session)):
    return finance_db.create_finance_in_db(finance, session=session)


@router.patch("/edit_finance_record")
def edit_finance(finance_id: int, finance: FinanceUpdate, session: Session = Depends(admin_db.get_session)):
    return finance_db.edit_finance_record_in_db(finance_id, finance, session=session)


@router.get("/get_finance_records")
def get_finance_records(
    page: int = 1,
    page_size: int = 10,
    start_date: date | None = None,
    end_date: date | None = None,
    category_id: int | None = None,
    bank_account_id: int | None = None,
    session: Session = Depends(admin_db.get_session),
):
    return finance_db.get_finance_records_in_db(page, page_size, start_date, end_date, category_id, bank_account_id, session=session)


@router.get("/get_edit_history/{finance_id}")
def get_finance_edit_history(finance_id: int, session: Session = Depends(admin_db.get_session)):
    return finance_db.get_edit_history_in_db(finance_id, session=session)


@router.get("/monthly_summary")
def get_monthly_summary(bank_account_id: int, year: int | None = None, session: Session = Depends(admin_db.get_session)):
    return finance_db.get_monthly_summary_in_db(bank_account_id, year or date.today().year, session=session)


@router.get("/get_all_categories")
def get_finance_categories(session: Session = Depends(admin_db.get_session)):
    return finance_db.get_all_categories_in_db(session=session)


@router.post("/create_category")
def create_finance_category(payload: dict, session: Session = Depends(admin_db.get_session)):
    return finance_db.create_category_in_db(
        payload.get("category_name", ""), payload.get("color_code", ""), session=session
    )


@router.patch("/update_category/{category_id}")
def update_finance_category(category_id: int, payload: dict, session: Session = Depends(admin_db.get_session)):
    return finance_db.update_category_in_db(
        category_id, payload.get("category_name", ""), payload.get("color_code", ""), session=session
    )


@router.delete("/delete_category/{category_id}")
def delete_finance_category(category_id: int, session: Session = Depends(admin_db.get_session)):
    return finance_db.delete_category_in_db(category_id, session=session)
