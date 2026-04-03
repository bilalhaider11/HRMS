# Backend Data Models

All models use SQLModel (SQLAlchemy + Pydantic). Each entity has a `*Base` class (used for request validation) and a table class (used for ORM).

## Admin
**Table**: `admin`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | int | PK, auto-increment |
| `company_name` | str | min_length=1 |
| `website` | str | min_length=1 |
| `address` | str | min_length=1 |
| `phone` | str | min_length=1 |
| `email` | str | min_length=1 |
| `password` | str | min_length=1, stored plaintext |

Single-row constraint enforced at application level (not DB level).

## Employee
**Table**: `employee`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | int | PK, auto-increment | Internal FK target |
| `employee_id` | str | unique (app-enforced) | User-facing business ID |
| `name` | str | required | |
| `bank_name` | str | required | |
| `bank_account_title` | str | required | |
| `bank_branch_code` | str | required | |
| `bank_account_number` | str | required | |
| `bank_iban_number` | str | required | |
| `initial_base_salary` | float | required | Set at hire time |
| `current_base_salary` | float | required | Updated by increments |
| `date_of_joining` | date | required | |
| `fulltime_joining_date` | date | optional | |
| `last_increment_date` | date | optional | Updated by increment CRUD |
| `increment_amount` | float | default 0.0 | Last increment amount |
| `department` | str | required | |
| `team` | str | required | |
| `home_address` | str | required | |
| `email` | str | required | |
| `password` | str | required | |
| `designation` | str | required | Mutated by team lead assignment |
| `cnic` | str | required | |
| `date_of_birth` | date | required | |
| `actual_date_of_birth` | date | optional | Defaults to `date_of_birth` |
| `hobbies` | str | optional | |
| `vehicle_registration_number` | str | optional | |
| `status` | bool | default True | False = deactivated (soft delete) |

**Relationships**:
- `additional_roles` -> `EmployeeAdditionalRoleLink` (M2M, back_populates="employee")
- `increments` -> `EmployeeIncrement` (1:M, back_populates="employee")

### Dual ID Pattern
- `Employee.id` (int) — used for ALL foreign keys and internal DB operations
- `Employee.employee_id` (str) — user-facing business identifier, used in API request params
- The increment module's `IncrementCreate`/`IncrementResponse` Pydantic schemas translate between these

## EmployeeIncrement
**Table**: `employee_increment_history`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | int | PK, auto-increment |
| `employee_id` | int | FK -> `employee.id`, NOT NULL |
| `increment_amount` | float | required |
| `effective_date` | date | required |
| `notes` | str | optional |

**Relationship**: `employee` -> `Employee` (back_populates="increments")

## AdditionalRole
**Table**: `additional_roles`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | int | PK, auto-increment |
| `role_name` | str | min_length=1 |
| `role_description` | str | optional |

Roles are global — shared across employees. Created on-the-fly if a new role_name is provided during employee registration or role update.

**Seed data** (via `seeders.py`): `hr` (salary_management), `teamlead` (operations_manager)

## EmployeeAdditionalRoleLink
**Table**: `employee_additional_roles`

| Field | Type | Constraints |
|-------|------|-------------|
| `employee_id` | int | FK -> `employee.id`, composite PK |
| `role_id` | int | FK -> `additional_roles.id`, composite PK |

## FinanceCategory
**Table**: `financecategory`

| Field | Type |
|-------|------|
| `category_id` | int, PK, auto-increment |
| `category_name` | str |
| `color_code` | str |

**Seed data** (via `seeders.py`):

| category_id | category_name | color_code |
|-------------|--------------|------------|
| 1 | Salaries | Blue |
| 2 | With Holding Income Tax | Black |
| 3 | Office Expenses | Golden / Orange |
| 4 | Office Rent | Red |
| 5 | Loan | Parrot Green |
| 6 | Benefits | Parrot Green |
| 7 | Utility Bills | Pink |
| 8 | Bank Charges | Purple |
| 9 | Remittance | Green |
| 10 | Cancelled? | Light Gray |

These IDs are hardcoded in `finance_db.py` summary calculations: `category_id=1` is salaries, `[3,4,7,8]` are expenses.

## Finance
**Table**: `finance`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | int | PK, auto-increment |
| `date` | date | required |
| `description` | str | required |
| `amount` | float | required |
| `tax_deductions` | float | required |
| `cheque_number` | str | required |
| `category_id` | int | FK -> `financecategory.category_id` |
| `added_by` | int | FK -> `admin.id`, optional, auto-set |

## Store
**Table**: `store`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | int | PK, auto-increment |
| `name` | str | min_length=1 |
| `unique_identifier` | str | min_length=1, unique (app-enforced) |
| `description` | str | optional |

## ItemCategory
**Table**: `item_category`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | int | PK, auto-increment |
| `name` | str | min_length=1 |
| `description` | str | optional |
| `store_id` | int | FK -> `store.id` |

Uniqueness: `name + store_id` (app-enforced).

## StoreItems
**Table**: `store_items`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | int | PK, auto-increment |
| `name` | str | min_length=1 |
| `description` | str | optional |
| `quantity` | int | required |
| `category_id` | int | FK -> `item_category.id` |
| `store_id` | int | FK -> `store.id` |

Uniqueness: `name + store_id + category_id` (app-enforced).

## Team
**Table**: `team`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | int | PK, auto-increment |
| `name` | str | min_length=1 |
| `description` | str | min_length=1 |
| `team_lead_id` | int | FK -> `employee.id` |

## Teams_to_employee
**Table**: `teams_to_employee`

| Field | Type | Constraints |
|-------|------|-------------|
| `team_id` | int | FK -> `team.id`, composite PK |
| `employee_id` | int | FK -> `employee.id`, composite PK |

## jwt_tokens
**Table**: `jwt_tokens`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | int | PK, auto-increment |
| `client_ip` | str | min_length=1 |
| `token` | str | min_length=1 |
| `created_at` | date | default `date.today()` |

## Entity Relationships

```
Admin 1──M Finance (added_by)

Employee 1──M EmployeeIncrement (employee_id -> employee.id)
Employee M──M AdditionalRole (via EmployeeAdditionalRoleLink)
Employee M──M Team (via Teams_to_employee)
Team M──1 Employee (team_lead_id -> employee.id)

Store 1──M ItemCategory (store_id)
ItemCategory 1──M StoreItems (category_id)
Store 1──M StoreItems (store_id)

Finance M──1 FinanceCategory (category_id)
```

Note: `jwt_tokens` has no FK to any table. It stores `client_ip` + `token` pairs. The JWT payload contains `user_id` (admin.id) but there is no database-level relationship.
