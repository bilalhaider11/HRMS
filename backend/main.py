from fastapi import FastAPI, Depends, HTTPException, APIRouter, Request
from sqlmodel import Session, select
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, date
from typing import Optional, List
import admin_db, auth, employee_db, increment_db, finance_db, store_db, team_db
from models import AdminBase, EmployeeBase, AdditionalRoleBase, EmployeeIncrementBase, FinanceBase, StoreBase, ItemCategoryBase, StoreItemsBase, TeamBase
from increment_db import IncrementUpdate, IncrementCreate, IncrementResponse
# Initialize FastAPI app
app = FastAPI(title="Celestials Management System")

# ------------------ Middleware ------------------
@app.middleware("http")
async def auto_auth_middleware(request: Request, call_next):
    client_ip = request.client.host
    # Skip login endpoint
    if request.url.path.endswith("/admin/login") and request.method == "POST":
        return await call_next(request)

    with Session(admin_db.engine) as session:
        token_record = admin_db.get_client_token_in_db(client_ip, session)
        if token_record:
            request.headers.__dict__["_list"].append(
                (b"authorization", f"Bearer {token_record}".encode())
            )
    return await call_next(request)


# ------------------ Admin Endpoints ------------------
admin_router = APIRouter(prefix="/admin")

# Register admin
@app.post("/register_admin", status_code=201)
def register_admin(admin: AdminBase, session: Session = Depends(admin_db.get_session)):
    existing_admin = session.exec(select(admin_db.Admin)).first()
    if existing_admin:
        raise HTTPException(status_code=409, detail="Admin already exists")
    db_admin = admin_db.create_admin_in_db(admin, session)
    return {"message": "Admin created successfully", "admin_id": db_admin["admin"]}


# Admin login
@admin_router.post("/login", status_code=200)
def admin_login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(admin_db.get_session),
                request: Request = None):
    admin = session.exec(select(admin_db.Admin).where(admin_db.Admin.email == form_data.username)).first()
    if not admin or admin.password != form_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = auth.create_access_token(data={"user_id": admin.id}, expires_delta=access_token_expires)

    client_ip = request.client.host
    admin_db.add_jwt_token_in_db(client_ip, token, session)

    return {"access_token": token, "token_type": "bearer"}


# Get company profile
@admin_router.get("/company_profile")
def get_company_profile(session: Session = Depends(admin_db.get_session)):
    admin = session.exec(select(admin_db.Admin)).first()
    if not admin:
        raise HTTPException(status_code=404, detail="No admin found. Please register first.")
    return {
        "company_name": admin.company_name,
        "website": admin.website,
        "address": admin.address,
        "phone": admin.phone,
        "email": admin.email
    }

# Update admin password
@admin_router.patch("/update_password")
def update_password(old_password: str, new_password: str, session: Session = Depends(admin_db.get_session)):
    admin = session.exec(select(admin_db.Admin)).first()
    if not admin:
        raise HTTPException(status_code=404, detail="No admin found. Please register first.")
    if admin.password != old_password:
        raise HTTPException(status_code=401, detail="Old password is incorrect")
    return admin_db.update_password_in_db(old_password, new_password, admin, session)


# ------------------ Employee Endpoints ------------------
@admin_router.post("/create_employee")
def create_employee(employee: EmployeeBase, lst: List[AdditionalRoleBase],
                    session: Session = Depends(admin_db.get_session)):
    return employee_db.register_new_employee_in_db(employee, lst, session=session)

@admin_router.patch("/update_employee_details")
def update_employee(employee_id: str, employee: EmployeeBase, session: Session = Depends(admin_db.get_session)):
    return employee_db.update_employee_details_in_db(employee_id, employee, session=session)

@admin_router.patch("/deactivate_employee")
def deactivate_employee(employee_id: str, session: Session = Depends(admin_db.get_session)):
    return employee_db.deactivate_employee_in_db(employee_id, session=session)

@admin_router.get("/display_all_employees")
def display_employees(page: int = 1, page_size: int = 10, department: Optional[str] = None, team: Optional[str] = None,
                      session: Session = Depends(admin_db.get_session)):
    return employee_db.display_all_employee_in_db(page, page_size, department, team, session=session)

@admin_router.put("/update_roles")
def update_roles(employee_id: str, lst: List[AdditionalRoleBase], session: Session = Depends(admin_db.get_session)):
    return employee_db.update_roles_in_db(employee_id, lst, session=session)


# ------------------ Employee Increment Endpoints ------------------
@admin_router.post("/create_increment", response_model=IncrementResponse)
def create_increment(new_increment: IncrementCreate, session: Session = Depends(admin_db.get_session)):
    """
    User enters business ID (string) here. Backend will lookup Employee.id internally.
    """
    return increment_db.create_increment_in_db(new_increment, session=session)


# ---------------- GET Increment by ID ----------------
@admin_router.get("/get_increment/{increment_id}", response_model=IncrementResponse)
def get_increment(increment_id: int, session: Session = Depends(admin_db.get_session)):
    """
    Get increment by primary key id.
    """
    return increment_db.get_increment_by_id_in_db(increment_id, session=session)


# ---------------- UPDATE Increment ----------------
@admin_router.patch("/update_increment/{increment_id}", response_model=IncrementResponse)
def update_increment(increment_id: int, new_increment: IncrementUpdate, session: Session = Depends(admin_db.get_session)):
    """
    Update increment. Use primary key id in path, not business ID.
    """
    return increment_db.update_increment_in_db(increment_id, new_increment, session=session)


# ---------------- DELETE Increment ----------------
@admin_router.delete("/delete_increment/{increment_id}")
def delete_increment(increment_id: int, session: Session = Depends(admin_db.get_session)):
    """
    Delete increment by primary key id.
    """
    return increment_db.delete_increment_in_db(increment_id, session=session)


# ------------------ Finance Endpoints ------------------
finance_router = APIRouter(prefix="/finance")

@finance_router.post("/create_finance_record")
def create_finance(finance: FinanceBase, session: Session = Depends(admin_db.get_session)):
    return finance_db.create_finance_in_db(finance, session=session)

@finance_router.patch("/edit_finance_record")
def edit_finance(finance_id: int, finance: FinanceBase, session: Session = Depends(admin_db.get_session)):
    return finance_db.edit_finance_record_in_db(finance_id, finance, session=session)

@finance_router.delete("/delete_finance_record")
def delete_finance(finance_id: int, session: Session = Depends(admin_db.get_session)):
    return finance_db.delete_finance_record_in_db(finance_id, session=session)

@finance_router.get("/get_finance_records")
def get_finance_records(page: int = 1, page_size: int = 10,
                        start_date: Optional[date] = None, end_date: Optional[date] = None,
                        category_id: Optional[int] = None, session: Session = Depends(admin_db.get_session)):
    return finance_db.get_finance_records_in_db(page, page_size, start_date, end_date, category_id, session=session)


# ------------------ Store Endpoints ------------------
store_router = APIRouter(prefix="/store")

@store_router.post("/new_store")
def create_store(store: StoreBase, session: Session = Depends(admin_db.get_session)):
    return store_db.create_new_store_in_db(store, session=session)

@store_router.patch("/update_store")
def update_store(store_id: int, store: StoreBase, session: Session = Depends(admin_db.get_session)):
    return store_db.update_store_details_in_db(store_id, store, session=session)

@store_router.get("/get_all_stores")
def get_all_stores(page: int, page_size: int, session: Session = Depends(admin_db.get_session)):
    return store_db.get_all_stores_in_db(page, page_size, session=session)

@store_router.post("/create_category_for_store_items")
def create_item_category(item_category: ItemCategoryBase, session: Session = Depends(admin_db.get_session)):
    return store_db.create_new_category_for_store_items_in_db(item_category, session=session)

@store_router.patch("/update_category_for_store_items")
def update_item_category(item_category_id: int, item_category: ItemCategoryBase, session: Session = Depends(admin_db.get_session)):
    return store_db.update_category_for_store_items_in_db(item_category_id, item_category, session=session)


@store_router.get("/get_store_by_id")
def get_store_by_id(store_id: int, session: Session = Depends(admin_db.get_session)):

    return store_db.get_store_by_id_in_db(store_id, session=session)
@store_router.get("/get_category_by_id")
def get_category_by_id(
    item_category_id: int,
    store_id: int,
    session: Session = Depends(admin_db.get_session)
):
    return store_db.get_category_by_id_in_db(item_category_id, store_id, session=session)

@store_router.get("/get_all_categories")
def get_all_categories(page: int, page_size: int, store_id: int, session: Session = Depends(admin_db.get_session)):
    return store_db.get_all_categories_in_db(page, page_size, store_id, session=session)

@store_router.post("/create_store_items")
def create_store_items(item: StoreItemsBase, session: Session = Depends(admin_db.get_session)):
    return store_db.create_store_item_in_db(item, session=session)

@store_router.patch("/update_store_items_details")
def update_store_items(item_id: int, item: StoreItemsBase, session: Session = Depends(admin_db.get_session)):
    return store_db.update_store_item_in_db(item_id, item, session=session)

@store_router.get("/get_store_item_by_id")
def get_store_item(item_id: int, session: Session = Depends(admin_db.get_session)):
    return store_db.get_store_item_by_id_in_db(item_id, session=session)

@store_router.get("/get_store_items")
def get_store_items(page: int, page_size: int, category_id: int, store_id: int, session: Session = Depends(admin_db.get_session)):
    return store_db.get_store_items_in_db(page, page_size, category_id, store_id, session=session)


# ------------------ Team Endpoints ------------------
@admin_router.post("/create_team")
def create_team(team: TeamBase, session: Session = Depends(admin_db.get_session)):
    return team_db.create_team_in_db(team, session=session)

@admin_router.get("/get_team_by_id")
def get_team(team_id: int, session: Session = Depends(admin_db.get_session)):
    return team_db.get_team_by_id_in_db(team_id, session=session)

@admin_router.patch("/edit_team")
def edit_team(team_id: int, team: TeamBase, session: Session = Depends(admin_db.get_session)):
    return team_db.edit_team_in_db(team_id, team, session=session)

@admin_router.delete("/delete_team")
def delete_team(team_id: int, session: Session = Depends(admin_db.get_session)):
    return team_db.delete_team_in_db(team_id, session=session)


# ------------------ Include Routers ------------------
app.include_router(admin_router)
app.include_router(finance_router)
app.include_router(store_router)