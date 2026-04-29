import datetime
from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


# --- Bank Account Models ---
class BankAccountBase(SQLModel):
    account_name: str = Field(..., min_length=1)
    bank_name: str = Field(..., min_length=1)
    account_number: str = Field(..., min_length=1)
    branch_code: Optional[str] = None
    iban_number: Optional[str] = None
    opening_balance: float = Field(default=0.0)


class BankAccount(BankAccountBase, table=True):
    __tablename__ = "bank_account"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)