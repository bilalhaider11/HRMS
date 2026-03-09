from sqlmodel import Session, select
from models import AdditionalRole, FinanceCategory, Admin
from admin_db import engine

# --- Seed default roles ---
def seed_roles(session: Session):
    default_roles = [
        {"role_name": "hr", "role_description": "salary_management"},
        {"role_name": "teamlead", "role_description": "operations_manager"}
    ]

    for role_data in default_roles:
        existing = session.exec(
            select(AdditionalRole).where(AdditionalRole.role_name == role_data["role_name"])
        ).first()
        if not existing:
            session.add(AdditionalRole(**role_data))

    session.commit()
    print("✅ Default roles seeded successfully.")


# --- Seed default finance categories ---
def seed_categories(session: Session):
    # Default categories with colors
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
        # Check if category already exists
        existing = session.exec(
            select(FinanceCategory).where(FinanceCategory.category_name == name)
        ).first()
        if not existing:
            session.add(FinanceCategory(category_name=name, color_code=color))

    session.commit()
    print("✅ Default finance categories seeded successfully!")


# --- Run seeders ---
if __name__ == "__main__":
    with Session(engine) as session:
        seed_roles(session)
        seed_categories(session)