# Backend Business Rules

Validation logic, constraints, and side effects buried in `*_db.py` modules.

## Sentinel Validation Pattern

All modules check for Swagger UI default values as sentinels meaning "not provided":
- Strings: `"string"`, `""`
- Numbers: `0`
- Dates: `date.today()`, `str(date.today())`
- Null: `None`

This pattern is intentional and used consistently across all CRUD operations.

## Admin

- **Single admin constraint**: Only one admin allowed. `register_admin` checks if any admin exists (409 if so). Enforced at app level, not DB level.
- **Password storage**: Hashed with bcrypt on registration and password update. Verified via `bcrypt.checkpw` in `auth.verify_password()`.

## Employee

### Registration
- 16 required fields validated against sentinels (400 on failure): `employee_code`, `name`, `bank_name`, `bank_account_title`, `bank_branch_code`, `bank_account_number`, `bank_iban_number`, `initial_base_salary`, `department`, `team`, `home_address`, `email`, `password`, `designation`, `cnic`, `date_of_birth`
- `employee_code` (business code) must be unique (409 on duplicate)
- **Auto-defaults**: `current_base_salary` set to `initial_base_salary` if 0. `actual_date_of_birth` set to `date_of_birth` if null.
- **Role creation**: If a `role_name` doesn't exist globally in `additional_roles`, it gets created. Roles with sentinel names are skipped.

### Update
- Uses `dict(exclude_unset=True, exclude_defaults=True)` with additional sentinel filtering
- Only non-sentinel values are written to the record
- **Deactivated employees cannot be updated** (403)

### Deactivation
- Soft delete: `status = False`
- Cannot deactivate an already-deactivated employee (409)
- Does NOT delete relationships, roles, increments, or team memberships

### Role Update
- **Full replace**: Deletes all existing `EmployeeAdditionalRoleLink` entries for the employee, then creates new ones
- Does NOT delete the `AdditionalRole` records themselves (they're global)
- Deactivated employees cannot have roles updated (403)

## Increments

### 30-Day Gap Rule
- On **create**: Checks the most recent increment for the employee. If fewer than 30 days between the last `effective_date` and the new one, returns 409.
- On **update**: The 30-day gap is NOT enforced.

### Salary Synchronization
- **Create**: `Employee.current_base_salary += increment_amount`. Also updates `Employee.last_increment_date` and `Employee.increment_amount`.
- **Update**: Calculates diff `(new_amount - old_amount)` and adjusts `Employee.current_base_salary` by the diff. Updates `Employee.increment_amount` to new value.
- **Delete**: Does NOT reverse the salary change. The employee's `current_base_salary` retains the increment amount even after deletion.

### ID Translation
- API accepts `employee_code` as string (business code) in `IncrementCreate`
- Internally resolves to `Employee.id` (int) for the FK in `EmployeeIncrement`
- Response returns business ID string in `IncrementResponse.employee_code`

## Finance

### Duplicate Detection
- Checked by combination of `cheque_number + date + amount` (409 on match)

### Summary Calculation
- Hardcoded category IDs in `finance_db.py`:
  - `category_id == 1` -> "Salaries"
  - `category_id in [3, 4, 7, 8]` -> "Expenses" (Office Expenses, Office Rent, Utility Bills, Bank Charges)
- `total_earnings` = sum of ALL record amounts (not just income)
- `total_profit = total_earnings - total_salaries - total_expenses`
- Summary is computed over ALL filtered records (not just the current page)

### Auto-Assignment
- `added_by` field auto-set to the single admin's ID on create and edit

## Inventory

### Hierarchy
ItemCategory -> InventoryItem. Categories are top-level; items belong to a category.

### Uniqueness
- ItemCategory: `name` must be unique
- InventoryItem: `name + category_id` must be unique

### Validation
- Item creation validates that the category exists
- Empty paginated results return 404 (categories, items)
- `quantity` must be >= 1 on create, >= 0 on update; negative values are blocked
- `name` is validated against empty string and `"string"` sentinel on both create and update

## Database Seeding

Run via `python seeders.py`. Seeds:
- **Roles**: `hr` (salary_management), `teamlead` (operations_manager)
- **Finance categories**: 10 default categories (Salaries, WHT, Office Expenses, Office Rent, Loan, Benefits, Utility Bills, Bank Charges, Remittance, Cancelled?) — skips existing by name
