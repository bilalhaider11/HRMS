import datetime
from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class FinanceCategoryBase(SQLModel):
    category_name: str
    color_code: str


class FinanceCategory(FinanceCategoryBase, table=True):
    __tablename__ = 'financecategory'
    category_id: Optional[int] = Field(default=None, primary_key=True, index=True)


class FinanceBase(SQLModel):
    date: date
    description: str
    amount: float
    tax_deductions: float
    cheque_number: Optional[str] = None
    category_id: int = Field(foreign_key='financecategory.category_id')
    bank_account_id: int = Field(foreign_key='bank_account.id')


class FinanceUpdate(SQLModel):
    date: Optional[datetime.date] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    tax_deductions: Optional[float] = None
    cheque_number: Optional[str] = None
    category_id: Optional[int] = None
    bank_account_id: Optional[int] = None


class Finance(FinanceBase, table=True):
    __tablename__ = "finance"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)

    added_by: Optional[int] = Field(default=None, foreign_key='admin.id')
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))


class FinanceEditHistory(SQLModel, table=True):
    __tablename__ = "finance_edit_history"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    finance_id: int = Field(foreign_key="finance.id")
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    edited_by: Optional[int] = Field(default=None, foreign_key='admin.id')
    edited_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))

