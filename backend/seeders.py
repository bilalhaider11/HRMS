from sqlmodel import Session, select
from models import AdditionalRole, FinanceCategory, Admin
from admin_db import engine

# for roles table
def seed_roles(session: Session):
    default_roles = [
        {"role_name": "hr", "role_description": "salary_management"},
        {"role_name": "teamlead", "role_description": "operations_manager"}
    ]

    for role_data in default_roles:
        existing = session.exec(select(AdditionalRole).where(AdditionalRole.role_name == role_data["role_name"])).first()
        if not existing:
            session.add(AdditionalRole(**role_data))

    session.commit()
    print("Default roles seeded successfully.")

#for Finance Categories table
def seed_categories(session: Session):
    # --- Default categories with colors ---
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

    # Grab a company/admin to associate these categories
    company = session.exec(select(Admin)).first()
    if not company:
        raise ValueError("No admin/company found to associate categories with!")

    for name, color in default_categories:
        category = FinanceCategory(
            category_name=name,
            color_code=color,
            company_id=company.id
        )
        session.add(category)
    session.commit()

    print("✅ Default finance categories seeded successfully!")

if __name__ == "__main__":
    with Session(engine) as session:
        seed_roles(session)
        seed_categories(session)