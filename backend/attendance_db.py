# attendance_db.py
import logging
from datetime import date as date_type, datetime
from typing import Optional
from sqlmodel import select, func, Session
from models import AttendanceRaw, Admin, Employee

logger = logging.getLogger("attendance")


def validate_access_key(access_key: str, session: Session) -> bool:
    admin = session.exec(select(Admin)).first()
    if not admin or not admin.access_key:
        return False
    return access_key == admin.access_key


def insert_raw_attendances(records: list, session: Session) -> dict:
    """Insert bulk raw attendance records. Skips duplicates by employee_code + timestamp."""
    inserted = 0
    duplicates = 0
    failures = 0

    for i, raw in enumerate(records):
        try:
            timestamp = raw.get("timestamp")
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))

            if not timestamp:
                logger.warning(f"[ATTENDANCE] Record #{i+1}: FAILED - missing timestamp, raw={raw}")
                failures += 1
                continue

            employee_code = str(raw.get("employee_code", ""))
            if not employee_code:
                logger.warning(f"[ATTENDANCE] Record #{i+1}: FAILED - missing employee_code, raw={raw}")
                failures += 1
                continue

            status = raw.get("status", 0)

            # Check for duplicate: same employee_code + timestamp
            existing = session.exec(
                select(AttendanceRaw).where(
                    AttendanceRaw.employee_code == employee_code,
                    AttendanceRaw.timestamp == timestamp,
                )
            ).first()

            if existing:
                duplicates += 1
                continue

            record = AttendanceRaw(
                serial_number=str(raw.get("serial_number", "")),
                employee_code=employee_code,
                status=status,
                timestamp=timestamp,
                date=timestamp.date(),
            )
            session.add(record)
            inserted += 1
            logger.debug(f"[ATTENDANCE] Record #{i+1}: INSERT employee={employee_code} status={status} time={timestamp}")

        except Exception as e:
            logger.error(f"[ATTENDANCE] Record #{i+1}: ERROR - {e}, raw={raw}")
            failures += 1

    # Single commit for the entire batch
    if inserted > 0:
        try:
            session.commit()
            logger.info(f"[ATTENDANCE] Batch committed: {inserted} new records saved to DB")
        except Exception as e:
            logger.error(f"[ATTENDANCE] Batch COMMIT FAILED: {e}")
            session.rollback()
            return {
                "total": len(records),
                "inserted": 0,
                "duplicates_skipped": duplicates,
                "failures": failures + inserted,
            }

    if duplicates > 0:
        logger.info(f"[ATTENDANCE] {duplicates} duplicate records skipped (already in DB)")

    total = len(records)
    return {
        "total": total,
        "inserted": inserted,
        "duplicates_skipped": duplicates,
        "failures": failures,
    }


def get_attendance_records_in_db(
    page: int,
    page_size: int,
    start_date: Optional[date_type],
    end_date: Optional[date_type],
    search: Optional[str],
    status: Optional[int],
    session: Session,
) -> dict:
    """Return paginated attendance records joined with employee names."""

    # Build employee code → name map.
    # Biometric devices often send plain integer codes (e.g. "7", "32") while
    # employees may be stored as "EMP-007", "EMP-032". Map both forms so that
    # attendance records resolve names regardless of which format is stored.
    employees = session.exec(select(Employee)).all()
    emp_map: dict = {}
    for e in employees:
        emp_map[e.employee_code] = e.name
        if "-" in e.employee_code:
            suffix = e.employee_code.rsplit("-", 1)[-1]
            try:
                emp_map[str(int(suffix))] = e.name  # "EMP-007" → also map "7"
            except ValueError:
                pass

    # If search term matches an employee name or code, collect all matching
    # attendance codes (both stored format and numeric biometric format).
    matching_codes: Optional[set] = None
    if search:
        search_lower = search.strip().lower()
        matching_codes = set()
        for e in employees:
            if search_lower in e.name.lower() or search_lower in e.employee_code.lower():
                matching_codes.add(e.employee_code)
                if "-" in e.employee_code:
                    suffix = e.employee_code.rsplit("-", 1)[-1]
                    try:
                        matching_codes.add(str(int(suffix)))
                    except ValueError:
                        pass

    # Build base query
    base = select(AttendanceRaw)
    if start_date:
        base = base.where(AttendanceRaw.date >= start_date)
    if end_date:
        base = base.where(AttendanceRaw.date <= end_date)
    if matching_codes is not None:
        if not matching_codes:
            return {"items": [], "total_count": 0, "page": page, "total_pages": 1}
        base = base.where(AttendanceRaw.employee_code.in_(matching_codes))
    if status is not None:
        base = base.where(AttendanceRaw.status == status)

    # Count
    count_q = select(func.count(AttendanceRaw.id))
    if start_date:
        count_q = count_q.where(AttendanceRaw.date >= start_date)
    if end_date:
        count_q = count_q.where(AttendanceRaw.date <= end_date)
    if matching_codes is not None:
        count_q = count_q.where(AttendanceRaw.employee_code.in_(matching_codes))
    if status is not None:
        count_q = count_q.where(AttendanceRaw.status == status)
    total_count = session.exec(count_q).one()

    # Paginate
    records = session.exec(
        base.order_by(AttendanceRaw.date.desc(), AttendanceRaw.timestamp.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
    ).all()

    status_label = {0: "Check In", 1: "Check Out"}

    items = [
        {
            "id": r.id,
            "date": str(r.date),
            "timestamp": r.timestamp.isoformat(),
            "employee_code": r.employee_code,
            "employee_name": emp_map.get(r.employee_code, "—"),
            "status": r.status,
            "status_label": status_label.get(r.status, str(r.status)),
            "serial_number": r.serial_number,
        }
        for r in records
    ]

    return {
        "items": items,
        "total_count": total_count,
        "page": page,
        "total_pages": max(1, (total_count + page_size - 1) // page_size),
    }
