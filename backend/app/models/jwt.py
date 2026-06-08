
import datetime
from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

# --- JWT Tokens ---
class jwt_tokens(SQLModel, table=True):
    __tablename__ = "jwt_tokens"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    client_ip: str = Field(..., min_length=1)
    token: str = Field(..., min_length=1)

    created_at: date = Field(default_factory=date.today)