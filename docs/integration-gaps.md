# Frontend-Backend Integration Gaps

The frontend and backend are currently **not connected**. This doc catalogs the specific mismatches to address during integration.

## Current State

- Frontend fetches all data from static JSON in `public/dummy_json_data/`
- Backend has a full REST API at `http://localhost:8000`
- Auth is a dummy in-memory implementation on frontend
- No axios instance is configured for backend calls (the file `features/auth/api/axios.js` exists but is unused)

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
| `companyId` | — | Frontend-only field |
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
| `CompanyID` | — (frontend-only) |

### Finance Categories

| Frontend | Backend |
|----------|---------|
| `id` | `category_id` |
| `name` | `category_name` |
| `colorCode` | `color_code` |
| `companyId` | — (frontend-only) |

### Inventory

| Frontend | Backend |
|----------|---------|
| `StoreTableData.id` | `Store.id` |
| `StoreTableData.uniqueIdentifier` | `Store.unique_identifier` |
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
| `teamMembers[]` | — (must query Teams_to_employee + Employee) |
| `companyId`, `companyName` | — (frontend-only) |

## Auth Integration Gap

**Frontend dummy auth** uses hardcoded users and token prefixes. **Backend auth** uses real JWT with OAuth2 password flow.

Backend auth is now wired up: `get_current_user()` is applied as a router-level dependency on `admin_router`, `finance_router`, and `store_router`. Only `/admin/login` and `/admin/register_admin` are public. Passwords are bcrypt-hashed. CORS is enabled for `localhost:3000`.

To integrate the frontend:
1. Replace `login()` in `features/auth/api/auth.tsx` with POST to `/admin/login` (OAuth2 form data, not JSON)
2. Replace `verify()` with a call using the stored JWT (e.g., `GET /admin/company_profile` — now a protected endpoint that validates the token)
3. Replace `signup()` with POST to `/admin/register_admin`
4. The `superAdmin` check (`user?.name === "Celestial"`) needs rethinking — backend has a single admin model, not user roles

## Pagination Gap

- **Backend** returns: `{ page, page_size, total_count, total_pages, <items_key>: [...] }`
- **Frontend** `Pagination` component expects props: `totalPosts`, `postsPerPage`, `currentPage`, `currentPageSet`
- Currently frontend does client-side pagination on the full dummy data array

## Missing Backend Endpoints

| Need | Status |
|------|--------|
| List all teams with pagination | No endpoint exists |
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
| `inventory_json_data/storeTable.json` | `features/inventory/api/inventory.ts` |
| `inventory_json_data/categoryTable.json` | `features/inventory/api/inventory.ts` |
| `inventory_json_data/itemsTable.json` | `features/inventory/api/inventory.ts` |
| `teams_json_data/teamsTable.json` | `features/teams/api/teams.ts` |
| `dashboard_json_data/*.json` (6 files) | `features/dashboard/api/dashboard.ts` |
