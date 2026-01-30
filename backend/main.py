from fastapi import FastAPI, Depends, HTTPException, APIRouter, Request
from sqlmodel import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, date
import admin_db, auth, employee_db, increment_db, finance_db, store_db, team_db
from models import CompanyBase, AdminBase, EmployeeBase, AdditionalRoleBase, EmployeeIncrementBase, FinanceBase, StoreBase, ItemCategoryBase, StoreItemsBase, TeamBase
from typing import Optional

# Initialize FastAPI application
app = FastAPI(title="Celestials Management System")

# Middleware to automatically attach token for authenticated requests
@app.middleware("http")
async def auto_auth_middleware(request: Request, call_next, session: Session = Depends(admin_db.get_session)):
    client_ip = request.client.host  # Get client IP address

    # Skip token injection for admin login endpoint
    if request.url.path.endswith("/admin/login") and request.method == "POST":
        response = await call_next(request)
        try:
            data = await response.body()  # Try to read response body (optional)
        except Exception:
            data = None
        return response

    # Attach token to request headers if token exists for this client IP
    with Session(admin_db.engine) as session:
        token_record = admin_db.get_client_token_in_db(client_ip, session)
        if token_record:
            request.headers.__dict__["_list"].append(
                (b"authorization", f"Bearer {token_record}".encode())
            )

    response = await call_next(request)
    return response

# Endpoint to register a new company
@app.post("/register_new_company", status_code=201)
def register_company(company: CompanyBase, session=Depends(admin_db.get_session)):
    return admin_db.register_company_in_db(company, session)

# Router for admin-specific endpoints
admin_router = APIRouter(prefix="/admin")

# Admin login endpoint
@admin_router.post("/login", status_code=200)
def company_login(form_data: OAuth2PasswordRequestForm = Depends(), session=Depends(admin_db.get_session),
                    request: Request = None):
    # Authenticate admin credentials
    admin = auth.authenticate_admin(session, form_data.username, form_data.password)
    if not admin or admin.password != form_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate access token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = auth.create_access_token(data={"user_id": admin.id}, expires_delta=access_token_expires)

    # Store token for the client IP
    client_ip = request.client.host
    admin_db.add_jwt_token_in_db(client_ip, token, session)

    return {"access_token": token, "token_type": "bearer"}

# Endpoint to register a new admin
@app.post("/register_admin", status_code=201)
def register_admin(admin: AdminBase, session: Session = Depends(admin_db.get_session)):
    admin_db.create_admin_in_db(admin, session)
    return 'Admin Created successfully'

# Get the profile details of the current admin
@admin_router.get("/company_profile")
def get_company_profile(admin: AdminBase = Depends(auth.get_current_user)):
    return {"Comapany Name": admin.company_name, "Website": admin.website,
            "Address": admin.address, "Phone No.": admin.phone, "Email" : admin.email}

# Update company profile information
@admin_router.patch("/update_company_profile")
def update_company_profile(company_id: int, company: CompanyBase, current_admin: AdminBase = Depends(auth.get_current_user),
                            session: Session = Depends(admin_db.get_session)):
    return admin_db.update_company_profile_in_db(company_id, company, session, current_admin)

# Update admin password
@admin_router.patch("/update_password")
def update_password(old:str, new: str, current_admin: AdminBase = Depends(auth.get_current_user),
                    session: Session = Depends(admin_db.get_session)):
    return admin_db.update_password_in_db(old, new, current_admin, session)

# Register a new employee with optional additional roles
@admin_router.post("/create_employee")
def register_new_employee(employee: EmployeeBase, lst: list[AdditionalRoleBase],
                            current_admin: AdminBase = Depends(auth.get_current_user),
                            session: Session = Depends(admin_db.get_session)):
    return employee_db.register_new_employee_in_db(employee, lst, current_admin, session)

# Update existing employee details
@admin_router.patch("/update_employee_details")
def update_employee_details(employee_id: str, employee: EmployeeBase, current_admin: AdminBase = Depends(auth.get_current_user),
                            session: Session = Depends(admin_db.get_session)):
    return employee_db.update_employee_details_in_db(employee_id, employee, current_admin, session)

# Deactivate an employee account
@admin_router.patch("/deactivate_employee")
def deactivate_employee(employee_id: str, current_admin: AdminBase = Depends(auth.get_current_user),
                        session: Session = Depends(admin_db.get_session)):
    return employee_db.deactivate_employee_in_db(employee_id, current_admin, session)

# Display all employees with pagination and optional filtering by department or team
@admin_router.get("/display_all_employees")
def display_all_employee(page: int = 1, page_size: int = 10, department: Optional[str] = None, team: Optional[str] = None,
                            current_admin: AdminBase = Depends(auth.get_current_user),
                            session: Session = Depends(admin_db.get_session)):
    return employee_db.display_all_employee_in_db(page, page_size, department, team, current_admin, session)

# Update roles for an employee
@admin_router.put("/update_roles")
def update_roles(employee_id: str, lst: list[AdditionalRoleBase], current_admin: AdminBase = Depends(auth.get_current_user),
                    session: Session = Depends(admin_db.get_session)):
    return employee_db.update_roles_in_db(employee_id, lst, current_admin, session)

# Create a salary increment record for an employee
@admin_router.post("/create_increment")
def create_increment_in_db(new_increment: EmployeeIncrementBase, session: Session = Depends(admin_db.get_session), 
                            current_admin: AdminBase = Depends(auth.get_current_user)):
    return increment_db.create_increment_in_db(new_increment, session, current_admin)

# Retrieve increments for a specific employee
@admin_router.get("/get_increments")
def get_increment_by_id(id: str, session: Session = Depends(admin_db.get_session),
                    current_admin: AdminBase = Depends(auth.get_current_user)):
    return increment_db.get_increment_by_id_in_db(id, session, current_admin)

# Update an existing increment record
@admin_router.patch("/update_increment")
def update_increment(increment_id: int, new_increment: EmployeeIncrementBase, session: Session = Depends(admin_db.get_session),
                        current_admin: AdminBase = Depends(auth.get_current_user)):
    return increment_db.update_increment_in_db(increment_id, new_increment, session, current_admin)

# Delete an increment record
@admin_router.delete("/delete_increment")
def delete_increment(id: str, session: Session = Depends(admin_db.get_session),
                        current_admin: AdminBase = Depends(auth.get_current_user)):
    return increment_db.delete_increment_in_db(id, session, current_admin)

# Finance endpoints router
finance_router = APIRouter(prefix="/finance")
# Create a new finance record
@finance_router.post("/create_finance_record")
def create_finance(finance: FinanceBase, session: Session = Depends(admin_db.get_session),
                        current_admin: AdminBase = Depends(auth.get_current_user)):
    return finance_db.create_finance_in_db(finance, session, current_admin)

# Edit an existing finance record
@finance_router.patch("/edit_finance_record")
def edit_finance_record(finance_id: int,finance: FinanceBase, session: Session = Depends(admin_db.get_session),
                        current_admin: AdminBase = Depends(auth.get_current_user)):
    return finance_db.edit_finance_record_in_db(finance_id, finance, session, current_admin)

# Delete a finance record
@finance_router.delete("/delete_finance_record")
def delete_finance_record(finance_id: int, session: Session = Depends(admin_db.get_session),
                        current_admin: AdminBase = Depends(auth.get_current_user)):
    return finance_db.delete_finance_record_in_db(finance_id, session, current_admin)

# Get all finance records with optional filtering by date range or categorytheme
@finance_router.get("/get_finance_records")
def get_finance_records(page: int = 1, page_size: int = 10, start_date: Optional[date] = None,
                        end_date: Optional[date] = None, category_id: Optional[int] = None,
                        session: Session = Depends(admin_db.get_session), current_admin: AdminBase = Depends(auth.get_current_user)):
    return finance_db.get_finance_records_in_db(page, page_size, start_date, end_date, category_id, session, current_admin)

# Store endpoints router
store_router = APIRouter(prefix='/store')

# Create a new store
@store_router.post("/new_store", status_code=201)
def create_new_store(store: StoreBase, session: Session = Depends(admin_db.get_session),
                    current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.create_new_store_in_db(store, session, current_admin)

# Update store details
@store_router.patch("/update_store")
def update_store_details(store_id: int, store: StoreBase, session: Session = Depends(admin_db.get_session),
                    current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.update_store_details_in_db(store_id, store, session, current_admin)

# Get all stores with pagination
@store_router.get("/get_all_stores")
def get_all_stores(page: int, page_size: int, session: Session = Depends(admin_db.get_session),
                    current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.get_all_stores_in_db(page, page_size, session, current_admin)

# Get store details by ID
@store_router.get("/get_store_by_id")
def get_store_by_id(store_id: int, session: Session = Depends(admin_db.get_session),
                    current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.get_store_by_id_in_db(store_id, session, current_admin)

# Create a new category for store items
@store_router.post("/create_category_for_store_items", status_code=201)
def create_category_for_store_items(item_category: ItemCategoryBase, session: Session = Depends(admin_db.get_session),
                                    current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.Create_new_Category_for_store_items_in_db(item_category, session, current_admin)

# Update category details
@store_router.patch("/Update_details_of_Category_for_store_items")
def Update_details_of_Category_for_store_items(item_category_id: int, item_category: ItemCategoryBase, session: Session = Depends(admin_db.get_session),
                                    current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.Update_details_of_Category_for_store_items_in_db(item_category_id, item_category, session, current_admin)

# Get category by ID
@store_router.get('/get_category_by_id')
def get_category_by_id(item_category_id:int, session: Session = Depends(admin_db.get_session),
                                    current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.get_category_by_id_in_db(item_category_id, session, current_admin)

# Get all categories with pagination
@store_router.get('/get_all_categories')
def get_all_categories(page:int, page_size:int, store_id: int, session: Session = Depends(admin_db.get_session),
                                    current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.get_all_categories_in_db(page, page_size, store_id, session, current_admin)

# Create store items
@store_router.post('/Create_store_items')
def Create_store_items(item: StoreItemsBase, session: Session = Depends(admin_db.get_session),
                                    current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.Create_new_Category_for_store_items_in_db(item, session, current_admin)

# Update store item details
@store_router.patch('/Update_store_items_details')
def Update_store_items_details(item_id: int, item: StoreItemsBase, session: Session = Depends(admin_db.get_session),
                                    current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.Update_store_items_details_in_db(item_id, item, session, current_admin)

# Get store item by ID
@store_router.get("/get_store_item_by_id")
def get_store_item_by_id(item_id: int, session: Session = Depends(admin_db.get_session),
                        current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.get_store_item_by_id_in_db(item_id, session, current_admin)

# Get all store items with pagination
@store_router.get("/get_store_items")
def get_store_items_in_db(page:int, page_size:int, category_id: int, store_id: int, session: Session = Depends(admin_db.get_session),
                            current_admin: AdminBase = Depends(auth.get_current_user)):
    return store_db.get_store_items_in_db(page, page_size, category_id, store_id, session, current_admin)

# Create a new team
@admin_router.post('/create_team')
def create_team(team: TeamBase, session: Session = Depends(admin_db.get_session),
                current_admin: AdminBase = Depends(auth.get_current_user)):
    return team_db.create_team_in_db(team, session, current_admin)

# Get team by ID
@admin_router.get('/get_team_by_id')
def get_team_by_id(team_id: int, session: Session = Depends(admin_db.get_session),
                current_admin: AdminBase = Depends(auth.get_current_user)):
    return team_db.get_team_by_id_in_db(team_id, session, current_admin)

# Edit team details
@admin_router.patch('/edit_team')
def edit_team(team_id: int, team: TeamBase, session: Session = Depends(admin_db.get_session),
                current_admin: AdminBase = Depends(auth.get_current_user)):
    return team_db.edit_team_in_db(team_id, team, session, current_admin)

# Delete a team
@admin_router.delete('/delete_team')
def delete_team(team_id: int, session: Session = Depends(admin_db.get_session),
                current_admin: AdminBase = Depends(auth.get_current_user)):
    return team_db.delete_team_in_db(team_id, session, current_admin)

# Include routers in the main FastAPI app
app.include_router(admin_router)
app.include_router(finance_router)
app.include_router(store_router)