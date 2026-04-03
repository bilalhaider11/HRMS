# Frontend: Finance Feature

**Location**: `src/features/finance/`

## Files

| File | Description |
|------|-------------|
| `modal/FinanceContext.tsx` | Context provider, state, CRUD actions |
| `api/finance.ts` | Data fetching from dummy JSON |
| `ui/FinanceBody.tsx` | Finance records list |
| `ui/CategoryBody.tsx` | Finance category management |

## Data Interfaces

### `FinanceTableData`
```typescript
{
  FinanceId?: string;       // PascalCase — maps to backend Finance.id
  Date?: string;
  Description?: string;
  Amount?: number;
  TaxDeductions?: number;
  ChequeNumber?: string;
  CategoryID?: number;
  AddedBy?: string;
  CompanyID?: number;       // Frontend-only
}
```

### `FinanceCategoriesData`
```typescript
{
  id?: string;
  name?: string;            // category_name
  colorCode?: string;       // color_code
  companyId?: number;       // Frontend-only
}
```

## Context API (`useFinance()`)

### State
| State | Type | Description |
|-------|------|-------------|
| `financeList` | `FinanceTableData[]` | All finance records |
| `financeCategoriesList` | `FinanceCategoriesData[]` | All categories |
| `editingFinance` | `FinanceTableData \| null` | Currently editing record |
| `editingCategory` | `FinanceCategoriesData \| null` | Currently editing category |
| `idExistError` | `string` | Error message |
| `successfullModal` | `boolean` | Show success modal |
| `isDeleteModal` | `FinanceTableData \| null` | Record delete confirmation |
| `isDeleteCategoryModal` | `FinanceCategoriesData \| null` | Category delete confirmation |

### Actions
| Action | Behavior |
|--------|----------|
| `addFinance(fin)` | Appends to list, shows success modal |
| `updateFinance(fin)` | Replaces by `FinanceId` match |
| `editFinanceData(fin)` | Sets editing state |
| `handleFinanceDelete(fin)` | Filters out by `FinanceId` |
| `addCategory(cat)` | Appends to categories list |
| `updateFinanceCategory(cat)` | Replaces by `id` match |
| `editCategoryData(cat)` | Sets category editing state |
| `handleCategoryDelete(cat)` | Filters out by `id` |

## API Layer
- `fetchFinanceTableData()` -> `/dummy_json_data/finance_json_data/financeList.json`
- `fetchFinanceCategoriesData()` -> `/dummy_json_data/finance_json_data/financeCategories.json`

## Routes
| Path | Component |
|------|-----------|
| `/finance` | `FinanceBody` |
| `/finance/new-finance` | NewFinancePage |
| `/finance/update-finance/:financeId` | UpdateFinancePage |
| `/finance/category-lists` | `CategoryBody` |
| `/finance/category-lists/new-category` | NewCategoryPage |
| `/finance/category-lists/update-category/:categoryId` | UpdateCategoryPage |

Finance has a **sub-entity pattern**: categories have their own CRUD pages nested under the `/finance/category-lists` route.
