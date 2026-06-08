from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.services import admin_db
from app.services import auth
from app.services import bank_account_db

router = APIRouter(prefix="/bank_accounts", dependencies=[Depends(auth.get_current_user)])


@router.get("/")
def get_bank_accounts(session: Session = Depends(admin_db.get_session)):
    return bank_account_db.get_all_bank_accounts_in_db(session=session)


@router.post("/")
def create_bank_account(payload: dict, session: Session = Depends(admin_db.get_session)):
    return bank_account_db.create_bank_account_in_db(payload, session=session)


@router.patch("/{account_id}")
def update_bank_account(account_id: int, payload: dict, session: Session = Depends(admin_db.get_session)):
    return bank_account_db.update_bank_account_in_db(account_id, payload, session=session)


@router.delete("/{account_id}")
def delete_bank_account(account_id: int, session: Session = Depends(admin_db.get_session)):
    return bank_account_db.delete_bank_account_in_db(account_id, session=session)
