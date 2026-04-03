from fastapi import FastAPI, Depends, HTTPException, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, date
from typing import Optional, List
import admin_db, auth, employee_db, increment_db, finance_db, inventory_db
from models import AdminBase, AdminProfileUpdate, AdminPasswordUpdate, EmployeeBase, AdditionalRoleBase, FinanceBase, FinanceUpdate, ItemCategoryBase, ItemCategoryUpdate, InventoryItemBase, InventoryItemUpdate
from models import Admin
from increment_db import IncrementUpdate, IncrementCreate, IncrementResponse
# Initialize FastAPI app
app = FastAPI(title="Celestials Management System")

# ------------------ CORS Middleware ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Auto-Auth Middleware ------------------
@app.middleware("http")
async def auto_auth_middleware(request: Request, call_next):
    client_ip = request.client.host
    # Skip public endpoints
    if request.url.path in ("/admin/login", "/admin/register_admin") and request.method == "POST":
        return await call_next(request)

    with Session(admin_db.engine) as session:
        token_record = admin_db.get_client_token_in_db(client_ip, session)
        if token_record:
            request.headers.__dict__["_list"].append(
                (b"authorization", f"Bearer {token_record}".encode())
            )
    return await call_next(request)


# ------------------ Routers ------------------
# Public admin routes (no auth required)
admin_public_router = APIRouter(prefix="/admin")

# Protected admin routes (auth required)
admin_router = APIRouter(prefix="/admin", dependencies=[Depends(auth.get_current_user)])

# Protected feature routers
finance_router = APIRouter(prefix="/finance", dependencies=[Depends(auth.get_current_user)])
inventory_router = APIRouter(prefix="/inventory", dependencies=[Depends(auth.get_current_user)])


# ------------------ Public Admin Endpoints ------------------

# Register admin
@admin_public_router.post("/register_admin", status_code=201)
def register_admin(admin: AdminBase, session: Session = Depends(admin_db.get_session)):
    existing_admin = session.exec(select(admin_db.Admin)).first()
    if existing_admin:
        raise HTTPException(status_code=409, detail="Admin already exists")
    db_admin = admin_db.create_admin_in_db(admin, session)
    return {"message": "Admin created successfully", "admin_id": db_admin["admin"]}


# Admin login
@admin_public_router.post("/login", status_code=200)
def admin_login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(admin_db.get_session),
                request: Request = None):
    admin = session.exec(select(admin_db.Admin).where(admin_db.Admin.email == form_data.username)).first()
    if not admin or not auth.verify_password(form_data.password, admin.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = auth.create_access_token(data={"user_id": admin.id}, expires_delta=access_token_expires)

    client_ip = request.client.host
    admin_db.add_jwt_token_in_db(client_ip, token, session)

    return {"access_token": token, "token_type": "bearer"}


# ------------------ Protected Admin Endpoints ------------------

# Get company profile
@admin_router.get("/company_profile")
def get_company_profile(current_user: Admin = Depends(auth.get_current_user)):
    return {
        "company_name": current_user.company_name,
        "website": current_user.website,
        "address": current_user.address,
        "phone": current_user.phone,
        "email": current_user.email
    }

# Edit company profile
@admin_router.patch("/update_company_profile")
def update_company_profile(profile: AdminProfileUpdate, current_user: Admin = Depends(auth.get_current_user),
                           session: Session = Depends(admin_db.get_session)):
    return admin_db.update_company_profile_in_db(profile, current_user, session)


# Update admin password
@admin_router.patch("/update_password")
def update_password(passwords: AdminPasswordUpdate, current_user: Admin = Depends(auth.get_current_user),
                    session: Session = Depends(admin_db.get_session)):
    if not auth.verify_password(passwords.old_password, current_user.password):
        raise HTTPException(status_code=401, detail="Old password is incorrect")
    return admin_db.update_password_in_db(passwords.new_password, current_user, session)


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
@finance_router.post("/create_finance_record")
def create_finance(finance: FinanceBase, session: Session = Depends(admin_db.get_session)):
    return finance_db.create_finance_in_db(finance, session=session)

@finance_router.patch("/edit_finance_record")
def edit_finance(finance_id: int, finance: FinanceUpdate, session: Session = Depends(admin_db.get_session)):
    return finance_db.edit_finance_record_in_db(finance_id, finance, session=session)

@finance_router.delete("/delete_finance_record")
def delete_finance(finance_id: int, session: Session = Depends(admin_db.get_session)):
    return finance_db.delete_finance_record_in_db(finance_id, session=session)

@finance_router.get("/get_finance_records")
def get_finance_records(page: int = 1, page_size: int = 10,
                        start_date: Optional[date] = None, end_date: Optional[date] = None,
                        category_id: Optional[int] = None, session: Session = Depends(admin_db.get_session)):
    return finance_db.get_finance_records_in_db(page, page_size, start_date, end_date, category_id, session=session)


# ------------------ Inventory: Category Endpoints ------------------
@inventory_router.post("/create_category")
def create_category(category: ItemCategoryBase, session: Session = Depends(admin_db.get_session)):
    return inventory_db.create_category_in_db(category, session=session)

@inventory_router.patch("/update_category/{category_id}")
def update_category(category_id: int, category: ItemCategoryUpdate, session: Session = Depends(admin_db.get_session)):
    return inventory_db.update_category_in_db(category_id, category, session=session)

@inventory_router.get("/get_category/{category_id}")
def get_category(category_id: int, session: Session = Depends(admin_db.get_session)):
    return inventory_db.get_category_by_id_in_db(category_id, session=session)

@inventory_router.get("/get_all_categories")
def get_all_categories(page: int = 1, page_size: int = 10, session: Session = Depends(admin_db.get_session)):
    return inventory_db.get_all_categories_in_db(page, page_size, session=session)


# ------------------ Inventory: Item Endpoints ------------------
@inventory_router.post("/create_item")
def create_item(item: InventoryItemBase, session: Session = Depends(admin_db.get_session)):
    return inventory_db.create_item_in_db(item, session=session)

@inventory_router.patch("/update_item/{item_id}")
def update_item(item_id: int, item: InventoryItemUpdate, session: Session = Depends(admin_db.get_session)):
    return inventory_db.update_item_in_db(item_id, item, session=session)

@inventory_router.get("/get_item/{item_id}")
def get_item(item_id: int, session: Session = Depends(admin_db.get_session)):
    return inventory_db.get_item_by_id_in_db(item_id, session=session)

@inventory_router.get("/get_all_items")
def get_all_items(page: int = 1, page_size: int = 10, category_id: Optional[int] = None,
                  session: Session = Depends(admin_db.get_session)):
    return inventory_db.get_all_items_in_db(page, page_size, category_id, session=session)


# ------------------ Include Routers ------------------
app.include_router(admin_public_router)
app.include_router(admin_router)
app.include_router(finance_router)
app.include_router(inventory_router)
