from sqlmodel import Session, select
from models import Admin, FinanceCategory
from admin_db import engine
import bcrypt


# --- Seed default admin account ---
def seed_admin(session: Session):
    existing = session.exec(select(Admin)).first()
    if existing:
        print("Admin already exists, skipping.")
        return

    hashed_password = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    admin = Admin(
        company_name="HRMS Company",
        website="https://hrms.com",
        address="Default Address",
        phone="0000000000",
        email="admin@hrms.com",
        password=hashed_password,
        access_key="hrms-default-access-key",
    )
    session.add(admin)
    session.commit()
    print("Default admin seeded (email: admin@hrms.com, password: admin123, access_key: hrms-default-access-key).")


# --- Seed default finance categories ---
def seed_categories(session: Session):
    default_categories = [
        ("Salaries", "Blue"),
        ("With Holding Income Tax", "Black"),
        ("Office Expenses", "Golden / Orange"),
        ("Office Rent", "Red"),
        ("Loan", "Parrot Green"),
        ("Benefits", "Parrot Green"),
        ("Utility Bills", "Pink"),
        ("Bank Charges", "Purple"),
        ("Remittance", "Green")
    ]

    for name, color in default_categories:
        existing = session.exec(
            select(FinanceCategory).where(FinanceCategory.category_name == name)
        ).first()
        if not existing:
            session.add(FinanceCategory(category_name=name, color_code=color))

    session.commit()
    print("Default finance categories seeded successfully.")


# --- Run seeders ---
if __name__ == "__main__":
    with Session(engine) as session:
        seed_admin(session)
        seed_categories(session)
