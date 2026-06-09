from sqlmodel import Session, select
from app.models.admin import Admin
from app.models.finance import FinanceCategory
from app.db.session import engine
import bcrypt
import logging

logger = logging.getLogger(__name__)


# --- Seed default admin account ---
def seed_admin(session: Session):
    existing = session.exec(select(Admin)).first()
    if existing:
        logger.info("Admin already exists, skipping.")
        return

    hashed_password = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    hashed_access_key = bcrypt.hashpw("hrms-default-access-key".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    admin = Admin(
        company_name="HRMS Company",
        website="https://hrms.com",
        address="Default Address",
        phone="0000000000",
        email="admin@hrms.com",
        password=hashed_password,
        access_key=hashed_access_key,
    )
    session.add(admin)
    session.commit()
    logger.info("Default admin seeded (email: admin@hrms.com, password: admin123, access_key: hrms-default-access-key).")


# --- Seed default finance categories ---
def seed_categories(session: Session):
    default_categories = [
        ("Salaries", "#3B82F6"),
        ("With Holding Income Tax", "#1E293B"),
        ("Office Expenses", "#F59E0B"),
        ("Office Rent", "#EF4444"),
        ("Loan", "#22C55E"),
        ("Reimbursement", "#10B981"),
        ("Utility Bills", "#EC4899"),
        ("Bank Charges", "#8B5CF6"),
        ("Income (Remittance)", "#14B8A6"),
        ("Income (Others)", "#06B6D4")
    ]

    # Rename old categories to new names
    renames = {
        "Benefits": "Reimbursement",
        "Remittance": "Income (Remittance)",
    }
    for old_name, new_name in renames.items():
        old_cat = session.exec(
            select(FinanceCategory).where(FinanceCategory.category_name == old_name)
        ).first()
        if old_cat:
            old_cat.category_name = new_name
            logger.info(f"Renamed category '{old_name}' -> '{new_name}'")

    # Upsert: create missing categories, fix color codes on existing ones
    for name, color in default_categories:
        existing = session.exec(
            select(FinanceCategory).where(FinanceCategory.category_name == name)
        ).first()
        if existing:
            if existing.color_code != color:
                existing.color_code = color
                logger.info(f"Updated color for '{name}' -> {color}")
        else:
            session.add(FinanceCategory(category_name=name, color_code=color))

    # Remove dropped categories
    dropped = ["Cancelled?"]
    for name in dropped:
        old = session.exec(
            select(FinanceCategory).where(FinanceCategory.category_name == name)
        ).first()
        if old:
            session.delete(old)
            logger.info(f"Removed category '{name}'")

    session.commit()
    logger.info("Default finance categories seeded successfully.")


# --- Run seeders ---
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    with Session(engine) as session:
        seed_admin(session)
        seed_categories(session)
