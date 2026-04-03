# Frontend-Backend Integration Gaps

The frontend and backend are **partially connected** after Phase 1. This doc catalogs the remaining mismatches to address during further integration.

## Current State

- Auth is wired to real backend endpoints (login, verify, signup)
- Most feature data still fetched from static JSON in `public/dummy_json_data/`
- Backend has a full REST API at `http://localhost:8000`
- Store feature has been dropped from both backend and frontend
- Team management has been dropped from backend (frontend UI still exists but is not connected)

## Data Shape Mismatches

### Employees

| Frontend (camelCase) | Backend (snake_case) | Notes |
|---------------------|---------------------|-------|
| `id` (string) | `employee_id` (string) | Business ID — same concept, different field name |
| — | `id` (int) | Internal PK, not exposed to frontend |
| `status` (string: "Active") | `status` (bool: true) | Type mismatch |
| `bankTitle` | `bank_account_title` | |
| `bankIBAN` | `bank_iban_number` | |
| `fullTimeJoinDate` | `fulltime_joining_date` | |
| `lastIncreamentDate` | `last_increment_date` | Spelling differs too |
| `initialBaseSalary` (string) | `initial_base_salary` (float) | Type mismatch |
| `currentBaseSalary` (string) | `current_base_salary` (float) | Type mismatch |
| `lastIncreament` (IncrementHistory[]) | — | Embedded array, backend returns separately via increment endpoints |
| `image` | — | Frontend-only field |
| `employeeInformation` | — | Frontend-only field |

### Finance

| Frontend (PascalCase) | Backend (snake_case) |
|----------------------|---------------------|
| `FinanceId` | `id` |
| `Date` | `date` |
| `Description` | `description` |
| `Amount` | `amount` |
| `TaxDeductions` | `tax_deductions` |
| `ChequeNumber` | `cheque_number` |
| `CategoryID` | `category_id` |
| `AddedBy` (string) | `added_by` (int FK) |

### Finance Categories

| Frontend | Backend |
|----------|---------|
| `id` | `category_id` |
| `name` | `category_name` |
| `colorCode` | `color_code` |

### Inventory

| Frontend | Backend |
|----------|---------|
| `CategoryTableData.categoryId` | `ItemCategory.id` |
| `CategoryTableData.categoryName` | `ItemCategory.name` |
| `CategoryTableData.categoryDescription` | `ItemCategory.description` |
| `ItemsTableData.itemId` | `StoreItems.id` |
| `ItemsTableData.itemName` | `StoreItems.name` |
| `ItemsTableData.itemDescription` | `StoreItems.description` |
| `ItemsTableData.itemQuantity` | `StoreItems.quantity` |

### Teams

| Frontend | Backend |
|----------|---------|
| `teamId` | `Team.id` |
| `teamName` | `Team.name` |
| `teamDescription` | `Team.description` |
| `teamLeadId` | `Team.team_lead_id` |
| `teamLeadName` | — (must join with Employee) |
| `teamMembers[]` | — (no backend endpoint) |

> **Note:** Team management backend has been dropped in Phase 1. These mappings are documented for reference if the feature is re-added later.

## Auth Integration Gap

Auth is now wired to the real backend as of Phase 1:

| Function | Endpoint | Status |
|----------|----------|--------|
| `login(email, password)` | POST `/admin/login` (OAuth2 form data) | Wired |
| `verify(token)` | GET `/admin/company_profile` (Bearer token) | Wired |
| `signup(companyName, website, address, phone, email, password)` | POST `/admin/register_admin` | Wired |

The `superAdmin` flag is now derived as `user !== null` (single-admin model; any authenticated user is treated as admin).

Social login buttons have been removed from login/signup pages.

## Pagination Gap

- **Backend** returns: `{ page, page_size, total_count, total_pages, <items_key>: [...] }`
- **Frontend** `Pagination` component expects props: `totalPosts`, `postsPerPage`, `currentPage`, `currentPageSet`
- Currently frontend does client-side pagination on the full dummy data array

## Missing Backend Endpoints

| Need | Status |
|------|--------|
| Finance category CRUD | No endpoints (only seeder exists) |
| Get all increments for an employee | Function exists (`get_increments_by_business_id`) but not exposed as route |
| Get single employee by business ID | No dedicated endpoint |

## Dummy JSON Data Files

| File | Consumed by |
|------|------------|
| `employees_json_data/employeeslist.json` | `features/employees/api/employees.ts`, `features/dashboard/api/dashboard.ts` |
| `employees_json_data/statusList.json` | `features/employees/api/employees.ts` |
| `finance_json_data/financeList.json` | `features/finance/api/finance.ts` |
| `finance_json_data/financeCategories.json` | `features/finance/api/finance.ts` |
| `inventory_json_data/categoryTable.json` | `features/inventory/api/inventory.ts` |
| `inventory_json_data/itemsTable.json` | `features/inventory/api/inventory.ts` |
| `teams_json_data/teamsTable.json` | `features/teams/api/teams.ts` |
| `dashboard_json_data/*.json` (6 files) | `features/dashboard/api/dashboard.ts` |
