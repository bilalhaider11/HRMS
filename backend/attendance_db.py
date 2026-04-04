# attendance_db.py
import logging
from sqlmodel import select, Session
from models import AttendanceRaw, Admin
from datetime import datetime

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
