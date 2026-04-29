import datetime
from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


# --- Attendance Models ---
class AttendanceRaw(SQLModel, table=True):
    __tablename__ = "attendance_raw"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    serial_number: str
    employee_code: str
    status: int
    timestamp: datetime.datetime
    date: date