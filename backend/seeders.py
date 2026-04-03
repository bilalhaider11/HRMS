from sqlmodel import Session, select
from models import FinanceCategory
from admin_db import engine


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
        ("Remittance", "Green"),
        ("Cancelled?", "Light Gray")
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
        seed_categories(session)
