# Backend API Reference

All endpoints return JSON. Errors use `HTTPException` with `status_code` and `detail`.

## Admin Endpoints

### `POST /admin/register_admin`
Register the single system admin. Blocks with 409 if any admin already exists. **Public** — no auth required.
- **Body**: `AdminBase` — `company_name`, `website`, `address`, `phone`, `email`, `password` (all required strings, min_length=1)
- **Response** (201): `{ "message": "Admin created successfully", "admin_id": <int> }`
- **Validation**: Each field checked against sentinel value `"string"` (400 if matched)
- **Side effect**: Password is bcrypt-hashed before storage

### `POST /admin/login`
OAuth2 password flow. Accepts `username` (email) and `password` as form data. **Public** — no auth required.
- **Body**: `OAuth2PasswordRequestForm`
- **Response** (200): `{ "access_token": "<jwt>", "token_type": "bearer" }`
- **Side effect**: Stores JWT token in `jwt_tokens` table keyed by client IP (upsert)
- **Password check**: Uses `bcrypt.checkpw` via `auth.verify_password()`

### `GET /admin/company_profile`
Returns the admin's company info. 404 if no admin registered.
- **Response**: `{ "company_name", "website", "address", "phone", "email" }`

### `PATCH /admin/update_password`
- **Query params**: `old_password`, `new_password`
- **Response**: `"Password Updated"` or 401 if old password wrong

---

## Employee Endpoints (prefix: `/admin`)

### `POST /admin/create_employee`
- **Body**: `EmployeeBase` + `List[AdditionalRoleBase]` (two separate params)
- **Response**: `{ "message": "Employee Added Successfully", "employee": "<employee_code>" }`
- **Validation**: 16 required fields checked against sentinels (`"string"`, `""`, `None`, `0`, `date.today()`). 409 if `employee_id` (business ID) already exists.
- **Side effects**: Creates `AdditionalRole` records globally if role_name doesn't exist. Creates `EmployeeAdditionalRoleLink` entries. Sets `current_base_salary = initial_base_salary` if 0. Sets `actual_date_of_birth = date_of_birth` if null.

### `PATCH /admin/update_employee_details`
- **Query param**: `employee_code` (string business code)
- **Body**: `EmployeeBase`
- **Behavior**: Uses `dict(exclude_unset=True, exclude_defaults=True)` + sentinel filtering. Only non-sentinel values get written. 403 if employee is deactivated.

### `PATCH /admin/deactivate_employee`
Soft delete — sets `status = False`. Does NOT delete relationships.
- **Query param**: `employee_code` (string business code)
- **Response**: `{ "message": "Employee Deactivated", "employee": "<employee_code>" }`
- 409 if already deactivated.

### `GET /admin/display_all_employees`
- **Query params**: `page` (default 1), `page_size` (default 10), `department?`, `team?`
- **Filters**: `ilike` partial match on department and team. Only active employees (`status == True`).
- **Response**: `{ "page", "page_size", "total_count", "total_pages", "filters": { "department", "team" }, "employees": [...] }`

### `PUT /admin/update_roles`
Full replace of employee roles — deletes all existing links, then creates new ones.
- **Query param**: `employee_code` (string business code)
- **Body**: `List[AdditionalRoleBase]`
- 403 if employee is deactivated.

---

## Increment Endpoints (prefix: `/admin`)

**Important**: API schemas use `employee_code` as a string (business code). Internally resolved to `Employee.id` (int PK).

### `POST /admin/create_increment`
- **Body**: `IncrementCreate` — `employee_code` (str), `increment_amount` (float), `effective_date` (date), `notes?` (str)
- **Response**: `IncrementResponse` — `id` (int), `employee_code` (str), `increment_amount`, `effective_date`, `notes`
- **Business rule**: 30-day minimum gap between increments per employee (409 if violated)
- **Side effects**: Adds `increment_amount` to `Employee.current_base_salary`. Updates `Employee.last_increment_date` and `Employee.increment_amount`.

### `GET /admin/get_increment/{increment_id}`
- **Path param**: `increment_id` (int PK)
- **Response**: `IncrementResponse`

### `PATCH /admin/update_increment/{increment_id}`
- **Path param**: `increment_id` (int PK)
- **Body**: `IncrementUpdate` — `increment_amount` (float, default 0), `effective_date?`, `notes?`
- **Side effect**: Recalculates salary diff on employee. Does NOT enforce 30-day gap.

### `DELETE /admin/delete_increment/{increment_id}`
- **Path param**: `increment_id` (int PK)
- **Response**: `{ "detail": "Increment deleted successfully" }`
- **Warning**: Does NOT reverse the salary change on the employee.

### Unexposed: `get_increments_by_business_id(business_id, session)`
Defined in `increment_db.py` but not exposed in `main.py`. Returns all increments for an employee by business ID.

---

## Finance Endpoints (prefix: `/finance`)

### `POST /finance/create_finance_record`
- **Body**: `FinanceBase` — `date`, `description`, `amount` (float), `tax_deductions` (float), `cheque_number` (str), `category_id` (int FK)
- **Duplicate detection**: `cheque_number + date + amount` combination
- **Side effect**: `added_by` auto-set to single admin's ID

### `PATCH /finance/edit_finance_record`
- **Query param**: `finance_id` (int)
- **Body**: `FinanceBase`
- **Behavior**: Only updates fields that aren't sentinel values (`""`, `"string"`, `0`)

### `DELETE /finance/delete_finance_record`
- **Query param**: `finance_id` (int)
- **Response**: `{ "Message": "Deleted Successfully" }`

### `GET /finance/get_finance_records`
- **Query params**: `page`, `page_size`, `start_date?`, `end_date?`, `category_id?`
- **Response**: Paginated records + summary:
```json
{
  "page", "page_size", "total_count", "total_pages",
  "filters": { "start_date", "end_date", "category_id" },
  "records": [...],
  "summary": {
    "total_earnings": <sum of all amounts>,
    "total_salaries": <sum where category_id == 1>,
    "total_expenses": <sum where category_id in [3, 4, 7, 8]>,
    "total_profit": <total_earnings - total_salaries - total_expenses>
  }
}
```

---

## Inventory Endpoints (prefix: `/inventory`)

### Item Category CRUD
| Method | Path | Params | Notes |
|--------|------|--------|-------|
| `POST` | `/inventory/create_category` | Body: `ItemCategoryBase` — `name`, `description` | Duplicate = `name` (409) |
| `PATCH` | `/inventory/update_category/{category_id}` | Path: `category_id` (int), Body: `ItemCategoryUpdate` — optional `name`, `description` | |
| `GET` | `/inventory/get_category/{category_id}` | Path: `category_id` (int) | |
| `GET` | `/inventory/get_all_categories` | Query: `page`, `page_size` | |

### Inventory Item CRUD
| Method | Path | Params | Notes |
|--------|------|--------|-------|
| `POST` | `/inventory/create_item` | Body: `InventoryItemBase` — `name`, `description`, `quantity`, `category_id` | Duplicate = `name + category_id` (409). Validates category exists. |
| `PATCH` | `/inventory/update_item/{item_id}` | Path: `item_id` (int), Body: `InventoryItemUpdate` — optional `name`, `description`, `quantity`, `category_id` | |
| `GET` | `/inventory/get_item/{item_id}` | Path: `item_id` (int) | |
| `GET` | `/inventory/get_all_items` | Query: `page`, `page_size`, `category_id` (optional filter) | |

---

## Cross-Cutting Patterns

### Pagination Response
All paginated endpoints return:
```json
{ "page", "page_size", "total_count", "total_pages", "<items_key>": [...] }
```
The items key varies: `"employees"`, `"records"`, `"categories"`, `"items"`.

### Sentinel Validation
All `*_db.py` modules check for Swagger UI default value `"string"` as a sentinel for "not provided". Numeric sentinels are `0`. Date sentinel is `date.today()`. This is intentional, not a bug.

### Authentication
Routes are split across routers by auth requirement:
- **`admin_public_router`** (`/admin`): `register_admin`, `login` — no auth
- **`admin_router`** (`/admin`): all other admin routes — protected via `Depends(auth.get_current_user)`
- **`finance_router`** (`/finance`): all routes — protected via router-level dependency
- **`inventory_router`** (`/inventory`): all routes — protected via router-level dependency

### Auto-Auth Middleware
Defined in `main.py`. For every request except `POST /admin/login` and `POST /admin/register_admin`, looks up `jwt_tokens` by client IP. If found and valid, injects `Authorization: Bearer <token>` header. Returns `None` for expired/invalid tokens (no injection).

### CORS
Enabled for `http://localhost:3000` with credentials, all methods, and all headers.

### Session Management
`admin_db.get_session()` is the canonical session generator. All routes use `session: Session = Depends(admin_db.get_session)`. Some `*_db.py` modules define their own `get_session()` but the one from `admin_db` is used in routes.
