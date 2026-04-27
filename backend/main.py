from fastapi import FastAPI, Depends, HTTPException, APIRouter, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, date
from typing import Optional
import admin_db, auth, employee_db, increment_db, finance_db, inventory_db, attendance_db, bank_account_db,teams_db
from models import AdminProfileUpdate, AdminPasswordUpdate, EmployeeBase, EmployeeUpdate, FinanceBase, FinanceUpdate, ItemCategoryBase, ItemCategoryUpdate, InventoryItemBase, InventoryItemUpdate
from models import Admin
from increment_db import IncrementUpdate, IncrementCreate, IncrementResponse
import os, uuid

# Initialize FastAPI app
app = FastAPI(title="Celestials Management System")

# Serve uploaded files publicly
os.makedirs("uploads/profile_pics", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ------------------ CORS Middleware ------------------
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],#cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Auto-Auth Middleware ------------------
@app.middleware("http")
async def auto_auth_middleware(request: Request, call_next):
    if request.url.path == "/admin/login" and request.method == "POST":
        return await call_next(request)
    if request.url.path.startswith("/attendances/"):
        return await call_next(request)

    try:
        client_ip = request.client.host if request.client else None
        if client_ip:
            with Session(admin_db.engine) as session:
                token_record = admin_db.get_client_token_in_db(client_ip, session)
                if token_record:
                    request.headers.__dict__["_list"].append(
                        (b"authorization", f"Bearer {token_record}".encode())
                    )
    except Exception:
        pass

    return await call_next(request)


# ------------------ Routers ------------------
admin_public_router = APIRouter(prefix="/admin")
admin_router = APIRouter(prefix="/admin", dependencies=[Depends(auth.get_current_user)])
finance_router = APIRouter(prefix="/finance", dependencies=[Depends(auth.get_current_user)])
bank_account_router = APIRouter(prefix="/bank_accounts", dependencies=[Depends(auth.get_current_user)])
inventory_router = APIRouter(prefix="/inventory", dependencies=[Depends(auth.get_current_user)])


# ------------------ Public Admin Endpoints ------------------

@admin_public_router.post("/login", status_code=200)
def admin_login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(admin_db.get_session),
                request: Request = None):
    admin = session.exec(select(admin_db.Admin).where(admin_db.Admin.email == form_data.username)).first()
    if not admin or not auth.verify_password(form_data.password, admin.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = auth.create_access_token(data={"user_id": admin.id}, expires_delta=access_token_expires)

    client_ip = request.client.host if request and request.client else "unknown"
    admin_db.add_jwt_token_in_db(client_ip, token, session)

    return {"access_token": token, "token_type": "bearer"}


# ------------------ Protected Admin Endpoints ------------------

@admin_router.get("/company_profile")
def get_company_profile(current_user: Admin = Depends(auth.get_current_user)):
    return {
        "company_name": current_user.company_name,
        "website": current_user.website,
        "address": current_user.address,
        "phone": current_user.phone,
        "email": current_user.email,
        "access_key": current_user.access_key or "",
    }

@admin_router.patch("/update_company_profile")
def update_company_profile(profile: AdminProfileUpdate, current_user: Admin = Depends(auth.get_current_user),
                           session: Session = Depends(admin_db.get_session)):
    return admin_db.update_company_profile_in_db(profile, current_user, session)

@admin_router.patch("/update_password")
def update_password(passwords: AdminPasswordUpdate, current_user: Admin = Depends(auth.get_current_user),
                    session: Session = Depends(admin_db.get_session)):
    if not auth.verify_password(passwords.old_password, current_user.password):
        raise HTTPException(status_code=401, detail="Old password is incorrect")
    return admin_db.update_password_in_db(passwords.new_password, current_user, session)

@admin_router.patch("/update_access_key")
def update_access_key(payload: dict, current_user: Admin = Depends(auth.get_current_user),
                      session: Session = Depends(admin_db.get_session)):
    new_key = payload.get("access_key", "").strip()
    if not new_key:
        raise HTTPException(status_code=400, detail="Access key cannot be empty")
    current_user.access_key = new_key
    session.add(current_user)
    session.commit()
    return {"message": "Access key updated successfully"}


# ------------------ File Upload ------------------
@admin_router.post("/upload_profile_pic")
def upload_profile_pic(file: UploadFile = File(...)):
    allowed = {"image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="File type not allowed. Use JPG, PNG, GIF, SVG, or WebP.")

    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = f"uploads/profile_pics/{filename}"

    with open(filepath, "wb") as f:
        f.write(file.file.read())

    return {"url": f"/uploads/profile_pics/{filename}"}


# ------------------ Employee Endpoints ------------------
@admin_router.post("/create_employee")
def create_employee(employee: EmployeeBase, session: Session = Depends(admin_db.get_session)):
    return employee_db.register_new_employee_in_db(employee, session=session)

@admin_router.patch("/update_employee_details")
def update_employee(employee_code: str, employee: EmployeeUpdate, session: Session = Depends(admin_db.get_session)):
    return employee_db.update_employee_details_in_db(employee_code, employee, session=session)

@admin_router.patch("/deactivate_employee")
def deactivate_employee(employee_code: str, session: Session = Depends(admin_db.get_session)):
    return employee_db.deactivate_employee_in_db(employee_code, session=session)

@admin_router.get("/display_all_employees")
def display_employees(page: int = 1, page_size: int = 10, department: Optional[str] = None,
                      search: Optional[str] = None, status: Optional[str] = None,
                      session: Session = Depends(admin_db.get_session)):
    return employee_db.display_all_employee_in_db(page, page_size, department, search, status, session=session)


# ------------------ Employee Increment Endpoints ------------------
@admin_router.post("/create_increment", response_model=IncrementResponse)
def create_increment(new_increment: IncrementCreate, session: Session = Depends(admin_db.get_session)):
    return increment_db.create_increment_in_db(new_increment, session=session)

@admin_router.get("/get_increment/{increment_id}", response_model=IncrementResponse)
def get_increment(increment_id: int, session: Session = Depends(admin_db.get_session)):
    return increment_db.get_increment_by_id_in_db(increment_id, session=session)

@admin_router.patch("/update_increment/{increment_id}", response_model=IncrementResponse)
def update_increment(increment_id: int, new_increment: IncrementUpdate, session: Session = Depends(admin_db.get_session)):
    return increment_db.update_increment_in_db(increment_id, new_increment, session=session)

@admin_router.delete("/delete_increment/{increment_id}")
def delete_increment(increment_id: int, session: Session = Depends(admin_db.get_session)):
    return increment_db.delete_increment_in_db(increment_id, session=session)

@admin_router.get("/get_increments/{employee_code}")
def get_employee_increments(employee_code: str, session: Session = Depends(admin_db.get_session)):
    return increment_db.get_increments_by_business_id(employee_code, session=session)


# ------------------ Bank Account Endpoints ------------------
@bank_account_router.get("/")
def get_bank_accounts(session: Session = Depends(admin_db.get_session)):
    return bank_account_db.get_all_bank_accounts_in_db(session=session)

@bank_account_router.post("/")
def create_bank_account(payload: dict, session: Session = Depends(admin_db.get_session)):
    return bank_account_db.create_bank_account_in_db(payload, session=session)

@bank_account_router.patch("/{account_id}")
def update_bank_account(account_id: int, payload: dict, session: Session = Depends(admin_db.get_session)):
    return bank_account_db.update_bank_account_in_db(account_id, payload, session=session)

@bank_account_router.delete("/{account_id}")
def delete_bank_account(account_id: int, session: Session = Depends(admin_db.get_session)):
    return bank_account_db.delete_bank_account_in_db(account_id, session=session)


# ------------------ Finance Endpoints ------------------
@finance_router.post("/create_finance_record")
def create_finance(finance: FinanceBase, session: Session = Depends(admin_db.get_session)):
    return finance_db.create_finance_in_db(finance, session=session)

@finance_router.patch("/edit_finance_record")
def edit_finance(finance_id: int, finance: FinanceUpdate, session: Session = Depends(admin_db.get_session)):
    return finance_db.edit_finance_record_in_db(finance_id, finance, session=session)

@finance_router.get("/get_finance_records")
def get_finance_records(page: int = 1, page_size: int = 10,
                        start_date: Optional[date] = None, end_date: Optional[date] = None,
                        category_id: Optional[int] = None, bank_account_id: Optional[int] = None,
                        session: Session = Depends(admin_db.get_session)):
    return finance_db.get_finance_records_in_db(
        page, page_size, start_date, end_date, category_id, bank_account_id, session=session
    )

@finance_router.get("/get_edit_history/{finance_id}")
def get_finance_edit_history(finance_id: int, session: Session = Depends(admin_db.get_session)):
    return finance_db.get_edit_history_in_db(finance_id, session=session)

@finance_router.get("/monthly_summary")
def get_monthly_summary(bank_account_id: int, year: Optional[int] = None,
                        session: Session = Depends(admin_db.get_session)):
    return finance_db.get_monthly_summary_in_db(bank_account_id, year or date.today().year, session=session)


# --- Finance Categories ---
@finance_router.get("/get_all_categories")
def get_finance_categories(session: Session = Depends(admin_db.get_session)):
    return finance_db.get_all_categories_in_db(session=session)

@finance_router.post("/create_category")
def create_finance_category(payload: dict, session: Session = Depends(admin_db.get_session)):
    return finance_db.create_category_in_db(
        payload.get("category_name", ""), payload.get("color_code", ""), session=session
    )

@finance_router.patch("/update_category/{category_id}")
def update_finance_category(category_id: int, payload: dict, session: Session = Depends(admin_db.get_session)):
    return finance_db.update_category_in_db(
        category_id, payload.get("category_name", ""), payload.get("color_code", ""), session=session
    )

@finance_router.delete("/delete_category/{category_id}")
def delete_finance_category(category_id: int, session: Session = Depends(admin_db.get_session)):
    return finance_db.delete_category_in_db(category_id, session=session)


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


# ------------------ Attendance Endpoints ------------------
import logging
attendance_logger = logging.getLogger("attendance")
attendance_router = APIRouter(prefix="/attendances")

@admin_router.get("/attendance_records")
def get_attendance_records(
    page: int = 1, page_size: int = 50,
    start_date: Optional[date] = None, end_date: Optional[date] = None,
    search: Optional[str] = None,
    status: Optional[int] = None,
    session: Session = Depends(admin_db.get_session),
):
    return attendance_db.get_attendance_records_in_db(page, page_size, start_date, end_date, search, status, session=session)

@attendance_router.post("/bulk-raw-attendance")
def create_bulk_raw_attendance(payload: dict, request: Request, session: Session = Depends(admin_db.get_session)):
    client_ip = request.client.host if request.client else "unknown"
    attendance_logger.info(f"[ATTENDANCE] Incoming request from {client_ip}")

    access_key = request.headers.get("access-key")
    if not access_key:
        raise HTTPException(status_code=403, detail="access-key header is required")

    if not attendance_db.validate_access_key(access_key, session):
        raise HTTPException(status_code=403, detail="Invalid access-key")

    records = payload.get("createBulkAttendanceRaw", [])
    if not records:
        raise HTTPException(status_code=400, detail="No attendance records provided")

    result = attendance_db.insert_raw_attendances(records, session)
    result["message"] = f"{result['inserted']} of {result['total']} records inserted successfully"
    return result


#...................... Teams implementation............................................
@admin_router.post("/create_team")
def create_team(
    payload: dict,
    current_user: Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    return teams_db.create_team_in_db(payload, company_id=current_user.id, session=session)


@admin_router.get("/get_teams")
def get_teams(
    current_user: Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    return teams_db.get_teams_in_db(company_id=current_user.id, session=session)


@admin_router.get("/get_team/{team_id}")
def get_team(
    team_id: int,
    current_user: Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    return teams_db.get_team_by_id_in_db(team_id, company_id=current_user.id, session=session)


@admin_router.patch("/update_team/{team_id}")
def update_team(
    team_id: int,
    payload: dict,
    current_user: Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    return teams_db.update_team_in_db(team_id, payload, company_id=current_user.id, session=session)


@admin_router.delete("/delete_team/{team_id}")
def delete_team(
    team_id: int,
    current_user: Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    return teams_db.delete_team_in_db(team_id, company_id=current_user.id, session=session)


# ------------------ Include Routers ------------------
app.include_router(admin_public_router)
app.include_router(admin_router)
app.include_router(bank_account_router)
app.include_router(finance_router)
app.include_router(inventory_router)
app.include_router(attendance_router)
