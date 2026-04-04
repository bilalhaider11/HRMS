# Frontend: Employees Feature

**Location**: `src/features/employees/`

## Files

| File | Description |
|------|-------------|
| `modal/EmployeesContext.tsx` | Context provider, state, CRUD actions, custom hook |
| `api/employees.ts` | Data fetching from dummy JSON |
| `EmployeesBody.tsx` | Employee list page |
| `RegisterEmployees.tsx` | New employee form page |
| `UpdateEmployee.tsx` | Edit employee form page |
| `IncreamentHistory.tsx` | Increment history page |
| `ui/EmployeeTable.tsx` | Employee list table |
| `ui/Form.tsx` | Registration/update form |
| `ui/IncreamentModalForm.tsx` | Increment add/edit form |
| `ui/IncrementHistoryTable.tsx` | Increment history table |
| `ui/StatusModal.tsx` | Employee status change modal |

## Data Interfaces

### `EmployeeTableData`

**Warning**: This interface is defined in TWO places with different fields:
- `api/employees.ts` — has `increamentAmount?: number`, lacks `lastIncreament` and `lastIncreamentId`
- `modal/EmployeesContext.tsx` — has `lastIncreament?: IncrementHistory[]` and `lastIncreamentId?: string`, lacks `increamentAmount`

Combined fields across both definitions:
```typescript
{
  id?: string;                        // Maps to backend employee_code (business code)
  name: string;
  status: string;                     // String ("Active"/"Inactive"), not boolean
  date?: string;                      // date_of_joining
  fullTimeJoinDate?: string;          // fulltime_joining_date
  lastIncreamentDate?: string;        // last_increment_date
  department?: string;
  employeeInformation?: string;
  email?: string;
  password?: string;
  cnic?: string;
  designation?: string;
  team?: string;
  hobbies?: string;
  vehicleRegistrationNumber?: string;
  companyId?: string;
  dateOfBirth?: string;
  actualDateOfBirth?: string;
  bankName?: string;
  bankTitle?: string;                 // bank_account_title
  bankAccountNumber?: string;
  bankIBAN?: string;                  // bank_iban_number
  bankBranchCode?: string;
  initialBaseSalary?: string;         // Note: string, not float
  currentBaseSalary?: string;
  increamentAmount?: number;          // Only in api/employees.ts
  lastIncreament?: IncrementHistory[];// Only in modal/EmployeesContext.tsx
  lastIncreamentId?: string;          // Only in modal/EmployeesContext.tsx
  homeAddress?: string;
  additionalRoles?: string;
  image?: string;                     // Frontend-only, no backend equivalent
}
```

### `IncrementHistory`
```typescript
{
  increamentId?: string;
  increamentAmount: number;
  increamentDate: string;
}
```

## Context API (`useEmployees()`)

### State
| State | Type | Description |
|-------|------|-------------|
| `employeesList` | `EmployeeTableData[]` | All employees |
| `statusList` | `StatusListData[]` | Status options |
| `editingEmployee` | `EmployeeTableData \| null` | Currently editing |
| `editingIncreamentList` | `IncrementHistory \| null` | Currently editing increment |
| `employeeIncreamentList` | `IncrementHistory[]` | Current employee's increments |
| `idExistError` | `string` | Duplicate ID error message |
| `successfullModal` | `boolean` | Show success modal |
| `isDeleteModal` | `IncrementHistory \| null` | Increment delete confirmation |
| `isEmployeeDelete` | `EmployeeTableData \| null` | Employee delete confirmation |

### Actions
| Action | Behavior |
|--------|----------|
| `addEmployee(emp)` | Returns `false` if duplicate `id`, else adds to list and shows success modal |
| `updateEmployee(emp)` | Checks duplicate ID (excluding current), updates in list |
| `editEmployeeData(emp)` | Sets `editingEmployee`, resets success modal |
| `updateStatus(id, newStatus)` | Updates status string in employee list |
| `addNewIncrement(inc)` | Appends to `employeeIncreamentList` |
| `updateIncrement(inc)` | Replaces by matching `increamentDate` |
| `handleIncrementDelete(inc)` | Filters out by `increamentId` |
| `handleEmployeeDelete(emp)` | Filters out by `id` |
| `clearError()` | Clears `idExistError` |

## API Layer
Fetches from static JSON:
- `fetchEmploeeTableData()` -> `/dummy_json_data/employees_json_data/employeeslist.json`
- `fetchStatusList()` -> `/dummy_json_data/employees_json_data/statusList.json`

Not connected to backend.

## Routes
| Path | Component |
|------|-----------|
| `/employees` | `EmployeesBody` |
| `/employees/register-employees` | `RegisterEmployees` |
| `/employees/update-employees/:employeeId` | `UpdateEmployee` |
| `/employees/increament-history/:employeeId` | `IncreamentHistory` |

## Spelling Note
The codebase consistently uses **"Increament"** (misspelling of "Increment") throughout the frontend: file names, variable names, interface fields. Do not "fix" this without a coordinated global rename.
