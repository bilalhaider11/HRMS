from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from pydantic import BaseModel
from sqlmodel import Session, SQLModel
from app.services import admin_db
from app.services import auth
from app.services import attendance_db


class AttendanceRecord(BaseModel):
    timestamp: str
    employee_code: str
    status: int = 0
    serial_number: str = ""


class BulkAttendancePayload(SQLModel):
    createBulkAttendanceRaw: List[AttendanceRecord] = []

router = APIRouter(prefix="/admin", dependencies=[Depends(auth.get_current_user)])
attendance_router = APIRouter(prefix="/attendance")

@router.get("/attendance_records")
def get_attendance_records(
    page: int = 1,
    page_size: int = Query(default=50, ge=1, le=200),
    start_date: date | None = None,
    end_date: date | None = None,
    search: str | None = None,
    status: int | None = None,
    session: Session = Depends(admin_db.get_session),
):
    return attendance_db.get_attendance_records_in_db(page, page_size, start_date, end_date, search, status, session=session)


@attendance_router.post("/bulk-raw-attendance")
def create_bulk_raw_attendance(payload: BulkAttendancePayload, request: Request, session: Session = Depends(admin_db.get_session)):
    access_key = request.headers.get("access-key")
    if not access_key:
        raise HTTPException(status_code=403, detail="access-key header is required")

    if not attendance_db.validate_access_key(access_key, session):
        raise HTTPException(status_code=403, detail="Invalid access-key")

    records = payload.createBulkAttendanceRaw
    if not records:
        raise HTTPException(status_code=400, detail="No attendance records provided")

    result = attendance_db.insert_raw_attendances(records, session)
    result["message"] = f"{result['inserted']} of {result['total']} records inserted successfully"
    return result
