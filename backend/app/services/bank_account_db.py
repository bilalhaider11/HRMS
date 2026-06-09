from collections import defaultdict
from fastapi import HTTPException
from sqlmodel import select, Session
from app.models.bank_account import BankAccount
from app.models.finance import Finance, FinanceCategory


def get_all_bank_accounts_in_db(session: Session):
    accounts = session.exec(select(BankAccount)).all()
    if not accounts:
        return []

    # Batch-load all categories once
    cats = session.exec(select(FinanceCategory)).all()
    cat_map = {c.category_id: c.category_name for c in cats}

    # Batch-load all finance records in a single query, grouped by account
    all_finance = session.exec(
        select(Finance.bank_account_id, Finance.category_id, Finance.amount)
    ).all()

    income_by_account: dict = defaultdict(float)
    expense_by_account: dict = defaultdict(float)
    for bank_account_id, cat_id, amount in all_finance:
        if cat_map.get(cat_id, "").startswith("Income"):
            income_by_account[bank_account_id] += amount
        else:
            expense_by_account[bank_account_id] += amount

    return [
        {
            "id": acc.id,
            "account_name": acc.account_name,
            "bank_name": acc.bank_name,
            "account_number": acc.account_number,
            "branch_code": acc.branch_code,
            "iban_number": acc.iban_number,
            "opening_balance": acc.opening_balance,
            "total_income": income_by_account[acc.id],
            "total_expense": expense_by_account[acc.id],
            "current_balance": acc.opening_balance + income_by_account[acc.id] - expense_by_account[acc.id],
        }
        for acc in accounts
    ]


def create_bank_account_in_db(data: dict, session: Session):
    account_name = (data.get("account_name") or "").strip()
    bank_name = (data.get("bank_name") or "").strip()
    account_number = (data.get("account_number") or "").strip()

    if not account_name:
        raise HTTPException(status_code=400, detail="Account name is required")
    if not bank_name:
        raise HTTPException(status_code=400, detail="Bank name is required")
    if not account_number:
        raise HTTPException(status_code=400, detail="Account number is required")

    existing = session.exec(
        select(BankAccount).where(BankAccount.account_number == account_number)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="A bank account with this number already exists")

    new_account = BankAccount(
        account_name=account_name,
        bank_name=bank_name,
        account_number=account_number,
        branch_code=data.get("branch_code") or None,
        iban_number=data.get("iban_number") or None,
        opening_balance=float(data.get("opening_balance") or 0),
    )
    session.add(new_account)
    session.commit()
    session.refresh(new_account)
    return new_account


def update_bank_account_in_db(account_id: int, data: dict, session: Session):
    existing = session.exec(
        select(BankAccount).where(BankAccount.id == account_id)
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Bank account not found")

    if data.get("account_name"):
        existing.account_name = data["account_name"].strip()
    if data.get("bank_name"):
        existing.bank_name = data["bank_name"].strip()
    if data.get("account_number"):
        new_num = data["account_number"].strip()
        dup = session.exec(
            select(BankAccount).where(
                BankAccount.account_number == new_num,
                BankAccount.id != account_id,
            )
        ).first()
        if dup:
            raise HTTPException(status_code=409, detail="A bank account with this number already exists")
        existing.account_number = new_num
    if "branch_code" in data:
        existing.branch_code = data["branch_code"] or None
    if "iban_number" in data:
        existing.iban_number = data["iban_number"] or None
    if data.get("opening_balance") is not None:
        existing.opening_balance = float(data["opening_balance"])

    session.commit()
    session.refresh(existing)
    return existing


def delete_bank_account_in_db(account_id: int, session: Session):
    existing = session.exec(
        select(BankAccount).where(BankAccount.id == account_id)
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Bank account not found")

    linked = session.exec(
        select(Finance).where(Finance.bank_account_id == account_id)
    ).first()
    if linked:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete — finance records are linked to this account"
        )

    session.delete(existing)
    session.commit()
    return {"message": "Bank account deleted successfully"}
